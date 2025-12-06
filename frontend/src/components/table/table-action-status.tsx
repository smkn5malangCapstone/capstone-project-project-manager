import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle, Circle, Clock11 } from "lucide-react";
import { TaskStatusEnum, TaskStatusEnumType } from "@/constant";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { TaskType } from "@/types/api.type";
import { EditTaskPayloadType } from "@/types/api.type";
import { cn } from "@/lib/utils";

interface TableActionStatusProps {
  task: TaskType;
  workspaceId: string;
  projectId?: string;
}

export function TableActionStatus({ task, workspaceId, projectId }: TableActionStatusProps) {
  const queryClient = useQueryClient();
  
  const getNextStatus = (currentStatus: TaskStatusEnumType): TaskStatusEnumType => {
    switch (currentStatus) {
      case TaskStatusEnum.TODO:
        return TaskStatusEnum.IN_PROGRESS;
      case TaskStatusEnum.IN_PROGRESS:
        return TaskStatusEnum.DONE;
      case TaskStatusEnum.DONE:
        return TaskStatusEnum.TODO;
      default:
        return TaskStatusEnum.TODO;
    }
  };

  const getButtonConfig = (status: TaskStatusEnumType) => {
    switch (status) {
      case TaskStatusEnum.TODO:
        return {
          text: "SEDANG DIAJARKAN",
          icon: <Clock11 className="h-4 w-4 mr-1" />,
          variant: "default" as const,
          className: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border-yellow-200",
        };
      case TaskStatusEnum.IN_PROGRESS:
        return {
          text: "SUDAH DIAJARKAN",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          variant: "secondary" as const,
          className: "bg-green-100 text-green-600 hover:bg-green-200 border-green-200",
        };
      case TaskStatusEnum.DONE:
        return {
          text: "BELUM DIAJARKAN",
          icon: <Circle className="h-4 w-4 mr-1" />,
          variant: "outline" as const,
          className: "bg-[#DEEBFF] text-[#0052CC] hover:bg-[#c5daff] border-[#0052CC]/20",
        };
      default:
        return {
          text: "Progress",
          icon: <Play className="h-4 w-4 mr-1" />,
          variant: "default" as const,
          className: "bg-[#DEEBFF] text-[#0052CC] hover:bg-[#c5daff] border-[#0052CC]/20",
        };
    }
  };

  const getToastMessage = (status: TaskStatusEnumType) => {
    switch (status) {
      case TaskStatusEnum.IN_PROGRESS:
        return "Materi Sedang Di Ajarkan";
      case TaskStatusEnum.DONE:
        return "Materi Sudah Di Ajarkan";
      case TaskStatusEnum.TODO:
        return "Materi Belum Di Ajarkan";
      default:
        return "Status berhasil diperbarui";
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId || !task.project?._id) {
        throw new Error("Workspace or project ID is missing");
      }

      const currentStatus = task.status as TaskStatusEnumType;
      const nextStatus = getNextStatus(currentStatus);

      const payload: EditTaskPayloadType = {
        workspaceId,
        projectId: task.project._id,
        taskId: task._id,
        data: {
          title: task.title || "",
          description: task.description || "",
          status: nextStatus,
          assignedTo: task.assignedTo?._id || "",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
          links: task.links || [],
        }
      };

      const apiReturn = await editTaskMutationFn(payload);
      return { apiReturn, nextStatus };
    },

    onSuccess: ({ nextStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
        queryClient.invalidateQueries({ queryKey: ["project-analytics", projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ["task", task._id] });

      toast({
        title: "Berhasil",
        description: getToastMessage(nextStatus),
        variant: "success",
      });
    },

    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = () => {
    updateStatusMutation.mutate();
  };

  const taskStatus = task.status as TaskStatusEnumType;
  const buttonConfig = getButtonConfig(taskStatus);

  return (
    <Button
      size="sm"
      variant={buttonConfig.variant}
      onClick={handleStatusChange}
      disabled={updateStatusMutation.isPending || !task.project?._id}
      className={cn(
        "h-8 px-3 text-xs font-medium min-w-[100px] transition-colors",
        buttonConfig.className
      )}
      title={!task.project?._id ? "Task tidak memiliki project ID" : ""}
    >
      {updateStatusMutation.isPending ? (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <span className="flex items-center">
          {buttonConfig.icon}
          {updateStatusMutation.isPending ? "Updating..." : buttonConfig.text}
        </span>
      )}
    </Button>
  );
}
