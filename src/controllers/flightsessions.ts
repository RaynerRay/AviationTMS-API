import { Request, Response } from "express";
import { db } from "@/db/db";
import { Prisma } from "@prisma/client";
import { FlightHoursService } from "@/utils/flightHoursService";

const flightHoursService = new FlightHoursService(db);

function nullableToUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

// POST /api/flight-sessions
// export async function createFlightSession(req: Request, res: Response) {
//   try {
//     const {
//       sessionType,
//       startTime,
//       endTime,
//       durationHours,
//       status,
//       teacherFeedback,
//       studentId,
//       teacherId,
//       aircraftId,
//       simulatorId,
//       schoolId,
//       actualFlightHours,
//       actualSimulatorHours,
//       actualGroundHours,
//       verifiedByInstructor,

//       // new fields
//       date,
//       flightType,
//       detailsOfFlight,
//       ifrApproaches,
//       instrumentTime,
//       instrumentTimeSe,
//       instrumentTimeMe,
//       actualTime,
//       fstdTime,
//       fstdDual,
//       fstdPic,
//       fstdPicPractice,
//       singleEngineDay,
//       singleEngineNight,
//       multiEngineDay,
//       multiEngineNight,
//       other,
//       takeOffsDay,
//       takeOffsNight,
//       landingsDay,
//       landingsNight,
//       aircraftType,
//       registrationNumber,
//       departureAirport,
//       arrivalAirport,
//       dayHours,
//       nightHours,
//       instrumentHours,
//       singleEngineTime,
//       multiEngineTime,
//       pilotRole,
//       crewOperation,
//     } = req.body;

//     const session = await db.flightSession.create({
//       data: {
//         sessionType,
//         startTime,
//         endTime,
//         durationHours,
//         status,
//         teacherFeedback,
//         studentId,
//         teacherId,
//         aircraftId,
//         simulatorId,
//         schoolId,
//         actualFlightHours,
//         actualSimulatorHours,
//         actualGroundHours,
//         verifiedByInstructor: verifiedByInstructor ?? false,

//         date,
//         flightType,
//         detailsOfFlight,
//         ifrApproaches,
//         instrumentTime,
//         instrumentTimeSe,
//         instrumentTimeMe,
//         actualTime,
//         fstdTime,
//         fstdDual,
//         fstdPic,
//         fstdPicPractice,
//         singleEngineDay,
//         singleEngineNight,
//         multiEngineDay,
//         multiEngineNight,
//         other,
//         takeOffsDay,
//         takeOffsNight,
//         landingsDay,
//         landingsNight,
//         aircraftType,
//         registrationNumber,
//         departureAirport,
//         arrivalAirport,
//         dayHours,
//         nightHours,
//         instrumentHours,
//         singleEngineTime,
//         multiEngineTime,
//         pilotRole,
//         crewOperation,
//       },
//     });

//     return res.status(201).json(session);
//   } catch (error) {
//     console.error("[CREATE_FLIGHT_SESSION]", error);
//     return res.status(500).json({ error: "Failed to create session." });
//   }
// }

