export interface IUtils {
  generateAppCredentials?: () => {};
}

export interface AppCredentials {
  appId: string;
  appSecret: string;
}
