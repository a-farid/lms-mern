import { Request as Req, Response as Res, NextFunction as Next } from "express";
import NotificationModel, { INotification } from "../models/notification.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";
import { v2 as cloudinary } from "cloudinary";
import LayoutModel from "../models/layout.model";

export const createLayout = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { type, faqs, categories, banner } = req.body;
    if (!type) return next(new ErrorHandler("Type is required", 400));
    if (type !== "FAQ" && type !== "Category" && type !== "Banner")
      return next(new ErrorHandler("Type: FAQ || Category || Banner", 400));
    const isTypeExists = await LayoutModel.findOne({ type });
    if (!isTypeExists) await LayoutModel.create({ type });
    const layout = await LayoutModel.findOne({ type: "FAQ" });
    if (layout) {
      if (type === "Banner") {
        if (!banner) return next(new ErrorHandler("Banner is required", 400));
        const { image, title, subTitle } = banner;
        if (!image || !title || !subTitle)
          return next(new ErrorHandler("Banner fields are required", 400));

        const imageUpload = await cloudinary.uploader.upload(image, {
          folder: "layout",
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
        layout.banner = newBanner;
      }
      if (type === "FAQ") {
        if (!faqs) return next(new ErrorHandler("FAQs are required", 400));
        layout.faqs.push(...faqs);
      }
      if (type === "Category") {
        if (!categories)
          return next(new ErrorHandler("Categories are required", 400));
        layout.categories.push(...categories);
      }
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

export const getLayout = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const layout = await LayoutModel.find();
    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const updateLayout = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { type, faqs, categories, banner } = req.body;
    if (!type) return next(new ErrorHandler("Type is required", 400));
    if (type !== "FAQ" && type !== "Category" && type !== "Banner")
      return next(new ErrorHandler("Type: FAQ || Category || Banner", 400));
    if (type === "Banner") {
      if (!banner) return next(new ErrorHandler("Banner is required", 400));
      const { image, title, subTitle } = banner;
      if (!image || !title || !subTitle)
        return next(new ErrorHandler("Banner fields are required", 400));
      const layout = await LayoutModel.findOne({ type: "Banner" });
      if (layout) {
        await cloudinary.uploader.destroy(layout.banner.image.public_id);
        const imageUpload = await cloudinary.uploader.upload(image, {
          folder: "layout",
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

        layout.banner = newBanner;
        await layout.save();
      }
    }
    if (type === "FAQ") {
      if (!faqs) return next(new ErrorHandler("FAQs are required", 400));
      const layout = await LayoutModel.findOne({ type: "FAQ" });
      if (layout) {
        layout.faqs = faqs;
        await layout.save();
      }
    }
    if (type === "Category") {
      if (!categories)
        return next(new ErrorHandler("Categories are required", 400));
      const layout = await LayoutModel.findOne({ type: "Category" });
      if (layout) {
        layout.categories.push(...categories);
        await layout.save();
      }
    }
    res.status(200).json({
      success: true,
      message: "Layout updated successfully",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getLayoutByType = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { type } = req.params as { type: string };
    if (type !== "FAQ" && type !== "Category" && type !== "Banner")
      return next(new ErrorHandler("Type: FAQ || Category || Banner", 400));
    if (!type) return next(new ErrorHandler("Type is required", 400));
    const layout = await LayoutModel.findOne({ type });
    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