export async function createFlightSession(req: Request, res: Response) {
  try {
    const {
      sessionType,
      startTime,
      endTime,
      durationHours,
      status,
      teacherFeedback,
      studentId,
      teacherId,
      aircraftId,
      simulatorId,
      schoolId,
      actualFlightHours,
      actualSimulatorHours,
      actualGroundHours,
      verifiedByInstructor,

      // new fields
      date,
      flightType,
      detailsOfFlight,
      ifrApproaches,
      instrumentTime,
      instrumentTimeSe,
      instrumentTimeMe,
      actualTime,
      fstdTime,
      fstdDual,
      fstdPic,
      fstdPicPractice,
      singleEngineDay,
      singleEngineNight,
      multiEngineDay,
      multiEngineNight,
      other,
      takeOffsDay,
      takeOffsNight,
      landingsDay,
      landingsNight,
      aircraftType,
      registrationNumber,
      departureAirport,
      arrivalAirport,
      dayHours,
      nightHours,
      instrumentHours,
      singleEngineTime,
      multiEngineTime,
      pilotRole,
      crewOperation,
    } = req.body;

    const session = await db.flightSession.create({
      data: {
        sessionType,
        startTime,
        endTime,
        durationHours,
        status,
        teacherFeedback,
        studentId,
        teacherId,
        aircraftId,
        simulatorId,
        schoolId,
        actualFlightHours,
        actualSimulatorHours,
        actualGroundHours,
        verifiedByInstructor: verifiedByInstructor ?? false,

        date,
        flightType,
        detailsOfFlight,
        ifrApproaches,
        instrumentTime,
        instrumentTimeSe,
        instrumentTimeMe,
        actualTime,
        fstdTime,
        fstdDual,
        fstdPic,
        fstdPicPractice,
        singleEngineDay,
        singleEngineNight,
        multiEngineDay,
        multiEngineNight,
        other,
        takeOffsDay,
        takeOffsNight,
        landingsDay,
        landingsNight,
        aircraftType,
        registrationNumber,
        departureAirport,
        arrivalAirport,
        dayHours,
        nightHours,
        instrumentHours,
        singleEngineTime,
        multiEngineTime,
        pilotRole,
        crewOperation,
      },
    });

    // 🔁 Update accumulated hours
    const service = new FlightHoursService(db);
    await service.updateFlightHours({
      studentId,
      teacherId,
      aircraftId,
      sessionType,
      durationHours,
      dayHours,
      nightHours,
      instrumentHours,
      singleEngineTime,
      multiEngineTime,
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error("[CREATE_FLIGHT_SESSION]", error);
    return res.status(500).json({ error: "Failed to create session." });
  }
}

// PUT /api/flight-sessions/:id
export async function updateFlightSession(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const existingSession = await db.flightSession.findUnique({ where: { id } });

    if (!existingSession) {
      return res.status(404).json({ message: "Flight session not found" });
    }

    // Optional: rollback previous flight hours before applying new ones
    await flightHoursService.rollbackFlightHours({
      studentId: nullableToUndefined(existingSession.studentId),
      teacherId: nullableToUndefined(existingSession.teacherId),
      aircraftId: nullableToUndefined(existingSession.aircraftId),
      sessionType: existingSession.sessionType,
      durationHours: existingSession.durationHours || 0,
      dayHours: nullableToUndefined(existingSession.dayHours),
      nightHours: nullableToUndefined(existingSession.nightHours),
      instrumentHours: nullableToUndefined(existingSession.instrumentHours),
      singleEngineTime: nullableToUndefined(existingSession.singleEngineTime),
      multiEngineTime: nullableToUndefined(existingSession.multiEngineTime),
    });

    // Update the session with new data from request body
    const updatedSession = await db.flightSession.update({
      where: { id },
      data: req.body, // validate this beforehand or use zod/yup for safety
    });

    // Apply updated flight hours
    await flightHoursService.updateFlightHours({
      studentId: nullableToUndefined(updatedSession.studentId),
      teacherId: nullableToUndefined(updatedSession.teacherId),
      aircraftId: nullableToUndefined(updatedSession.aircraftId),
      sessionType: updatedSession.sessionType,
      durationHours: updatedSession.durationHours || 0,
      dayHours: nullableToUndefined(updatedSession.dayHours),
      nightHours: nullableToUndefined(updatedSession.nightHours),
      instrumentHours: nullableToUndefined(updatedSession.instrumentHours),
      singleEngineTime: nullableToUndefined(updatedSession.singleEngineTime),
      multiEngineTime: nullableToUndefined(updatedSession.multiEngineTime),
    });

    return res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Failed to update flight session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// export async function updateFlightSession(req: Request, res: Response) {
//   try {
//     const { id } = req.params;

//     const existingSession = await db.flightSession.findUnique({ where: { id } });
//     if (!existingSession) {
//       return res.status(404).json({ error: "Flight session not found." });
//     }

//     const {
//       sessionType,
//       startTime,
//       endTime,
//       durationHours,
//       status,
//       teacherFeedback,
//       actualFlightHours,
//       actualSimulatorHours,
//       actualGroundHours,
//       verifiedByInstructor,

//       date,
//       flightType,
//       detailsOfFlight,
//       ifrApproaches,
//       instrumentTime,
//       instrumentTimeSe,
//       instrumentTimeMe,
//       actualTime,
//       fstdTime,
//       fstdDual,
//       fstdPic,
//       fstdPicPractice,
//       singleEngineDay,
//       singleEngineNight,
//       multiEngineDay,
//       multiEngineNight,
//       other,
//       takeOffsDay,
//       takeOffsNight,
//       landingsDay,
//       landingsNight,
//       aircraftId,
//       aircraftType,
//       registrationNumber,
//       departureAirport,
//       arrivalAirport,
//       dayHours,
//       nightHours,
//       instrumentHours,
//       singleEngineTime,
//       multiEngineTime,
//       pilotRole,
//       crewOperation,

//       studentId,
//       teacherId,
//       simulatorId,
//       schoolId,
//     } = req.body;

//     const updateData: Prisma.FlightSessionUpdateInput = {
//       sessionType,
//       startTime,
//       endTime,
//       durationHours,
//       status,
//       teacherFeedback,
//       actualFlightHours,
//       actualSimulatorHours,
//       actualGroundHours,
//       verifiedByInstructor,

//       date,
//       flightType,
//       detailsOfFlight,
//       ifrApproaches,
//       instrumentTime,
//       instrumentTimeSe,
//       instrumentTimeMe,
//       actualTime,
//       fstdTime,
//       fstdDual,
//       fstdPic,
//       fstdPicPractice,
//       singleEngineDay,
//       singleEngineNight,
//       multiEngineDay,
//       multiEngineNight,
//       other,
//       takeOffsDay,
//       takeOffsNight,
//       landingsDay,
//       landingsNight,
//       aircraftType,
//       registrationNumber,
//       departureAirport,
//       arrivalAirport,
//       dayHours,
//       nightHours,
//       instrumentHours,
//       singleEngineTime,
//       multiEngineTime,
//       pilotRole,
//       crewOperation,
//     };

//     if (studentId) updateData.student = { connect: { id: studentId } };
//     if (teacherId) updateData.teacher = { connect: { id: teacherId } };
//     if (schoolId) updateData.school = { connect: { id: schoolId } };

//     if (aircraftId) {
//       updateData.aircraft = { connect: { id: aircraftId } };
//     } else {
//       updateData.aircraft = { disconnect: true };
//     }

//     if (simulatorId) {
//       updateData.simulator = { connect: { id: simulatorId } };
//     } else {
//       updateData.simulator = { disconnect: true };
//     }

//     const updated = await db.flightSession.update({
//       where: { id },
//       data: updateData,
//     });

//     // 🔁 Rollback old values, then apply new ones
//     const service = new FlightHoursService(db);
//     await service.rollbackFlightHours(existingSession);
//     await service.updateFlightHours({
//       studentId: studentId || existingSession.studentId,
//       teacherId: teacherId || existingSession.teacherId,
//       aircraftId: aircraftId || existingSession.aircraftId,
//       sessionType,
//       durationHours,
//       dayHours,
//       nightHours,
//       instrumentHours,
//       singleEngineTime,
//       multiEngineTime,
//     });

//     return res.status(200).json(updated);
//   } catch (error) {
//     console.error("[UPDATE_FLIGHT_SESSION]", error);
//     return res.status(500).json({ error: "Failed to update flight session." });
//   }
// }

// GET /api/flight-sessions
export async function getFlightSessions(req: Request, res: Response) {
  try {
    const {
      schoolId,
      studentId,
      teacherId,
      studentUserId,
      teacherUserId,
      aircraftId,
      status,
      startDate,
      endDate,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const whereClause: any = {};

    if (schoolId) whereClause.schoolId = schoolId;
    if (aircraftId) whereClause.aircraftId = aircraftId;
    if (status) whereClause.status = status;

    // Date range filtering
    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) whereClause.startTime.gte = new Date(startDate as string);
      if (endDate) whereClause.startTime.lte = new Date(endDate as string);
    }

    // Resolve studentId from studentUserId
    if (studentUserId && !studentId) {
      const user = await db.user.findUnique({
        where: { id: studentUserId as string },
        include: { student: true },
      });

      if (user?.student?.id) {
        whereClause.studentId = user.student.id;
      } else {
        return res.status(400).json({ error: "Student profile not found for given userId" });
      }
    }

    // Resolve teacherId from teacherUserId
    if (teacherUserId && !teacherId) {
      const user = await db.user.findUnique({
        where: { id: teacherUserId as string },
        include: { teacher: true },
      });

      if (user?.teacher?.id) {
        whereClause.teacherId = user.teacher.id;
      } else {
        return res.status(400).json({ error: "Teacher profile not found for given userId" });
      }
    }

    // Direct IDs take priority if provided
    if (studentId) whereClause.studentId = studentId;
    if (teacherId) whereClause.teacherId = teacherId;

    const sessions = await db.flightSession.findMany({
      where: whereClause,
      orderBy: { startTime: "desc" },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error("[GET_FLIGHT_SESSIONS]", error);
    return res.status(500).json({ error: "Failed to fetch flight sessions." });
  }
}

// GET /api/flight-sessions/:id
export async function getFlightSessionById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const session = await db.flightSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: "Flight session not found." });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error("[GET_FLIGHT_SESSION_BY_ID]", error);
    return res.status(500).json({ error: "Failed to fetch session." });
  }
}

