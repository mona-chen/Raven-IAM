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

      console.log("existing user", existingUser);
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
          const access_token = await Utils.createToken({
            email: existingUser.email as string,
            apps: JSON.stringify(existingUser.apps),
          });

          return success(res, "Login successful", {
            ...access_token,
            authenticating_app: authApp.name,
          });
        }

        if (authMethod === "proxy") {
          //retrieve the login details for the app
          const loginCreds = Authorization.findOne({
            userId: existingUser._id,
          });

          if (typeof loginCreds === "object") {
            // try authenticating to requested app using stored credentials
            // if it succeeds return login token
            // if it fails, try authenticating to the requested app using the request creds
            // if it succeeds, update the user and profiled app with new login credentials
            // return the login token to user
          }
        }
      } else {
        return fail(res, "Authentication failed");
      }

      //try logging in the user to the requested app
    } else {
      const encryptedPassword = await bcrypt.hash(password, 10);

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

      return res.json(user);
    }
  } catch (error: any) {
    if (error.isValidationError) {
      // This error is from the validator
      console.error("[app-register]: Validation Error", error.message);
      return fail(res, "Validation Error", 400, error.message);
    } else {
      // Handle other errors
      console.error("[app-register]: App Register Error", error.message);
      return fail(res, "App Register Error", 400, error.message);
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

export { authenticate, getUserById, updateUser };
