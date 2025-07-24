import { db } from "@/db/db";
import { Request, Response } from "express";
import { MaintenanceType, MaintenanceStatus } from "@/types/types";

import { CreateMaintenanceLogProps } from "@/types/types";
import { Prisma } from "@prisma/client";

// Convert Prisma.Decimal to number safely
function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number | null | undefined {
  if (value instanceof Prisma.Decimal) return value.toNumber();
  return value ?? null;
}

// ✅ CREATE
export async function createMaintenanceLog(
  req: Request<{}, {}, CreateMaintenanceLogProps>,
  res: Response
) {
  try {
    const {
      aircraftId,
      logDate,
      description,
      maintenanceType,
      performedBy,
      cost,
      partsReplaced,
      hoursAtMaintenance,
      nextDueDate,
      status = MaintenanceStatus.PENDING,
    } = req.body;

    const existingAircraft = await db.aircraft.findUnique({ where: { id: aircraftId } });
    if (!existingAircraft) {
      return res.status(404).json({ error: "Aircraft not found." });
    }

    const log = await db.maintenanceLog.create({
      data: {
        aircraftId,
        logDate: new Date(logDate),
        description,
        maintenanceType,
        performedBy,
        cost: cost !== undefined ? new Prisma.Decimal(cost) : undefined,
        partsReplaced,
        hoursAtMaintenance,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        status,
      },
    });

    return res.status(201).json({
      ...log,
      cost: decimalToNumber(log.cost),
    });
  } catch (error) {
    console.error("Create MaintenanceLog Error:", error);
    return res.status(500).json({ error: "Failed to create maintenance log." });
  }
}

// ✅ GET ALL BY AIRCRAFT ID
export async function getMaintenanceLogsByAircraft(req: Request, res: Response) {
  const { aircraftId } = req.params;
  try {
    const logs = await db.maintenanceLog.findMany({
      where: { aircraftId },
      orderBy: { logDate: "desc" },
    });

    const formatted = logs.map((log) => ({
      ...log,
      cost: decimalToNumber(log.cost),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Fetch MaintenanceLogs Error:", error);
    return res.status(500).json({ error: "Failed to fetch maintenance logs." });
  }
}

// ✅ GET BY LOG ID
export async function getMaintenanceLogById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const log = await db.maintenanceLog.findUnique({ where: { id } });

    if (!log) {
      return res.status(404).json({ error: "Maintenance log not found." });
    }

    return res.status(200).json({
      ...log,
      cost: decimalToNumber(log.cost),
    });
  } catch (error) {
    console.error("Get MaintenanceLog Error:", error);
    return res.status(500).json({ error: "Failed to fetch maintenance log." });
  }
}

// ✅ UPDATE
export async function updateMaintenanceLog(req: Request, res: Response) {
  const { id } = req.params;

  const {
    logDate,
    nextDueDate,
    cost,
    description,
    notes,
    maintenanceType,
    status,
  } = req.body;

  if (!id) {
    return res.status(400).json({ data: null, error: "Missing maintenance log ID." });
  }

  try {
    const existingLog = await db.maintenanceLog.findUnique({ where: { id } });

    if (!existingLog) {
      return res.status(404).json({ data: null, error: "Maintenance log not found." });
    }

    // Build update data dynamically and safely
    const updateData: Prisma.MaintenanceLogUpdateInput = {
      ...(logDate && { logDate: new Date(logDate) }),
      ...(nextDueDate && { nextDueDate: new Date(nextDueDate) }),
      ...(cost !== undefined && cost !== null && { cost: new Prisma.Decimal(cost) }),
      ...(description && { description }),
      ...(notes && { notes }),
      ...(maintenanceType && { maintenanceType: maintenanceType as MaintenanceType }),
      ...(status && { status: status as MaintenanceStatus }),
    };

    const updatedLog = await db.maintenanceLog.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      data: {
        ...updatedLog,
        cost: decimalToNumber(updatedLog.cost), // if you're sending cost as number
      },
      error: null,
    });
  } catch (error) {
    console.error("Failed to update maintenance log:", error);
    res.status(500).json({ data: null, error: "Failed to update maintenance log." });
  }
}

// ✅ DELETE
export async function deleteMaintenanceLog(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const existing = await db.maintenanceLog.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Maintenance log not found." });
    }

    await db.maintenanceLog.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete MaintenanceLog Error:", error);
    return res.status(500).json({ error: "Failed to delete maintenance log." });
  }
}
