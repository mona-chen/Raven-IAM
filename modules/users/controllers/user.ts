import { Request, Response, NextFunction } from "express";
import { IUser, User } from "../models/user.model";
import { App } from "../../apps/models/apps.model";
import { fail, success } from "../../../utils/requests";
import {
  Authorization,
  IAuthorization,
} from "../../apps/models/authorization.model";
import bcrypt from "bcrypt";
import Utility from "../../../utils/utils";
import Validator from "../../../utils/validation";
import { decryptData, encryptData } from "../../../utils/encryption";
import redisClient from "../../../drivers/redis";

const Utils = new Utility();
const validator = new Validator();
interface UserT {
  username?: string;
  email: string;
  phone?: string;
  password: string; // Hashed password
  apps: Array<string>;
}
// Controller to create a new user and associate apps
async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const { password, email, phone, username, appId } = req.body;
    const multiLogin = process.env.MULTI_LOGIN
      ? process.env.MULTI_LOGIN === "true"
      : true;

    const mergeAuth = process.env.MERGE_AUTH
      ? process.env.MERGE_AUTH === "true"
      : true;

    validator
      .validate(req.body)
      .require("password", "Password must be provided")
      .require("appId", "App ID must be provided")
      .require("appSecret", "App secret must be provided")
      .custom(() => {
        return password || email || phone;
      }, "Email, phone, or username must be provided")
      .end(validator);

    //check if appId exists
    const authApp = await App.findOne({ appId: appId });

    if (!authApp) {
      return fail(res, `App with id ${appId} does not exist on R-IAM`);
    }

    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const fingerprint = Date.now() + "-" + appId + "-" + email + "-" + ip;

    const expiry = Utils.convertToExpiryTime(
      Number(process.env.TOKEN_EXP_PERIOD) ?? 1,
      (process.env.TOKEN_EXP_UNIT as "seconds") ?? "days"
    );

    // Check if the user already exists by email, phone, or username
    const existingUser = await User.findOne({
      $or: [
        { email },
        { $and: [{ phone: { $ne: null } }, { phone }] }, // Match non-null phone
        { $and: [{ username: { $ne: null } }, { username }] }, // Match non-null username
        {
          apps: {
            $elemMatch: {
              "loginCredentials.email": email,
              "loginCredentials.phone": { $ne: null }, // Match non-null phone
              "loginCredentials.username": { $ne: null }, // Match non-null username
            },
          },
        },
      ],
    });

    if (existingUser) {
      // Check and update associated apps with the appId
      if (!existingUser.apps.includes(appId)) {
        existingUser.apps.push(appId);
        await existingUser.save();
      }

      //try login in the user to the R-IAM service
      const canAuthenticate = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (canAuthenticate) {
        //retrieve apps and auth method
        const authMethod = authApp.auth_method;

        // handle authorization for passport authentication
        if (authMethod === "passport") {
          const jwt_token = await Utils.createToken({
            email: existingUser.email as string,
            apps: existingUser.apps,
            expiry: expiry.jwt,
          });

          const session_key = `${fingerprint.split("-")[0]}:${
            existingUser.email
          }:session`;

          const access_token = await encryptData(fingerprint);

          if (!multiLogin) {
            await Utils.redisScanDelete({
              count: 50,
              pattern: `*:${existingUser.email}:session`,
            });
          }

          if (access_token) {
            await redisClient.set(
              session_key,
              JSON.stringify({
                access_token: access_token,
                jwt_token: jwt_token.token,
              }),
              "EX",
              expiry.redis
            );
          }

          return success(res, "Login successful", {
            token: access_token,
            authenticating_app: authApp.name,
            expiresIn:
              process.env.TOKEN_EXP_PERIOD + " " + process.env.TOKEN_EXP_UNIT ??
              "30days",
            expiryTimestamp: expiry.timestamp,
          });
        }

        if (authMethod === "proxy") {
          //retrieve the login details for the app
          const loginCreds = Authorization.findOne({
            userId: existingUser._id,
          });

          //TODO:implement passport authentication

          if (typeof loginCreds === "object") {
            // try authenticating to requested app using stored credentials
            // if it succeeds return login token
            // if it fails, try authenticating to the requested app using the request creds
            // if it succeeds, update the user and profiled app with new login credentials
            // return the login token to user
          }

          return fail(
            res,
            "Authentication method not supported yet, please revert to passport"
          );
        }
      } else {
        return fail(res, "Authentication failed");
      }

      //try logging in the user to the requested app
    } else {
      if (!mergeAuth) {
        return fail(res, "User does not exist");
      }

      const encryptedPassword = await bcrypt.hash(password, 10);

      //check if appId exists
      const authApp = await App.findOne({ appId: appId });

      if (!authApp) {
        return fail(res, `App with id ${appId} does not exist on R-IAM`);
      }

      const newUserObj: UserT = {
        email: email,
        password: encryptedPassword,
        apps: [`${appId}`],
      };

      if (username) {
        newUserObj.username = username;
      }

      if (phone) {
        newUserObj.phone = phone;
      }

      // Create a new user
      const user = await User.create(newUserObj);

      //login the user

      if (user) {
        const access_token = await Utils.createToken({
          email: user.email as string,
          apps: user.apps,
          expiry: expiry.jwt,
        });
        //retrieve apps and auth method
        const authMethod = authApp.auth_method;

        // handle authorization for passport authentication
        if (authMethod === "passport") {
          const jwt_token = await Utils.createToken({
            email: user.email as string,
            apps: user.apps,
            expiry: expiry.jwt,
          });

          const session_key = `${fingerprint.split("-")[0]}:${
            user.email
          }:session`;

          const access_token = await encryptData(fingerprint);

          if (access_token) {
            await redisClient.set(
              session_key,
              JSON.stringify({
                access_token: access_token,
                jwt_token: jwt_token.token,
              }),
              "EX",
              expiry.redis
            );
          }

          return success(
            res,
            "User registered and authenticated successfully",
            {
              token: access_token,
              authenticating_app: authApp.name,
              apps: user.apps,
              expiresIn:
                process.env.TOKEN_EXP_PERIOD +
                  " " +
                  process.env.TOKEN_EXP_UNIT ?? "30days",
              expiryTimestamp: expiry.timestamp,
            }
          );
        }
        if (authMethod === "proxy") {
          //retrieve the login details for the app
          const loginCreds = Authorization.findOne({
            userId: user._id,
          });

          //TODO:implement passport authentication

          if (typeof loginCreds === "object") {
            // try authenticating to requested app using stored credentials
            // if it succeeds return login token
            // if it fails, try authenticating to the requested app using the request creds
            // if it succeeds, update the user and profiled app with new login credentials
            // return the login token to user
          }

          return fail(
            res,
            "Authentication method not supported yet, please revert to passport"
          );
        }
      } else {
        return fail(res, "Failed to create user");
      }
    }
  } catch (error: any) {
    if (error.isValidationError) {
      // This error is from the validator
      console.error("[user-auth]: User Validation Error", error.message);
      return fail(res, "Validation Error", 400, error.message);
    } else {
      // Handle other errors
      console.error("[user-auth]: User Authorization Error", error);
      return fail(res, "Authorization Error", 400, error.message);
    }
  }
}

