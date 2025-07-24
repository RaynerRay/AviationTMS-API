import express, { Router } from "express";
import {
  createUser,
  getAllUsers,
  getStaffMembers,
  getUserProfileId,
  loginUser,
} from "@/controllers/users";

const userRouter: Router = express.Router();

// User registration
userRouter.post("/register", createUser);

// User login
userRouter.post("/login", loginUser);

// Get all users
userRouter.get("/users", getAllUsers);

// Get user profile ID
userRouter.get("/users/:userId", getUserProfileId);

// Get staff members by school
userRouter.get("/staff/:schoolId", getStaffMembers);

export default userRouter;