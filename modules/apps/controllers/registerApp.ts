import { NextFunction, Request, Response } from "express";
import { fail, success } from "../../../utils/requests";

import Utility from "../../../utils/utils";
import { App } from "../models/apps.model";
import Validator from "../../../utils/validation";

const Utils = new Utility();
const validator = new Validator();

async function registerApp(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return fail(res, "Invalid request body");
  }

  const { name, auth_method } = req.body;

  validator
    .validate(req.body)
    .require("name", "Name is required")
    .require("auth_method", "Auth method is required")
    .minLength("name", 2, "Name must be at least 2 characters")
    .custom(() => {
      return auth_method === "proxy" || auth_method === "passport";
    }, "Auth method must be 'proxy' or 'passport");

  // return error message
  if (!validator.isValid()) {
    const errorMessage = validator.getErrors().join(", ");
    return fail(res, errorMessage);
  }

  try {
    // Check if app with name exists
    const nameExists = await Utils.checkNameExists(name);

    if (nameExists) return fail(res, "App with name already exists");

    const appCred = await Utils.generateAppCredentials();

    const newApp = await App.create({
      name,
      appId: appCred.appId,
      auth_method: auth_method,
      appSecret: appCred.appSecret,
    });

    return success(res, "App Register Successfully", {
      ...newApp.toObject(),
    });
  } catch (error: any) {
    console.error("[app-register]: App Registration Error", error.message);
    return fail(res, "App Register Error", 400, error.message);
  }
}

export default registerApp;
