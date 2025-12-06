import { Dialog, DialogContent } from "@/components/ui/dialog";
import ViewTaskForm from "./view-task-form";
import { TaskType } from "@/types/api.type";

const ViewTaskDialog = ({ task, isOpen, onClose }: { task: TaskType; isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
        <ViewTaskForm task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default ViewTaskDialog;