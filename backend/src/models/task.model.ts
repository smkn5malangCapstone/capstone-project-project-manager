import mongoose, { Document, Schema } from "mongoose";
import {  TaskStatusEnum, TaskStatusEnumType } from "../enums/task.enum";
import { generateTaskCode } from "../utils/uuid";


export interface TaskDocument extends Document {
  taskCode: string;
  title: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  status: TaskStatusEnumType,
  assignedTo: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  dueDate: Date | null;
  links: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    taskCode: {
      type: String,
      unique: true,
      default: generateTaskCode,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatusEnum),
      default: TaskStatusEnum.TODO,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
     links: {
      type: [String],
      default: [], 
      validate: {
        validator: function(links: string[]) {
          return links.every(link => {
            try {
              new URL(link);
              return true;
            } catch {
              return false;
            }
          });
        },
        message: 'Each link must be a valid URL'
      }
    },
  }, 
  { timestamps: true }
);

const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema);
export default TaskModel;