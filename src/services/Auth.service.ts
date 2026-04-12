import type { IUser, AuthTokens } from "../interfaces/User.js";
import { hashPassword, verifyPassword } from "../utils/Password.js";
import { generateAuthTokens, rotateTokens } from "../utils/Token.js";
import { UserService } from "./User.service.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";

async function login(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new AppError("Invalid email or password", HTTPStatusCodes.UNAUTHORIZED);
    
    if(user.status==="inactive") throw new AppError("Account is inactive. Please contact support.", HTTPStatusCodes.FORBIDDEN);

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new AppError("Invalid email or password", HTTPStatusCodes.UNAUTHORIZED);
    
    const tokens = generateAuthTokens(user._id.toString(), user.email);
    return { user, tokens };

}

async function register(name: string, email: string, password: string, dateOfBirth: Date): Promise<{ user: IUser; tokens: AuthTokens }> {
    
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) throw new AppError("Email already in use", HTTPStatusCodes.BAD_REQUEST);

    const hashedPassword = await hashPassword(password);
    const user = await UserService.createUser(name, email, hashedPassword, dateOfBirth);
    const tokens = generateAuthTokens(user._id.toString(), user.email);
    return { user, tokens };
}

async function refreshTokens(refreshToken: string): Promise<AuthTokens>{
    return rotateTokens(refreshToken);
}

export const AuthService = {
    login,
    register,
    refreshTokens
}

