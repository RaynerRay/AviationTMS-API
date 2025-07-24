import { db } from "@/db/db";
import { generateContactFormEmail } from "@/email-templates/contactEmail";
interface ContactSectionSettings {
  title?: string;
  description?: string;
  locationInfo?: {
    title?: string;
    address?: string;
    note?: string;
  };
  emailInfo?: {
    title?: string;
    email?: string;
    note?: string;
  };
  phoneInfo?: {
    title?: string;
    phone?: string;
    note?: string;
  };
  hoursInfo?: {
    title?: string;
    hours?: string;
    note?: string;
  };
  formSettings?: {
    nameLabel?: string;
    namePlaceholder?: string;
    phoneLabel?: string;
    phonePlaceholder?: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    subjectLabel?: string;
    subjectPlaceholder?: string;
    messageLabel?: string;
    messagePlaceholder?: string;
    buttonText?: string;
    buttonColor?: string;
  };
}
interface ContactFormMailData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  schoolName: string;
}

import {
  ActivityCreateDTO,
  EventCreateDTO,
  ExamCreateProps,
  GalleryCategoryCreateDTO,
  GalleryImageCreateDTO,
  NewsCreateDTO,
  SiteCreateProps,
  TypedRequestBody,
  WebsiteContactCreateDTO,
} from "@/types/types";

import { convertDateToIso } from "@/utils/convertDateToIso";
import { generateSlug } from "@/utils/generateSlug";
import { getFormattedDate } from "@/utils/getFormatedDate";
import { SectionType } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

import { Request, Response } from "express";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

