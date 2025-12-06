import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { changeRolesSchema, createWorkspaceSchema, updateWorkspaceSchema, workspaceIdSchema } from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import { changeMemberRoleService, createWorkspaceService, deletedWorkspaceByIdService, getAllWorkspaceUserIsMemberService, getWorkspaceAnalyticsService, getWorkspaceByIdService, getWorkspaceMembersService, updateWorkspaceByIdService } from "../services/workspace.service";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { Permissions, PermissionsType } from "../enums/role.enum";
import roleGuard from "../utils/roleGuard";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException } from "../utils/appError";

export const createWorkspaceController = asyncHandler(async(req: Request, res: Response) => { 
  const body = createWorkspaceSchema.parse(req.body);

  const userId= req.user?._id;
  const { workspace } = await createWorkspaceService(userId, body);


  return res.status(HTTPSTATUS.CREATED).json({
    message: "Workspace created successfully",
    workspace,
  })
});

export const getAllWorkspacesUserIsMemberController = asyncHandler(async(req:Request, res:Response) => {
  const userId = req.user?._id;

   const { workspace } = await getAllWorkspaceUserIsMemberService(userId);

   return res.status(HTTPSTATUS.OK).json({
    message: "User workspace fetched successfully",
    workspace,
   })
});

export const getWorkspaceByIdController = asyncHandler(async( req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  
  await getMemberRoleInWorkspace(userId, workspaceId);

  const { workspace } = await getWorkspaceByIdService(workspaceId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace fetched successfully", workspace
  })
});

export const getWorkspaceMembersController = asyncHandler(async(req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);

  const userId = req.user?._id;

  const {role} = await getMemberRoleInWorkspace(userId, workspaceId);

  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { members , roles } = await getWorkspaceMembersService(workspaceId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace members retrieved successfully",
    members,
    roles,
  })
});

export const getWorkspaceAnalyticsController = asyncHandler(async(req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  
  const {role} = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace Analytics retrieved Successfully",
    analytics
  })
});

export const changeWorkspaceMemberRoleController = asyncHandler(async(req: Request, res: Response)=>{
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const { memberId, roleId} = changeRolesSchema.parse(req.body);

  const userId = req.user?._id;
  
  const {role} = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

  const { member } = await changeMemberRoleService(
    workspaceId,
    memberId,
    roleId,
  );

  return res.status(HTTPSTATUS.OK).json({
    mesagge: "Member role changed successfully",
    member,
  })
});

export const updateWorkspaceByIdController = asyncHandler(async(req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);

  const {name, description} = updateWorkspaceSchema.parse(req.body);
  const userId = req.user?._id;
  
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId); 
  roleGuard(role, [Permissions.EDIT_WORKSPACE]);

  const { workspace } = await updateWorkspaceByIdService(
    workspaceId,
    name,
    description,
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace update successfully",
    workspace,
  })
});

export const deleteWorkspaceByIdController = asyncHandler(async(
  req: Request,
  res: Response,
) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;  
  
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_WORKSPACE]);

    const { currentWorkspace } = await deletedWorkspaceByIdService(workspaceId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace deleted successfully",
      currentWorkspace,
    });
});