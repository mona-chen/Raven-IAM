import userController from "../controllers/index";

const { Router } = require("express");

const userRouter = Router();

userRouter.route("/authenticate").post(userController.authenticate);

export default userRouter;
