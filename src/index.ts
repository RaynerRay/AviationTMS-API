import express from "express";
import schoolRouter from "./routes/school";
import adminRouter from "./routes/admin";
import classRouter from "./routes/classes";
import parentRouter from "./routes/parents";
import studentRouter from "./routes/students";
import subjectRouter from "./routes/subjects";
import teacherRouter from "./routes/teachers";
import userRouter from "./routes/user";
import aircraftsRouter from "./routes/aircrafts";
import simulatorsRouter from "./routes/simulators";
import maintenanceRouter from "./routes/maintenance";
import flightSessionsRouter from "./routes/flightSessions";
// import periodRouter from "./routes/periods";
// import schoolFeeRouter from "./routes/school-fee";
// import paymentRouter from "./routes/feePayment";
// import userLogRouter from "./routes/userLogs";
// import stdDocRouter from "./routes/student-document";
// import reminderRouter from "./routes/communicate";
// import examRouter from "./routes/exams";
// import markSheetRouter from "./routes/marksheet";
// import reportCardRouter from "./routes/report-card";
// import siteRouter from "./routes/site";
// import attendanceRouter from "./routes/attendance";

require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(cors());

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Log a message indicating the server is running
});

app.use("/api/v1", schoolRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", classRouter);
app.use("/api/v1", parentRouter);
app.use("/api/v1", studentRouter);
app.use("/api/v1", subjectRouter);
app.use("/api/v1", teacherRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", aircraftsRouter);
app.use("/api/v1", simulatorsRouter);
app.use("/api/v1", maintenanceRouter);
app.use("/api/v1", flightSessionsRouter);
// app.use("/api/v1", analyticsRouter);
// app.use("/api/v1", periodRouter);
// app.use("/api/v1", schoolFeeRouter);
// app.use("/api/v1", paymentRouter);
// app.use("/api/v1", userLogRouter);
// app.use("/api/v1", stdDocRouter);
// app.use("/api/v1", reminderRouter);
// app.use("/api/v1", examRouter);
// app.use("/api/v1", markSheetRouter);
// app.use("/api/v1", reportCardRouter);
// app.use("/api/v1", siteRouter);
// app.use("/api/v1", attendanceRouter);
