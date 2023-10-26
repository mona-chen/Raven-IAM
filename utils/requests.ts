import Redis from "ioredis";
import { encryptData } from "./encryption";

const isProduction = process.env.NODE_ENV === "production";

function authHeader(req: any) {
  if (req.headers) {
    let auth = req.headers.authorization;

    if (auth === undefined) return "no authorization header parsed";
    else {
      if (auth.includes("Bearer ")) {
        let bearerToken = auth.split("Bearer ")[1];
      } else return "api requires bearer authorization model";
    }
  } else return "authorization header required";
}

async function success(
  res: any,
  message: string,
  data: any = null,
  code: number = 200
) {
  if (isProduction) {
    return res.status(code).send(
      await encryptData({
        status: "success",
        message,
        data,
      })
    );
  } else
    return res.status(code).send({
      status: "success",
      message,
      data,
    });
}

async function fail(
  res: any,
  message: string,
  code: number = 200,
  data: any = null
) {
  if (isProduction) {
    return res.status(code).send(
      await encryptData({
        status: "fail",
        message,
        data,
      })
    );
  } else
    return res.status(code).send({
      status: "fail",
      message,
      data,
    });
}

async function bad(res: any, message: string, code: number = 400) {
  if (isProduction) {
    return res.status(code).send(
      await encryptData({
        status: "fail",
        message,
      })
    );
  } else
    return res.status(code).send({
      status: "fail",
      message,
    });
}

async function notfound(res: any, message: string) {
  if (isProduction) {
    return res.status(404).send(
      await encryptData({
        status: "fail",
        message,
      })
    );
  } else
    return res.status(404).send({
      status: "fail",
      message,
    });
}

async function error(res: any, message: string) {
  if (isProduction) {
    return res.status(500).send(
      await encryptData({
        status: "fail",
        message,
      })
    );
  } else
    return res.status(500).send({
      status: "fail",
      message,
    });
}

function redis() {
  const client = new Redis({
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  });

  try {
    client.on("ready", () => {
      console.log(
        "Redis: Connection Established on port " +
          (process.env.REDIS_PORT || 6379)
      );
    });
    client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  } catch (error) {
    console.log("Redis Error:", error);
  }

  return client;
}

const redisClient = redis();

export { success, fail, bad, notfound, error, authHeader, redisClient };
