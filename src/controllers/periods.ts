import { db } from "@/db/db";
import { PeriodCreateProps, TypedRequestBody } from "@/types/types";
import { Request, Response } from "express";
import { groupBy } from "lodash";
export async function createPeriod(
  req: TypedRequestBody<PeriodCreateProps>,
  res: Response
) {
  const data = req.body;
  try {
    const newTerm = await db.period.create({
      data,
    });
    console.log(`Term created successfully: ${newTerm.term} (${newTerm.id})`);
    return res.status(201).json({
      data: newTerm,
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
export async function updatePeriodById(
  req: TypedRequestBody<Partial<PeriodCreateProps>>,
  res: Response
) {
  const data = req.body;
  const { id } = req.params;
  try {
    const updatedTerm = await db.period.update({
      data,
      where: {
        id,
      },
    });
    console.log(
      `Term updated successfully: ${updatedTerm.term} (${updatedTerm.id})`
    );
    return res.status(201).json({
      data: updatedTerm,
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
export async function getPeriodsGroupedByYear(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const periods = await db.period.findMany({
      where: {
        schoolId,
      },
      orderBy: [
        { year: "desc" }, // Most recent years first
        { term: "asc" }, // Terms in ascending order within each year
      ],
    });

    // Use lodash to group by year
    const groupedPeriods = groupBy(periods, "year");

    return res.status(201).json({
      data: groupedPeriods,
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
export async function getPeriodsByYear(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const periods = await db.period.findMany({
      where: {
        schoolId,
      },
      orderBy: [
        { year: "desc" }, // Most recent years first
        { term: "asc" }, // Terms in ascending order within each year
      ],
    });

    return res.status(201).json({
      data: periods,
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
