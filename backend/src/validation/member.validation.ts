import { z } from "zod";

export const memberIdSchema = z.string().trim().min(1, { message: "Member ID is Required"});
