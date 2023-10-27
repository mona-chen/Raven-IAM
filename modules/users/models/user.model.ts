import mongoose, { Document, Schema } from "mongoose";
import { IAuthorization } from "../../apps/models/authorization.model";

interface IUser extends Document {
  username?: string; // Make fields optional
  email?: string;
  phone?: string;
  password: string; // Hashed password
  apps: Array<IAuthorization>;
}

const userSchema = new Schema({
  username: { type: String, required: false, unique: true, sparse: true }, // Add "sparse" option
  email: { type: String, required: false, unique: true, sparse: true },
  phone: { type: String, required: false, unique: true, sparse: true },
  password: { type: String, required: true },
  apps: [{ type: String, ref: "AppAuthorization" }], // Array of app IDs
});

const User = mongoose.model<IUser>("User", userSchema);

export { IUser, User };
