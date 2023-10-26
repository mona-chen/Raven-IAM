import mongoose, { Document, Schema } from "mongoose";

interface IEncryption extends Document {
  name: string;
  encrypt_code: string;
  decrypt_code: string;
  key: string;
  // Add more fields as needed, e.g., app description, allowed redirect URIs, etc.
}

const encryptionSchema = new Schema({
  encrypt_code: { type: Text, required: true },
  decrypt_code: { type: Text, required: true },
  key: { type: String, required: true },
  // Add more fields as needed
});

const AppRegistration = mongoose.model<IEncryption>(
  "Encryption",
  encryptionSchema
);

export { IEncryption, AppRegistration };
