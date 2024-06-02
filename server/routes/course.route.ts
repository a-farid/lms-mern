import express, { Express } from "express";
import {
  addQuestion,
  addReplyAnswer,
  addReview,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  updateCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const courseRouter = express.Router();

courseRouter.post(
  "/create",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);
courseRouter.put(
  "/update/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateCourse
);

courseRouter.get("/one/:id", isAuthenticated, getSingleCourse);
courseRouter.get("/content/:id", isAuthenticated, getCourseByUser);
courseRouter.get("/all", isAuthenticated, getAllCourses);
courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addReplyAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);

export default courseRouter;
