import {Router} from "express";
import {
    deleteUser,
    getUser,
    getUsers,
    storeUser,
    updateUser,
    updateUserPassword
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Fetch all users
userRouter.get("/", getUsers);

// Fetch a single user by ID
userRouter.get("/:id", authorize, getUser);

// Create a new user
userRouter.post("/", authorize, storeUser);

// Update an existing user by ID
userRouter.put("/:id", authorize, updateUser);

// Update an existing user  password by ID
userRouter.put("/:id/password", authorize, updateUserPassword);

// Delete a user by ID
userRouter.delete("/:id", authorize, deleteUser);

export default userRouter;
