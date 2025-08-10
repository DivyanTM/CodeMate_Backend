import { ResponseBody } from '../models/ResponseBody.js';
import { loginUser, registerUser } from '../services/auth.service.js';
import AppError from '../utils/AppError.js';

export const register = async (req, res) => {
    let body = req.body;
    if (!body) {
        throw new AppError('Request body is required', 400);
    }
    if (!body.fullName || !body.username || !body.email || !body.password || !body.mobile) {
        throw new AppError('All fields are required', 400);
    }

    let user = await registerUser(
        body.fullName.trim(),
        body.username.trim(),
        body.email.trim(),
        body.password,
        body.mobile.trim()
    );

    return res.status(201).json(
        ResponseBody.success('User registered successfully', user)
    );

};

export const login = async (req, res) => {
    let body = req.body;
    if (!body) {
        throw new AppError('Request body is required', 400);
    }
    if (!body.email || !body.password) {
        throw new AppError('Email and password are required', 400);
    }

    let user = await loginUser(body.email, body.password);

    return res.status(200).json(
        ResponseBody.success('User logged in successfully', user)
    );
}