// controller to verify token should be used as a middleware
async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization;
  const token = bearer?.split(" ")[1];
  if (!token) {
    return fail(res, "Bearer token is required");
  } else {
    const fingerprint = await decryptData(token);

    const splitToken = fingerprint.split("-");

    console.log(splitToken);

    const timestamp = splitToken[0];
    const appId = splitToken[1];
    const userEmail = splitToken[2];
    const userIp = splitToken[3];

    //retrieve jwt session
    const session_key = `${timestamp}:${userEmail}:session`;

    const session = await redisClient.get(session_key);

    if (!session) {
      return fail(res, "Token expired or invalid", 401);
    }

    const parsedSession = JSON.parse(String(session));

    try {
      //verify token
      const verifyToken = await Utils.verifyToken(parsedSession.jwt_token);

      // check if user has access to requested application
      const hasAccess = verifyToken.apps.includes(appId);

      if (!hasAccess) {
        return fail(res, "Sorry you dont have access to this application", 402);
      }

      return success(res, "Token successfully verified", {
        email: verifyToken.email,
        user_ip: userIp,
        appId: appId,
        exp: verifyToken.exp,
        iat: verifyToken.iat,
        timestamp: Number(timestamp),
      });
    } catch (error: any) {
      return fail(res, "Token verification failed", 401, error.message);
    }
  }
}

// Controller to get a user by ID
async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId).populate("apps"); // Populate the 'apps' field

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching user" });
  }
}

// Controller to update a user
async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id;
    const { username, password, apps } = req.body; // You should validate and sanitize user input here

    // Find the user by ID and update the fields
    const user = await User.findByIdAndUpdate(
      userId,
      {
        username,
        password, // You should hash the new password before updating
        apps, // Array of AppAuthorization references
      },
      { new: true } // Return the updated user
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Error updating user" });
  }
}

// You can add more controller functions as needed

export { authenticate, getUserById, updateUser, verifyToken };
