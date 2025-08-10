import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export async function registerUser(fullName, username, email, password, mobile) {
    if (!fullName) throw new AppError('Full name is required', 400);
    if (!username) throw new AppError('Username is required', 400);
    if (!email) throw new AppError('Email is required', 400);
    if (!password) throw new AppError('Password is required', 400);
    if (!mobile) throw new AppError('Mobile number is required', 400);

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw new AppError('Username already exists', 400);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new AppError('Email already exists', 400);
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
        throw new AppError('Mobile number already exists', 400);
    }

    const passwordHash = bcrypt.hashSync(password, 12);

    const newUser = new User({
        fullName,
        username,
        email,
        passwordHash,
        mobile,
    });

    return await newUser.save();
}


export async function loginUser(email, password) {
    if (!email) throw new AppError('Email is required', 400);
    if (!password) throw new AppError('Password is required', 400);

    const user = await User.findOne({ email });
    if (!user) throw new AppError('Invalid email or password', 401);

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) throw new AppError('Invalid email or password', 401);

    return user;
}
