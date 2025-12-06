import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { z } from "zod";
import { HTTPSTATUS } from "../config/http.config";
import { getMemberRoleInWorkspace, joinWorkspaceByInviteService, removeMemberByMemberIdService } from "../services/member.service";
import roleGuard from "../utils/roleGuard";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { memberIdSchema } from "../validation/member.validation";
import { Permissions } from "../enums/role.enum";

export const joinWorkspaceController = asyncHandler(async(req: Request, res: Response) => {
  const inviteCode = z.string().parse(req.params.inviteCode);
  const userId = req.user?._id;

  
  const { workspaceId, role } = await joinWorkspaceByInviteService(
    userId,
    inviteCode,
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Successfully joined the workspace",
    workspaceId,
    role,
  })
});

export const removeMemberFromWorkspaceByIdController = asyncHandler(async(req: Request, res:Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const memberId = memberIdSchema.parse(req.params.memberId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.REMOVE_MEMBER]);

    await removeMemberByMemberIdService(workspaceId, memberId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Remove member from workspace successfully"
    })
})