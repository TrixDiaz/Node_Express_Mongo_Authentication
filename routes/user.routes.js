import { Router } from "express";
import {
    deleteUser,
    getUser,
    getUsers,
    storeUser,
    updateUser,
    updateUserPassword,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import validateRequest from "../validators/validateRequest.js";
import {
    createUserValidator,
    updateUserValidator,
    updateUserPasswordValidator,
    validateUserId,
} from "../validators/user.validator.js";

const userRouter = Router();

// Fetch all users
userRouter.get("/", getUsers);

// Fetch a single user by ID
userRouter.get("/:id", authorize, validateUserId, validateRequest, getUser);

// Create a new user
userRouter.post("/", authorize, createUserValidator, validateRequest, storeUser);

// Update an existing user by ID
userRouter.put("/:id", authorize, updateUserValidator, validateRequest, updateUser);

// Update user password
userRouter.put("/:id/password", authorize, updateUserPasswordValidator, validateRequest, updateUserPassword);

// Delete a user by ID
userRouter.delete("/:id", authorize, validateUserId, validateRequest, deleteUser);

export default userRouter;
