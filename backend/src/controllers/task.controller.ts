import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { projectIdSchema, workspaceIdSchema } from "../validation/workspace.validation";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "../validation/task.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import roleGuard from "../utils/roleGuard";
import { Permissions } from "../enums/role.enum";
import { HTTPSTATUS } from "../config/http.config";
import { createTaskService, deleteTaskService, getAllTaskservice, getTaskByIdService, updateTaskService } from "../services/task.service";

export const createTaskController = asyncHandler(async(req: Request, res: Response) => {
  const userId = req.user?._id;

  const body = createTaskSchema.parse(req.body);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  const projectId = projectIdSchema.parse(req.params.projectId);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.CREATE_TASK]);

  const { task } = await createTaskService(workspaceId, projectId, userId, body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Create task successfully",
    task
  })
});

export const updateTaskController = asyncHandler(async(req: Request, res: Response) => {
  const userId = req.user?._id;
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  const projectId = projectIdSchema.parse(req.params.projectId);
  const taskId = taskIdSchema.parse(req.params.id);
  const body = updateTaskSchema.parse(req.body);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.EDIT_TASK]);

  const { updateTask } = await updateTaskService(workspaceId, projectId, taskId, body);


  return res.status(HTTPSTATUS.OK).json({
    message: "Task updated successfully",
    updateTask,
  })
});

export const getAllTasksController = asyncHandler(async(req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status 
        ? (req.query.status as string)?.split(",") : undefined,
      assignedTo: req.query.assignedTo 
        ? (req.query.assignedTo as string)?.split(",") : undefined,
      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate as string | undefined,
    };

    const pagination = {
      pageSize:parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getAllTaskservice(
      workspaceId,
      filters,
      pagination,
    )

  return res.status(HTTPSTATUS.OK).json({
    message: "All tasks fetched successfully",
    ...result
  })
});

export const deleteTaskController = asyncHandler(async(req: Request, res:Response) => {
  const userId = req.user?._id;
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  const taskId = taskIdSchema.parse(req.params.id);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.DELETE_TASK]);

  await deleteTaskService(workspaceId, taskId);
  
  return res.status(HTTPSTATUS.OK).json({
    message: "Task deleted successfully"
  })
});

export const getTaskByTaskIdController = asyncHandler(async(req: Request, res: Response) => {
  const userId = req.user?._id;
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  const projectId = projectIdSchema.parse(req.params.projectId);
  const taskId = taskIdSchema.parse(req.params.id);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { task } = await getTaskByIdService(workspaceId, projectId, taskId)
  
  return res.status(HTTPSTATUS.OK).json({
    message: "Task fetched successfully",
    task,
  })
})
