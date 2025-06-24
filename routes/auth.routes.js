import {Router} from "express";
import {
  forgotPassword,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyEmail,
  refreshToken,
  authenticateToken,
  validateToken,
} from "../controllers/auth.controller.js";
import {
  signUpValidator,
  signInValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";
import {validateRequest} from "../validators/validateRequest.js";

const authRouter = Router();

authRouter.post("/sign-up", signUpValidator, validateRequest, signUp);
authRouter.post("/sign-in", signInValidator, validateRequest, signIn);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/sign-out", signOut);
authRouter.post(
  "/forgot-password",
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);
authRouter.put(
  "/reset-password/:token",
  resetPasswordValidator,
  validateRequest,
  resetPassword
);
authRouter.get("/verify-email/:token", verifyEmail);

authRouter.get("/validate-token", authenticateToken, validateToken);

export default authRouter;
