import type { Request, Response } from "express";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { UserService } from "../services/User.service.js";
import { AppError } from "../utils/AppError.js";
import { updateProfileSchema } from "../validations/user/updateProfile.validator.js";
import { updateProfilePictureSchema } from "../validations/user/updateProfilePicture.validator.js";
import { updateLocationSchema } from "../validations/user/updateLocation.validator.js";
import { changePasswordSchema } from "../validations/user/changePassword.validator.js";
import { resetPasswordSchema } from "../validations/user/resetPassword.validator.js";

async function updateProfile(req: Request, res: Response): Promise<void> {
    const { error, value } = updateProfileSchema.validate(req.body ?? {}, {
        errors: { wrap: { label: false } },
        stripUnknown: true,
    });

    if (error)
        throw new AppError( error.details?.[0]?.message || "Invalid input", HTTPStatusCodes.BAD_REQUEST);

    
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const { name, bio, headline, githubURI, linkedinURI, portfolioURI, lastKnownLocation,} = value;

    
    const updatedUser = await UserService.updateUserProfile(
        userId,
        name,
        bio,
        headline,
        githubURI,
        linkedinURI,
        portfolioURI,
        lastKnownLocation,
    );

    if (!updatedUser)
        throw new AppError(
        "Failed to update user profile",
        HTTPStatusCodes.INTERNAL_SERVER_ERROR,
        );

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: { user: updatedUser },
    });
}

async function updateProfilePicture(req: Request, res: Response ): Promise<void> {

    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const file = req.file;
    if (!file)
        throw new AppError("No file uploaded", HTTPStatusCodes.BAD_REQUEST);

    const { error } = updateProfilePictureSchema.validate(
        { mimetype: file.mimetype, size: file.size },
        { errors: { wrap: { label: false } } },
    );

    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid file",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const updatedUser = await UserService.updateProfilePicture(
        userId,
        file.buffer,
    );

    if (!updatedUser)
        throw new AppError(
        "Failed to update profile picture",
        HTTPStatusCodes.INTERNAL_SERVER_ERROR,
        );

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: { user: updatedUser },
    });
}


async function updateLocation(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const { error, value } = updateLocationSchema.validate(req.body ?? {}, {
        errors: { wrap: { label: false } },
        stripUnknown: true,
    });
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { lastKnownLocation } = value;

    const updatedUser = await UserService.updateLocation(
        userId,
        lastKnownLocation,
    );
    
    if (!updatedUser)
        throw new AppError(
        "Failed to update location",
        HTTPStatusCodes.INTERNAL_SERVER_ERROR,
        );

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: { user: updatedUser },
    });
}

async function changePassword(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const { error, value } = changePasswordSchema.validate(req.body ?? {}, {
        errors: { wrap: { label: false } },
        stripUnknown: true,
    });
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { currentPassword, newPassword } = value;

    
    await UserService.changePassword(userId, currentPassword, newPassword);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        message: "Password updated successfully",
    });
}

async function resetPassword(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const { error, value } = resetPasswordSchema.validate(req.body ?? {}, {
        errors: { wrap: { label: false } },
        stripUnknown: true,
    });
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { newPassword } = value;

    await UserService.resetPassword(userId, newPassword);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        message: "Password reset successfully",
    });
}


async function deactivateUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    await UserService.deactivateUser(userId);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        message: "Account deactivated successfully",
    });
}

async function reactivateUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    await UserService.reactivateUser(userId);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        message: "Account reactivated successfully",
    });
}

async function deleteUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    await UserService.deleteUser(userId);

    res.status(HTTPStatusCodes.NO_CONTENT).json({
        status: "success",
        message: "Account deleted successfully",
    });
}

export const UserController = {
    updateProfile,
    updateProfilePicture,
    updateLocation,
    changePassword,
    resetPassword,
    deactivateUser,
    reactivateUser,
    deleteUser
}