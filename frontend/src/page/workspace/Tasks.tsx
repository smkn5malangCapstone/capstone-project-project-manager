import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";
import { Permissions } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";

export default function Tasks() {

  const { hasPermission } = useAuthContext();

  const canCreateTask = hasPermission(
    Permissions.CREATE_TASK
  );

  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Tugas</h2>
          <p className="text-muted-foreground">
            Ini adalah daftar tugas untuk workspace ini!
          </p>
        </div>
        {
          canCreateTask ? (
            <CreateTaskDialog />
          ) : null
        }
      </div>
      {/* {Task Table} */}
      <div>
        <TaskTable />
      </div>
    </div>
  );
}
