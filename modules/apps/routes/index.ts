import appsController from "../controllers";

const { Router } = require("express");

const appsRouter = Router();

appsRouter.route("/register-app").post(appsController.registerApp);
appsRouter.route("/all-apps").get(appsController.getAllApps);
appsRouter.route("/all-apps").get(appsController.getAllApps);
appsRouter.route("/update-app/:app_id").patch(appsController.updateApp);
appsRouter
  .route("/activate-app/:app_id")
  .post(appsController.activateDeactivateApp);

export default appsRouter;
