import { NextFunction, Request, Response } from "express";
import { fail, success } from "../../../utils/requests";
import { App } from "../models/apps.model";
import Validator from "../../../utils/validation";
import { isValidObjectId } from "mongoose";

const validator = new Validator();

async function deleteApp(req: Request, res: Response, next: NextFunction) {
  if (!req.params) {
    return fail(res, "Invalid request parameters");
  }

  validator
    .validate(req.params)
    .require("app_id", "App ID is required")
    .custom(() => {
      return isValidObjectId(req.params.app_id); // TODO: Add support for pgsl id type here
    }, "App ID must be a valid object id");

  // return error message
  if (!validator.isValid()) {
    const errorMessage = validator.getErrors().join(", ");
    return fail(res, errorMessage);
  }

  const { app_id } = req.params;
  try {
    // Check if app with name exists
    const appExists = await App.exists({ _id: app_id });

    if (!appExists) return fail(res, "App with provided ID does not exist");

    // delete app

    const delApp = await App.findByIdAndRemove({ _id: app_id });

    if (delApp) {
      return success(res, "App deleted Successfully", delApp);
    } else {
      return fail(res, "Sorry app deletion failed, please try again later");
    }
  } catch (error: any) {
    console.error("[app-deletion]: App Deletion Error", error.message);
    return fail(res, "App Deletion Error", 400, error.message);
  }
}

export default deleteApp;
