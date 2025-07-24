import { createExam, getExamsByAcademicYear } from "@/controllers/exams";
import {
  createGalleryCategory,
  createGalleryImage,
  createSite,
  createSiteActivity,
  createSiteEvents,
  createSiteMessages,
  createSiteNews,
  deleteGalleryCategory,
  deleteGalleryImage,
  getNotifications,
  getSchoolAllSections,
  getSchoolEvents,
  getSchoolGalleryCategories,
  getSchoolGalleryImages,
  getSchoolNews,
  getSchoolSectionByType,
  getSchoolSiteRecentActivities,
  getSchoolWebsiteMessages,
  updateSectionById,
} from "@/controllers/sites";

import express from "express";
const siteRouter = express.Router();

siteRouter.post("/site", createSite);
siteRouter.post("/site-news", createSiteNews);
siteRouter.post("/site-messages", createSiteMessages);
siteRouter.get("/site-notifications/:schoolId", getNotifications);
siteRouter.get("/site-messages/:schoolId", getSchoolWebsiteMessages);
siteRouter.post("/site-events", createSiteEvents);
siteRouter.post("/site-gallery-categories", createGalleryCategory);
siteRouter.post("/site-gallery-images", createGalleryImage);
siteRouter.get("/site-news/:schoolId", getSchoolNews);
siteRouter.get(
  "/site-gallery-categories/:schoolId",
  getSchoolGalleryCategories
);
siteRouter.delete("/site-gallery-categories/:id", deleteGalleryCategory);
siteRouter.delete("/site-gallery-images/:id", deleteGalleryImage);
siteRouter.get("/site-gallery-images/:schoolId", getSchoolGalleryImages);
siteRouter.get("/site-events/:schoolId", getSchoolEvents);
siteRouter.post("/site-activity", createSiteActivity);
siteRouter.get("/site/:schoolId", getSchoolSiteRecentActivities);
siteRouter.get("/site-section/:schoolId", getSchoolSectionByType);
siteRouter.get("/site-sections/:schoolId", getSchoolAllSections);
siteRouter.patch("/site-section/:id", updateSectionById);

export default siteRouter;
