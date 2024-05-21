import { Request, Response, NextFunction } from "express";
import CourseModel, { IComment, ICourse } from "../models/course.model";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import { count, dir } from "console";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/errorHandler";
import { mongo } from "mongoose";
import { getTsBuildInfoEmitOutputFilePath } from "typescript";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

const findOne_id = (one: string, gb: any) => {
  return gb.find((c: any) => String(c._id) === String(one));
};

/**
 * Registers a new course.
 * @param {req} request
 * @param {res} response
 */
export const uploadCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as ICourse;
    const thumbnail = data.thumbnail as string;

    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    createCourse(data, res);
  }
);

export const updateCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      await cloudinary.v2.uploader.destroy(thumbnail.public_id);
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const course = await CourseModel.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true }
    );

    res.status(201).json({
      success: true,
      course,
    });
  }
);

export const getSingleCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id;
    const cacheKey = `course:${courseId}`;
    const cacheTTL = 7 * 24 * 60 * 60; // 7 days in seconds

    // Check if course exists in Redis cache
    const cachedCourse = await redis.get(cacheKey);
    if (cachedCourse) {
      return res.status(200).json({
        success: true,
        course: JSON.parse(cachedCourse),
      });
    }

    // Fetch course from database
    const course = await CourseModel.findById(courseId).select(
      "-courseData.videoUrl -courseData.suggestions -courseData.links -courseData.questions"
    );

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    // Store the course in Redis cache with TTL
    await redis.set(cacheKey, JSON.stringify(course), "EX", cacheTTL);

    return res.status(200).json({
      success: true,
      course,
    });
  }
);

export const getAllCourses = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const courses = await CourseModel.find().select(
      "-courseData.videoUrl -courseData.suggestions -courseData.links -courseData.questions"
    );
    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  }
);

export const getCourseByUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userCourses = req.user?.courses;
    const courseId = req.params.id;
    try {
      const courseExist = userCourses?.find((c: any) => c._id === courseId);
      if (!courseExist) {
        return next(
          new ErrorHandler(
            "You are not eligible to access this course !!!",
            401
          )
        );
      }
    } catch (error) {
      return next(new ErrorHandler("Internal error !!!", 401));
    }

    const course = await CourseModel.findById(courseId);

    res.status(200).json({
      success: true,
      course,
    });
  }
);

export const addQuestion = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, courseDataId } = req.body as {
        question: string;
        courseId: string;
        courseDataId: string;
      };
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      if (!mongo.ObjectId.isValid(courseDataId)) {
        return next(new ErrorHandler("Invalid course data id", 400));
      }
      //   const courseData = course?.courseData?.find(
      //       (c: any) => String(c._id) === courseDataId
      //     );
      const courseData = findOne_id(courseDataId, course?.courseData);

      if (!courseData) {
        return next(new ErrorHandler("Course data not found", 404));
      }
      courseData.questions.push({
        user: req.user,
        question,
        questionReplies: [],
      } as IComment);
      await course.save();
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal error !!!", 401));
    }
  }
);

export const addReplyAnswer = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, courseDataId, questionId } = req.body as {
        answer: string;
        courseId: string;
        courseDataId: string;
        questionId: string;
      };
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      if (!mongo.ObjectId.isValid(courseDataId)) {
        return next(new ErrorHandler("Invalid course data id", 400));
      }
      const courseData = findOne_id(courseDataId, course?.courseData);

      if (!courseData) {
        return next(new ErrorHandler("Course data not found", 404));
      }
      const question = findOne_id(questionId, courseData.questions);
      if (!question) {
        return next(new ErrorHandler("Question not found", 404));
      }
      question.questionReplies.push({
        user: req.user,
        question: answer,
        questionReplies: [],
      } as IComment);
      await course.save();
      if (req.user?._id === question.user._id) {
        //todo: create notification
      } else {
        const data = {
          name: question.user?.name,
          title: courseData.title,
        };
        // const html = await ejs.renderFile(
        //   path.join(__dirname, "../mails/question-reply.ejs"),
        //   data
        // );

        try {
          await sendMail({
            email: question.user.email,
            subject: `Question reply for ${courseData.title}`,
            template: "question-reply.ejs",
            data,
          });
        } catch (error) {
          return next(
            new ErrorHandler("Internal error !!! while ending Email", 401)
          );
        }
      }

      return res.status(201).json({
        success: true,
        course,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal error !!!", 401));
    }
  }
);
