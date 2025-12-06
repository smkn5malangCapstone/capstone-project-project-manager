import { Router } from "express";
import { createTaskController, deleteTaskController, getAllTasksController, getTaskByTaskIdController, updateTaskController } from "../controllers/task.controller";

const taskRoutes = Router();

taskRoutes.post("/project/:projectId/workspace/:workspaceId/create", createTaskController);
taskRoutes.put("/:id/project/:projectId/workspace/:workspaceId/update", updateTaskController);
taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);
taskRoutes.get("/:id/project/:projectId/workspace/:workspaceId", getTaskByTaskIdController);
taskRoutes.delete("/:id/workspace/:workspaceId/delete", deleteTaskController);

export default taskRoutes;