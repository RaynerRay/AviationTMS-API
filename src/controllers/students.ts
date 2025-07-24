import { db } from "@/db/db";
import {
  GuardianCreateProps,
  // MarkSheetCreateProps,
  StudentCreateProps,
  TypedRequestBody,
} from "@/types/types";
import { convertDateToIso } from "@/utils/convertDateToIso";
import { Request, Response } from "express";
import {  createUserService } from "./users";
import { UserRole } from "@prisma/client";

export async function createStudent(
  req: TypedRequestBody<StudentCreateProps>,
  res: Response
) {
  const data = req.body;
  const { regNo, email, rollNo, dob, admissionDate } = data;
  data.dob = convertDateToIso(dob);
  data.admissionDate = convertDateToIso(admissionDate);
  try {
    // Check if the school already exists\
    const existingEmail = await db.student.findUnique({
      where: {
        email,
      },
    });
  
    const existingRegNo = await db.student.findUnique({
      where: {
        regNo,
      },
    });
    const existingRollNo = await db.student.findUnique({
      where: {
        rollNo,
      },
    });
   
    if (existingEmail) {
      return res.status(409).json({
        data: null,
        error: "Student with this email already exists",
      });
    }
    if (existingRegNo) {
      return res.status(409).json({
        data: null,
        error: "Student with this RegNo already exists",
      });
    }
    if (existingRollNo) {
      return res.status(409).json({
        data: null,
        error: "Student with this RollNo already exists",
      });
    }
    // Create a student as a user
    const userData = {
      email: data.email,
      password: data.password,
      role: "STUDENT" as UserRole,
      name: data.name,
      phone: data.phone,
      image: data.imageUrl,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
    };
    const user = await createUserService(userData);
    data.userId = user.id;
    const newStudent = await db.student.create({
      data,
    });
    console.log(
      `Student created successfully: ${newStudent.firstName} (${newStudent.id})`
    );
    return res.status(201).json({
      data: newStudent,
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
export async function createGuardian(
  req: TypedRequestBody<GuardianCreateProps>,
  res: Response
) {
  const data = req.body;
  try {
    // Check if the school already exists\
    const existingGuardian = await db.guardianInfo.findUnique({
      where: {
        studentId: data.studentId,
      },
    });

    if (existingGuardian) {
      return res.status(409).json({
        data: null,
        error: "Guardian already exists",
      });
    }

    const newGuardian = await db.guardianInfo.create({
      data,
    });
    console.log(`Guardian created successfully: ${newGuardian.id} `);
    return res.status(201).json({
      data: newGuardian,
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
export async function updateGuardian(
  req: TypedRequestBody<GuardianCreateProps>,
  res: Response
) {
  const data = req.body;
  const { id } = req.params;
  try {
    // Check if the school already exists\
    const existingGuardian = await db.guardianInfo.findUnique({
      where: {
        id,
      },
    });

    if (!existingGuardian) {
      return res.status(404).json({
        data: null,
        error: "Guardian Does not exist",
      });
    }

    const updatedG = await db.guardianInfo.update({
      where: {
        id,
      },
      data,
    });
    console.log(`Guardian updated successfully: ${updatedG.id} `);
    return res.status(200).json({
      data: updatedG,
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
export async function getStudents(req: Request, res: Response) {
  try {
    const students = await db.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
  }
}
export async function getStudentsBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const students = await db.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
    });
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
  }
}
export async function getBriefStudentsBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const students = await db.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
      select: {
        id: true,
        name: true,
        regNo: true,
      },
    });
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
  }
}
// export async function createMarkSheetAndFetchStudents(
//   req: TypedRequestBody<MarkSheetCreateProps>,
//   res: Response
// ) {
//   try {
//     const data = req.body;
//     let markSheetId = "";
//     const subjectId = data.subjectId;
//     const existingMarkSheet = await db.marksheet.findFirst({
//       where: {
//         subjectId: subjectId,
//         classId: data.classId,
//         examId: data.examId,
//         termId: data.termId,
//       },
//     });
//     if (existingMarkSheet) {
//       markSheetId = existingMarkSheet.id;
//       console.log("Marksheet already exists", markSheetId);
//     } else {
//       const markSheet = await db.marksheet.create({
//         data,
//       });
//       markSheetId = markSheet.id;
//       console.log("New Marksheet Created", markSheetId);
//     }

//     const studentMarks = await db.studentMark.findMany({
//       where: {
//         subjectId: data.subjectId,
//         classId: data.classId,
//         examId: data.examId,
//         termId: data.termId,
//         marks: {
//           not: null,
//         },
//       },
//       select: {
//         studentId: true,
//       },
//     });
//     const excludedStudentIds = studentMarks.map((item) => item.studentId);
//     console.log("Excluded students Ids", excludedStudentIds);
//     const students = await db.student.findMany({
//       orderBy: {
//         name: "asc",
//       },
//       where: {
//         classId: data.classId,
//         id: {
//           notIn: excludedStudentIds,
//         },
//       },
//       select: {
//         name: true,
//         id: true,
//       },
//       take: 4,
//     });
//     console.log("Next Batch of Students", students);
//     return res.status(200).json({
//       students,
//       markSheetId: markSheetId,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }
export async function getStudentsByClass(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const { classId, streamId } = req.query;
    if (!classId || !streamId) {
      return res
        .json({
          data: null,
          error: "Class Id and Stream ID are required",
        })
        .status(403);
    }
    console.log(schoolId, classId, streamId);
    let students = [];
    if (streamId === "all") {
      students = await db.student.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          schoolId,
          classId: classId as string,
        },
      });
    } else {
      students = await db.student.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          schoolId,
          classId: classId as string,
          streamId: streamId as string,
        },
      });
    }
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
  }
}
export async function getStudentsByParentId(req: Request, res: Response) {
  try {
    const { parentId } = req.params;
    const students = await db.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        parentId,
      },
      select: {
        id: true,
        name: true,
        regNo: true,
        classTitle: true,
        streamTitle: true,
        dob: true,
        imageUrl: true,
      },
    });
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
  }
}
export async function getNextStudentSequence(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const lastStudent = await db.student.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
    });
    // BU/UG/2024/0001
    const stringSeq = lastStudent?.regNo.split("/")[3];
    const lastSeq = stringSeq ? parseInt(stringSeq) : 0;
    const nextSeq = lastSeq + 1;
    return res.status(200).json(nextSeq);
  } catch (error) {
    console.log(error);
  }
}
export async function getStudentById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const student = await db.student.findUnique({
      where: {
        id,
      },
      include: {
        guardian: true,
      },
    });
    return res.status(200).json(student);
  } catch (error) {
    console.log(error);
  }
}
export async function getStudentByUserId(req: Request, res: Response) {
  const { userId } = req.params;
  try {
    const student = await db.student.findUnique({
      where: {
        userId,
      },
      include: {
        guardian: true,
      },
    });
    return res.status(200).json(student);
  } catch (error) {
    console.log(error);
  }
}
