import mongoose, { Document, Schema, Model } from "mongoose";

interface IFaq extends Document {
  question: string;
  answer: string;
}
interface ICategory extends Document {
  name: string;
}
interface BannerImage {
  public_id: string;
  url: string;
}

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String },
    answer: { type: String },
  },
  { timestamps: true }
);
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String },
  },
  { timestamps: true }
);

export interface ILayout extends Document {
  type: string;
  faqs: IFaq[];
  categories: ICategory[];
  banner: {
    image: BannerImage;
    title: string;
    subTitle: string;
  };
}

const LayoutSchema = new Schema<ILayout>(
  {
    type: { type: String },
    faqs: [faqSchema],
    categories: [categorySchema],
    banner: {
      image: {
        public_id: { type: String },
        url: { type: String },
      },
      title: { type: String },
      subTitle: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const LayoutModel: Model<ILayout> = mongoose.model("Layout", LayoutSchema);

export default LayoutModel;
