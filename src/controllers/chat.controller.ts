import type { Request, Response } from "express";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { ChatService } from "../services/Chat.service.js";
import { AppError } from "../utils/AppError.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);
  return userId;
}

function getParam(req: Request, key: string): string {
  const val = req.params[key];
  if (!val || Array.isArray(val))
    throw new AppError(`Missing param: ${key}`, HTTPStatusCodes.BAD_REQUEST);
  return val;
}

function getQueryString(req: Request, key: string, fallback: string): string {
  const val = req.query[key];
  if (!val || Array.isArray(val)) return fallback;
  if (typeof val === "string") return val;
  return fallback;
}

async function getMyRooms(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const rooms = await ChatService.getUserRooms(userId);
  res.status(HTTPStatusCodes.OK).json({ status: "success", data: { rooms } });
}

async function openDM(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const targetUserId = getParam(req, "targetUserId");
  const room = await ChatService.getOrCreateDMRoom(userId, targetUserId);
  res.status(HTTPStatusCodes.OK).json({ status: "success", data: { room } });
}

async function openProjectRoom(req: Request, res: Response): Promise<void> {
  const projectId = getParam(req, "projectId");
  const room = await ChatService.getOrCreateProjectRoom(projectId);
  res.status(HTTPStatusCodes.OK).json({ status: "success", data: { room } });
}

async function openTeamRoom(req: Request, res: Response): Promise<void> {
  const teamId = getParam(req, "teamId");
  const room = await ChatService.getOrCreateTeamRoom(teamId);
  res.status(HTTPStatusCodes.OK).json({ status: "success", data: { room } });
}

async function getMessages(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const roomId = getParam(req, "roomId");
  const page = parseInt(getQueryString(req, "page", "1"));
  const limit = parseInt(getQueryString(req, "limit", "30"));

  const messages = await ChatService.getRoomMessages(
    roomId,
    userId,
    page,
    limit,
  );
  res
    .status(HTTPStatusCodes.OK)
    .json({ status: "success", data: { messages } });
}

async function sendMessage(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const roomId = getParam(req, "roomId");
  const { content, type } = req.body;

  if (!content)
    throw new AppError(
      "Message content is required",
      HTTPStatusCodes.BAD_REQUEST,
    );

  const message = await ChatService.sendMessage(roomId, userId, content, type);
  res
    .status(HTTPStatusCodes.CREATED)
    .json({ status: "success", data: { message } });
}

async function markAsRead(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const roomId = getParam(req, "roomId");
  await ChatService.markAsRead(roomId, userId);
  res.status(HTTPStatusCodes.OK).json({ status: "success" });
}

export const ChatController = {
  getMyRooms,
  openDM,
  openProjectRoom,
  openTeamRoom,
  getMessages,
  sendMessage,
  markAsRead,
};
