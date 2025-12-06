import mongoose from "mongoose";
import {  TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createTaskService = async(
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
    links?: string[];
  }
) => {
  try {
    const { title, description, status, assignedTo, dueDate, links } = body;

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    const project = await ProjectModel.findOne({
      _id: projectId,
      workspace: workspaceId
    });

    if (!project) {
      throw new NotFoundException("Project not found in this workspace");
    }

    if (assignedTo) {
      const isAssignedToIsUserMember = await MemberModel.exists({
        userId: assignedTo,
        workspaceId,
      })

      if (!isAssignedToIsUserMember) {
        throw new Error("Assigned user is not a member of this workspace")
      }
    }

    const task = new TaskModel({
      title,
      description,
      status: status || TaskStatusEnum.TODO,
      assignedTo,
      createdBy: userId,
      workspace: workspaceId,
      project: projectId,
      dueDate,
      links: links || [],
    });
    
    await task.save();
    return {
      task
    }
  } catch (error) {  
    throw error;
  }
};

export const updateTaskService = async(
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: {
    title: string;
    description?: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
    links?: string[];
  }
) => {

  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Project Not Found or not belong to this workspace")
  };

  const task= await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException("Task not found or not belong to this project");
  };

  const updateTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
      ...(body.links !== undefined && { links: body.links }),
    },
    {new: true}
  );

  if (!updateTask) {
    throw new BadRequestException("Failed to update task")
  }

  return { updateTask }
}

export const deleteTaskService = async(
  workspaceId: string,
  taskId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const task = await TaskModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(taskId),
      workspace: new mongoose.Types.ObjectId(workspaceId),
    }).session(session);

    if (!task) {
      throw new NotFoundException("Task not found or does not belong to this project");
    }

    await session.commitTransaction();
    session.endSession();

    return;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getAllTaskservice = async(
  workspaceId: string,
  filters: {
    projectId?: string,
    status?: string[],
    assignedTo?: string[],
    keyword?: string,
    dueDate?: string
  },
  pagination: {
    pageSize: number,
    pageNumber: number,
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  }

  if (filters.projectId) {
      query.project = filters.projectId
  }

  if (filters.status && filters.status?.length > 0) {
      query.status = { $in: filters.status}
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
      query.assignedTo = { $in: filters.assignedTo }
  }
  if (filters.keyword && filters.keyword !== undefined) {
      query.title = { $regex: filters.keyword, $options: "i"};
  }
  if (filters.dueDate) {
    query.dueDate = {
      $eq : new Date(filters.dueDate),
    };
  }

  // paggination setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [ tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1})
      .populate("assignedTo", "_id name profilePicture email -password")
      .populate("project", "_id emoji name")
      .populate("createdBy", "_id name email -password"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  
  return{
  tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    }
  }
};

export const getTaskByIdService = async(
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  try {
    const project = await ProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(projectId),
      workspace: new mongoose.Types.ObjectId(workspaceId)
    });

    if (!project) {
      throw new NotFoundException("Project not found or does not belong to this workspace");
    }

    const task = await TaskModel.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      workspace: new mongoose.Types.ObjectId(workspaceId),
      project: new mongoose.Types.ObjectId(projectId)
    })
    .populate("assignedTo", "_id name email    profilePicture -password")
    .populate("project", "_id name emoji description")
    .populate("workspace", "_id name")
    .populate("createdBy", "_id name email profilePicture -password")
    .lean();;

    if (!task) {
      throw new NotFoundException("Task not found or does not belong to this project");
    }


    return {
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
        project: task.project,
        workspace: task.workspace,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
        taskCode: task.taskCode,
        createdBy: task.createdBy,
        links: task.links,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }
    };

  } catch (error) {
    throw error;
  }
};