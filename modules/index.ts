import appsModule from "./apps";
import authModule from "./users";

function initModules(app: any) {
  appsModule.init(app);
  authModule.init(app);
}

export default initModules;
