import { db } from "@/db/db";
import {
  // ContactProps,
  ParentCreateProps,
  TypedRequestBody,
} from "@/types/types";
import { convertDateToIso } from "@/utils/convertDateToIso";
import { Request, Response } from "express";
import { createUserService } from "./users";
import { UserRole } from "@prisma/client";

export async function createParent(
  req: TypedRequestBody<ParentCreateProps>,
  res: Response
) {
  const data = req.body;
  const { phone, email, dob } = data;
  data.dob = convertDateToIso(dob);
  try {
    // Check if the school already exists\
    const existingEmail = await db.parent.findUnique({
      where: {
        email,
      },
    });
  
    const existingPhone = await db.parent.findUnique({
      where: {
        phone,
      },
    });
    
    if (existingEmail) {
      return res.status(409).json({
        data: null,
        error: "Parent with this email already exists",
      });
    }
    if (existingPhone) {
      return res.status(409).json({
        data: null,
        error: "Parent with this Phone already exists",
      });
    }
    const userData = {
      email: data.email,
      password: data.password,
      role: "PARENT" as UserRole,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      image: data.imageUrl,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
    };
    const user = await createUserService(userData);
    data.userId = user.id;
    console.log(user, data);
    const newParent = await db.parent.create({
      data,
    });
    console.log(
      `Parent created successfully: ${newParent.firstName} (${newParent.id})`
    );
    return res.status(201).json({
      data: newParent,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getParents(req: Request, res: Response) {
  try {
    const parents = await db.parent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json(parents);
  } catch (error) {
    console.log(error);
  }
}
export async function getParentsBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const parents = await db.parent.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        // schoolId,
      },
    });
    return res.status(200).json(parents);
  } catch (error) {
    console.log(error);
  }
}
// export async function getCustomerById(req: Request, res: Response) {
//   const { id } = req.params;
//   try {
//     const customer = await db.customer.findUnique({
//       where: {
//         id,
//       },
//     });
//     return res.status(200).json(customer);
//   } catch (error) {
//     console.log(error);
//   }
// }
