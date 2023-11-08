import { NextFunction, Request, Response } from "express";
import { fail, success } from "../../../utils/requests";
import { App } from "../models/apps.model";
import Validator from "../../../utils/validation";
import { isValidObjectId } from "mongoose";

const validator = new Validator();

async function updateApp(req: Request, res: Response, next: NextFunction) {
  if (!req.params) {
    return fail(res, "Invalid request parameters");
  }

  const { app_logo, name, login_endpoint, auth_method, description } = req.body;

  const { app_id } = req.params;

  const updateData: any = {};

  if (app_logo) {
    updateData.logo = req.body.logo;
  }

  if (name) {
    updateData.name = name;
  }

  if (description) {
    updateData.description = description;
  }

  if (login_endpoint) {
    updateData.login_endpoint = login_endpoint;
  }

  if (auth_method) {
    if (auth_method.toLowerCase() !== ("passport" || "proxy")) {
      return fail(res, "Auth method must be eithe proxy or passport");
    }
    updateData.auth_method = auth_method;
  }
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
    else {
      const update = await App.updateOne({ _id: app_id }, updateData);

      if (update) {
        return success(res, "App info updated successfully", update);
      } else {
        return fail(res, "Update failed", update);
      }
    }
  } catch (error: any) {
    console.error("[app-activation]: App Update Error", error.message);
    return fail(res, "App Update Error", 400, error.message);
  }
}

export default updateApp;
