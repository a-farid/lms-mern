import express, { Express } from "express";
import {
  addQuestion,
  addReplyAnswer,
  addReplyReview,
  addReview,
  deleteCourse,
  getAllCourses,
  getAllCoursesContent,
  getCourseByUser,
  getSingleCourse,
  updateCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated as Auth } from "../middleware/auth";

const courseRouter = express.Router();

courseRouter.post("/create", Auth, authorizeRoles("admin"), uploadCourse);
courseRouter.put("/update/:id", Auth, authorizeRoles("admin"), updateCourse);
courseRouter.get("/preview/one/:id", Auth, getSingleCourse);
courseRouter.get("/content/one/:id", Auth, getCourseByUser);
courseRouter.put("/add-question", Auth, addQuestion);
courseRouter.get("/preview/all", Auth, getAllCourses);
courseRouter.get(
  "/content/all",
  Auth,
  authorizeRoles("admin"),
  getAllCoursesContent
);
courseRouter.put("/add-answer", Auth, addReplyAnswer);
courseRouter.put("/add-review/:id", Auth, addReview);
courseRouter.delete("/:id", Auth, authorizeRoles("admin"), deleteCourse);
courseRouter.put(
  "/review-reply/:id",
  Auth,
  authorizeRoles("admin"),
  addReplyReview
);

export default courseRouter;
