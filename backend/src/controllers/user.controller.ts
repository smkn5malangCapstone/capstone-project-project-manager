import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService, updateUserNameService, updateUserPasswordService } from "../services/user.service";


export const getCurrentUserController = asyncHandler(async(req: Request, res: Response) => {
  const userId = req.user?._id;

  const { user } = await getCurrentUserService(userId);

  return res.status(HTTPSTATUS.OK).json({
    message: "User fetch successfuly",
    user,
  })
});

export const updateUserNameController = asyncHandler(async(req: Request, res: Response) => {
  const userId = req.user?._id;
  const { name } = req.body;

  const { user } = await updateUserNameService(userId, name);

  return res.status(HTTPSTATUS.OK).json({
    message: "Name updated successfully",
    user,
  });
});

export const updateUserPasswordController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { currentPassword, newPassword } = req.body;

  const { user } = await updateUserPasswordService(userId, currentPassword, newPassword);

  return res.status(HTTPSTATUS.OK).json({
    message: "Password updated successfully",
    user,
  });
});