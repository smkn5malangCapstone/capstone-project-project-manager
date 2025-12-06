import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { TaskType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import EditTaskDialog from "../edit-task-dialog";
import ViewTaskDialog from "../view-task-dialog"; // Import the View Dialog
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { hasPermission } = useAuthContext();

  const canDeletedTask = hasPermission(
    Permissions.DELETE_TASK
  );

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });

  const task = row.original;
  const taskId = task._id as string;
  const taskCode = task.taskCode;

  const handleConfirm = () => {
    mutate(
      { workspaceId, taskId },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
          toast({ title: "Success", description: data.message, variant: "success" });
          setTimeout(() => setOpenDialog(false), 100);
        },
        onError: (error) => {
          toast({ title: "Error", description: "Member Tidak dapat Menghapus Tugas", variant: "destructive" });
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {/* View Task Option */}
          <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenViewDialog(true)}>
            <Eye className="w-4 h-4 mr-2" /> Lihat Tugas
          </DropdownMenuItem>

          {/* Edit Task Option */}
          <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenEditDialog(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Edit Tugas
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          {/* Delete Task Option */}
            {
              canDeletedTask ? (
                <DropdownMenuItem
                  className="!text-destructive cursor-pointer"
                  onClick={() => setOpenDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus Tugas
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              ) : null
            }
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Task Dialog */}
      <ViewTaskDialog 
        task={task} 
        isOpen={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog 
        task={task} 
        isOpen={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
      />

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirm}
        title="Hapus Tugas"
        description={`Apakah kamu yakin ingin menghapus tugas ${taskCode}?`}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </>
  );
}