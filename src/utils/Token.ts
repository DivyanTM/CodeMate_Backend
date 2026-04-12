import jwt from "jsonwebtoken";
import type { AuthTokens, TokenPayload } from "../interfaces/User.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const JWT_SECRET: string = process.env["JWT_SECRET"] || "jfjfjfjfjfjjfjfjfjf";
const JWT_REFRESH_SECRET: string = process.env["JWT_REFRESH_SECRET"] || "jfjfjfjfjfjjfjfjfjf";

export function generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
}

export function generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
}

export function generateAuthTokens(userId: string, email: string): AuthTokens {
    return {
        accessToken: generateAccessToken(userId, email),
        refreshToken: generateRefreshToken(userId, email),
    };
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

export function rotateTokens(refreshToken: string): AuthTokens {
    const payload = verifyRefreshToken(refreshToken);
    return generateAuthTokens(payload.userId, payload.email);
}
