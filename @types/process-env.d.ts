declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      PORT: string;
      DATABASE_URL: string;
      MONGODB_URI: string;
      TOKEN_EXP_PERIOD: string;
      TOKEN_EXP_UNIT: "seconds" | "hours" | "days";
      // add more environment variables and their types here
    }
  }
}
