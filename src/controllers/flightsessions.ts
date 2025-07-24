import { Request, Response } from "express";
import { db } from "@/db/db";
import { Prisma } from "@prisma/client";

// GET /api/flight-sessions
export async function getFlightSessions(req: Request, res: Response) {
  try {
    const { schoolId, studentId, teacherId } = req.query;

    const sessions = await db.flightSession.findMany({
      where: {
        schoolId: schoolId as string | undefined,
        studentId: studentId as string | undefined,
        teacherId: teacherId as string | undefined,
      },
      orderBy: { startTime: "desc" },
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

// POST /api/flight-sessions
export async function createFlightSession(req: Request, res: Response) {
  try {
    const {
      sessionType,
      startTime,
      endTime,
      durationHours,
      status,
      teacherFeedback,
      studentFeedback,
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
      totalFlightTime,
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
        studentFeedback,
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
        totalFlightTime,
        dayHours,
        nightHours,
        instrumentHours,
        singleEngineTime,
        multiEngineTime,
        pilotRole,
        crewOperation,
      },
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error("[CREATE_FLIGHT_SESSION]", error);
    return res.status(500).json({ error: "Failed to create session." });
  }
}

// PUT /api/flight-sessions/:id
export async function updateFlightSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
  
      const session = await db.flightSession.findUnique({ where: { id } });
      if (!session) {
        return res.status(404).json({ error: "Flight session not found." });
      }
  
      const {
        sessionType,
        startTime,
        endTime,
        durationHours,
        status,
        teacherFeedback,
        studentFeedback,
        actualFlightHours,
        actualSimulatorHours,
        actualGroundHours,
        verifiedByInstructor,
  
        // New fields
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
        aircraftId,
        aircraftType,
        registrationNumber,
        departureAirport,
        arrivalAirport,
        totalFlightTime,
        dayHours,
        nightHours,
        instrumentHours,
        singleEngineTime,
        multiEngineTime,
        pilotRole,
        crewOperation,
  
        // Relations
        studentId,
        teacherId,
        simulatorId,
        schoolId,
      } = req.body;
  
      const updateData: Prisma.FlightSessionUpdateInput = {
        sessionType,
        startTime,
        endTime,
        durationHours,
        status,
        teacherFeedback,
        studentFeedback,
        actualFlightHours,
        actualSimulatorHours,
        actualGroundHours,
        verifiedByInstructor,
  
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
        totalFlightTime,
        dayHours,
        nightHours,
        instrumentHours,
        singleEngineTime,
        multiEngineTime,
        pilotRole,
        crewOperation,
      };
  
      if (studentId) updateData.student = { connect: { id: studentId } };
      if (teacherId) updateData.teacher = { connect: { id: teacherId } };
      if (schoolId) updateData.school = { connect: { id: schoolId } };
  
      if (aircraftId) {
        updateData.aircraft = { connect: { id: aircraftId } };
      } else {
        updateData.aircraft = { disconnect: true };
      }
  
      if (simulatorId) {
        updateData.simulator = { connect: { id: simulatorId } };
      } else {
        updateData.simulator = { disconnect: true };
      }
  
      const updated = await db.flightSession.update({
        where: { id },
        data: updateData,
      });
  
      return res.status(200).json(updated);
    } catch (error) {
      console.error("[UPDATE_FLIGHT_SESSION]", error);
      return res.status(500).json({ error: "Failed to update flight session." });
    }
  }
  

// DELETE /api/flight-sessions/:id
export async function deleteFlightSession(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const session = await db.flightSession.findUnique({ where: { id } });
    if (!session) {
      return res.status(404).json({ error: "Flight session not found." });
    }

    await db.flightSession.delete({ where: { id } });

    return res.status(200).json({ message: "Session deleted successfully." });
  } catch (error) {
    console.error("[DELETE_FLIGHT_SESSION]", error);
    return res.status(500).json({ error: "Failed to delete session." });
  }
}
