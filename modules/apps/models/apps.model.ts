import mongoose, { Document, Schema } from "mongoose";

interface IApp extends Document {
  name: string;
  description: string;
  appId: string;
  appSecret: string;
  login_endpoint: string;
  // Add more fields as needed, e.g., app description, allowed redirect URIs, etc.
}

const appSchema = new Schema(
  {
    name: { type: String, required: true },
    appId: { type: String, required: true },
    appSecret: { type: String, required: true },
    description: { type: String },
    login_endpoint: { type: String, required: false },
    encrypted: { type: String, required: false },
  },
  { timestamps: true }
);

const App = mongoose.model<IApp>("App", appSchema);

export { IApp, App };
