import { db } from "@/db/db";
import { TypedRequestBody, UserLogCreateProps } from "@/types/types";
import { Request, Response } from "express";

export async function createUserLog(
  req: TypedRequestBody<UserLogCreateProps>,
  res: Response
) {
  const data = req.body;
  try {
    const newLog = await db.userLog.create({
      data,
    });
    console.log(`Log created successfully: ${newLog.name} (${newLog.id})`);
    return res.status(201).json({
      data: newLog,
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

export async function getLogsBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const logs = await db.userLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
    });
    return res.status(200).json(logs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to fetch " });
  }
}
