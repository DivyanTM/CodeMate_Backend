import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import type { IUser } from "../interfaces/User.js";
import { UserSkill } from "../models/mappings/UserSkill.js";
import { Skill } from "../models/Skills.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword, verifyPassword } from "../utils/Password.js";

async function createUser(
  name: string,
  email: string,
  hashedPassword: string,
  dateOfBirth: Date,
): Promise<IUser> {
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    dateOfBirth,
  });
  return user.toObject() as IUser;
}

async function getUserById(userId: string): Promise<any | null> {
  const user = await User.findById(userId).select("-password");
  if (!user) return null;

  const userObj = user.toObject() as any;

  // Fetch the mapped skills and attach them as an array of strings
  const userSkills = await UserSkill.find({ userId }).populate("skillId");
  userObj.skills = userSkills
    .map((us: any) => us.skillId?.name)
    .filter(Boolean);

  // Placeholder for experience (we will build this next)
  userObj.experience = [];

  return userObj;
}

async function getUserByEmail(email: string): Promise<IUser | null> {
  const user = await User.findOne({ email: email.toLowerCase() });
  return user ? (user.toObject() as IUser) : null;
}

async function updateUserProfile(
  userId: string,
  name?: string,
  bio?: string,
  headline?: string,
  githubURI?: string,
  linkedinURI?: string,
  portfolioURI?: string,
  lastKnownLocation?: number[],
  skills?: string[],
): Promise<any | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(headline !== undefined && { headline }),
      ...(githubURI !== undefined && { githubURI }),
      ...(linkedinURI !== undefined && { linkedinURI }),
      ...(portfolioURI !== undefined && { portfolioURI }),
      ...(lastKnownLocation && { lastKnownLocation }),
      updatedAt: new Date(),
    },
    // FIXED WARNING HERE 👇
    { returnDocument: "after", runValidators: true },
  ).select("-password");

  if (!user) return null;

  if (skills && Array.isArray(skills)) {
    const skillEntries = [];
    for (const sName of skills) {
      const cleanName = sName.trim();
      if (!cleanName) continue;
      let skillDoc = await Skill.findOne({
        name: new RegExp(`^${cleanName}$`, "i"),
      });
      if (!skillDoc) {
        skillDoc = await Skill.create({ name: cleanName, type: "technical" });
      }
      skillEntries.push({
        userId,
        skillId: skillDoc._id,
        proficiency: "intermediate",
      });
    }
    await UserSkill.deleteMany({ userId });
    if (skillEntries.length > 0) {
      await UserSkill.insertMany(skillEntries);
    }
  }

  return await getUserById(userId);
}
async function updateProfilePicture(
  userId: string,
  imageBuffer: Buffer,
): Promise<any | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    { profilePicture: imageBuffer, updatedAt: new Date() },
    // FIXED WARNING HERE 👇
    { returnDocument: "after" },
  ).select("-password");

  return user ? (user.toObject() as any) : null;
}

async function updateLocation(
  userId: string,
  coordinates: [number, number],
): Promise<any | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    { lastKnownLocation: coordinates, updatedAt: new Date() },
    // FIXED WARNING HERE 👇
    { returnDocument: "after" },
  ).select("-password");

  return user ? (user.toObject() as any) : null;
}
async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", HTTPStatusCodes.NOT_FOUND);

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid)
    throw new AppError(
      "Current password is incorrect",
      HTTPStatusCodes.UNAUTHORIZED,
    );

  const hashed = await hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, {
    password: hashed,
    updatedAt: new Date(),
  });
}

async function resetPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const hashed = await hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, {
    password: hashed,
    updatedAt: new Date(),
  });
}

async function deactivateUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    status: "inactive",
    updatedAt: new Date(),
  });
}

async function reactivateUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    status: "active",
    updatedAt: new Date(),
  });
}

async function deleteUser(userId: string): Promise<void> {
  await User.findByIdAndDelete(userId);
}

export const UserService = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  updateProfilePicture,
  updateLocation,
  changePassword,
  resetPassword,
  deactivateUser,
  reactivateUser,
  deleteUser,
};
