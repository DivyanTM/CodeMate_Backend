import { AuthService } from "../services/Auth.service.js";
import { loginSchema } from "../validations/auth/auth.validator.js";
import type { Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { HTTPStatusCodes } from '../constants/HttpStatusCodes.js';
import type { IUser, AuthTokens } from "../interfaces/User.js";
import { registrationSchema } from "../validations/auth/registration.validator.js";
import { refreshTokenSchema } from "../validations/auth/refreshToken.validator.js";


async function login(req: Request, res: Response): Promise<void>{

    const { error, value } = loginSchema.validate(req.body ?? {}, {
        errors: { wrap: { label: false } },
    });

    if (error) throw new AppError(error.details?.[0]?.message || "Invalid input", HTTPStatusCodes.BAD_REQUEST);
    
    const { email, password } = value;
    
    const {user,tokens} = await AuthService.login(email, password) as {user: IUser, tokens: AuthTokens};

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: {
            user,
            tokens
        }
    });

}

async function register(req: Request, res: Response): Promise<void>{
    
    const { error, value } = registrationSchema.validate(req.body ?? {}, {
        errors: {wrap : {label:false}}
    });

    if (error) throw new AppError(error.details?.[0]?.message || "Invalid input", HTTPStatusCodes.BAD_REQUEST);
    
    const {user,tokens} = await AuthService.register(value.name,value.email,value.password,value.dateOfBirth) as {user: IUser, tokens: AuthTokens};

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: {
            user,
            tokens
        }
    });
}

async function refreshTokens(req: Request, res: Response): Promise<void> {
    const { error, value } = refreshTokenSchema.validate(req.body ?? {},{
        errors: {wrap : {label:false}}
    });
    
    if (error) throw new AppError(error.details?.[0]?.message || "Invalid input", HTTPStatusCodes.BAD_REQUEST);
    
    const tokens = await AuthService.refreshTokens(value.refreshToken);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: {
            tokens
        }
    });
}


export const AuthController = {
    login,
    register,
    refreshTokens
}