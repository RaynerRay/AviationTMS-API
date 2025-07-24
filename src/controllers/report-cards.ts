import { db } from "@/db/db";
import { ExamCategory, ExamType } from "@prisma/client";
import { Request, Response } from "express";
// https://claude.ai/chat/e402c6ec-afaa-4bc7-8ba1-fecbaf54e0f7
// async function getClassReportData(
//   classId: string,
//   termId: string,
//   examIds: string[]
// ) {
//   // Get class details with stream information
//   const classData = await db.class.findUnique({
//     where: {
//       id: classId,
//     },
//     // include: {
//     //   term: {
//     //     where: {
//     //       id: termId,
//     //     },
//     //   },
//     // },
//   });

//   if (!classData) {
//     throw new Error("Class not found");
//   }

//   // Get all students in this class
//   const students = await db.student.findMany({
//     where: {
//       classId: classId,
//     },
//     include: {
//       stream: true,
//     },
//   });

//   // Map exam categories to their respective positions
//   const examCategoryMap = {
//     TERM_START: "beginningTerm",
//     MID_TERM: "midTerm",
//     END_TERM: "endTerm",
//   };

//   // Fetch all subjects for this class
//   const subjects = await db.subject.findMany({
//     where: {
//       examSubjects: {
//         some: {
//           examId: {
//             in: examIds,
//           },
//         },
//       },
//     },
//   });

//   // Get all student marks for these exams, term, and class
//   const studentMarks = await db.studentMark.findMany({
//     where: {
//       classId: classId,
//       termId: termId,
//       examId: {
//         in: examIds,
//       },
//     },
//     include: {
//       exam: true,
//       subject: true,
//       student: true,
//     },
//   });

//   // Get all marksheets for grading reference
//   const marksheets = await db.marksheet.findMany({
//     where: {
//       classId: classId,
//       termId: termId,
//       examId: {
//         in: examIds,
//       },
//     },
//     include: {
//       marks: true,
//     },
//   });

//   // Function to calculate grade based on marks
//   function calculateGrade(marks: number): string {
//     if (marks >= 90) return "A+";
//     if (marks >= 85) return "A";
//     if (marks >= 80) return "A-";
//     if (marks >= 75) return "B+";
//     if (marks >= 70) return "B";
//     if (marks >= 65) return "B-";
//     if (marks >= 60) return "C+";
//     if (marks >= 55) return "C";
//     if (marks >= 50) return "C-";
//     if (marks >= 45) return "D+";
//     if (marks >= 40) return "D";
//     return "F";
//   }

//   // Process students data to match the required format
//   const processedStudents = students.map((student) => {
//     // Group marks by subject
//     const subjectMarks = {};

//     subjects.forEach((subject) => {
//       subjectMarks[subject.id] = {
//         name: subject.name,
//         beginningTerm: null,
//         midTerm: null,
//         endTerm: null,
//         grade: null,
//         comment: null,
//       };
//     });

//     // Populate marks for each exam type
//     studentMarks
//       .filter((mark) => mark.studentId === student.id)
//       .forEach((mark) => {
//         const examCategory = mark.exam.examCategory;
//         const mappedCategory = examCategoryMap[examCategory];

//         if (mappedCategory && subjectMarks[mark.subjectId]) {
//           subjectMarks[mark.subjectId][mappedCategory] = mark.marks;
//           subjectMarks[mark.subjectId].comment = mark.comments;
//         }
//       });

//     // Calculate average and grade for each subject
//     Object.values(subjectMarks).forEach((subject: any) => {
//       const validMarks = [
//         subject.beginningTerm,
//         subject.midTerm,
//         subject.endTerm,
//       ].filter((m) => m !== null);
//       if (validMarks.length > 0) {
//         const average =
//           validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length;
//         subject.average = Math.round(average * 10) / 10; // Round to 1 decimal place
//         subject.grade = calculateGrade(subject.average);
//       }
//     });

