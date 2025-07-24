import { db } from "@/db/db";
import { ContactProps, TypedRequestBody } from "@/types/types";
// Define the interfaces for our nested fee structure
interface FeeLine {
  id: string;
  amount: number;
  feeStatus: "PAID" | "NOT_PAID";
}

interface FeeGroup {
  id: string;
  term: string;
  year: number;
  fees: FeeLine[];
}

// Define return type for our calculation function
interface FeeCalculationResult {
  totalPaid: number;
  totalPending: number;
}

import { Request, Response } from "express";

export async function getAnalyticsBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const students = await db.student.count({
      where: {
        schoolId,
      },
    });
    const teachers = await db.teacher.count({
      where: {
        schoolId,
      },
    });
    const parents = await db.parent.count({
      where: {
        schoolId,
      },
    });
    const classes = await db.class.count({
      where: {
        schoolId,
      },
    });
    const currentTerms = await db.period.findMany({
      where: {
        year: new Date().getFullYear(),
        isActive: true,
      },
      take: 1,
    });
    const currentTermId = currentTerms.length > 0 ? currentTerms[0].id : "";
    const fees = await db.schoolFee.findMany({
      where: {
        schoolId,
        periodId: currentTermId,
      },
      select: {
        id: true,
        term: true,
        year: true,
        fees: {
          select: {
            id: true,
            amount: true,
            feeStatus: true,
          },
        },
      },
    });
    function calculateFeeTotals(feeGroups: FeeGroup[]): FeeCalculationResult {
      // First, flatten all fee lines from all fee groups
      const allFeeLines: FeeLine[] = feeGroups.flatMap((group) => group.fees);

      // Calculate totals from the flattened array
      const totalPaid = allFeeLines
        .filter((fee) => fee.feeStatus === "PAID")
        .reduce((sum, fee) => sum + fee.amount, 0);

      const totalPending = allFeeLines
        .filter((fee) => fee.feeStatus === "NOT_PAID")
        .reduce((sum, fee) => sum + fee.amount, 0);

      return { totalPaid, totalPending };
    }
    const { totalPaid, totalPending } = calculateFeeTotals(fees);

    // The Tables
    const recentStudents = await db.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
      take: 3,
      select: {
        id: true,
        name: true,
        regNo: true,
        gender: true,
        class: {
          select: {
            title: true,
          },
        },
      },
    });
    const recentEvents = await db.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      where: {
        schoolId,
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        date: true,
        endTime: true,
        location: true,
      },
    });
    const result = {
      students,
      teachers,
      parents,
      totalPending,
      totalPaid,
      recentStudents,
      recentEvents,
    };
    // console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
}
export async function getTeachersAnalytics(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const students = await db.student.count({
      where: {
        schoolId,
      },
    });
    const exams = await db.exam.count({
      where: {
        schoolId,
      },
    });
    const reminders = await db.reminder.count({
      where: {
        schoolId,
      },
    });
    const parents = await db.parent.count({
      where: {
        schoolId,
      },
    });
    const classes = await db.class.count({
      where: {
        schoolId,
      },
    });
    const currentTerms = await db.period.findMany({
      where: {
        year: new Date().getFullYear(),
        isActive: true,
      },
      take: 1,
    });
    const currentTermId = currentTerms.length > 0 ? currentTerms[0].id : "";
    const fees = await db.schoolFee.findMany({
      where: {
        schoolId,
        periodId: currentTermId,
      },
      select: {
        id: true,
        term: true,
        year: true,
        fees: {
          select: {
            id: true,
            amount: true,
            feeStatus: true,
          },
        },
      },
    });
    function calculateFeeTotals(feeGroups: FeeGroup[]): FeeCalculationResult {
      // First, flatten all fee lines from all fee groups
      const allFeeLines: FeeLine[] = feeGroups.flatMap((group) => group.fees);

      // Calculate totals from the flattened array
      const totalPaid = allFeeLines
        .filter((fee) => fee.feeStatus === "PAID")
        .reduce((sum, fee) => sum + fee.amount, 0);

      const totalPending = allFeeLines
        .filter((fee) => fee.feeStatus === "NOT_PAID")
        .reduce((sum, fee) => sum + fee.amount, 0);

      return { totalPaid, totalPending };
    }
    const { totalPaid, totalPending } = calculateFeeTotals(fees);

    // The Tables
    const recentStudents = await db.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        schoolId,
      },
      take: 3,
      select: {
        id: true,
        name: true,
        regNo: true,
        gender: true,
        class: {
          select: {
            title: true,
          },
        },
      },
    });
    const recentEvents = await db.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      where: {
        schoolId,
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        date: true,
        endTime: true,
        location: true,
      },
    });
    const result = {
      students,
      exams,
      reminders,
      // totalPending,
      // totalPaid,
      recentStudents,
      recentEvents,
    };
    // console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
}
export async function getPublicStats(req: Request, res: Response) {
  try {
    const students = await db.user.count({
      where: {
        role: "STUDENT",
      },
    });
    const teachers = await db.user.count({
      where: {
        role: "TEACHER",
      },
    });
    const parents = await db.user.count({
      where: {
        role: "PARENT",
      },
    });
    const schools = await db.school.count();
    const result = {
      students,
      teachers,
      schools,
      parents,
    };
    return res.status(200).json(result);
  } catch (error) {
    return null;
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
