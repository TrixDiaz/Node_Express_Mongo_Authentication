import {Router} from "express";
import {forgotPassword, resetPassword, signIn, signOut, signUp} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.post("/forgot-password", forgotPassword);
authRouter.put("/reset-password/:token", resetPassword)

export default authRouter;
