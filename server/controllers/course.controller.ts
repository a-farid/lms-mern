import { Request as Req, Response as Res, NextFunction as Next } from "express";
import CourseModel, {
  IComment,
  ICourse,
  ICourseData,
  IReview,
} from "../models/course.model";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";

import cloudinary from "cloudinary";
import {
  SdeleteCourse,
  SgetAllCourses,
  createCourse,
} from "../services/course.service";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/errorHandler";
import { mongo } from "mongoose";
import sendMail from "../utils/sendMail";
import { findOneById } from "../services/custom.service";
import { sendNotif, sendNotifToAdmins } from "../services/notification.service";

// Register a new course
export const uploadCourse = Catch(async (req: Req, res: Res, next: Next) => {
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
});

// Update a course
export const updateCourse = Catch(async (req: Req, res: Res, next: Next) => {
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
});

// Get a course without content
export const getSingleCourse = Catch(async (req: Req, res: Res, next: Next) => {
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
});

// Get all courses without content
export const getAllCourses = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const courses = await CourseModel.find().select(
      "-courseData.videoUrl -courseData.suggestions -courseData.links -courseData.questions"
    );
    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 401));
  }
});
// Get all courses without content
export const getAllCoursesContent = Catch(
  async (req: Req, res: Res, next: Next) => {
    try {
      const courses = await CourseModel.find();
      res.status(200).json({
        success: true,
        count: courses.length,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 401));
    }
  }
);

// Get a course with content by user
export const getCourseByUser = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const userCoursesList = req.user?.courses;
    const courseId = req.params.id;

    const courseExist = userCoursesList!.find(
      (c: any) => String(c.courseId) === courseId
    );
    if (!courseExist) {
      return next(new ErrorHandler("Unauthorized to this course !!!", 401));
    }
    const course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found", 404));

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler("Internal error !!!", 401));
  }
});

// Add a question to a course
export const addQuestion = Catch(async (req: Req, res: Res, next: Next) => {
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
    const courseData: ICourseData = findOneById(
      courseDataId,
      course?.courseData
    );
    if (!courseData)
      return next(new ErrorHandler("Course data not found", 404));

    courseData.questions.push({
      user: req.user,
      question,
      questionReplies: [],
    } as IComment);

    sendNotifToAdmins(
      "New question",
      `There is a new question on the course ${courseData.title}`
    );

    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error: any) {
    log.error(error.message);
    return next(new ErrorHandler(error.message, 401));
  }
});

// Add a reply to a question
export const addReplyAnswer = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { answer, courseId, courseDataId, questionId } = req.body as {
      answer: string;
      courseId: string;
      courseDataId: string;
      questionId: string;
    };
    const course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found", 404));

    if (!mongo.ObjectId.isValid(courseDataId)) {
      return next(new ErrorHandler("Invalid course data id", 400));
    }
    const courseData = findOneById(courseDataId, course?.courseData);
    if (!courseData)
      return next(new ErrorHandler("Course data not found", 404));

    const question = findOneById(questionId, courseData.questions);
    if (!question) return next(new ErrorHandler("Question not found", 404));
    question.userId;
    question.questionReplies.push({
      user: req.user,
      question: answer,
      questionReplies: [],
    } as IComment);
    await course.save();

    if (String(req.user?._id) === String(question.user._id)) {
      sendNotif(
        question.userId,
        "Question Reply",
        "You have a new reply on your question by the instructor"
      );
      log.warning("User recieves a notification to his question");
    } else {
      log.warning("User recieves an email to his question");

      const data = {
        name: question.user.name,
        title: courseData.title,
      };
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
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 401));
  }
});

// Add a review to a course
export const addReview = Catch(async (req: Req, res: Res, next: Next) => {
  const userCoursesList = req.user?.courses;
  try {
    const { rating, comment } = req.body as {
      rating: number;
      comment: string;
    };

    const courseId = req.params.id;
    const courseExist = findOneById(courseId, userCoursesList);
    if (!courseExist) {
      return next(
        new ErrorHandler("Unauthorized to review this course !!!", 401)
      );
    }
    const course = (await CourseModel.findById(courseId)) as ICourse;
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    const review = {
      user: req.user,
      rating,
      comment,
      commentReplies: [],
    } as IReview;
    await course.reviews!.push(review);
    course.ratings =
      course.reviews!.reduce((acc, item) => item.rating + acc, 0) /
      course.reviews!.length;

    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 401));
  }
});

// Add a reply to a review
export const addReplyReview = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { question, courseId, reviewId } = req.body as {
      courseId: string;
      question: string;
      reviewId: string;
    };
    const course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found", 404));

    const review = findOneById(reviewId, course?.reviews);
    if (!review) return next(new ErrorHandler("Review not found", 404));

    review.commentReplies.push({
      user: req.user,
      question,
      questionReplies: [],
    } as IComment);

    await course.save();
    return res.status(201).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 401));
  }
});

// Get all courses with content - admin
export const getAllCoursesWithContent = Catch(
  async (req: Req, res: Res, next: Next) => {
    try {
      SgetAllCourses(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 401));
    }
  }
);

// Delete a course
export const deleteCourse = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    SdeleteCourse(res, req.params.id, next);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 401));
  }
});
