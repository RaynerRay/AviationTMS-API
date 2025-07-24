import { db } from "@/db/db";
import { Request, Response } from "express";
import { TypedRequestBody } from "@/types/types"; // Adjust this path as necessary
import {
  CreateAircraftProps,
  AircraftModel,
  AircraftStatus, // These will now point to Prisma's enums due to the re-export
  AircraftType,   // These will now point to Prisma's enums due to the re-export
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
 * @route POST /api/aircrafts
 * @description Creates a new aircraft record.
 * @param req - Express Request object containing aircraft data in the body.
 * @param res - Express Response object.
 */
export async function createAircraft(
  req: TypedRequestBody<CreateAircraftProps>,
  res: Response
) {
  const {
    tailNumber,
    make,
    model,
    aircraftType,
    engineHours,
    airframeHours,
    lastInspection,
    nextInspection,
    status,
    location,
    hourlyRate,
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

    const existingAircraft = await db.aircraft.findUnique({
      where: {
        tailNumber_schoolId: {
          tailNumber,
          schoolId,
        },
      },
    });

    if (existingAircraft) {
      return res.status(409).json({
        data: null,
        error: "An aircraft with this tail number already exists for this school.",
      });
    }

    const newAircraft = await db.aircraft.create({
      data: {
        tailNumber,
        make,
        model,
        aircraftType,
        engineHours: engineHours ?? 0.0,
        airframeHours: airframeHours ?? 0.0,
        lastInspection: lastInspection ? new Date(lastInspection) : null,
        nextInspection: nextInspection ? new Date(nextInspection) : null,
        status: status ?? AircraftStatus.AVAILABLE,
        location,
        hourlyRate: hourlyRate !== undefined ? new Prisma.Decimal(hourlyRate) : new Prisma.Decimal(0.0), // Convert number to Decimal
        schoolId,
      },
    });

    console.log(
      `Aircraft created successfully: ${newAircraft.tailNumber} (${newAircraft.id})`
    );

    // Manually transform the hourlyRate from Decimal to number for the response
    const responseData = {
      ...newAircraft,
      hourlyRate: decimalToNumber(newAircraft.hourlyRate),
    };
    const { createdAt, updatedAt, ...others } = responseData;

    return res.status(201).json({
      data: others as Omit<AircraftModel, "createdAt" | "updatedAt">,
      error: null,
    });
  } catch (error) {
    console.error("Error creating aircraft:", error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong while creating the aircraft.",
    });
  }
}

export async function getAircraftsBySchoolId(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ data: null, error: "Missing schoolId." });
    }

    const aircrafts = await db.aircraft.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
    });

    const formattedAircrafts = aircrafts.map((aircraft) => ({
      ...aircraft,
      hourlyRate: decimalToNumber(aircraft.hourlyRate),
    }));

    return res.status(200).json(formattedAircrafts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: "Internal Server Error" });
  }
}

export const getAircraftById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const aircraft = await db.aircraft.findUnique({
      where: { id },
      include: {
        maintenanceLogs: true, 
      },
    });

    if (!aircraft) {
      return res.status(404).json({ message: "Aircraft not found" });
    }

    return res.status(200).json(aircraft);
  } catch (error) {
    console.error("Error fetching aircraft:", error);
    return res.status(500).json({ message: "Failed to fetch aircraft" });
  }
};

// export async function getAircraftByIdOrTailNumber(req: Request, res: Response) {
//   const { identifier } = req.params;
//   const type = req.query.type as "id" | "tailNumber" | undefined;
//   const schoolId = req.query.schoolId as string | undefined;

//   if (!identifier) {
//     return res.status(400).json({
//       data: null,
//       error: "Identifier is required.",
//     });
//   }

//   if (type === "tailNumber" && !schoolId) {
//     return res.status(400).json({
//       data: null,
//       error: "schoolId is required when searching by tailNumber.",
//     });
//   }

//   try {
//     let aircraft = null;

//     if (type === "id") {
//       aircraft = await db.aircraft.findUnique({
//         where: { id: identifier },
//       });
//     } else if (type === "tailNumber" && schoolId) {
//       aircraft = await db.aircraft.findUnique({
//         where: {
//           tailNumber_schoolId: {
//             tailNumber: identifier,
//             schoolId: schoolId,
//           },
//         },
//       });
//     } else {
//       aircraft = await db.aircraft.findUnique({
//         where: { id: identifier },
//       });
//     }

//     if (!aircraft) {
//       return res.status(404).json({
//         data: null,
//         error: "Aircraft not found.",
//       });
//     }

//     // Convert hourlyRate from Decimal to number
//     const formattedAircraft = {
//       ...aircraft,
//       hourlyRate: decimalToNumber(aircraft.hourlyRate),
//     };

//     return res.status(200).json(formattedAircraft as AircraftModel);
//   } catch (error) {
//     console.error("Error fetching aircraft:", error);
//     return res.status(500).json({
//       data: null,
//       error: "Something went wrong while fetching the aircraft.",
//     });
//   }
// }

export async function updateAircraft(
  req: TypedRequestBody<Partial<CreateAircraftProps>>,
  res: Response
) {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      data: null,
      error: "Aircraft ID is required for update.",
    });
  }

  try {
    const existingAircraft = await db.aircraft.findUnique({
      where: { id },
    });

    if (!existingAircraft) {
      return res.status(404).json({
        data: null,
        error: "Aircraft not found.",
      });
    }

    const formattedUpdateData: { [key: string]: any } = { ...updateData };
    if (formattedUpdateData.lastInspection) {
      formattedUpdateData.lastInspection = new Date(formattedUpdateData.lastInspection);
    }
    if (formattedUpdateData.nextInspection) {
      formattedUpdateData.nextInspection = new Date(formattedUpdateData.nextInspection);
    }
    // Convert hourlyRate back to Prisma.Decimal if it's being updated
    if (formattedUpdateData.hourlyRate !== undefined) {
      formattedUpdateData.hourlyRate = new Prisma.Decimal(formattedUpdateData.hourlyRate);
    }


    const updatedAircraft = await db.aircraft.update({
      where: { id },
      data: formattedUpdateData,
    });

    console.log(
      `Aircraft updated successfully: ${updatedAircraft.tailNumber} (${updatedAircraft.id})`
    );

    // Manually transform the hourlyRate from Decimal to number for the response
    const responseData = {
      ...updatedAircraft,
      hourlyRate: decimalToNumber(updatedAircraft.hourlyRate),
    };
    const { createdAt, updatedAt, ...others } = responseData;

    return res.status(200).json({
      data: others as Omit<AircraftModel, "createdAt" | "updatedAt">,
      error: null,
    });
  } catch (error) {
    console.error("Error updating aircraft:", error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong while updating the aircraft.",
    });
  }
}

/**
 * @route DELETE /api/aircrafts/:id
 * @description Deletes an aircraft record.
 * @param req - Express Request object containing aircraft ID in params.
 * @param res - Express Response object.
 */
export async function deleteAircraft(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      data: null,
      error: "Aircraft ID is required for deletion.",
    });
  }

  try {
    const existingAircraft = await db.aircraft.findUnique({
      where: { id },
    });

    if (!existingAircraft) {
      return res.status(404).json({
        data: null,
        error: "Aircraft not found.",
      });
    }

    await db.aircraft.delete({
      where: { id },
    });

    console.log(`Aircraft deleted successfully: ${id}`);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting aircraft:", error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong while deleting the aircraft.",
    });
  }
}