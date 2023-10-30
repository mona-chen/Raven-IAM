import { authenticate, verifyToken } from "./user";
const userController: IUserController = {
  authenticate,
  verifyToken,
};

export default userController;
