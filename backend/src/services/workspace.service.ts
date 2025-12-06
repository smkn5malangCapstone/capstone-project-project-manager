import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.model";

// create new workspace

export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string;
    description?: string | undefined; 
  }
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User Not Found");
  }
  
  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER});

  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = new WorkspaceModel({
    name: name,
    description: description,
    owner: user._id,
  });

  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  })

  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;

  await user.save();

  return {
    workspace,
  };
};

export const getAllWorkspaceUserIsMemberService = async(
  userId: string,
) => {
  const memberships = await MemberModel.find({ userId }).populate("workspaceId").select("-password").exec();

  const workspace = memberships.map((membership) => membership.workspaceId) ;

  return { workspace };
}

export const getWorkspaceByIdService = async(
  workspaceId: string,
) => {
  const workspace = await WorkspaceModel.findById( workspaceId)

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const members = await MemberModel.find({ workspaceId }).populate("role");

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return { workspace: workspaceWithMembers };
}

export const getWorkspaceMembersService = async(
  workspaceId: string,
) => {
   const workspace = await WorkspaceModel.findById( workspaceId);

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    const members = await MemberModel.find({
      workspaceId
    }).populate("userId", "name email profilePicture -password").populate("role", "name");

    const roles = await RoleModel.find({}, {name: 1, _id:1}).select("-permission").lean();

    return { members, roles };
}

export const getWorkspaceAnalyticsService = async(
  workspaceId: string,
) => {
  const currentDate = new Date();

  const totalTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
  });

  const overDueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE},
  });

  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics ={
    totalTasks,
    overDueTasks,
    completedTasks,
  };

  return { analytics };
};

export const changeMemberRoleService = async(
  workspaceId: string,
  memberId: string,
  roleId: string,
) => {

  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace Not Found!")
  }
  
  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId
  });
  if (!member) {
    throw new NotFoundException("Member Not Found in the workspace")
  }

  member.role = role;
  await member.save();
  
  return { member }
};

export const updateWorkspaceByIdService = async(
  workspaceId: string,
  name: string,
  description?: string,
) => {

  const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
    throw new NotFoundException("Workspace Not Found!")
  }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;

    await workspace.save();
    return { workspace };
};

export const deletedWorkspaceByIdService = async(
 workspaceId: string,
 userId: string
) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
  const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
    throw new NotFoundException("Workspace Not Found!")
     }

    if (workspace.owner.toString() !== userId) {
      throw new BadRequestException(
        "You are not authorized to deleted this workspace"
      );
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException(
        "User not found"
      );
    }

    await TaskModel.deleteMany({
    workspaceId: workspace._id
    }).session(session);

    await ProjectModel.deleteMany({
       workspace: workspace._id
    }).session(session);

    await MemberModel.deleteMany({
      workspaceId: workspace._id
    }).session(session);

     // Update user's currentWorkspace jika sedang menggunakan workspace yang dihapus
    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({
        userId,
        workspaceId: { $ne: workspaceId}
      }).session(session);

      user.currentWorkspace = memberWorkspace ? memberWorkspace.workspaceId : null;

      await user.save();
    }

    await workspace.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();

    return {
      currentWorkspace: user.currentWorkspace
    }
  } catch (error) {
   await session.abortTransaction();
   session.endSession();
   throw error; 
  }
};