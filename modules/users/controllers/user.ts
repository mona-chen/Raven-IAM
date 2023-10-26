import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { App } from "../../apps/models/apps.model";
import { fail } from "../../../utils/requests";
import { Authorization } from "../../apps/models/authorization.model";
import bcrypt from "bcrypt";

// Controller to create a new user and associate apps
async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const { password, email, phone, username, appId } = req.body;

    //check if appId exists
    const authApp = await App.findOne({ appId: appId });

    if (!authApp) {
      return fail(res, `App with id ${appId} does not exist on R-IAM`);
    }

    // Check if the user already exists by email, phone, or username
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phone },
        { username },
        { apps: { $elemMatch: { "loginCredentials.email": email } } },
        { apps: { $elemMatch: { "loginCredentials.phone": phone } } },
        { apps: { $elemMatch: { "loginCredentials.username": username } } },
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
        existingUser.password,
        password
      );

      if (canAuthenticate) {
        //retrieve the login details for the app
        const loginCreds = Authorization.findOne({ userId: existingUser._id });

        if (typeof loginCreds === "object") {
          // try authenticating to requested app using stored credentials
        }

        // if it succeeds return login token

        // if it fails, try authenticating to the requested app using the request creds

        // if it succeeds, update the user and profiled app with new login credentials

        // return the login token to user
      }

      //try logging in the user to the requested app
    } else {
      // Create a new user
      const user = await User.create({
        email,
        phone,
        username,
        password, // You should hash the password before saving
      });

      // Check and update associated apps with the appId

      if (!user.apps.includes(appId)) {
        user.apps.push(appId);

        // Save the user to the database
        const savedUser = await user.save();
      }

      return res.json(user);
    }
  } catch (error) {
    return res.status(500).json({ error: "Error creating user" });
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
