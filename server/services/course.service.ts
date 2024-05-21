import { Response } from "express";
import CourseModel, { ICourse } from "../models/course.model";

/**
 * Registers a new course.
 * @param {res} response object
 * @param {data} course data
 */
export const createCourse = async (data: ICourse, res: Response) => {
  const course = await CourseModel.create(data);
  return res.status(201).json({ succes: true, course });
};