//     return {
//       name: `${student.firstName} ${student.lastName}`,
//       admissionNumber: student.regNo,
//       class: classData.title,
//       stream: student.stream.title,
//       subjects: Object.values(subjectMarks),
//       teacherComment: "", // This needs to be fetched separately or calculated
//     };
//   });

//   // Format the final response
//   const response = {
//     className: `${classData.title} 5A || ""}`,
//     term: `Term 1`,
//     year: "2025",
//     teacher: "Not done Yet",
//     students: processedStudents,
//   };

//   return marksheets;
// }
// async function getClassReportData(
//   classId: string,
//   termId: string,
//   examIds: string[]
// ) {
//   // Get all marksheets for the specified class, term, and exams
//   const marksheets = await db.marksheet.findMany({
//     where: {
//       classId: classId,
//       termId: termId,
//       examId: {
//         in: examIds,
//       },
//     },
//     include: {
//       exam: true,
//       subject: true,
//       marks: {
//         include: {
//           student: {
//             include: {
//               stream: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!marksheets.length) {
//     throw new Error("No marksheets found for the given criteria");
//   }

//   // Extract class information from the first marksheet
//   const classInfo = await db.class.findFirst({
//     where: {
//       id: classId,
//     },
//   });
//   const termInfo = await db.period.findFirst({
//     where: {
//       id: termId,
//     },
//   });

//   // Map exam categories to their respective positions
//   const examCategoryMap = {
//     TERM_START: "beginningTerm",
//     MID_TERM: "midTerm",
//     END_TERM: "endTerm",
//   };

//   // Group marksheets by exam category
//   const marksheetsByExam = {};
//   marksheets.forEach((marksheet) => {
//     const category = marksheet.exam.examCategory;
//     if (!marksheetsByExam[category]) {
//       marksheetsByExam[category] = [];
//     }
//     marksheetsByExam[category].push(marksheet);
//   });

//   // Get unique students from all marksheets
//   const studentMap = new Map();
//   marksheets.forEach((marksheet) => {
//     marksheet.marks.forEach((mark) => {
//       if (!studentMap.has(mark.student.id)) {
//         studentMap.set(mark.student.id, mark.student);
//       }
//     });
//   });

//   // Process students data to match the required format
//   const processedStudents = Array.from(studentMap.values()).map((student) => {
//     // Initialize subjects data structure
//     const subjectsMap = {};

//     // Process each marksheet for this student
//     marksheets.forEach((marksheet) => {
//       const subjectId = marksheet.subject.id;
//       const examCategory = marksheet.exam.examCategory;
//       const mappedCategory = examCategoryMap[examCategory];

//       // Initialize subject if not already done
//       if (!subjectsMap[subjectId]) {
//         subjectsMap[subjectId] = {
//           name: marksheet.subject.name,
//           beginningTerm: null,
//           midTerm: null,
//           endTerm: null,
//           grade: null,
//           comment: null,
//         };
//       }

//       // Find student's mark for this marksheet
//       const studentMark = marksheet.marks.find(
//         (mark) => mark.studentId === student.id
//       );
//       if (studentMark && mappedCategory) {
//         subjectsMap[subjectId][mappedCategory] = studentMark.marks;
//         subjectsMap[subjectId].comment = studentMark.comments;
//       }
//     });

//     // Calculate grade for each subject
//     Object.values(subjectsMap).forEach((subject: any) => {
//       // Calculate average based on available marks
//       const validMarks = [
//         subject.beginningTerm,
//         subject.midTerm,
//         subject.endTerm,
//       ].filter((m) => m !== null && m !== undefined);
//       if (validMarks.length > 0) {
//         const average =
//           validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length;
//         subject.average = Math.round(average * 10) / 10; // Round to 1 decimal place
//         subject.grade = calculateGrade(subject.average);
//       }
//     });

