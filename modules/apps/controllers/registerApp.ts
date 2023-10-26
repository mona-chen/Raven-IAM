import { NextFunction, Request, Response } from "express";
import { fail, success } from "../../../utils/requests";

import Utility from "../../../utils/utils";
import { App } from "../models/apps.model";
import { Authorization } from "../models/authorization.model";

const Utils = new Utility();

async function registerApp(req: Request, res: Response, next: NextFunction) {
  console.log(req.body);
  if (!req.body) {
    return fail(res, "Invalid request body");
  }

  const { name } = req.body;

  try {
    if (!name) {
      return fail(res, "Name is required");
    } else {
      // Check if app with name exists

      const nameExists = await Utils.checkNameExists(name);

      if (nameExists) return fail(res, "App with name already exists");

      const appCred = await Utils.generateAppCredentials();

      const newApp = await App.create({
        name,
        appId: appCred.appId,
        appSecret: appCred.appSecret,
      });

      return success(res, "App Register Successfully", {
        ...newApp.toObject(),
      });
    }
  } catch (error: any) {
    console.error("[app-register]: App Register Error", error.message);
    return fail(res, "App Register Error", error.message);
  }
}

export default registerApp;
