import { Request, Response } from "express";
import {
  Gender,
  SubjectCategory,
  SubjectType,
  UserRole,
  
  School,
} from "@prisma/client";


// Utility
export interface TypedRequestBody<T> extends Request {
  body: T;
}

export type Option = {
  label: string;
  value: string;
};

// Auth & User
export type UserCreateProps = {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string | null;
  image?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
};

export type UserLoginProps = {
  email: string;
  password: string;
};

export type AssignClassTeacherProps = {
  classTeacherId: string;
  classId: string;
  classTeacherName: string;
  oldClassTeacherId: string | null | undefined;
};

// School Management
export type ClassCreateProps = {
  title: string;
  slug: string;
  schoolId: string;
};

export type StreamCreateProps = {
  title: string;
  slug: string;
  classId: string;
  schoolId: string;
};

export type PeriodCreateProps = {
  year: number;
  term: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  schoolId: string;
};

// Student & Parent
export interface GuardianCreateProps {
  studentId: string;
  fatherFullName: string;
  fatherOccupation: string;
  fatherPhoneNumber: string;
  fatherEmail: string;
  fatherOfficeAddress: string;
  isPrimaryGuardian: boolean;
  motherFullName: string;
  motherOccupation: string;
  motherPhoneNumber: string;
  motherEmail: string;
  motherOfficeAddress: string;
  isSecondaryGuardian: boolean;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactNumber: string;
  isLocalGuardian: boolean;
}

export type ParentCreateProps = {
  title: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email: string;
  NIN: string;
  gender: Gender;
  dob: string;
  phone: string;
  nationality: string;
  whatsappNo: string;
  imageUrl: string;
  contactMethod: string;
  occupation: string;
  address: string;
  password: string;
  schoolId: string;
  schoolName: string;
  userId: string;
};

export interface StudentCreateProps {
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  licenseType: string;
  pilotLicenseNumber?: string;

  totalFlightHours?: number;
  totalSimulatorHours?: number;
  dayHours?: number;
  nightHours?: number;
  instrumentHours?: number;
  singleEngineTime?: number;
  multiEngineTime?: number;

  licenseExpiryDate?: string;
  medicalCertificateExpiry?: string;

  parentId: string;
  classId: string;
  studentType?: string;
  streamId: string;
  password: string;
  imageUrl?: string;
  phone?: string;
  parentName?: string;
  classTitle?: string;
  streamTitle?: string;
  state: string;
  idNumber: string;
  nationality: string;
  religion: string;
  gender: "MALE" | "FEMALE" | "OTHER"; 
  dob: string;
  rollNo: string;
  regNo: string;
  admissionDate: string;
  address: string;
  schoolId: string;
  schoolName: string;

}

// export type StudentCreateProps = {
//   name: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   parentId: string;
//   classId: string;
//   streamId: string;
//   parentName?: string;
//   classTitle?: string;
//   streamTitle?: string;
//   password: string;
//   imageUrl: string;
//   phone: string;
//   state: string;
//   idNumber: string;
//   nationality: string;
//   religion: string;
//   gender: Gender;
//   dob: string;
//   rollNo: string;
//   regNo: string;
//   admissionDate: string;
//   address: string;
//   schoolId: string;
//   schoolName: string;
//   userId: string;
// };

// export type TeacherCreateProps = {
//   title: string;
//   employeeId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   whatsappNo: string;
//   nationality: string;
//   NIN: string;
//   gender: Gender;
//   dateOfBirth: string;
//   contactMethod: string;
//   password: string;
//   dateOfJoining: string;
//   designation: string;
//   qualification: string;
//   mainSubject: string;
//   mainSubjectId: string;
//   classIds: string[];
//   classes: string[];
//   experience: number;
//   address: string;
//   imageUrl: string;
//   schoolId: string;
//   schoolName: string;
//   userId: string;
//   subjectsSummary: string[];
// };
export interface TeacherCreateProps {
  // Required Relationships
  userId: string;
  schoolId: string;
  schoolName: string;

