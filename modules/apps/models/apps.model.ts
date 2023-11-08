import mongoose, { Document, Schema } from "mongoose";

interface IApp extends Document {
  name: string;
  description: string;
  appId: string;
  appSecret: string;
  active: boolean;
  login_endpoint: string;
  logo: string;
  auth_method: string;
}

const appSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    appId: { type: String, required: true },
    auth_method: { type: String, required: true, enum: ["passport", "proxy"] },
    appSecret: { type: String, required: true },
    login_endpoint: { type: String, required: false },
    active: { type: Boolean, default: true },
    logo: { type: String, required: false },
    encrypted: { type: String, required: false },
  },
  { timestamps: true }
);

const App = mongoose.model<IApp>("App", appSchema);

export { IApp, App };
