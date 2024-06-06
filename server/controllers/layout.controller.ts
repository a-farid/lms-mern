import { Request as Req, Response as Res, NextFunction as Next } from "express";
import NotificationModel, { INotification } from "../models/notification.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";
import { v2 as cloudinary } from "cloudinary";
import LayoutModel from "../models/layout.model";

export const createLayout = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { type, faqs, categories, banner } = req.body;
    log.info(`Creating layout of type ${type}`);
    log.info(`categories ${categories}`);
    log.info(`faqs ${faqs}`);
    log.info(`banner ${banner}`);
    if (type === "Banner") {
      if (!banner) return next(new ErrorHandler("Banner is required", 400));
      const { image, title, subTitle } = banner;
      if (!image || !title || !subTitle)
        return next(new ErrorHandler("Banner fields are required", 400));

      const imageUpload = await cloudinary.uploader.upload(image, {
        folder: "banner",
        width: 1920,
        crop: "scale",
      });
      const newBanner = {
        image: {
          public_id: imageUpload.public_id,
          url: imageUpload.secure_url,
        },
        title,
        subTitle,
      };
      await LayoutModel.create({ type, banner: newBanner });
    }
    if (type === "FAQ") {
      if (!faqs) return next(new ErrorHandler("FAQs are required", 400));
      const { question, answer } = faqs as { question: string; answer: string };
      await LayoutModel.create({ type, faqs: [{ question, answer }] });
    }
    if (type === "Category") {
      if (!categories)
        return next(new ErrorHandler("Categories are required", 400));
      const layout = await LayoutModel.create({ type });
      layout.categories.push(categories);
      await layout.save();
    }
    res.status(200).json({
      success: true,
      message: "Layout created successfully",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