  // Required Fields
  // title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  NIN: string;
  contactMethod: string;
  designation: string;
  instructorRatings: string[];
  classes: string[];
  classIds: string[];
  subjectsSummary: string[];
  nationality: string;
  dateOfJoining: string;
  gender: Gender;

  // Optional Fields
  password: string;
  whatsappNo?: string;
  dateOfBirth: string;
  imageUrl?: string;
  lastLogin?: Date;
  pilotLicenseNumber?: string;
  licenseExpiryDate?: string;
  medicalCertificateExpiry?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  experience?: number;
  bio?: string;
  skills?: string;

  // Optional Totals (can be omitted on create)
  totalFlightHours?: number;
  totalSimulatorHours?: number;
  dayHours?: number;
  nightHours?: number;
  instrumentHours?: number;
  singleEngineTime?: number;
  multiEngineTime?: number;

}

// Academic
export type MarkSheetCreateProps = {
  examId: string;
  termId: string;
  classId: string;
  subjectId: string;
  title: string;
};

export type CreateMarkSheetProps = {
  examId: string;
  classId: string;
  markSheetId: string;
  subjectId: string;
  termId: string;
  studentMarks: {
    studentId: string;
    marks: number;
    isAbsent: boolean;
    comments: string;
  }[];
};

export type SubjectCreateProps = {
  name: string;
  slug: string;
  code: string;
  shortName: string;
  category: SubjectCategory;
  type: SubjectType;
};

// Communication
export type SingleEmailReminderProps = {
  parentName: string;
  email: string;
  message: string;
  subject: string;
};

export type SinglePhoneReminderProps = {
  parentName: string;
  phone: string;
  message: string;
};

export type BatchEmailReminderProps = {
  parents: {
    name: string;
    email: string;
    phone: string;
  }[];
  message: string;
  subject: string;
};

export type GroupMessagePayload = {
  key: string;
  subject: string;
  message: string;
  schoolId: string;
};

// Website CMS
export interface ActivityCreateDTO {
  activity: string;
  description: string;
  time: string;
  schoolId: string;
}

export interface NewsCreateDTO {
  schoolId: string;
  title: string;
  slug: string;
  content: string;
  image: string;
}

