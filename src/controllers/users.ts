import { db } from "@/db/db";
import {
  TypedRequestBody,
  UserCreateProps,
  UserLoginProps,
} from "@/types/types";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload
} from "@/utils/tokens";
import { UserRole } from "@prisma/client";

export async function createUserService(data: UserCreateProps) {
  // Check if the user already exists
  const existingEmail = await db.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  // Hash the Password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userData = { ...data, password: hashedPassword };

  const newUser = await db.user.create({
    data: userData,
  });

  console.log(`User created successfully: ${newUser.name} (${newUser.id})`);
  return newUser;
}

export const createUser = async (
  req: TypedRequestBody<UserCreateProps>,
  res: Response
): Promise<void> => {
  try {
    const newUser = await createUserService(req.body);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      data: userWithoutPassword,
      error: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      data: null,
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const loginUser = async (
  req: TypedRequestBody<UserLoginProps>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  
  try {
    // Check if the user exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    
    if (!existingUser) {
      res.status(409).json({
        data: null,
        error: "Invalid Credentials",
      });
      return;
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    
    if (!isPasswordValid) {
      res.status(401).json({
        error: "Invalid credentials",
        data: null,
      });
      return;
    }
    
    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
    
    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = existingUser;

    res.status(200).json({
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      error: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        image: true,
        schoolId: true,
        schoolName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      error: "Failed to fetch users" 
    });
  }
};

export const getStaffMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolId } = req.params;
    
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        OR: [
          { role: "SECRETARY" as UserRole }, 
          { role: "LIBRARIAN" as UserRole }
        ],
        schoolId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        image: true,
        schoolId: true,
        schoolName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      error: "Failed to fetch staff members" 
    });
  }
};

export const getUserProfileId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.query;
    const userRole = role as UserRole;
    
    let profileId = null;
    
    if (userRole === "PARENT") {
      profileId = await db.parent.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      });
    }
    
    res.status(200).json(profileId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      error: "Failed to fetch profile" 
    });
  }
};