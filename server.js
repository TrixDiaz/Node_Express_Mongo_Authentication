import express from 'express';
import cookieParser from 'cookie-parser';
import connectToDatabase from "./database/mongodb.js";
import {PORT} from "./config/env.js";
import helmetConfig from "./config/helmet.js";
import corsConfig from "./config/cors.js";

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import ratelimiter from "./config/ratelimiter.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(helmetConfig);
app.use(corsConfig);
app.use(ratelimiter);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use(errorMiddleware);

app.get('/', (res) => {
   res.send('Hello, World! Welcome to the Server from Node and Express!');
});

app.listen(PORT, async () => {
   console.log(`Server started on port ${PORT}`);
   await connectToDatabase();
});