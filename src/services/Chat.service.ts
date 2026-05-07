import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { ChatRoom } from "../models/ChartRoom.js";
import { Message } from "../models/Message.js";
import { ProjectMember } from "../models/mappings/ProjectMember.js";
import { TeamMember } from "../models/mappings/TeamMember.js";
import { AppError } from "../utils/AppError.js";

async function getOrCreateDMRoom(userA: string, userB: string) {
  const existing = await ChatRoom.findOne({
    type: "dm",
    participants: { $all: [userA, userB], $size: 2 },
  }).populate("participants", "name headline profilePicture");

  if (existing) return existing;

  const newRoom = await ChatRoom.create({
    type: "dm",
    participants: [userA, userB],
  });

  return newRoom.populate("participants", "name headline profilePicture");
}

async function getOrCreateProjectRoom(projectId: string) {
  const existing = await ChatRoom.findOne({
    type: "project",
    reference: projectId,
  }).populate("reference");

  if (existing) return existing;

  const newRoom = await ChatRoom.create({
    type: "project",
    reference: projectId,
    referenceModel: "Project",
  });

  return newRoom.populate("reference");
}

async function getOrCreateTeamRoom(teamId: string) {
  const existing = await ChatRoom.findOne({ 
    type: "team", 
    reference: teamId 
  }).populate("reference");

  if (existing) return existing;

  const newRoom = await ChatRoom.create({
    type: "team",
    reference: teamId,
    referenceModel: "Team",
  });

  return newRoom.populate("reference");
}

async function getUserRooms(userId: string) {
  // Get all team/project memberships
  const [teamMemberships, projectMemberships] = await Promise.all([
    TeamMember.find({ userId, status: "active" }).select("teamId"),
    ProjectMember.find({ userId, status: "active" }).select("projectId"),
  ]);

  const teamIds = teamMemberships.map((m) => m.teamId);
  const projectIds = projectMemberships.map((m) => m.projectId);

  const rooms = await ChatRoom.find({
    $or: [
      { type: "dm", participants: userId },
      { type: "team", reference: { $in: teamIds } },
      { type: "project", reference: { $in: projectIds } },
    ],
  })
    .populate("participants", "name headline profilePicture")
    .populate("reference")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name" },
    })
    .sort({ updatedAt: -1 });

  return rooms;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

async function sendMessage(
  roomId: string,
  senderId: string,
  content: string,
  type = "text",
) {
  const room = await ChatRoom.findById(roomId);
  if (!room) throw new AppError("Room not found", HTTPStatusCodes.NOT_FOUND);

  await assertRoomAccess(room, senderId);

  const message = await Message.create({
    roomId,
    sender: senderId,
    content,
    type,
    readBy: [senderId],
  });

  await ChatRoom.findByIdAndUpdate(roomId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  return message.populate("sender", "name profilePicture");
}

async function getRoomMessages(
  roomId: string,
  userId: string,
  page = 1,
  limit = 30,
) {
  const room = await ChatRoom.findById(roomId);
  if (!room) throw new AppError("Room not found", HTTPStatusCodes.NOT_FOUND);

  await assertRoomAccess(room, userId);

  const messages = await Message.find({ roomId })
    .populate("sender", "name profilePicture headline")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return messages.reverse();
}

async function markAsRead(roomId: string, userId: string) {
  await Message.updateMany(
    { roomId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } },
  );
}

// ─── Access Guard ─────────────────────────────────────────────────────────────

async function assertRoomAccess(room: any, userId: string) {
  if (room.type === "dm") {
    const isMember = room.participants.some(
      (p: any) => p.toString() === userId,
    );
    if (!isMember)
      throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);
    return;
  }

  if (room.type === "team") {
    const member = await TeamMember.findOne({
      teamId: room.reference,
      userId,
      status: "active",
    });
    if (!member)
      throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);
    return;
  }

  if (room.type === "project") {
    const member = await ProjectMember.findOne({
      projectId: room.reference,
      userId,
      status: "active",
    });
    if (!member)
      throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);
    return;
  }
}

export const ChatService = {
  getOrCreateDMRoom,
  getOrCreateProjectRoom,
  getOrCreateTeamRoom,
  getUserRooms,
  sendMessage,
  getRoomMessages,
  markAsRead,
};
