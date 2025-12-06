import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableActionStatus } from "@/components/table/table-action-status"; 
import { DataTableColumnHeader } from "./table-column-header";
import { DataTableRowActions } from "./table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  TaskStatusEnum,
  TaskStatusEnumType,
} from "@/constant";
import {
  formatStatusToEnum,
  getAvatarColor,
  getAvatarFallbackText,
} from "@/lib/helper";
import { statuses } from "./data";
import { TaskType } from "@/types/api.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWorkspaceId from "@/hooks/use-workspace-id";

export const getColumns = (projectId?: string): ColumnDef<TaskType>[] => {

   const WorkspaceIdWrapper = ({ task }: { task: TaskType }) => {
    const workspaceId = useWorkspaceId();
    return (
      <TableActionStatus 
        task={task} 
        workspaceId={workspaceId} 
        projectId={projectId} 
      />
    );
  };

  const columns: ColumnDef<TaskType>[] = [
    {
      id: "_id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "Judul",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Judul" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap space-x-2">
            <span className="block lg:max-w-[220px] max-w-[200px] font-medium">
              {(() => {
                  const words = row.original.title?.split(' ') || [];
                  if (words.length === 0) return 'Untitled';
                  
                  const firstWord = words[0];
                  
                  if (firstWord.length <= 2 && words.length > 1) {
                    return words.slice(0, 2).join(' '); 
                  }
                  
                  if (firstWord.length > 4) {
                    return firstWord.substring(0, 4);
                  }                  
                  return firstWord; 
                })()}
            </span>
          </div>
        );
      },
    },
    ...(projectId
      ? [] // If projectId exists, exclude the "Project" column
      : [
          {
            accessorKey: "project",
            header: ({ column }: { column: Column<TaskType, unknown> }) => (
              <DataTableColumnHeader column={column} title="Proyek" />
            ),
            cell: ({ row }: { row: Row<TaskType> }) => {
              const project = row.original.project;

              if (!project) {
                return null;
              }

              return (
                <div className="flex items-center gap-1">
                  <span className="rounded-full border">{project.emoji}</span>
                  <span className="block capitalize truncate w-[100px] text-ellipsis">
                    {project.name}
                  </span>
                </div>
              );
            },
          },
        ]),
    {
      accessorKey: "Ditugaskan",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ditugaskan" />
      ),
      cell: ({ row }) => {
        const assignee = row.original.assignedTo || null;
        const name = assignee?.name || "";

        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);

        return (
          name && (
            <div className="flex items-center gap-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee?.profilePicture || ""} alt={name} />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="block text-ellipsis w-[100px] truncate">
                {assignee?.name.split(" ")[0]}
              </span>
            </div>
          )
        );
      },
    },
    {
      accessorKey: "Tenggat Tugas",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tenggat Tugas" />
      ),
      cell: ({ row }) => {
        return (
          <span className="lg:max-w-[100px] text-sm">
            {row.original.dueDate ? format(row.original.dueDate, "PPP") : null}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue("status")
        );

        if (!status) return null;

        const statusKey = formatStatusToEnum(
          status.value
        ) as TaskStatusEnumType;
        const Icon = status.icon;

        if (!Icon) return null;

        // 🔥 Mapping label status baru
        const labelMap: Record<TaskStatusEnumType, string> = {
          DONE: "SUDAH DIAJARKAN",
          TODO: "BELUM DIAJARKAN",
          IN_PROGRESS: "SEDANG DIAJARKAN",
        };

        return (
          <div className="flex lg:w-[160px] items-center">
            <Badge
              variant={TaskStatusEnum[statusKey]}
              className="flex w-auto px-2 gap-1 font-medium shadow-sm uppercase border-0"
            >
              <Icon className="h-4 w-4 rounded-full text-inherit" />
              <span>{labelMap[statusKey]}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dibuat Oleh" />
      ),
      cell: ({ row }) => {
        const createdBy = row.original.createdBy;
        if (!createdBy) return <div>-</div>;
        
        const name = createdBy.name || "Unknown";
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);

        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={createdBy.profilePicture || ""} alt={name} />
              <AvatarFallback className={avatarColor}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{name.split(" ")[0]}</span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

     {
      id: "actionStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => {
        return <WorkspaceIdWrapper task={row.original} />;
      },
      enableSorting: false,
      enableHiding: false,
      size: 120,
    },

    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <>
            <DataTableRowActions row={row} />
          </>
        );
      },
    },
  ];

  return columns;
};
