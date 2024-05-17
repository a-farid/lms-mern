import mongoose, { Document, Schema, Model } from "mongoose";

interface IComment extends Document {
  user: object;
  comment: string;
}
interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReplies?: IComment;
}
interface ILink extends Document {
  title: string;
  url: string;
}
interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoDuration: string;
  videoPlayer: string;
  suggestions: string;
  links: ILink[];
  questions: IComment[];
}
interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimated?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequistes: { title: string }[];
  courseData: ICourseData[];
  reviews: IReview[];
  ratings?: number;
  perchased?: number;
}

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
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
