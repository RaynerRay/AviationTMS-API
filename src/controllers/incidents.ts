import { db } from "@/db/db";
import { Request, Response } from "express";
import { CreateIncident } from "@/types/types";

export async function createIncident(req: Request, res: Response) {
  const {
    occurredAt,
    reportedBy,
    involvedPeople,
    equipmentName,
    flightSessionId,
    location,
    type,
    description,
    schoolId,
  }: CreateIncident & { schoolId: string } = req.body;

  if (!schoolId) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  try {
    const newIncident = await db.incident.create({
      data: {
        occurredAt: new Date(occurredAt),
        reportedAt: new Date(), // now
        reportedBy,
        involvedPeople,
        equipmentName,
        flightSessionId,
        location,
        type,
        description,
        status: "OPEN",
        schoolId,
      },
    });

    return res.status(201).json({ data: newIncident, error: null });
  } catch (error) {
    console.error("Error creating incident:", error);
    return res.status(500).json({ data: null, error: "Failed to create incident." });
  }
}

export async function getIncidents(req: Request, res: Response) {
  const { schoolId, type, status, equipmentName, reportedBy } = req.query;

  if (!schoolId || typeof schoolId !== "string") {
    return res.status(400).json({ error: "schoolId is required" });
  }

  try {
    const incidents = await db.incident.findMany({
      where: {
        schoolId,
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
        ...(equipmentName && { equipmentName: equipmentName as string }),
        ...(reportedBy && { reportedBy: reportedBy as string }),
      },
      orderBy: { reportedAt: "desc" },
    });

    return res.status(200).json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return res.status(500).json({ error: "Failed to fetch incidents." });
  }
}

export async function getIncidentById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const incident = await db.incident.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    return res.status(200).json(incident);
  } catch (error) {
    console.error("Error fetching incident:", error);
    return res.status(500).json({ error: "Failed to fetch incident." });
  }
}

export async function updateIncident(req: Request, res: Response) {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await db.incident.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error("Error updating incident:", error);
    return res.status(500).json({ error: "Failed to update incident." });
  }
}

export async function getIncidentsBySchoolId(req: Request, res: Response) {
  const { schoolId } = req.params;

  try {
    const incidents = await db.incident.findMany({
      where: { schoolId },
      orderBy: { reportedAt: "desc" },
    });

    return res.status(200).json(incidents);
  } catch (error) {
    console.error("Error fetching incidents by school:", error);
    return res.status(500).json({ error: "Failed to fetch incidents." });
  }
}


export async function deleteIncident(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await db.incident.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting incident:", error);
    return res.status(500).json({ error: "Failed to delete incident." });
  }
}