export interface EventCreateDTO {
  schoolId: string;
  title: string;
  description: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface GalleryCategoryCreateDTO {
  schoolId: string;
  name: string;
}

export interface GalleryImageCreateDTO {
  schoolId: string;
  title: string;
  description?: string;
  image: string;
  date?: string;
  categoryId: string;
}

export interface WebsiteContactCreateDTO {
  schoolId: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  subject: string;
}

// Documents
export type DocumentCreateProps = {
  name: string;
  type: string;
  url: string;
  size: number;
  studentId: string;
};

export type SchoolFeeProps = {
  term: string;
  title: string;
  year: number;
  fees: { title: string; amount: number }[];
  schoolId: string;
  classId: string;
  periodId: string;
  schoolName: string;
  className: string;
};

// Aviation Enums
export enum AircraftType {
  SINGLE_ENGINE_PISTON = "SINGLE_ENGINE_PISTON",
  MULTI_ENGINE_PISTON = "MULTI_ENGINE_PISTON",
  TURBOPROP = "TURBOPROP",
  JET = "JET",
  HELICOPTER = "HELICOPTER",
  GLIDER = "GLIDER",
  ULTRALIGHT = "ULTRALIGHT",
}

export enum AircraftStatus {
  AVAILABLE = "AVAILABLE",
  IN_FLIGHT = "IN_FLIGHT",
  MAINTENANCE = "MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
  RESERVED = "RESERVED",
}

export enum SimulatorType {
  BASIC_AVIATION_TRAINING_DEVICE = "BASIC_AVIATION_TRAINING_DEVICE",
  ADVANCED_AVIATION_TRAINING_DEVICE = "ADVANCED_AVIATION_TRAINING_DEVICE",
  FLIGHT_TRAINING_DEVICE = "FLIGHT_TRAINING_DEVICE",
  FULL_FLIGHT_SIMULATOR = "FULL_FLIGHT_SIMULATOR",
  VIRTUAL_REALITY = "VIRTUAL_REALITY",
  FIXED_BASE = "FIXED_BASE",
}

export enum SimulatorStatus {
  AVAILABLE = "AVAILABLE",
  IN_USE = "IN_USE",
  MAINTENANCE = "MAINTENANCE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

export enum SessionType {
  FLIGHT = "FLIGHT",
  SIMULATOR = "SIMULATOR",
  TRAINING = "TRAINING",
  CHECKRIDE = "CHECKRIDE",
  SOLO = "SOLO",
  CROSS_COUNTRY = "CROSS_COUNTRY",
}

export enum SessionStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  RESCHEDULED = "RESCHEDULEED",
  NO_SHOW = "NO_SHOW",
  PENDING_REVIEW = "PENDING_REVIEW",
}


export enum MaintenanceType {
  SCHEDULED = "SCHEDULED",
  UNSCHEDULED = "UNSCHEDULED",
  INSPECTION = "INSPECTION",
  REPAIR = "REPAIR",
  PREVENTATIVE = "PREVENTATIVE",
}

export enum MaintenanceStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DEFERRED = "DEFERRED",
}
export enum CrewOperation {
  SINGLE_PILOT = "SINGLE_PILOT",
  MULTI_PILOT = "MULTI_PILOT",
}
export enum PilotRole {
  PIC = "PIC",
  DUAL = "DUAL",
  COPILOT = "COPILOT",
  PICUS = "PICUS",
  COMMD_PRACTICE = "COMMD_PRACTICE",
}
  
  

// Aviation Models
export type CreateAircraftProps = {
  tailNumber: string;
  make: string;
  model: string;
  aircraftType: AircraftType;
  engineHours?: number;
  airframeHours?: number;
  lastInspection?: Date;
  nextInspection?: Date;
  status?: AircraftStatus;
  location?: string;
  hourlyRate?: number;
  schoolId: string;
};

