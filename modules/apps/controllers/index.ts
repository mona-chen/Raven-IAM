import registerApp from "./registerApp";
import deleteApp from "./deleteApp";
import activateDeactivateApp from "./activateDeactivateApp";
import getAllApps from "./getAllApps";
import updateApp from './updateApp';

const appsController: IAppsController = {
  registerApp,
  activateDeactivateApp,
  deleteApp,
  getAllApps,
  updateApp
};

export default appsController;
