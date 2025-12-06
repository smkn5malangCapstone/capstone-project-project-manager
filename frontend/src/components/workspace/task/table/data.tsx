import { TaskStatusEnum } from "@/constant";
import { transformOptions } from "@/lib/helper";
import {
  CheckCircle,
  Circle,
  Timer,
} from "lucide-react";

const statusIcons = {
  [TaskStatusEnum.TODO]: Circle,
  [TaskStatusEnum.IN_PROGRESS]: Timer,
  [TaskStatusEnum.DONE]: CheckCircle,
};


export const statuses = transformOptions(
  Object.values(TaskStatusEnum),
  statusIcons
);

