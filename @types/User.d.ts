interface IUserController {
  authenticate: (req, res, next) => void;
  verifyToken: (req, res, next) => void;
}
