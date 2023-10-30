import { Redis, RedisOptions } from "ioredis";

function redis() {
  const redisOptions: RedisOptions = {
    port: parseInt(process.env.REDIS_PORT ?? "6379"),
  };

  const client = new Redis(redisOptions);

  try {
    client.on("ready", () => {
      console.log("Redis: Connection Established on port " + redisOptions.port);
    });
    // catch errors
    client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  } catch (error) {
    console.log("Redis Error:", error);
  }

  return client;
}

const redisClient = redis();

export default redisClient;
