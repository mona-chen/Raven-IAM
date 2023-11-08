import { NextFunction, Request, Response } from "express";
import { fail, success } from "../../../utils/requests";
import { App } from "../models/apps.model";
import Validator from "../../../utils/validation";
import { isValidObjectId } from "mongoose";

const validator = new Validator();

async function activateDeactivateApp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.params) {
    return fail(res, "Invalid request parameters");
  }

  const { app_id } = req.params;
  try {
    validator
      .validate(req.params)
      .require("app_id", "App ID is required")
      .custom(() => {
        return isValidObjectId(req.params.app_id); // TODO: Add support for pgsl id type here
      }, "App ID must be a valid object id")
      .end(validator);
    // Check if app with name exists
    const appExists = await App.exists({ _id: app_id });

    if (!appExists) return fail(res, "App with provided ID does not exist");

    // check if app is active then deactivate it

    const isActive = await App.findById({ _id: app_id });

    if (isActive?.active === true) {
      // try deactivating

      const update = await App.findOneAndUpdate(
        { _id: app_id },
        { active: false }
      );

      if (update) {
        return success(res, "App successfully deactivated", update);
      } else {
        return fail(res, "Unable to deactivate App, please try again later");
      }
    } else {
      const update = await App.findOneAndUpdate(
        { _id: app_id },
        { active: true }
      );

      if (update) {
        return success(res, "App successfully activated", update);
      } else {
        return fail(res, "Unable to activate App, please try again later");
      }
    }
  } catch (error: any) {
    console.error(
      "[app-activation]: App Activation / Deactivation Error",
      error.message
    );
    return fail(res, "App Activation / Deactivation Error", 400, error.message);
  }
}

export default activateDeactivateApp;
