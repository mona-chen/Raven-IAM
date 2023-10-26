import { AppCredentials, IUtils } from "../modules/apps/@types/Utils";
import crypto from "crypto";
import { App } from "../modules/apps/models/apps.model";

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
}

// Function to generate a random string of a given length
function generateRandomString(length: number) {
  return crypto.randomBytes(length).toString("hex");
}

export default Utility;
