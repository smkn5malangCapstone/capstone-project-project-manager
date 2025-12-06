import 'dotenv/config';
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import RoleModel from "../models/roles-permission.model";
import { RolesPermissions } from "../utils/role-permission";

const seedRoles = async () => {
  console.log("Seeding roles...");
  try {
    await connectDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Clearing existing roles...");
    await RoleModel.deleteMany({}, { session });

    for ( const roleName in RolesPermissions){
      const role = roleName as keyof typeof RolesPermissions;
      const permissions = RolesPermissions[role];

      // Check if role already exists
      const existingRole = await RoleModel
        .findOne({ name: role }).session(
          session);

      if (!existingRole) {
      const newRole = new RoleModel({
        name: role,
        permissions: permissions,
      });
      await newRole.save({ session });
      console.log(`Role ${role} added`);
      }else{
        console.log(`Role ${role} already exists`);
      }
    };

    await session.commitTransaction();
    console.log("Transaction Committed")
    session.endSession();
    console.log("Session End")
    console.log("Roles seeding completed.");
  } catch (error) {
    console.error("Error seeding roles:", error);
  }
}

seedRoles().catch((error) => {
  console.error("Error Running seed script: ", error);
});