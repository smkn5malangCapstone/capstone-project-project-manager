import { Router } from "express";
import { createProjectByWorkspaceIdController, deleteProjectController, getAllProjectInWorkspaceController, getProjectAnalyticsController, getProjectByIdAndWorkspaceIdController, updateProjectInWorkspaceController } from "../controllers/project.controller";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create", createProjectByWorkspaceIdController);
projectRoutes.get("/workspace/:workspaceId/all", getAllProjectInWorkspaceController);
projectRoutes.get("/:id/workspace/:workspaceId", getProjectByIdAndWorkspaceIdController);
projectRoutes.get("/:id/workspace/:workspaceId/analytics", getProjectAnalyticsController);
projectRoutes.put("/:id/workspace/:workspaceId/update", updateProjectInWorkspaceController);
projectRoutes.delete("/:id/workspace/:workspaceId/delete", deleteProjectController);

export default projectRoutes;