import { Router } from "express";
import { getCurrentUserController, updateUserNameController, updateUserPasswordController } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get("/current", getCurrentUserController);
userRoutes.patch("/name", updateUserNameController);
userRoutes.patch("/password", updateUserPasswordController);

export default userRoutes;