import express, { Express } from "express";
import {
  addQuestion,
  addReplyAnswer,
  addReplyReview,
  addReview,
  deleteCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  updateCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated as Auth } from "../middleware/auth";

const courseRouter = express.Router();

courseRouter.post("/create", Auth, authorizeRoles("admin"), uploadCourse);
courseRouter.put("/update/:id", Auth, authorizeRoles("admin"), updateCourse);
courseRouter.get("/one/:id", Auth, getSingleCourse);
courseRouter.get("/content/:id", Auth, getCourseByUser);
courseRouter.get("/all", Auth, getAllCourses);
courseRouter.put("/add-question", Auth, addQuestion);
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
