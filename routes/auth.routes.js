import {Router} from "express";
import {forgotPassword, resetPassword, signIn, signOut, signUp} from "../controllers/auth.controller.js";
import {
    signUpValidator,
    signInValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} from "../validators/auth.validator.js";
import {validateRequest} from "../validators/validateRequest.js";

const authRouter = Router();

authRouter.post("/sign-up", signUpValidator, validateRequest, signUp);
authRouter.post("/sign-in", signInValidator, validateRequest, signIn);
authRouter.post("/sign-out", signOut);
authRouter.post("/forgot-password", forgotPasswordValidator, validateRequest, forgotPassword);
authRouter.put("/reset-password/:token", resetPasswordValidator, validateRequest, resetPassword)

export default authRouter;
