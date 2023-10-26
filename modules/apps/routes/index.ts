import appsController from "../controllers";

const { Router } = require("express");

const appsRouter = Router();

appsRouter.route("/register-app").post(appsController.registerApp);

export default appsRouter;
