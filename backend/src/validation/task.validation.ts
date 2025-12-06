import { z } from "zod";
import { TaskStatusEnum } from "../enums/task.enum";

export const titleSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().optional();
export const assignedToSchema = z.string().trim().min(1).nullable().optional();
export const dueDateSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => {
    return !val || !isNaN(Date.parse(val))
  },{
    message: "Invalid date format. Please provide valid date format"
  });
export const taskIdSchema = z.string().trim().min(1);

export const linksSchema =  z.array(z.string().url("Each link must be a valid URL")).optional();


export const statusSchema = z.enum(
  Object.values(TaskStatusEnum) as [string, ...string[]]
);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema,
  links: linksSchema,
});

export const updateTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema,
  links: linksSchema,
});