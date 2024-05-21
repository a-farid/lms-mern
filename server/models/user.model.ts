import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const regExpEmail: RegExp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    url: string;
    public_id: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      set: (v: string) => v.toLowerCase(),
      maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      set: (v: string) => v.toLowerCase(),
      validate: {
        validator: function (v: string) {
          return regExpEmail.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    password: {
      type: String,
      minlength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [{ courseId: String }],
  },
  { timestamps: true }
);

// hashing the password before saving the user
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Comparing the password
userSchema.methods.comparePassword = async function (pwd: string) {
  return await bcrypt.compare(pwd, this.password);
};

// Generating JWT token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN!);
};

userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN!);
};

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default UserModel;
