import { db } from "@/db/db";
import { CreateSchoolFeePaymentInput, TypedRequestBody } from "@/types/types";
import { Request, Response } from "express";
export async function createFeePayment(
  req: TypedRequestBody<CreateSchoolFeePaymentInput>,
  res: Response
) {
  const data = req.body;
  try {
    const newPayment = await db.schoolFeePayment.create({
      data,
    });
    // paidFees: selectedFeeDetails.map(
    //   (item) => `${item.title}*${item.amount}*${item.id}`
    // ),
    const paidFees = newPayment.paidFees;
    const paidFeeIds = paidFees
      .map((fee) => {
        const parts = fee.split("*");
        // Check if the string follows the format (has 3 parts)
        return parts.length === 3 ? parts[2] : null;
      })
      .filter((id) => id !== null);
    await db.fee.updateMany({
      where: {
        id: {
          in: paidFeeIds,
        },
      },
      data: {
        feeStatus: "PAID",
        paymentDate: newPayment.createdAt,
      },
    });
    console.log(
      `Payment created successfully: ${newPayment.PRN} (${newPayment.studentName})`
    );
    return res.status(201).json({
      data: newPayment.PRN,
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
export async function getPaymentsByYear(req: Request, res: Response) {
  const cYear = new Date().getFullYear();
  try {
    const { schoolId } = req.params;
    const payments = await db.schoolFeePayment.findMany({
      where: {
        schoolId,
      },
      orderBy: [
        { year: "desc" }, // Most recent years first
        { term: "asc" },
      ],
      select: {
        id: true,
        studentUserId: true,
        studentName: true,
        paidFeeAmount: true,
        paidFees: true,
        PRN: true,
        paymentStatus: true,
        term: true,
        year: true,
        className: true,
      },
    });
    return res.status(201).json({
      data: payments,
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
