import { Router } from "express";
import { joinWorkspaceController, removeMemberFromWorkspaceByIdController } from "../controllers/member.controller";

const memberRoutes = Router();
memberRoutes.post("/workspace/:inviteCode/join", joinWorkspaceController);
memberRoutes.delete("workspaceId/:workspaceId/memberId/:memberId/delete", removeMemberFromWorkspaceByIdController);

export default memberRoutes;

