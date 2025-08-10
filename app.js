import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import errorMiddleware from './middleware/Error.middleware.js';
import Authrouter from './routes/auth.route.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.use('/auth', Authrouter);
app.use(errorMiddleware);

export default app;