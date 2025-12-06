import {
  TaskStatusEnum,
  TaskStatusEnumType,
} from "@/constant";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

const useTaskTableFilter = () => {
  return useQueryStates({
    status: parseAsStringEnum<TaskStatusEnumType>(
      Object.values(TaskStatusEnum)
    ),
    keyword: parseAsString,
    projectId: parseAsString,
    assigneeId: parseAsString,
  });
};

export default useTaskTableFilter;
