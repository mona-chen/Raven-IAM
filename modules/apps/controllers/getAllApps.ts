import { NextFunction, Request, Response } from "express";
import { fail, success } from "../../../utils/requests";
import { App } from "../models/apps.model";
import Validator from "../../../utils/validation";
import { isValidObjectId } from "mongoose";

const validator = new Validator();

async function getAllApps(req: Request, res: Response, next: NextFunction) {
  try {
    const allApps = await App.find({});

    if (typeof allApps === "object") {
      if (allApps.length === 0) {
        return success(res, "No apps found", allApps);
      } else return success(res, "All apps returned successfully", allApps);
    } else {
      return fail(res, "Failed to fetch all apps");
    }
  } catch (error: any) {
    console.error(
      "[app-activation]: App Activation/Deactivation Error",
      error.message
    );
    return fail(res, "App Activation/Deactivation Error", 400, error.message);
  }
}

export default getAllApps;
