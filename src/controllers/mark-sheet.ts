import { db } from "@/db/db";
import { CreateMarkSheetProps, TypedRequestBody } from "@/types/types";
import { Request, Response } from "express";
function calculateGrade(marks: number): Grade {
  if (marks >= 95) return "A+";
  if (marks >= 90) return "A";
  if (marks >= 85) return "B+";
  if (marks >= 80) return "B";
  if (marks >= 75) return "C+";
  if (marks >= 70) return "C";
  if (marks >= 60) return "D";
  return "F";
}

// Type definitions
type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

type Student = {
  id: string;
  name: string;
  regNo: string;
  marks: number;
  position: number;
  grade: Grade;
};
function removeDuplicatesById<T extends { id: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      return true;
    }
    return false;
  });
}
export async function createMarkSheet(
  req: TypedRequestBody<CreateMarkSheetProps>,
  res: Response
) {
  const data = req.body;
  console.log("Received Data=>", data);
  try {
    //  Create the Marksheet
    const markSheet = await db.marksheet.create({
      data: {
        examId: data.examId,
        classId: data.classId,
        subjectId: data.subjectId,
        termId: data.termId,
      },
    });
    // Use the marksheet Id
    console.log(`Marksheet Created=> ${markSheet.id}`);
    const marksheetId = markSheet.id;
    // Create the Student Marks
    for (const item of data.studentMarks) {
      const stMark = await db.studentMark.create({
        data: {
          examId: data.examId,
          studentId: item.studentId,
          subjectId: data.subjectId,
          classId: data.classId,
          termId: data.termId,
          marks: item.marks,
          isAbsent: item.isAbsent,
          comments: item.comments,
          marksheetId,
        },
      });
      console.log(`New Mark Created=>${stMark.id}`);
    }

    const studentMarks = await db.studentMark.findMany({
      where: {
        subjectId: data.subjectId,
      },
      select: {
        studentId: true,
      },
    });
    const excludedStudentIds = studentMarks.map((item) => item.studentId);
    console.log("Excluded students Ids", excludedStudentIds);
    const students = await db.student.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        classId: data.classId,
        id: {
          notIn: excludedStudentIds,
        },
      },
      select: {
        name: true,
        id: true,
      },
      take: 4,
    });
    console.log("Next Batch of Students", students);
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.status(500).json(null);
  }
}
export async function updateMarkSheetWithMarks(
  req: TypedRequestBody<CreateMarkSheetProps>,
  res: Response
) {
  const data = req.body;
  const { markSheetId } = req.params;
  console.log("Received Data=>", data);
  try {
    // Use the marksheet Id
    console.log(`Marksheet => ${markSheetId}`);
    // Create the Student Marks
    console.log("Creating marks for ", data.studentMarks.length);
    for (const item of data.studentMarks) {
      const stMark = await db.studentMark.create({
        data: {
          examId: data.examId,
          studentId: item.studentId,
          subjectId: data.subjectId,
          termId: data.termId,
          marks: item.marks,
          isAbsent: item.isAbsent,
          comments: item.comments,
          marksheetId: markSheetId,
        },
      });
      console.log(`New Mark Created=>${stMark.id}`);
    }

    const studentMarks = await db.studentMark.findMany({
      where: {
        subjectId: data.subjectId,
      },
      select: {
        studentId: true,
      },
    });
    const excludedStudentIds = studentMarks.map((item) => item.studentId);
    console.log("Excluded students Ids", excludedStudentIds);
    const students = await db.student.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        classId: data.classId,
        id: {
          notIn: excludedStudentIds,
        },
      },
      select: {
        name: true,
        id: true,
      },
      take: 4,
    });
    console.log("Next Batch of Students", students);
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.status(500).json(null);
  }
}
// export async function getSubjectMarkSheet(req: Request, res: Response) {
//   const { subjectId } = req.params;

