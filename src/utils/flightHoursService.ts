// FlightHoursService.ts
import { Prisma, PrismaClient } from "@prisma/client";

export type FlightHoursUpdate = {
  totalFlightHours?: number;
  totalSimulatorHours?: number;
  dayHours?: number;
  nightHours?: number;
  instrumentHours?: number;
  singleEngineTime?: number;
  multiEngineTime?: number;
  airframeHours?: number;
};

export class FlightHoursService {
  constructor(private readonly db: PrismaClient) {}

  private calculateHours(session: {
    sessionType: string;
    durationHours: number;
    dayHours?: number;
    nightHours?: number;
    instrumentHours?: number;
    singleEngineTime?: number;
    multiEngineTime?: number;
  }): FlightHoursUpdate {
    const {
      sessionType,
      durationHours,
      dayHours,
      nightHours,
      instrumentHours,
      singleEngineTime,
      multiEngineTime,
    } = session;

    return {
      totalFlightHours: sessionType === "FLIGHT" ? durationHours : 0,
      totalSimulatorHours: sessionType === "SIMULATOR" ? durationHours : 0,
      dayHours: dayHours || 0,
      nightHours: nightHours || 0,
      instrumentHours: instrumentHours || 0,
      singleEngineTime: singleEngineTime || 0,
      multiEngineTime: multiEngineTime || 0,
      airframeHours: sessionType === "FLIGHT" ? durationHours : 0,
    };
  }

  private async updateStudentHours(
    tx: Prisma.TransactionClient,
    studentId: string,
    hours: FlightHoursUpdate
  ) {
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student) return;

    await tx.student.update({
      where: { id: studentId },
      data: {
        totalFlightHours: (student.totalFlightHours || 0) + (hours.totalFlightHours || 0),
        totalSimulatorHours: (student.totalSimulatorHours || 0) + (hours.totalSimulatorHours || 0),
        dayHours: (student.dayHours || 0) + (hours.dayHours || 0),
        nightHours: (student.nightHours || 0) + (hours.nightHours || 0),
        instrumentHours: (student.instrumentHours || 0) + (hours.instrumentHours || 0),
        singleEngineTime: (student.singleEngineTime || 0) + (hours.singleEngineTime || 0),
        multiEngineTime: (student.multiEngineTime || 0) + (hours.multiEngineTime || 0),
        updatedAt: new Date(),
      },
    });
  }

  private async updateTeacherHours(
    tx: Prisma.TransactionClient,
    teacherId: string,
    hours: FlightHoursUpdate
  ) {
    const teacher = await tx.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) return;

    await tx.teacher.update({
      where: { id: teacherId },
      data: {
        totalFlightHours: (teacher.totalFlightHours || 0) + (hours.totalFlightHours || 0),
        totalSimulatorHours: (teacher.totalSimulatorHours || 0) + (hours.totalSimulatorHours || 0),
        dayHours: (teacher.dayHours || 0) + (hours.dayHours || 0),
        nightHours: (teacher.nightHours || 0) + (hours.nightHours || 0),
        instrumentHours: (teacher.instrumentHours || 0) + (hours.instrumentHours || 0),
        singleEngineTime: (teacher.singleEngineTime || 0) + (hours.singleEngineTime || 0),
        multiEngineTime: (teacher.multiEngineTime || 0) + (hours.multiEngineTime || 0),
        updatedAt: new Date(),
      },
    });
  }

  private async updateAircraftHours(
    tx: Prisma.TransactionClient,
    aircraftId: string,
    hours: FlightHoursUpdate
  ) {
    const aircraft = await tx.aircraft.findUnique({ where: { id: aircraftId } });
    if (!aircraft) return;

    await tx.aircraft.update({
      where: { id: aircraftId },
      data: {
        engineHours: (aircraft.engineHours || 0) + (hours.totalFlightHours || 0),
        airframeHours: (aircraft.airframeHours || 0) + (hours.airframeHours || 0),
        updatedAt: new Date(),
      },
    });
  }

  async updateFlightHours(session: {
    studentId?: string;
    teacherId?: string;
    aircraftId?: string;
    sessionType: string;
    durationHours: number;
    dayHours?: number;
    nightHours?: number;
    instrumentHours?: number;
    singleEngineTime?: number;
    multiEngineTime?: number;
  }) {
    const hours = this.calculateHours(session);

    await this.db.$transaction(async (tx) => {
      if (session.studentId) {
        await this.updateStudentHours(tx, session.studentId, hours);
      }
      if (session.teacherId) {
        await this.updateTeacherHours(tx, session.teacherId, hours);
      }
      if (session.aircraftId) {
        await this.updateAircraftHours(tx, session.aircraftId, hours);
      }
    });
  }

  async rollbackFlightHours(session: {
    studentId?: string;
    teacherId?: string;
    aircraftId?: string;
    sessionType: string;
    durationHours: number;
    dayHours?: number;
    nightHours?: number;
    instrumentHours?: number;
    singleEngineTime?: number;
    multiEngineTime?: number;
  }) {
    const hours = this.calculateHours(session);

    const inverted: FlightHoursUpdate = Object.fromEntries(
      Object.entries(hours).map(([key, value]) => [key, -1 * (value || 0)])
    ) as FlightHoursUpdate;

    await this.db.$transaction(async (tx) => {
      if (session.studentId) {
        await this.updateStudentHours(tx, session.studentId, inverted);
      }
      if (session.teacherId) {
        await this.updateTeacherHours(tx, session.teacherId, inverted);
      }
      if (session.aircraftId) {
        await this.updateAircraftHours(tx, session.aircraftId, inverted);
      }
    });
  }
}
