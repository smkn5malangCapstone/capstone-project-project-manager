import mongoose from "mongoose";
import { TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createProjectByWorkspaceIdService = async (
  userId: string,
  workspaceId: string,
  body: {
      emoji?: string,
      name: string,
      description?: string,
  }
) => {
  const { emoji, name, description } = body;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found")
  }

  const isAlreadyMember = await MemberModel.findOne({
    userId: user._id,
    workspaceId: workspace._id
  }).exec();

  if (!isAlreadyMember) {
    throw new BadRequestException("You are not member of this workspace")
  }

  const project = new ProjectModel({
    ...(emoji && {emoji: emoji}),
    name: name,
    description: description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();
  
  return { 
    project
  }
}

export const getAllProjectInWorkspaceService = async(
  userId: string,
  workspaceId: string,
  pageNumber: number,
  pageSize: number,
) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found")
  }

  const isAlreadyMember = await MemberModel.findOne({
    userId: user._id,
    workspaceId: workspace._id
  }).exec();

  if (!isAlreadyMember) {
    throw new BadRequestException("You are not member of this workspace")
  } 

  // Find all project dengan pagination
  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId
  });

  const skip = (pageNumber - 1) * pageSize;

  const Projects = await ProjectModel.find({ workspace: workspaceId })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1}).exec();

  const totalPage = Math.ceil(totalCount / pageSize);

  return {
    Projects,
    totalCount,
    totalPage,
    skip,
  };
}

export const updateProjectByIdService = async (
    projectId: string,
    workspaceId: string,
    body: {
      emoji?: string,
      name: string,
      description?: string,
    }
) => {
  const {emoji, name, description} = body;

  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found")
  }



  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException("Project not found");
  }

    project.name = name || project.name;
    project.description = description || project.description;
    project.emoji = emoji|| project.emoji;

    await project.save()

    return {
      project
    }
};

export const getProjectAnalyticsService = async(
  projectId: string,
  workspaceId: string,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Project not found or does not belong to this workspace");
  }

  const currentDate = new Date();

  const analytics = await TaskModel.aggregate([
    // Stage 1: Filter tasks by workspace and project
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        project: new mongoose.Types.ObjectId(projectId)
      }
    },
    // Stage 2: Group and calculate all metrics in one query
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        overDueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", currentDate] },
                  { $ne: ["$status", TaskStatusEnum.DONE] }
                ]
              },
              1, 0
            ]
          }
        },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", TaskStatusEnum.DONE] }, 1, 0]
          }
        }
      }
    },
    // Stage 3: Project to clean up output
    {
      $project: {
        _id: 0,
        totalTasks: 1,
        completedTasks: 1,
        overDueTasks: 1
      }
    }
  ]);

  // Handle case when no tasks found
  const result = analytics[0] || {
    totalTasks: 0,
    completedTasks: 0,
    overDueTasks: 0,
  };

  return { analytics: result };
}

export const getProjectByIdAndWorkspaceService = async (
    projectId: string,
    workspaceId: string,
) => {

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project) {
    throw new NotFoundException("Project not found");
  }
  
  return {
    project
  }
};

export const deleteProjectService = async(
  workspaceId: string,
  projectId: string,
  
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const project = await ProjectModel.findOne({
      _id: projectId,
      workspace: workspaceId
    }).session(session);

    if (!project) {
      throw new NotFoundException("Project not found or does not belong to the specified workspace");
    }


    await TaskModel.deleteMany({
      project: projectId,
      workspace: workspaceId
    }).session(session);

    await project.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      project
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};