//     return {
//       name: `${student.firstName} ${student.lastName}`,
//       admissionNumber: student.regNo,
//       class: student.classTitle,
//       stream: student.streamTitle,
//       subjects: Object.values(subjectsMap),
//       teacherComment: "",
//     };
//   });

//   // Format the final response
//   const response = {
//     className: classInfo?.title,
//     term: termInfo?.term,
//     year: termInfo?.year,
//     teacher: classInfo?.classTeacherName,
//     students: processedStudents,
//   };

//   return response;
// }

// Define interfaces for the data structures
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  regNo: string;
  classTitle: string | null;
  streamTitle: string | null;
  stream?: {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    classId: string;
  };
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  schoolId?: string;
  schoolName?: string;
  // Adding other potential fields that might exist in your schema
  // but aren't used in this function
}

interface Mark {
  id?: string;
  studentId: string;
  marksheetId?: string | null;
  marks: number | null;
  comments: string | null;
  student: Student;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Subject {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  schoolId?: string;
  // Add other fields that might be in your schema
}

// Define missing enums that are referenced

interface Exam {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  schoolId: string;
  title: string;
  examType: ExamType;
  termName: number;
  academicYear: string;
  startDate: Date;
  duration: number;
  passingMark: number;
  totalMarks: number;
  weightage: number;
  examCategory: ExamCategory;
  // The error indicates these properties might be missing in the actual data
  endDate?: Date;
  status?: string;
  comments?: string;
}

interface Marksheet {
  id?: string;
  classId: string;
  termId: string;
  examId: string;
  exam: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    title: string;
    examType: ExamType;
    termName: number;
    academicYear: string;
    startDate: Date;
    duration: number;
    passingMark: number;
    totalMarks: number;
    weightage: number;
    examCategory: ExamCategory;
    endDate?: Date;
    status?: string;
    comments?: string;
  };
  subject: Subject;
  marks: Mark[];
  createdAt?: Date;
  updatedAt?: Date;
  schoolId?: string;
  // Add other fields that might be in your schema
}

interface ClassInfo {
  id: string;
  title: string;
  classTeacherName: string | null;
}

interface TermInfo {
  id: string;
  term: string;
  year: string | number;
}

interface SubjectResult {
  name: string;
  beginningTerm: number | null;
  midTerm: number | null;
  endTerm: number | null;
  average?: number;
  grade: string | null;
  comment: string | null;
}

interface StudentResult {
  name: string;
  admissionNumber: string;
  class: string; // We'll handle null values when creating this
  stream: string; // We'll handle null values when creating this
  subjects: SubjectResult[];
  teacherComment: string;
}

interface ClassReportData {
  className: string | undefined;
  term: string | undefined;
  year: string | number | undefined;
  teacher: string | null | undefined;
  students: StudentResult[];
}

// Type for the exam category mapping
type ExamCategoryMap = {
  [key in ExamCategory]: "beginningTerm" | "midTerm" | "endTerm";
};

// Type for marksheets grouped by exam category
interface MarksheetsByExam {
  [category: string]: Marksheet[];
}

