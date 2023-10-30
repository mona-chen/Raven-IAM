import { AppCredentials, IUtils } from "../@types/Utils";
import crypto from "crypto";
import { App } from "../modules/apps/models/apps.model";
import { encryptData } from "./encryption";
import jwt, {
  JsonWebTokenError,
  TokenExpiredError,
  VerifyErrors,
} from "jsonwebtoken";
import redisClient from "../drivers/redis";
import { IAuthorization } from "../modules/apps/models/authorization.model";

const redis = redisClient;
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

  createToken = async (data: {
    email: string;
    apps: IAuthorization[];
    expiry: number; // Expiry in seconds
  }) => {
    const expiresIn = data.expiry || 7200; // Default to 2 hours (2 * 60 * 60 seconds)

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is not defined");
    }

    const token = jwt.sign(
      { email: data.email, apps: data.apps },
      process.env.JWT_SECRET,
      {
        expiresIn,
      }
    );

    return { token, expiresIn };
  };

  verifyToken(token: string): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT secret is not defined");
      }
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err: JsonWebTokenError | TokenExpiredError | null, decoded: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        }
      );
    });
  }

  convertToExpiryTime(value: number, unit: "seconds" | "hours" | "days") {
    let seconds = 0;

    switch (unit) {
      case "seconds":
        seconds = value;
        break;
      case "hours":
        seconds = value * 3600; // 1 hour = 3600 seconds
        break;
      case "days":
        seconds = value * 86400; // 1 day = 86400 seconds
        break;
      default:
        throw new Error("Invalid time unit");
    }

    const timestamp = Math.floor(Date.now() / 1000) + seconds;

    return {
      jwt: seconds, // Time usable for JWT in seconds
      redis: seconds, // Time usable for Redis in seconds
      timestamp, // Expiration timestamp for external use
    };
  }

  /**
   * Scans and deletes Redis keys matching a specified pattern in batches.
   *
   * @param {Object} options - Options for the Redis scan and delete operation.
   * @param {number} options.count - The number of keys to process in each batch.
   * @param {string} options.pattern - The pattern to match against Redis keys.
   * @author Emmanuel Ezeani
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  redisScanDelete({ count = 50, pattern = "*:user" }) {
    return new Promise((resolve, reject) => {
      var stream = redis.scanStream({ match: pattern, count: count });
      var pipeline = redis.pipeline();
      var localKeys = [];

      stream.on("data", function (resultKeys) {
        for (var i = 0; i < resultKeys.length; i++) {
          localKeys.push(resultKeys[i]);
          pipeline.del(resultKeys[i]);
        }
        if (localKeys.length > count) {
          pipeline.exec(() => {
            localKeys = [];
            pipeline = redis.pipeline();
          });
        }
      });

      stream.on("end", function () {
        pipeline.exec(() => {
          resolve(true); // Resolve the Promise when the operation is complete
        });
      });

      stream.on("error", function (err) {
        reject(err); // Reject the Promise in case of an error
      });
    });
  }
}

// Function to generate a random string of a given length
function generateRandomString(length: number) {
  return crypto.randomBytes(length).toString("hex");
}

export default Utility;
