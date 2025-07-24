import { db } from "@/db/db";
import {
  DocumentCreateProps,
  PeriodCreateProps,
  TypedRequestBody,
} from "@/types/types";
import { Request, Response } from "express";
import { groupBy } from "lodash";
export async function createStudentDocuments(
  req: TypedRequestBody<DocumentCreateProps[]>,
  res: Response
) {
  const data = req.body;
  try {
    const newDocs = await db.studentDocument.createManyAndReturn({
      data,
    });
    console.log(`Docs created successfully:(${newDocs})`);
    return res.status(201).json({
      data: newDocs,
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

export async function getStudentDocs(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const docs = await db.studentDocument.findMany({
      where: {
        studentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      data: docs,
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
export async function deleteDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doc = await db.studentDocument.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      data: doc,
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
