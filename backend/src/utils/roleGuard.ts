import { PermissionsType } from "../enums/role.enum";
import { RolesPermissions } from "./role-permission";
import { UnauthorizedException } from "./appError";

export const roleGuard = (
  role: keyof typeof RolesPermissions,
  requiredPermission: PermissionsType[]
) => {
  const userPermissions = RolesPermissions[role] || [];
  
  const hasPermission = requiredPermission.every((perm) =>
    userPermissions.includes(perm)
  );


  if (!hasPermission) {
    throw new UnauthorizedException("You dont have the necesssary permissions to perform this action");
  }
};

export default roleGuard;