export interface AircraftModel {
  id: string;
  tailNumber: string;
  make: string;
  model: string;
  aircraftType: AircraftType;
  engineHours: number;
  airframeHours: number;
  lastInspection: Date | null;
  nextInspection: Date | null;
  status: AircraftStatus;
  location: string | null;
  hourlyRate: number;
  schoolId: string;
  school?: School;
  flightSessions?: FlightSessionModel[];
  maintenanceLogs?: MaintenanceLogModel[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSimulatorProps = {
  name: string;
  model: string;
  simulatorType: SimulatorType;
  hourlyRate?: number;
  location?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  status?: SimulatorStatus;
  schoolId: string;
};

export interface SimulatorModel {
  id: string;
  name: string;
  model: string;
  simulatorType: SimulatorType;
  hourlyRate: number;
  location: string | null;
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
  status: SimulatorStatus;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateFlightSessionProps = {
  // Required core fields
  sessionType: SessionType;
  startTime: Date;
  endTime: Date;
  studentId: string;
  teacherId: string;
  schoolId: string;

  // Optional logbook fields
  date?: Date;
  flightType?: string;
  detailsOfFlight?: string;

  // IFR / instrument
  ifrApproaches?: number;
  instrumentTime?: number;
  instrumentTimeSe?: number;
  instrumentTimeMe?: number;

  // Actual and simulated totals
  actualTime?: number;
  fstdTime?: number;
  fstdDual?: number;
  fstdPic?: number;
  fstdPicPractice?: number;

  // Multi‑/single‑engine day/night
  singleEngineDay?: number;
  singleEngineNight?: number;
  multiEngineDay?: number;
  multiEngineNight?: number;

  // Other time/take‑offs/landings
  other?: number;
  takeOffsDay?: number;
  takeOffsNight?: number;
  landingsDay?: number;
  landingsNight?: number;

  // Status & feedback
  status?: SessionStatus;
  durationHours?: number;
  teacherFeedback?: string;
  studentFeedback?: string;
  verifiedByInstructor?: boolean;

  // Aircraft/Sim information
  aircraftId?: string;
  aircraftType?: string;
  registrationNumber?: string;
  simulatorId?: string;

  // Airports
  departureAirport?: string;
  arrivalAirport?: string;

  // Computed breakdowns
  totalFlightTime?: number;
  dayHours?: number;
  nightHours?: number;
  instrumentHours?: number;
  singleEngineTime?: number;
  multiEngineTime?: number;

  // Roles
  pilotRole?: PilotRole;
  crewOperation?: CrewOperation;

  // Actuals if you need to override
  actualFlightHours?: number;
  actualSimulatorHours?: number;
  actualGroundHours?: number;
};

export interface FlightSessionModel {
  id: string;
  sessionId: string;
  sessionType: SessionType;
  date: Date | null;
  flightType: string | null;

  detailsOfFlight: string | null;

  ifrApproaches: number;
  instrumentTime: number;
  instrumentTimeSe: number;
  instrumentTimeMe: number;

  actualTime: number;

  fstdTime: number;
  fstdDual: number;
  fstdPic: number;
  fstdPicPractice: number;

  singleEngineDay: number;
  singleEngineNight: number;
  multiEngineDay: number;
  multiEngineNight: number;

  other: number;

  takeOffsDay: number;
  takeOffsNight: number;
  landingsDay: number;
  landingsNight: number;

  status: SessionStatus;
  startTime: Date;
  endTime: Date;
  durationHours: number | null;
  teacherFeedback: string | null;
  studentFeedback: string | null;
  verifiedByInstructor: boolean;

  aircraftId: string | null;
  aircraft?: AircraftModel | null;
  aircraftType: string | null;
  registrationNumber: string | null;

  departureAirport: string | null;
  arrivalAirport: string | null;

  totalFlightTime: number | null;
  dayHours: number | null;
  nightHours: number | null;
  instrumentHours: number | null;
  singleEngineTime: number | null;
  multiEngineTime: number | null;

  pilotRole: PilotRole | null;
  crewOperation: CrewOperation | null;

  studentId: string;
  student: StudentCreateProps; // Or a proper `StudentModel` interface if you define one
  teacherId: string;
  teacher: TeacherCreateProps; // Or `TeacherModel`
  simulatorId: string | null;
  simulator?: SimulatorModel | null;

  schoolId: string;
  school: School;

  actualFlightHours: number | null;
  actualSimulatorHours: number | null;
  actualGroundHours: number | null;

  createdAt: Date;
  updatedAt: Date;
}






export type CreateMaintenanceLogProps = {
  aircraftId: string;
  logDate: Date;
  description: string;
  maintenanceType: MaintenanceType;
  performedBy: string;
  cost?: number;
  partsReplaced?: string[];
  hoursAtMaintenance?: number;
  nextDueDate?: Date;
  status?: MaintenanceStatus;
};

export interface MaintenanceLogModel {
  id: string;
  aircraftId: string;
  aircraft?: AircraftModel;
  logDate: Date;
  description: string;
  maintenanceType: MaintenanceType;
  performedBy: string;
  cost: number | null;
  partsReplaced: string[] | null;
  hoursAtMaintenance: number | null;
  nextDueDate: Date | null;
  status: MaintenanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Form
export type ContactProps = {
  fullName: string;
  email: string;
  phone: string;
  school: string;
  country: string;
  schoolPage: string;
  students: number;
  role: string;
  media: string;
  message: string;
};
