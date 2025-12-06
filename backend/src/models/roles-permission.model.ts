import mongoose, { Document, Schema } from "mongoose";
import { Permissions, PermissionsType, Roles, RoleType } from "../enums/role.enum";
import { RolesPermissions } from "../utils/role-permission";

export interface RoleDocument extends Document{
  name: RoleType;
  permissions: Array<PermissionsType>;
}

const roleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      enum: Object.values(Roles),
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      enum: Object.values(Permissions),
      required: true,
      default: function(this: RoleDocument){
        return RolesPermissions[this.name]
      }
    },
  },
  { timestamps: true }
);

const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
export default RoleModel;