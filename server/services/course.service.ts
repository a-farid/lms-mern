import { NextFunction, Response } from "express";
import CourseModel, { ICourse } from "../models/course.model";
import ErrorHandler from "../utils/errorHandler";
import { redis } from "../utils/redis";

/**
 * Registers a new course.
 * @param {res} response object
 * @param {data} course data
 */
export const createCourse = async (data: ICourse, res: Response) => {
  const course = await CourseModel.create(data);
  return res.status(201).json({ succes: true, course });
};

/**
 * Registers a new course.
 * @param {res} response object
 * @param {data} course data
 */
export const SgetAllCourses = async (res: Response) => {
  const courses = await CourseModel.find().sort({ createdAt: -1 });
  return res.status(201).json({ succes: true, count: courses.length, courses });
};

/**
 * Registers a new course.
 * @param {res} response object
 * @param {data} course data
 */
export const SdeleteCourse = async (
  res: Response,
  courseId: string,
  next: NextFunction
) => {
  const course = await CourseModel.findByIdAndDelete(courseId);
  if (!course) return next(new ErrorHandler("Course not found", 404));
  await course.deleteOne();
  await redis.del(`course:${courseId}`);
  return res
    .status(201)
    .json({ succes: true, message: "Course deleted successfully" });
};
