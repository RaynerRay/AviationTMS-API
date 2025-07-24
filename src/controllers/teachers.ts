import { db } from "@/db/db";
import {
  TeacherCreateProps,
  TypedRequestBody,
} from "@/types/types";
import { convertDateToIso } from "@/utils/convertDateToIso";
import { UserRole } from "@prisma/client";
import { Request, Response } from "express";
import { createUserService } from "./users";

export async function createTeacher(
  req: TypedRequestBody<TeacherCreateProps>,
  res: Response
) {
  const data = req.body;

  const { NIN, phone, email, dateOfBirth, dateOfJoining, licenseExpiryDate } = data;
  data.dateOfBirth = convertDateToIso(dateOfBirth);
  data.dateOfJoining = convertDateToIso(dateOfJoining);
  try {
    console.log(data);
    // Check if the school already exists\
    const existingEmail = await db.teacher.findUnique({
      where: {
        email,
      },
    });
    const existingNIN = await db.teacher.findUnique({
      where: {
        NIN,
      },
    });
    const existingPhone = await db.teacher.findUnique({
      where: {
        phone,
      },
    });
    if (existingNIN) {
      console.log("NIN Already exists");
      return res.status(409).json({
        data: null,
        error: "Teacher with this NIN already exists",
      });
    }
    if (existingEmail) {
      console.log("Email Already exists");
      return res.status(409).json({
        data: null,
        error: "Teacher with this email already exists",
      });
    }
    if (existingPhone) {
      console.log("Phone Number already exists");
      return res.status(409).json({
        data: null,
        error: "Teacher with this Phone already exists",
      });
    }
    const userData = {
      email: data.email,
      password: data.password,
      role: "TEACHER" as UserRole,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      image: data.imageUrl,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
    };

    const user = await createUserService(userData);
    data.userId = user.id;
    console.log(user, data);
    const newTeacher = await db.teacher.create({
      data,
    });
    console.log(
      `Teacher created successfully: ${newTeacher.firstName} (${newTeacher.id})`
    );
    return res.status(201).json({
      data: newTeacher,
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
export async function getTeachers(req: Request, res: Response) {
  try {
    const teachers = await db.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json(teachers);
  } catch (error) {
    console.log(error);
  }
}
export async function getTeachersBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const teachers = await db.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
    });
    return res.status(200).json(teachers);
  } catch (error) {
    console.log(error);
  }
}
export async function getTeachersBriefBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const teachers = await db.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });
    return res.status(200).json(teachers);
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
