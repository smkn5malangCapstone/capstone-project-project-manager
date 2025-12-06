import UserModel from "../models/user.model"
import { BadRequestException } from "../utils/appError";

export const getCurrentUserService = async(userId: string) =>{
  const user = await UserModel.findById(userId).populate("currentWorkspace").select("-password");

  if (!user) {
    throw new BadRequestException("User Not Found");
  }

  return {
    user
  }
}

export const updateUserNameService = async (userId: string, name: string) => {
  if (!name || name.trim().length === 0) {
    throw new BadRequestException("Name is required");
  }

  if (name.trim().length < 2) {
    throw new BadRequestException("Name must be at least 2 characters long");
  }

  const existingUser = await UserModel.findOne({ 
    name: name.trim(), 
    _id: { $ne: userId } 
  });
  
  if (existingUser) {
    throw new BadRequestException("User with this name already exists");
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { name: name.trim() },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new BadRequestException("User Not Found");
  }

  return { user };
};

export const updateUserPasswordService = async (
  userId: string, 
  currentPassword: string, 
  newPassword: string
) => {
  if (!currentPassword || !newPassword) {
    throw new BadRequestException("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new BadRequestException("New password must be at least 6 characters long");
  }

  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new BadRequestException("User Not Found");
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new BadRequestException("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  const userWithoutPassword = await UserModel.findById(userId).select("-password");
  
  return { user: userWithoutPassword };
};