// GET /api/flight-sessions/student/:studentId
export async function getFlightSessionsByStudentId(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const sessions = await db.flightSession.findMany({
      where: { studentId },
      orderBy: { startTime: "desc" },
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Error getting student sessions" });
  }
}

// GET /api/flight-sessions/teacher/:teacherId
export async function getFlightSessionsByTeacherId(req: Request, res: Response) {
  try {
    const { teacherId } = req.params;
    const sessions = await db.flightSession.findMany({
      where: { teacherId },
      orderBy: { startTime: "desc" },
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Error getting instructor sessions" });
  }
}


  

// DELETE /api/flight-sessions/:id
export async function deleteFlightSession(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const session = await db.flightSession.findUnique({ where: { id } });

    if (!session) {
      return res.status(404).json({ message: "Flight session not found" });
    }

    // Rollback previous hours
    await flightHoursService.rollbackFlightHours({
      studentId: nullableToUndefined(session.studentId),
      teacherId: nullableToUndefined(session.teacherId),
      aircraftId: nullableToUndefined(session.aircraftId),
      sessionType: session.sessionType,
      durationHours: session.durationHours || 0,
      dayHours: nullableToUndefined(session.dayHours),
      nightHours: nullableToUndefined(session.nightHours),
      instrumentHours: nullableToUndefined(session.instrumentHours),
      singleEngineTime: nullableToUndefined(session.singleEngineTime),
      multiEngineTime: nullableToUndefined(session.multiEngineTime),
    });

    await db.flightSession.delete({ where: { id } });

    return res.status(200).json({ message: "Flight session deleted" });
  } catch (error) {
    console.error("Error deleting flight session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function batchUpdateFlightSessions(req: Request, res: Response) {
  const updates = req.body; // Should be an array of { id: string, ...updates }

  if (!Array.isArray(updates)) {
    return res.status(400).json({ message: "Invalid input: expected array of updates" });
  }

  try {
    const results = [];

    for (const update of updates) {
      const { id, ...data } = update;

      const existing = await db.flightSession.findUnique({ where: { id } });

      if (!existing) {
        results.push({ id, status: "not_found" });
        continue;
      }

      // Rollback old hours
      await flightHoursService.rollbackFlightHours({
        studentId: nullableToUndefined(existing.studentId),
        teacherId: nullableToUndefined(existing.teacherId),
        aircraftId: nullableToUndefined(existing.aircraftId),
        sessionType: existing.sessionType,
        durationHours: existing.durationHours || 0,
        dayHours: nullableToUndefined(existing.dayHours),
        nightHours: nullableToUndefined(existing.nightHours),
        instrumentHours: nullableToUndefined(existing.instrumentHours),
        singleEngineTime: nullableToUndefined(existing.singleEngineTime),
        multiEngineTime: nullableToUndefined(existing.multiEngineTime),
      });

      const updated = await db.flightSession.update({
        where: { id },
        data,
      });

      // Apply new hours
      await flightHoursService.updateFlightHours({
        studentId: nullableToUndefined(updated.studentId),
        teacherId: nullableToUndefined(updated.teacherId),
        aircraftId: nullableToUndefined(updated.aircraftId),
        sessionType: updated.sessionType,
        durationHours: updated.durationHours || 0,
        dayHours: nullableToUndefined(updated.dayHours),
        nightHours: nullableToUndefined(updated.nightHours),
        instrumentHours: nullableToUndefined(updated.instrumentHours),
        singleEngineTime: nullableToUndefined(updated.singleEngineTime),
        multiEngineTime: nullableToUndefined(updated.multiEngineTime),
      });

      results.push({ id, status: "updated" });
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Batch update failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

