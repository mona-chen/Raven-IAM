import appsRouter from "./routes";

const appsModule = {
  init: (app: any) => {
    app.use("/admin", appsRouter);
    console.log("[module]: apps module loaded");
  },
};

export default appsModule;
