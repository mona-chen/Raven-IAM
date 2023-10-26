import mongoose, { Document, Schema } from "mongoose";

interface IUserSession extends Document {
  userId: string; // Reference to the User model
  appId: string; // Reference to the AppAuthorization model
  token: string;
  // You can add more fields such as expiration time.
}

const userSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  appId: {
    type: Schema.Types.ObjectId,
    ref: "AppAuthorization",
    required: true,
  },
  token: { type: String, required: true },
  // Add more fields as needed
});

const UserSession = mongoose.model<IUserSession>(
  "UserSession",
  userSessionSchema
);

export { IUserSession, UserSession };
