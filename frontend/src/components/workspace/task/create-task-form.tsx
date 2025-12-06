import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { CalendarIcon, LinkIcon, Loader, Plus, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  getAvatarColor,
  getAvatarFallbackText,
} from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskStatusEnum } from "@/constant";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createTaskMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateTaskForm(props: {
  projectId?: string;
  onClose: () => void;
}) {
  const { projectId, onClose } = props;

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: createTaskMutationFn,
  });

  const { data, isLoading } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    skip: !!projectId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.Projects || [];
  const members = memberData?.members || [];

  // Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 text-xs">
            {project.emoji}
          </span>
          <span className="capitalize">{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });

  const membersOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.userId?.email}</p>
          </div>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const formSchema = z.object({
    title: z.string().trim().min(1, {
      message: "Title is required",
    }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, {
      message: "Project is required",
    }),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      {
        required_error: "Status is required",
      }
    ),
    assignedTo: z.string().trim().min(1, {
      message: "AssignedTo is required",
    }),
    dueDate: z.date({
      required_error: "A due date is required.",
    }),
    links: z.array(
      z.object({
        url: z.string().url("Please enter a valid URL").or(z.literal("")),
      })
    ).optional().default([]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: projectId ? projectId : "",
      status: "TODO",
      links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const taskStatusList = Object.values(TaskStatusEnum);

const statusLabelMap: Record<string, string> = {
  TODO: "BELUM DIAJARKAN",
  IN_PROGRESS: "SEDANG DIAJARKAN",
  DONE: "SUDAH DIAJARKAN",
};

const statusOptions = taskStatusList.map((status) => ({
  value: status,
  label: statusLabelMap[status],
}));
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    
    const filteredLinks = values.links
      ?.filter(link => link.url.trim() !== "")
      .map(link => link.url) || [];

    const payload = {
      workspaceId,
      projectId: values.projectId,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
        links: filteredLinks,
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["project-analytics", projectId],
        });

        queryClient.invalidateQueries({
          queryKey: ["all-tasks", workspaceId],
        });

        toast({
          title: "Success",
          description: "Task created successfully",
          variant: "success",
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Member Tidak Dapat Membuat Tugas",
          variant: "destructive",
        });
      },
    });
  };

  const addLinkField = () => {
    append({ url: "" });
  };

  const removeLinkField = (index: number) => {
    remove(index);
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        {/* Header - Sesuai dengan ViewTaskForm */}
        <div className="mb-6 pb-4 border-b">
          <h1 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1 text-center sm:text-left">
            Membuat Tugas Baru
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Membuat tugas baru dan tugaskan kepada anggota tim
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-4 max-h-[70vh] overflow-y-auto pr-2" onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* Title Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-muted-foreground text-xs mb-2 block">
                        Judul Tugas
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ketik judul tugas"
                          className="!h-[42px] text-base font-semibold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-muted-foreground text-xs mb-2 block">
                        Deskripsi Tugas
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          Optional
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3}
                          placeholder="Ketik deskripsi tugas" 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Project Card - Hanya ditampilkan jika tidak ada projectId */}
            {!projectId && (
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-muted-foreground text-xs mb-2 block">
                          Proyek
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="!h-[42px]">
                              <SelectValue placeholder="Pilih Proyek" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoading && (
                              <div className="flex justify-center py-2">
                                <Loader className="w-4 h-4 animate-spin" />
                              </div>
                            )}
                            <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                              {projectOptions?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Status  Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Status */}
                  <FormField 
                    control={form.control} 
                    name="status" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-muted-foreground text-xs mb-2 block">
                          Status
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="!h-[42px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assigned To Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-muted-foreground text-xs mb-2 block">
                        Tugas untuk
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="!h-[42px]">
                            <SelectValue placeholder="Pilih Member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                            {membersOptions?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Due Date Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-muted-foreground text-xs mb-2 block">
                        Tenggat Waktu Tugas
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full flex-1 pl-3 text-left font-normal !h-[42px]",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Tentukan Tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={
                              (date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                date > new Date("2100-12-31")
                            }
                            initialFocus
                            defaultMonth={new Date()}
                            fromMonth={new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Links Section Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <FormLabel className="font-medium text-muted-foreground text-xs">
                    Link Dokumen
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                    (Google Docs, Canva, Figma, etc.) Optional
                    </span>
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLinkField}
                    className="ml-auto flex items-center gap-1 h-7 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add Link
                  </Button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border"
                    >
                      <FormField
                        control={form.control}
                        name={`links.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="https://docs.google.com/document/d/..."
                                className="!h-[38px] text-sm bg-background"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeLinkField(index)}
                        className="h-[38px] w-[38px] shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/20">
                      <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        Tidak ada link yang ditambahkan. Klik "Add Link" untuk menambahkan dokumen terkait.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="h-[40px]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-[40px] text-white font-semibold min-w-[120px]"
                disabled={isPending}
              >
                {isPending && <Loader className="animate-spin mr-2 w-4 h-4" />}
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}