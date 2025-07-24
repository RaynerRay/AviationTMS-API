import { db } from "@/db/db";
import {
  AttendanceHeader,
  AttendanceResponseData,
  StudentMapEntry,
  StudentWithAttendance,
} from "@/types/attendance";
import { AttendanceData, TypedRequestBody } from "@/types/types";
import { Request, Response } from "express";

export async function createAttendance(
  req: TypedRequestBody<AttendanceData>,
  res: Response
) {
  const data = req.body;
  try {
    const attendanceLog = await db.attendanceLog.create({
      data: data.log,
    });
    // console.log(`Attendance Log created successfully: ${attendanceLog.id}`);
    for (const attendance of data.records) {
      const a = await db.attendance.create({
        data: {
          status: attendance.status,
          studentId: attendance.studentId,
          studentName: attendance.studentName,
          studentRegNo: attendance.studentRegNo,
          attendanceLogId: attendanceLog.id,
        },
      });
      // console.log(a);
    }
    return res.status(201).json({
      data: attendanceLog,
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

// export async function getAttendanceByStreamId(req: Request, res: Response) {
//   try {
//     const { streamId } = req.params;
//     const dateString = req.query.date as string;

//     if (!streamId) {
//       return res.status(400).json({ error: "Stream ID is required" });
//     }

//     if (!dateString) {
//       return res.status(400).json({ error: "Date parameter is required" });
//     }

//     // Parse date safely
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     // Create date range for the selected day
//     const startDate = new Date(date);
//     startDate.setHours(0, 0, 0, 0);

//     const endDate = new Date(date);
//     endDate.setHours(23, 59, 59, 999);

//     const attendanceLogs = await db.attendanceLog.findMany({
//       where: {
//         date: {
//           gte: startDate,
//           lt: endDate,
//         },
//         streamId,
//       },
//       include: {
//         records: {
//           include: {
//             student: true,
//           },
//         },
//       },
//       orderBy: {
//         startTime: "asc", // Order by start time
//       },
//     });

//     if (!attendanceLogs.length) {
//       return res.status(200).json({ headers: [], students: [] });
//     }

//     // Get unique list of students from all records
//     const studentMap = new Map();

//     attendanceLogs.forEach((log) => {
//       log.records.forEach((record) => {
//         if (!studentMap.has(record.studentId)) {
//           studentMap.set(record.studentId, {
//             id: record.studentId,
//             name: record.studentName,
//             regNo: record.studentRegNo,
//             attendanceBySubject: {},
//           });
//         }
//       });
//     });

//     // Create headers for the table (subject columns)
//     const headers = attendanceLogs.map((log) => ({
//       subjectId: log.subjectId,
//       subjectName: log.subjectName,
//       startTime: log.startTime,
//       endTime: log.endTime,
//       logId: log.id,
//     }));

//     // Create student records with attendance status for each subject
//     const students = Array.from(studentMap.values()).map((student) => {
//       const studentObj = {
//         id: student.id,
//         name: student.name,
//         regNo: student.regNo,
//         attendance: {},
//       };

//       // Initialize attendance status for each subject
//       headers.forEach((header) => {
//         studentObj.attendance[header.subjectId] = {
//           status: null,
//           note: null,
//           logId: header.logId,
//         };
//       });

//       // Fill in actual attendance statuses
//       attendanceLogs.forEach((log) => {
//         const record = log.records.find((r) => r.studentId === student.id);
//         if (record) {
//           studentObj.attendance[log.subjectId] = {
//             status: record.status,
//             note: record.note,
//             logId: log.id,
//             recordId: record.id,
//           };
//         }
//       });

//       return studentObj;
//     });

//     // Sort students by registration number
//     students.sort((a, b) => a.regNo.localeCompare(b.regNo));

//     const responseData = {
//       date: attendanceLogs[0].date,
//       stream: {
//         id: attendanceLogs[0].streamId,
//         name: attendanceLogs[0].streamName,
//       },
//       class: {
//         id: attendanceLogs[0].classId,
//         name: attendanceLogs[0].className,
//       },
//       headers,
//       students,
//     };

//     return res.status(200).json(responseData);
//   } catch (error) {
//     console.error("Error fetching attendance data:", error);
//     return res.status(500).json({ error: "Failed to fetch attendance data" });
//   }
// }
export async function getAttendanceByStreamId(req: Request, res: Response) {
  try {
    const { streamId } = req.params;
    const dateString = req.query.date as string;

    if (!streamId) {
      return res.status(400).json({ error: "Stream ID is required" });
    }

    if (!dateString) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Parse date safely
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Create date range for the selected day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const attendanceLogs = await db.attendanceLog.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
        streamId,
      },
      include: {
        records: {
          include: {
            student: true,
          },
        },
      },
      orderBy: {
        startTime: "asc", // Order by start time
      },
    });

    if (!attendanceLogs.length) {
      return res.status(200).json({ headers: [], students: [] });
    }

    // Get unique list of students from all records
    const studentMap = new Map<string, StudentMapEntry>();

    attendanceLogs.forEach((log) => {
      log.records.forEach((record) => {
        if (!studentMap.has(record.studentId)) {
          studentMap.set(record.studentId, {
            id: record.studentId,
            name: record.studentName,
            regNo: record.studentRegNo,
            attendanceBySubject: {},
          });
        }
      });
    });

    // Create headers for the table (subject columns)
    const headers: AttendanceHeader[] = attendanceLogs.map((log) => ({
      subjectId: log.subjectId,
      subjectName: log.subjectName,
      startTime: log.startTime,
      endTime: log.endTime,
      logId: log.id,
    }));

    // Create student records with attendance status for each subject
    const students: StudentWithAttendance[] = Array.from(
      studentMap.values()
    ).map((student) => {
      const studentObj: StudentWithAttendance = {
        id: student.id,
        name: student.name,
        regNo: student.regNo,
        attendance: {},
      };

      // Initialize attendance status for each subject
      headers.forEach((header) => {
        studentObj.attendance[header.subjectId] = {
          status: "ABSENT",
          note: null,
          logId: header.logId,
        };
      });

      // Fill in actual attendance statuses
      attendanceLogs.forEach((log) => {
        const record = log.records.find((r) => r.studentId === student.id);
        if (record) {
          studentObj.attendance[log.subjectId] = {
            status: record.status,
            note: record.note,
            logId: log.id,
            recordId: record.id,
          };
        }
      });

      return studentObj;
    });

    // Sort students by registration number
    students.sort((a, b) => a.regNo.localeCompare(b.regNo));

    const responseData: AttendanceResponseData = {
      date: attendanceLogs[0].date,
      stream: {
        id: attendanceLogs[0].streamId,
        name: attendanceLogs[0].streamName,
      },
      class: {
        id: attendanceLogs[0].classId,
        name: attendanceLogs[0].className,
      },
      headers,
      students,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return res.status(500).json({ error: "Failed to fetch attendance data" });
  }
}

export async function getStudentAttendanceByDate(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const dateString = req.query.date as string;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    if (!dateString) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Parse date safely
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    // console.log(date);
    // Create date range for the selected day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // 1. First get the student to ensure they exist and get their details
    const student = await db.student.findUnique({
      where: { id: studentId },
    });
    // console.log(student);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 2. Find all attendance logs for that day where the student has a record
    const attendanceLogs = await db.attendanceLog.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
        records: {
          some: {
            studentId,
          },
        },
      },
      include: {
        records: {
          where: {
            studentId,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            title: true,
          },
        },
        stream: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        startTime: "asc", // Order by start time
      },
    });
    // console.log(attendanceLogs);

    if (!attendanceLogs.length) {
      // Return empty records structure
      return res.status(200).json({
        student: {
          id: student.id,
          name: student.name,
          regNo: student.regNo,
        },
        date: dateString,
        subjects: [],
      });
    }

    // 3. Format the data for the response
    const subjects = attendanceLogs.map((log) => {
      const record = log.records[0]; // We filtered to have only this student's records

      return {
        id: log.subjectId,
        name: log.subjectName || log.subject.name,
        startTime: log.startTime,
        endTime: log.endTime,
        classId: log.classId,
        className: log.className || log.class.title,
        streamId: log.streamId,
        streamName: log.streamName || log.stream.title,
        attendance: {
          status: record?.status || null,
          note: record?.note || null,
          recordId: record?.id || null,
          logId: log.id,
        },
      };
    });

    // 4. Create the response structure
    const responseData = {
      student: {
        id: student.id,
        name: student.name,
        regNo: student.regNo,
      },
      date: date.toISOString(),
      subjects: subjects,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching student attendance data:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch student attendance data" });
  }
}