//   const classId = req.query.classId as string;
//   const termId = req.query.termId as string;
//   const examId = req.query.examId as string;
//   console.log("Recevied Data=>", subjectId, classId, termId, examId);
//   try {
//     // const markSheet = await db.marksheet.findFirst({
//     //   where: {
//     //     subjectId,
//     //     examId,
//     //     termId,
//     //     classId,
//     //   },
//     //   include: {
//     //     marks: {
//     //       include: {
//     //         student: {
//     //           select: {
//     //             id: true,
//     //             firstName: true,
//     //             lastName: true,
//     //             regNo: true,
//     //           },
//     //         },
//     //       },
//     //     },
//     //   },
//     // });
//     // console.log(markSheet);
//     // if (!markSheet) {
//     //   return res.status(404).json({
//     //     data: null,
//     //     error: "No Marksheet found",
//     //   });
//     // }
//     // console.log(markSheet);
//     // const studentMarks = await db.studentMark.findMany({
//     //   where: {
//     //     examId,
//     //     subject: {
//     //       id: subjectId,
//     //     },
//     //     termId,
//     //     student: {
//     //       classId,
//     //     },
//     //   },
//     //   include: {
//     //     student: {
//     //       select: {
//     //         id: true,
//     //         name: true,
//     //         firstName: true,
//     //         lastName: true,
//     //         regNo: true,
//     //       },
//     //     },
//     //   },
//     //   orderBy: {
//     //     marks: "desc",
//     //   },
//     // });
//     console.log("StudentMarks", markSheet.marks.length);

//     // Calculate positions based on marks
//     let currentPosition = 0; // Tracks the actual numerical position
//     let displayPosition = 0; // Tracks the position to display (accounting for ties)
//     let lastMarks: number | null = null;
//     let sameMarkCount = 0;

//     const formattedStudentMarks = markSheet.marks.map((mark, index) => {
//       currentPosition = index + 1;
//       if (lastMarks !== mark.marks) {
//         displayPosition = currentPosition;
//         lastMarks = mark.marks;
//         sameMarkCount = 1;
//       } else {
//         sameMarkCount++;
//       }

//       return {
//         id: mark.student.id.slice(-3).toUpperCase(),
//         name: `${mark.student.firstName} ${mark.student.lastName}`,
//         regNo: mark.student.regNo,
//         marks: mark.marks || 0, // Use 0 if marks is null
//         position: displayPosition,
//         grade: calculateGrade(mark.marks || 0),
//       };
//     });

//     // const uniqueStudents = removeDuplicatesById(formattedStudentMarks);
//     return res.status(200).json({
//       data: formattedStudentMarks,
//       error: null,
//     });
//   } catch (error) {
//     console.error("Error fetching student marks:", error);
//     return res.status(500).json({
//       data: null,
//       error: "Something went wrong",
//     });
//   }
// }
export async function getSubjectMarkSheet(req: Request, res: Response) {
  const { subjectId } = req.params;

  const classId = req.query.classId as string;
  const termId = req.query.termId as string;
  const examId = req.query.examId as string;
  // console.log("Recevied Data=>", subjectId, classId, termId, examId);
  try {
    const studentMarks = await db.studentMark.findMany({
      where: {
        examId,
        subject: {
          id: subjectId,
        },
        termId,
        student: {
          classId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            regNo: true,
          },
        },
      },
      orderBy: {
        marks: "desc",
      },
    });
    // console.log("StudentMarks", studentMarks);
    // Correct position calculation
    let currentRank = 1;
    let lastMarks: number | null = null;
    let sameMarkCount = 0;

    const formattedStudentMarks = studentMarks.map((mark, index) => {
      if (index === 0) {
        // First student
        lastMarks = mark.marks;
      } else if (lastMarks !== mark.marks) {
        // Different mark than previous student
        currentRank = index + 1;
        lastMarks = mark.marks;
      }
      // If marks are the same as previous, rank stays the same

      return {
        id: mark.student.id.slice(-3).toUpperCase(),
        name: `${mark.student.firstName} ${mark.student.lastName}`,
        regNo: mark.student.regNo,
        marks: mark.marks || 0,
        position: currentRank,
        grade: calculateGrade(mark.marks || 0),
      };
    });

    return res.status(200).json({
      data: formattedStudentMarks,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching student marks:", error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
