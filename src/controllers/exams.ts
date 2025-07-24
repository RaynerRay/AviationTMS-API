import { db } from "@/db/db";
import { ExamCreateProps, TypedRequestBody } from "@/types/types";
import { convertDateToIso } from "@/utils/convertDateToIso";
import { Request, Response } from "express";

export async function createExam(
  req: TypedRequestBody<ExamCreateProps>,
  res: Response
) {
  const data = req.body;
  try {
    //  Create the exam
    const exam = await db.exam.create({
      data: {
        title: data.title,
        examType: data.examType,
        termName: data.termName,
        academicYear: data.academicYear,
        startDate: convertDateToIso(data.startDate),
        duration: data.duration,
        passingMark: data.passingMark,
        totalMarks: data.totalMarks,
        weightage: data.weightage,
        schoolId: data.schoolId,
        examCategory: data.examCategory,
      },
    });
    // Use the exam Id
    const examId = exam.id;
    const examTitle = exam.title;
    // Create the EXAMCLASS
    for (const item of data.classes) {
      await db.examClass.create({
        data: {
          examId: examId,
          examTitle: examTitle,
          classId: item.value,
          classTitle: item.label,
        },
      });
    }
    // Create the examsubject
    for (const item of data.subjects) {
      await db.examSubject.create({
        data: {
          examId: examId,
          examTitle: examTitle,
          subjectId: item.value,
          subjectTitle: item.label,
        },
      });
    }
    console.log(exam);
    return res.status(201).json({
      data: exam,
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
export async function getExamsByAcademicYear(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const academicYear = req.query.year as string;
    const exams = await db.exam.findMany({
      where: {
        schoolId,
        academicYear: academicYear,
      },
      select: {
        id: true,
        title: true,
        examType: true,
        examCategory: true,
        termName: true,
        academicYear: true,
        startDate: true,
      },
    });

    return res.status(200).json({
      data: exams,
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