function parseSettings(
  settings: JsonValue | null | undefined
): ContactSectionSettings {
  // If settings is null, return an empty object
  if (settings === null) {
    return {};
  }

  // If settings is an object, return it as ContactSectionSettings
  if (
    typeof settings === "object" &&
    settings !== null &&
    !Array.isArray(settings)
  ) {
    return settings as unknown as ContactSectionSettings;
  }

  // If settings is not an object, return an empty object
  return {};
}
export async function createSite(
  req: TypedRequestBody<SiteCreateProps>,
  res: Response
) {
  const data = req.body;
  try {
    //  Create the sections
    for (const section of data.sections) {
      const newSection = await db.section.create({
        data: {
          schoolId: data.schoolId,
          type: section.type,
          title: section.title,
          subtitle: section.subtitle,
          order: section.order,
          settings: section.settings as any,
        },
      });
      // Update the school
      await db.school.update({
        where: {
          id: data.schoolId,
        },
        data: {
          sectionCount: {
            increment: 1,
          },
        },
      });
    }
    const school = await db.school.update({
      where: {
        id: data.schoolId,
      },
      data: {
        siteEnabled: data.siteEnabled,
      },
    });
    await db.recentActivity.create({
      data: {
        activity: "School Site Created ",
        description: "School Site was Created and Section editing was enabled",
        time: getFormattedDate(new Date()),
        schoolId: data.schoolId,
      },
    });
    await db.recentActivity.create({
      data: {
        activity: "10 Sections Initiated",
        description: "10 Sections with Dummy data were created",
        time: getFormattedDate(new Date()),
        schoolId: data.schoolId,
      },
    });
    return res.status(201).json({
      data: school,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function createSiteActivity(
  req: TypedRequestBody<ActivityCreateDTO>,
  res: Response
) {
  const data = req.body;
  try {
    const activity = await db.recentActivity.create({
      data,
    });
    return res.status(201).json({
      data: activity,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getSchoolSiteRecentActivities(
  req: Request,
  res: Response
) {
  try {
    const { schoolId } = req.params;

    const activities = await db.recentActivity.findMany({
      where: {
        schoolId,
        type: "site",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        activity: true,
        description: true,
        time: true,
        createdAt: true,
      },
      take: 2,
    });

    return res.status(200).json({
      data: activities,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}

export async function getSchoolSectionByType(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const type = req.query.type as SectionType;

    const section = await db.section.findFirst({
      where: {
        schoolId,
        type,
      },
    });

    return res.status(200).json({
      data: section,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getSchoolAllSections(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    const sections = await db.section.findMany({
      where: {
        schoolId,
      },
    });

    return res.status(200).json({
      data: sections,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function updateSectionById(req: Request, res: Response) {
  try {
    const data = req.body;
    const { id } = req.params;
    const schoolId = req.query.schoolId as string;
    const section = await db.section.update({
      where: {
        id,
      },
      data,
    });
    if (schoolId) {
      const school = await db.school.findUnique({
        where: {
          id: schoolId,
        },
        select: {
          siteCompletion: true,
        },
      });
      if (!school) {
        return res.status(200).json({
          data: section,
          error: null,
        });
      }
      const completion = data.isComplete
        ? school?.siteCompletion + 10
        : school?.siteCompletion - 10;

      await db.school.update({
        where: {
          id: schoolId,
        },
        data: {
          siteCompletion: completion,
        },
      });
    }
    console.log(section);
    return res.status(200).json({
      data: section,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function createSiteNews(
  req: TypedRequestBody<NewsCreateDTO>,
  res: Response
) {
  const data = req.body;
  data.slug = generateSlug(data.title);
  try {
    const news = await db.newsItem.create({
      data,
    });
    await db.recentActivity.create({
      data: {
        activity: "Added New News Item",
        description: "Admin created a news item ",
        time: getFormattedDate(new Date()),
        schoolId: data.schoolId,
      },
    });
    console.log(news);
    return res.status(201).json({
      data: news,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function createSiteMessages(
  req: TypedRequestBody<WebsiteContactCreateDTO>,
  res: Response
) {
  const data = req.body;
  //
  try {
    const message = await db.schoolContactMessage.create({
      data,
    });
    // Send an Email
    const school = await db.school.findUnique({
      where: {
        id: message.schoolId,
      },
    });
    const contactSection = await db.section.findFirst({
      where: {
        schoolId: message.schoolId,
        type: "CONTACT",
      },
    });
    // Parse the settings properly with type safety
    const typedSettings = parseSettings(contactSection?.settings);
    const contactEmail = typedSettings.emailInfo?.email;

    const schoolEmail =
      (school?.primaryEmail as string) || (contactEmail as string);

    // send the email
    const mailData: ContactFormMailData = {
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      schoolName: school?.name ?? "",
    };

    const response = await resend.emails.send({
      from: "Desishub <info@desishub.com>",
      to: schoolEmail,
      subject: "New Message from Website Contact Form ",
      html: generateContactFormEmail(mailData),
    });

    await db.recentActivity.create({
      data: {
        activity: "New Message from Website Contact Form ",
        description: `A Person named ${message.fullName} sent a message with a subject - ${message.subject} `,
        type: "contact-form",
        time: getFormattedDate(new Date()),
        schoolId: data.schoolId,
      },
    });
    // console.log(news);
    return res.status(201).json({
      data: message,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getNotifications(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    const nots = await db.recentActivity.findMany({
      where: {
        schoolId,
        read: false,
        type: "contact-form",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      data: nots,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function createSiteEvents(
  req: TypedRequestBody<EventCreateDTO>,
  res: Response
) {
  const data = req.body;
  data.date = convertDateToIso(data.date);
  try {
    const event = await db.event.create({
      data,
    });
    console.log(event);
    await db.recentActivity.create({
      data: {
        activity: "Added New Event",
        description: "Admin created a new event ",
        time: getFormattedDate(new Date()),
        schoolId: data.schoolId,
      },
    });
    console.log(event);
    return res.status(201).json({
      data: event,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function createGalleryCategory(
  req: TypedRequestBody<GalleryCategoryCreateDTO>,
  res: Response
) {
  const data = req.body;
  try {
    const cat = await db.galleryCategory.create({
      data,
    });

    await db.recentActivity.create({
      data: {
        activity: "Added New Gallery Category",
        description: "Admin created a Galley Category ",
        time: getFormattedDate(new Date()),
        schoolId: data.schoolId,
      },
    });
    console.log(cat);
    return res.status(201).json({
      data: cat,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function createGalleryImage(
  req: TypedRequestBody<GalleryImageCreateDTO>,
  res: Response
) {
  const data = req.body;
  try {
    const image = await db.galleryImage.create({
      data,
    });

    await db.recentActivity.create({
      data: {
        activity: "Added New Gallery Image",
        description: "Admin created a new Galley Image ",
        time: getFormattedDate(new Date()),
        schoolId: data.schoolId,
      },
    });
    console.log(image);
    return res.status(201).json({
      data: image,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getSchoolNews(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    const news = await db.newsItem.findMany({
      where: {
        schoolId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    return res.status(200).json({
      data: news,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}

export async function getSchoolGalleryCategories(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    const cats = await db.galleryCategory.findMany({
      where: {
        schoolId,
        active: true,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return res.status(200).json({
      data: cats,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function deleteGalleryCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const cat = await db.galleryCategory.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });
    if (!cat) {
      return res.status(404).json({
        data: null,
        error: "Not Category Found",
      });
    }
    if (cat.images.length > 0) {
      // Hide the Category
      const updatedCat = await db.galleryCategory.update({
        where: {
          id,
        },
        data: {
          active: false,
        },
      });
      // hide the images within that cat
      for (const image of cat.images) {
        await db.galleryImage.update({
          where: {
            id: image.id,
          },
          data: {
            active: false,
          },
        });
      }
      await db.recentActivity.create({
        data: {
          activity: "Achieved the Gallery Category",
          description: "Admin achieved the Gallery Category ",
          time: getFormattedDate(new Date()),
          schoolId: updatedCat.schoolId,
        },
      });
      return res.status(200).json({
        data: updatedCat,
        error: null,
      });
    } else {
      const deleted = await db.galleryCategory.delete({
        where: {
          id,
        },
      });
      await db.recentActivity.create({
        data: {
          activity: "Deleted the Gallery Category",
          description: "Admin deleted the Gallery Category ",
          time: getFormattedDate(new Date()),
          schoolId: deleted.schoolId,
        },
      });
      return res.status(200).json({
        data: deleted,
        error: null,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function deleteGalleryImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const image = await db.galleryImage.findUnique({
      where: {
        id,
      },
    });
    if (!image) {
      return res.status(404).json({
        data: null,
        error: "Not Image Found",
      });
    }
    const deleted = await db.galleryImage.delete({
      where: {
        id,
      },
    });
    await db.recentActivity.create({
      data: {
        activity: "Deleted the Gallery Image",
        description: "Admin deleted the Gallery Image ",
        time: getFormattedDate(new Date()),
        schoolId: deleted.schoolId,
      },
    });
    return res.status(200).json({
      data: deleted,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getSchoolGalleryImages(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    const images = await db.galleryImage.findMany({
      where: {
        schoolId,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      data: images,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getSchoolEvents(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    const events = await db.event.findMany({
      where: {
        schoolId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    return res.status(200).json({
      data: events,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
export async function getSchoolWebsiteMessages(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;

    const messages = await db.schoolContactMessage.findMany({
      where: {
        schoolId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      data: messages,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: null,
      error: "Something went wrong",
    });
  }
}
