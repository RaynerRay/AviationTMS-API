import { sendReminderTemplate } from "@/email-templates/reminder";
import { Request, Response } from "express";
import { Resend } from "resend";
import {
  BatchEmailReminderProps,
  GroupMessagePayload,
  SingleEmailReminderProps,
  SinglePhoneReminderProps,
  TypedRequestBody,
} from "@/types/types";

import { db } from "@/db/db";
import { sendMessageTemplate } from "@/email-templates/messageTemplate";
import { Key } from "@prisma/client";
const resend = new Resend(process.env.RESEND_API_KEY);
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require("twilio")(accountSid, authToken);
export async function sendSingleEmailReminder(
  req: TypedRequestBody<SingleEmailReminderProps>,
  res: Response
) {
  const receivedData = req.body;
  const { parentName: name, email, message: body, subject } = receivedData;
  try {
    const { data, error } = await resend.emails.send({
      from: "Desishub <info@desishub.com>",
      to: email,
      subject: subject,
      html: sendReminderTemplate(body, subject, name),
    });

    if (error) {
      return res.status(400).json({ error });
    }
    console.log(data);
    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error sending the reminder:", error);
    return res.status(500).json({ error: "Failed to send the reminder" });
  }
}
export async function sendSinglePhoneReminder(
  req: TypedRequestBody<SinglePhoneReminderProps>,
  res: Response
) {
  const receivedData = req.body;
  const { parentName, phone, message } = receivedData;
  try {
    // Create the message with parent name if available
    const messageBody = parentName ? `${parentName}: ${message}` : message;

    const twilioResponse = await client.messages.create({
      body: messageBody,
      to: phone,
      from: fromNumber,
    });
    console.log(twilioResponse);
    res.status(200).json({
      success: true,
      messageId: twilioResponse.sid,
      status: twilioResponse.status,
    });
  } catch (error) {
    console.error("Error sending the reminder:", error);
    return res.status(500).json({ error: "Failed to send the reminder" });
  }
}
export async function sendBatchEmailsReminder(
  req: TypedRequestBody<BatchEmailReminderProps>,
  res: Response
) {
  const receivedData = req.body;
  const { subject, message: body, parents } = receivedData;
  try {
    const { data, error } = await resend.batch.send(
      parents.map((parent) => {
        const name = parent.name;
        return {
          from: "Desishub <info@desishub.com>",
          to: parent.email,
          subject: subject,
          html: sendReminderTemplate(body, subject, name),
        };
      })
    );
    if (error) {
      return res.status(400).json({ error });
    }
    console.log(data);
    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error sending the reminder:", error);
    return res.status(500).json({ error: "Failed to send the reminder" });
  }
}

export async function getGroups(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const students = await db.student.count({
      where: {
        schoolId,
      },
    });
    const parents = await db.parent.count({
      where: {
        schoolId,
      },
    });
    const teachers = await db.teacher.count({
      where: {
        schoolId,
      },
    });

    const result = {
      students,
      parents,
      teachers,
    };
    console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
}
export async function getSchoolRemindersByKey(req: Request, res: Response) {
  const key = (req.query.key as Key) || "All";
  try {
    const { schoolId } = req.params;
    const reminders = await db.reminder.findMany({
      where: {
        schoolId,
        recipient: key,
      },
    });
    return res.status(200).json(reminders);
  } catch (error) {
    console.log(error);
  }
}
export async function sendGroupMessages(
  req: TypedRequestBody<GroupMessagePayload>,
  res: Response
) {
  try {
    const data = req.body;
    const { key, message, schoolId, subject } = data;
    const school = await db.school.findFirst({
      where: {
        id: schoolId,
      },
    });
    const students = await db.student.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const parentsData = await db.parent.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    const teachersData = await db.teacher.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    const teachers = teachersData.map((t) => {
      return {
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
      };
    });
    const parents = parentsData.map((p) => {
      return {
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
      };
    });
    const all = [...students, ...parents, ...teachers];

    let emails: {
      id: string;
      name: string;
      email: string;
    }[] = [];
    let salutation = `Dear ${key},`;
    if (key === "All") {
      emails = all;
      salutation = "Dear Parents, Teachers and Students";
    } else if (key === "Parents") {
      emails = parents;
    } else if (key === "Students") {
      emails = parents;
    } else {
      emails = teachers;
    }

    // send the email
    for (const mail of emails) {
      const body = message;

      const options = {
        headmasterName: "Dr. James Okello",
        schoolName: school?.name ?? "",
        salutation: salutation,
      };
      const { data, error } = await resend.emails.send({
        from: `${school?.name} <info@desishub.com>`,
        to: mail.email,
        subject: subject,
        html: sendMessageTemplate(body, subject, options),
      });
      console.log(data);
      if (error) {
        console.log(error);
      }
    }
    // Save the Reminder the message
    const reminder = await db.reminder.create({
      data: {
        message: message,
        recipient: key as Key,
        schoolId: schoolId,
        subject: subject,
      },
    });
    console.log(reminder);
    return res.status(200).json({
      success: true,
      message: "Messages sent successfully",
      data: reminder,
    });
  } catch (error) {
    console.log(error);
  }
}
