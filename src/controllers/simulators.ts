import { db } from "@/db/db";
import { Request, Response } from "express";
import { TypedRequestBody } from "@/types/types"; // Adjust this path as necessary
import {
  CreateSimulatorProps,
  SimulatorModel,
  SimulatorStatus, // These will now point to Prisma's enums due to the re-export
  SimulatorType,   // These will now point to Prisma's enums due to the re-export
} from "@/types/types"; // Adjust this path as necessary for your flight operations types

// Also import Prisma.Decimal from @prisma/client if you're directly working with it
import { Prisma } from '@prisma/client';

/**
 * Helper function to convert Prisma Decimal to number, or return null/undefined if input is not Decimal
 */
function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number | null | undefined {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  return value;
}

/**
 * @route POST /api/simulators
 * @description Creates a new simulator record.
 * @param req - Express Request object containing simulator data in the body.
 * @param res - Express Response object.
 */
export async function createSimulator(
  req: TypedRequestBody<CreateSimulatorProps>,
  res: Response
) {
  const {
    name,
    model,
    simulatorType,
    hourlyRate,
    location,
    lastMaintenance,
    nextMaintenance,
    status,
    schoolId,
  } = req.body;

  try {
    const existingSchool = await db.school.findUnique({
      where: { id: schoolId },
    });

    if (!existingSchool) {
      return res.status(404).json({
        data: null,
        error: "School not found.",
      });
    }

    const existingSimulator = await db.simulator.findUnique({
      where: {
        name_schoolId: {
          name,
          schoolId,
        },
      },
    });

    if (existingSimulator) {
      return res.status(409).json({
        data: null,
        error: "A simulator with this name already exists for this school.",
      });
    }

    const newSimulator = await db.simulator.create({
      data: {
        name,
        model,
        simulatorType,
        hourlyRate: hourlyRate !== undefined ? new Prisma.Decimal(hourlyRate) : new Prisma.Decimal(0.0), // Convert number to Decimal
        location,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
        status: status ?? SimulatorStatus.AVAILABLE,
        schoolId,
      },
    });

    console.log(
      `Simulator created successfully: ${newSimulator.name} (${newSimulator.id})`
    );

    // Manually transform the hourlyRate from Decimal to number for the response
    const responseData = {
      ...newSimulator,
      hourlyRate: decimalToNumber(newSimulator.hourlyRate),
    };
    const { createdAt, updatedAt, ...others } = responseData;

    return res.status(201).json({
      data: others as Omit<SimulatorModel, "createdAt" | "updatedAt">,
      error: null,
    });
  } catch (error) {
    console.error("Error creating simulator:", error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong while creating the simulator.",
    });
  }
}

/**
 * @route GET /api/simulators/school/:schoolId
 * @description Gets all simulators for a specific school.
 * @param req - Express Request object containing schoolId in params.
 * @param res - Express Response object.
 */
export async function getSimulatorsBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ data: null, error: "Missing schoolId." });
    }

    const simulators = await db.simulator.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
    });

    const formattedSimulators = simulators.map((simulator) => ({
      ...simulator,
      hourlyRate: decimalToNumber(simulator.hourlyRate),
    }));

    return res.status(200).json(formattedSimulators);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: "Internal Server Error" });
  }
}

/**
 * @route GET /api/simulators/:id
 * @description Gets a specific simulator by ID.
 * @param req - Express Request object containing simulator ID in params.
 * @param res - Express Response object.
 */
export const getSimulatorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const simulator = await db.simulator.findUnique({
      where: { id },
    });

    if (!simulator) {
      return res.status(404).json({ message: "Simulator not found" });
    }

    // Convert hourlyRate from Decimal to number
    const formattedSimulator = {
      ...simulator,
      hourlyRate: decimalToNumber(simulator.hourlyRate),
    };

    return res.status(200).json(formattedSimulator);
  } catch (error) {
    console.error("Error fetching simulator:", error);
    return res.status(500).json({ message: "Failed to fetch simulator" });
  }
};

/**
 * @route PUT /api/simulators/:id
 * @description Updates a simulator record.
 * @param req - Express Request object containing simulator ID in params and update data in body.
 * @param res - Express Response object.
 */
export async function updateSimulator(
  req: TypedRequestBody<Partial<CreateSimulatorProps>>,
  res: Response
) {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      data: null,
      error: "Simulator ID is required for update.",
    });
  }

  try {
    const existingSimulator = await db.simulator.findUnique({
      where: { id },
    });

    if (!existingSimulator) {
      return res.status(404).json({
        data: null,
        error: "Simulator not found.",
      });
    }

    const formattedUpdateData: { [key: string]: any } = { ...updateData };
    if (formattedUpdateData.lastMaintenance) {
      formattedUpdateData.lastMaintenance = new Date(formattedUpdateData.lastMaintenance);
    }
    if (formattedUpdateData.nextMaintenance) {
      formattedUpdateData.nextMaintenance = new Date(formattedUpdateData.nextMaintenance);
    }
    // Convert hourlyRate back to Prisma.Decimal if it's being updated
    if (formattedUpdateData.hourlyRate !== undefined) {
      formattedUpdateData.hourlyRate = new Prisma.Decimal(formattedUpdateData.hourlyRate);
    }

    const updatedSimulator = await db.simulator.update({
      where: { id },
      data: formattedUpdateData,
    });

    console.log(
      `Simulator updated successfully: ${updatedSimulator.name} (${updatedSimulator.id})`
    );

    // Manually transform the hourlyRate from Decimal to number for the response
    const responseData = {
      ...updatedSimulator,
      hourlyRate: decimalToNumber(updatedSimulator.hourlyRate),
    };
    const { createdAt, updatedAt, ...others } = responseData;

    return res.status(200).json({
      data: others as Omit<SimulatorModel, "createdAt" | "updatedAt">,
      error: null,
    });
  } catch (error) {
    console.error("Error updating simulator:", error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong while updating the simulator.",
    });
  }
}

/**
 * @route DELETE /api/simulators/:id
 * @description Deletes a simulator record.
 * @param req - Express Request object containing simulator ID in params.
 * @param res - Express Response object.
 */
export async function deleteSimulator(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      data: null,
      error: "Simulator ID is required for deletion.",
    });
  }

  try {
    const existingSimulator = await db.simulator.findUnique({
      where: { id },
    });

    if (!existingSimulator) {
      return res.status(404).json({
        data: null,
        error: "Simulator not found.",
      });
    }

    await db.simulator.delete({
      where: { id },
    });

    console.log(`Simulator deleted successfully: ${id}`);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting simulator:", error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong while deleting the simulator.",
    });
  }
}