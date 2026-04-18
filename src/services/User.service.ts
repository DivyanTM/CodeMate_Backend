import { User } from "../models/User.js";
import type { IUser } from "../interfaces/User.js";
import { hashPassword, verifyPassword } from "../utils/Password.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";

async function createUser(name: string,email: string,hashedPassword: string,dateOfBirth: Date,): Promise<IUser> {
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    dateOfBirth,
  });
  return user.toObject() as IUser;
}

async function getUserById(userId: string): Promise<IUser | null> {
  const user = await User.findById(userId).select("-password");
  return user ? (user.toObject() as IUser) : null;
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
): Promise<IUser | null> {
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
    { new: true, runValidators: true },
  ).select("-password");

  return user ? (user.toObject() as IUser) : null;
}

async function updateProfilePicture(userId: string,imageBuffer: Buffer,): Promise<IUser | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    { profilePicture: imageBuffer, updatedAt: new Date() },
    { new: true },
  ).select("-password");

  return user ? (user.toObject() as IUser) : null;
}

async function updateLocation(userId: string,coordinates: [number, number],): Promise<IUser | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    { lastKnownLocation: coordinates, updatedAt: new Date() },
    { new: true },
  ).select("-password");

  return user ? (user.toObject() as IUser) : null;
}

async function changePassword(userId: string,currentPassword: string,newPassword: string,): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", HTTPStatusCodes.NOT_FOUND);

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) throw new AppError("Current password is incorrect", HTTPStatusCodes.UNAUTHORIZED);

  const hashed = await hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, {
    password: hashed,
    updatedAt: new Date(),
  });
}

async function resetPassword(userId: string,newPassword: string,): Promise<void> {
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