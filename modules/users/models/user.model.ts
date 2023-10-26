import mongoose, { Document, Schema } from "mongoose";
import { IAuthorization } from "../../apps/models/authorization.model";

interface IUser extends Document {
  username: string;
  email: string;
  phone: string;
  password: string; // Hashed password
  apps: Array<IAuthorization>;
}

const userSchema = new Schema({
  username: { type: String, required: false, unique: true },
  email: { type: String, required: false, unique: true },
  phone: { type: String, required: false, unique: true },
  password: { type: String, required: true },
  apps: [{ type: String, ref: "AppAuthorization" }], // Array of app IDs
});

const User = mongoose.model<IUser>("User", userSchema);

export { IUser, User };
