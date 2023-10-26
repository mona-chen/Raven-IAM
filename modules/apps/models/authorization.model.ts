import mongoose, { Document, Schema } from "mongoose";

interface IAuthorization extends Document {
  appId: string; // Unique identifier for the app
  appSecret: string; // Secret key for app authentication
  userId: string; // Unique identifier for the user-app (e.g., fingerprint)
  loginCredentials: {
    email: string; // Email address for the app
    password: string; // Hashed password for app authentication
  };
}

const authorizationSchema = new Schema({
  appId: { type: String, required: true, unique: true },
  appSecret: { type: String, required: true },
  userId: { type: String, required: true, ref: "User" },
  loginCredentials: {
    email: { type: String, required: false },
    phone: { type: String, required: false },
    username: { type: String, required: false },
    password: { type: String, required: true },
  },
});

const Authorization = mongoose.model<IAuthorization>(
  "Authorization",
  authorizationSchema
);

export { IAuthorization, Authorization };
