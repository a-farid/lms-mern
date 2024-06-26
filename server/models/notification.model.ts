import mongoose, { Document, Schema, Model } from "mongoose";

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);

export default NotificationModel;
