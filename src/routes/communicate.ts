import {
  getGroups,
  getSchoolRemindersByKey,
  sendBatchEmailsReminder,
  sendGroupMessages,
  sendSingleEmailReminder,
  sendSinglePhoneReminder,
} from "@/controllers/communications";

import express from "express";
const reminderRouter = express.Router();

reminderRouter.post("/reminders/specific-email", sendSingleEmailReminder);
reminderRouter.post("/reminders/specific-phone", sendSinglePhoneReminder);
reminderRouter.post("/reminders/batch-emails", sendBatchEmailsReminder);
reminderRouter.get("/groups/:schoolId", getGroups);
reminderRouter.get("/reminders/:schoolId", getSchoolRemindersByKey);
reminderRouter.post("/groups/", sendGroupMessages);

export default reminderRouter;
