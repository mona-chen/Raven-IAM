import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import "./services/mongoose";
import initModules from "./modules";
import morgan from "morgan";
dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(morgan("dev"));
app.use(express.json());
app.set("trust proxy", true);

app.get("/health", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// init modules
initModules(app);

app.listen(port, () => {
  console.log(`⚡️[server]: RIAM is running on port ${port}`);
});
