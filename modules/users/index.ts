import userRouter from "./routes/index";

const authModule = {
  init: (app: any) => {
    app.use("/sso", userRouter);
    console.log("[module]: auth module loaded");
  },
};

export default authModule;
