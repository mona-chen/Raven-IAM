interface IAppsController {
  registerApp: (req, res, next) => void;
  deleteApp: (req, res, next) => void;
  getAllApps: (req, res, next) => void;
  activateDeactivateApp: (req, res, next) => void;
  updateApp: (req, res, next) => void;
}
