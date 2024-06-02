import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { IUser } from "../models/user.model";

export interface IComment {
  user: IUser;
  question: string;
  questionReplies: IComment[];
}

export interface IReview {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies?: IComment[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

export interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: {
    public_id: string;
    url: string;
  };
  videoSection: string;
  videoDuration: string;
  videoPlayer: string;
  suggestions: string;
  links: ILink[];
  questions: IComment[];
}

export interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimated?: number;
  thumbnail?:
    | {
        public_id: string;
        url: string;
      }
    | string;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequistes: { title: string }[];
  courseData?: ICourseData[];
  reviews?: IReview[];
  ratings: number;
  perchased: number;
}

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  questionReplies: [this],
});

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  commentReplies: [commentSchema], // nested comments
});

const linkSchema = new Schema<ILink>({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const courseDataSchema = new Schema<ICourseData>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  videoThumbnail: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  videoSection: { type: String, required: true },
  videoDuration: { type: String, required: true },
  videoPlayer: { type: String, required: true },
  suggestions: { type: String, required: true },
  links: [linkSchema],
  questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>({
  name: { type: String, required: true }, // Fix field definition
  description: { type: String, required: true },
  price: { type: Number, required: true },
  estimated: { type: Number },
  thumbnail: {
    public_id: String,
    url: String,
  },
  tags: { type: String, required: true },
  level: { type: String, required: true },
  demoUrl: { type: String, required: true },
  benefits: [{ title: String }],
  prerequistes: [{ title: String }],
  courseData: [courseDataSchema],
  reviews: [reviewSchema],
  ratings: { type: Number, default: 0 },
  perchased: { type: Number, default: 0 },
});

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);
export default CourseModel;
