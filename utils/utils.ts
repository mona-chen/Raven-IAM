import { AppCredentials, IUtils } from "../@types/Utils";
import crypto from "crypto";
import { App } from "../modules/apps/models/apps.model";
import { encryptData } from "./encryption";

class Utility {
  generateAppCredentials =
    async function generateAppCredentials(): Promise<AppCredentials> {
      const appId = generateRandomString(8); // Adjust the length as needed
      const appSecret = generateRandomString(32); // Adjust the length as needed

      return { appId, appSecret };
    };

  checkNameExists = async (name: string) => {
    const exists = await App.exists({ name: name });

    if (!exists) {
      return false;
    } else {
      return true;
    }
  };

  createToken = async (data: { email: string; apps: string }) => {
    let expiresIn = "2h";

    const token = await encryptData(data);

    const expirationTimestamp = Date.now() + 2 * 60 * 60 * 1000;

    // Store the token and expiration timestamp in the user's session or account information
    return { token, expiresIn, expirationTimestamp };
  };
}

// Function to generate a random string of a given length
function generateRandomString(length: number) {
  return crypto.randomBytes(length).toString("hex");
}

export default Utility;