async function getClassReportData(
  classId: string,
  termId: string,
  examIds: string[]
): Promise<ClassReportData> {
  // Get all marksheets for the specified class, term, and exams
  const marksheets = await db.marksheet.findMany({
    where: {
      classId: classId,
      termId: termId,
      examId: {
        in: examIds,
      },
    },
    include: {
      exam: true,
      subject: true,
      marks: {
        include: {
          student: {
            include: {
              stream: true,
            },
          },
        },
      },
    },
  });

  if (!marksheets.length) {
    throw new Error("No marksheets found for the given criteria");
  }

  // Extract class information from the first marksheet
  const classInfo = (await db.class.findFirst({
    where: {
      id: classId,
    },
  })) as ClassInfo | null;

  const termInfo = (await db.period.findFirst({
    where: {
      id: termId,
    },
  })) as TermInfo | null;

  // Map exam categories to their respective positions
  const examCategoryMap: ExamCategoryMap = {
    [ExamCategory.TERM_START]: "beginningTerm",
    [ExamCategory.MID_TERM]: "midTerm",
    [ExamCategory.END_TERM]: "endTerm",
  };

  // Group marksheets by exam category
  const marksheetsByExam: MarksheetsByExam = {};
  marksheets.forEach((marksheet) => {
    const category = marksheet.exam.examCategory;
    if (!marksheetsByExam[category]) {
      marksheetsByExam[category] = [];
    }
    marksheetsByExam[category].push(marksheet);
  });

  // Get unique students from all marksheets
  const studentMap = new Map<string, Student>();
  marksheets.forEach((marksheet) => {
    marksheet.marks.forEach((mark) => {
      if (!studentMap.has(mark.student.id)) {
        studentMap.set(mark.student.id, mark.student);
      }
    });
  });

  // Process students data to match the required format
  const processedStudents: StudentResult[] = Array.from(
    studentMap.values()
  ).map((student) => {
    // Initialize subjects data structure
    const subjectsMap: Record<string, SubjectResult> = {};

    // Process each marksheet for this student
    marksheets.forEach((marksheet) => {
      const subjectId = marksheet.subject.id;
      const examCategory = marksheet.exam.examCategory;
      const mappedCategory = examCategoryMap[examCategory];

      // Initialize subject if not already done
      if (!subjectsMap[subjectId]) {
        subjectsMap[subjectId] = {
          name: marksheet.subject.name,
          beginningTerm: null,
          midTerm: null,
          endTerm: null,
          grade: null,
          comment: null,
        };
      }

      // Find student's mark for this marksheet
      const studentMark = marksheet.marks.find(
        (mark) => mark.studentId === student.id
      );
      if (studentMark && mappedCategory) {
        subjectsMap[subjectId][mappedCategory] = studentMark.marks;
        subjectsMap[subjectId].comment = studentMark.comments;
      }
    });

    // Calculate grade for each subject
    Object.values(subjectsMap).forEach((subject: SubjectResult) => {
      // Calculate average based on available marks
      const validMarks = [
        subject.beginningTerm,
        subject.midTerm,
        subject.endTerm,
      ].filter((m) => m !== null && m !== undefined) as number[];

      if (validMarks.length > 0) {
        const average =
          validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length;
        subject.average = Math.round(average * 10) / 10; // Round to 1 decimal place
        subject.grade = calculateGrade(subject.average);
      }
    });

    return {
      name: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.regNo,
      class: student.classTitle || "", // Handle nullable classTitle
      stream: student.streamTitle || "", // Handle nullable streamTitle
      subjects: Object.values(subjectsMap),
      teacherComment: "",
    };
  });

  // Format the final response
  const response: ClassReportData = {
    className: classInfo?.title,
    term: termInfo?.term,
    year: termInfo?.year,
    teacher: classInfo?.classTeacherName,
    students: processedStudents,
  };

  return response;
}

// Helper function to calculate grade based on marks
function calculateGrade(marks: number): string {
  if (marks >= 90) return "A+";
  if (marks >= 85) return "A";
  if (marks >= 80) return "A-";
  if (marks >= 75) return "B+";
  if (marks >= 70) return "B";
  if (marks >= 65) return "B-";
  if (marks >= 60) return "C+";
  if (marks >= 55) return "C";
  if (marks >= 50) return "C-";
  if (marks >= 45) return "D+";
  if (marks >= 40) return "D";
  return "F";
}

export async function getReportCards(req: Request, res: Response) {
  const { classId } = req.params;
  const examIdsStr = req.query.examIds as string;
  const examIds = examIdsStr.split(",");
  // console.log(examIds);
  const termId = req.query.termId as string;
  try {
    const classData = await getClassReportData(classId, termId, examIds);
    // console.log(classData);
    return res.status(200).json(classData);
  } catch (error) {
    console.log(error);
    return res.status(500).json(null);
  }
}
