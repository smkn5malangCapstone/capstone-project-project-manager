import { format } from "date-fns";
import { CalendarIcon, LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskType } from "@/types/api.type";
import { TaskStatusEnum } from "@/constant";
import { 
  getAvatarColor, 
  getAvatarFallbackText, 
  formatStatusToEnum 
} from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {  statuses } from "./table/data";

interface ViewTaskFormProps {
  task: TaskType;
  onClose: () => void;
}

export default function ViewTaskForm({ task, onClose }: ViewTaskFormProps) {
  // Find status and priority data from constants
  const status = statuses.find(s => s.value === task.status);  
  const StatusIcon = status?.icon;

  // Format status display
  const getStatusDisplay = () => {
    if (!status) return task.status;
    
    const statusEnum = formatStatusToEnum(status.value) as keyof typeof TaskStatusEnum;
    const variant = TaskStatusEnum[statusEnum] || "outline";
    
    return (
      <Badge
        variant={variant}
        className="flex w-auto p-2 px-2 gap-1 font-medium shadow-sm uppercase border-0"
      >
        {StatusIcon && <StatusIcon className="h-4 w-4 rounded-full text-inherit" />}
        <span>{status.label}</span>
      </Badge>
    );
  };


  // Extract domain from URL
  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Get icon based on domain
  const getLinkIcon = (url: string): string => {
    const domain = getDomainFromUrl(url).toLowerCase();
    
    if (domain.includes('docs.google.com') || domain.includes('google.com')) {
      return '📄';
    } else if (domain.includes('canva.com')) {
      return '🎨';
    } else if (domain.includes('figma.com')) {
      return '🎯';
    } else if (domain.includes('miro.com')) {
      return '🔄';
    } else if (domain.includes('notion.so')) {
      return '📝';
    } else {
      return '🔗';
    }
  };

  // Format date safely
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "No date";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return "Invalid date";
    }
  };

  // Format datetime safely
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return "No date";
    try {
      return format(new Date(dateString), "PPp");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        {/* Header */}
        <div className="mb-6 pb-4 border-b">
          <h1 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1 text-center sm:text-left">
            Detail Tugas
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Detail tugas dan informasi terkait lainnya.
          </p>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Task Code & Project */}
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground text-xs mb-2">Kode Tugas</p>
                  <Badge variant="outline" className="capitalize h-6 text-xs">
                    {task.taskCode || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground text-xs mb-2">Proyek</p>
                  <div className="flex items-center gap-2">
                    {task.project?.emoji && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs">
                        {task.project.emoji}
                      </span>
                    )}
                    <span className="block capitalize text-sm font-medium truncate">
                      {task.project?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Title */}
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <p className="font-medium text-muted-foreground text-xs mb-2">Judul Tugas</p>
              <h2 className="text-base font-semibold leading-relaxed">
                {task.title}
              </h2>
            </CardContent>
          </Card>

          {/* Description */}
          {task.description && (
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <p className="font-medium text-muted-foreground text-xs mb-2">Deskripsi Tugas</p>
                <div className="bg-muted/30 p-3 rounded-md border">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {task.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links Section */}
          {task.links && task.links.length > 0 && (
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-muted-foreground text-xs">Dokumen Tugas</p>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {task.links.length} {task.links.length === 1 ? 'Dokumen' : 'Dokumen'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {task.links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-lg flex-shrink-0">{getLinkIcon(link)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getDomainFromUrl(link)}
                        </p>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-blue-600 truncate block"
                          title={link}
                        >
                          {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                        </a>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-8 text-xs"
                        asChild
                      >
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          Buka
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card className="border shadow-sm">
            <CardContent className="p-4">
            <p className="font-medium text-muted-foreground text-xs mb-2">Status</p>
            {getStatusDisplay()}
            </CardContent>
          </Card>

          {/* Assigned To */}
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <p className="font-medium text-muted-foreground text-xs mb-2">Ditugaskan Kepada</p>
              {task.assignedTo ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={task.assignedTo.profilePicture || ""} 
                      alt={task.assignedTo.name} 
                    />
                    <AvatarFallback className={getAvatarColor(task.assignedTo.name)}>
                      {getAvatarFallbackText(task.assignedTo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{task.assignedTo.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Due Date */}
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <p className="font-medium text-muted-foreground text-xs mb-2">Tenggat Tugas</p>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Created By */}
          {task.createdBy && (
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <p className="font-medium text-muted-foreground text-xs mb-2">Pembuat Tugas</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={task.createdBy.profilePicture || ""} 
                      alt={task.createdBy.name} 
                    />
                    <AvatarFallback className={getAvatarColor(task.createdBy.name)}>
                      {getAvatarFallbackText(task.createdBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{task.createdBy.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.createdBy.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Created & Updated Dates */}
          {(task.createdAt || task.updatedAt) && (
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {task.createdAt && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Dibuat</p>
                      <p className="text-xs">{formatDateTime(task.createdAt)}</p>
                    </div>
                  )}
                  {task.updatedAt && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Update</p>
                      <p className="text-xs">{formatDateTime(task.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 pr-4">
            <Button 
              onClick={onClose} 
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}