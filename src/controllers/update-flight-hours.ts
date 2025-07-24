import { db } from "@/db/db";
import { Request, Response } from "express";

export async function updateFlightHours(req: Request, res: Response) {
  const { id } = req.params; // session ID
  const { verified } = req.body; // new value from toggle

  try {
    const session = await db.flightSession.findUnique({ where: { id } });

    if (!session)
      return res.status(404).json({ error: "Flight session not found" });

    // Prevent double incrementing if already verified
    if (session.verifiedByInstructor && verified) {
      return res
        .status(200)
        .json({ message: "Already verified. No changes made." });
    }

    await db.$transaction(async (tx) => {
      // Update verification status
      await tx.flightSession.update({
        where: { id },
        data: {
          verifiedByInstructor: verified,
        },
      });

      if (verified) {
        // Only increment if we're marking as verified
        await tx.student.update({
          where: { id: session.studentId },
          data: {
            totalFlightHours: { increment: session.actualFlightHours ?? 0 },
            totalSimulatorHours: {
              increment: session.actualSimulatorHours ?? 0,
            },
            dayHours: { increment: session.dayHours ?? 0 },
            nightHours: { increment: session.nightHours ?? 0 },
            instrumentHours: { increment: session.instrumentHours ?? 0 },
            singleEngineTime: { increment: session.singleEngineTime ?? 0 },
            multiEngineTime: { increment: session.multiEngineTime ?? 0 },
          },
        });

        // teacher totals
        await tx.teacher.update({
          where: { id: session.teacherId },
          data: {
            totalFlightHours: { increment: session.actualFlightHours ?? 0 },
            totalSimulatorHours: {
              increment: session.actualSimulatorHours ?? 0,
            },
            dayHours: { increment: session.dayHours ?? 0 },
            nightHours: { increment: session.nightHours ?? 0 },
            instrumentHours: { increment: session.instrumentHours ?? 0 },
            singleEngineTime: { increment: session.singleEngineTime ?? 0 },
            multiEngineTime: { increment: session.multiEngineTime ?? 0 },
          },
        });
      }
    });

    return res
      .status(200)
      .json({ message: "Verification updated and totals synced." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
