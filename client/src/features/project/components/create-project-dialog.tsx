import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  Plus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ProjectPhase, ProjectPriority } from "../types";
import { useCreateProject } from "../hooks/use-create-project";
import { useWorkspaceMembers } from "../hooks/use-workspace-members";

const createProjectSchema = z
  .object({
    name: z.string().min(1, "Project name is required").max(100),
    code: z
      .string()
      .trim()
      .min(2, "Code must be at least 2 characters")
      .max(6, "Code cannot exceed 6 characters")
      .regex(/^[a-zA-Z0-9]+$/, "Code must contain only uppercase letters and numbers"),
    description: z.string().max(500).optional(),
    phase: z.nativeEnum(ProjectPhase, {
      error: () => ({ message: "Status is required" }),
    }),
    priority: z.nativeEnum(ProjectPriority).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    leadId: z.string().min(1, "Project lead is required"),
    memberIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Due date cannot be earlier than start date",
      path: ["dueDate"],
    }
  );

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

const STATUS_OPTIONS = [
  { value: ProjectPhase.PLANNING, label: "Planning" },
  { value: ProjectPhase.ON_HOLD, label: "On Hold" },
  { value: ProjectPhase.ACTIVE, label: "Active" },
  { value: ProjectPhase.COMPLETED, label: "Completed" },
  { value: ProjectPhase.CANCELLED, label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: ProjectPriority.LOW, label: "Low" },
  { value: ProjectPriority.MEDIUM, label: "Medium" },
  { value: ProjectPriority.HIGH, label: "High" },
  { value: ProjectPriority.URGENT, label: "Urgent" },
];

interface CreateProjectDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  children,
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const { allMembers, leadEligibleMembers } = useWorkspaceMembers();

  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      description: "",
      phase: ProjectPhase.PLANNING,
      priority: ProjectPriority.MEDIUM,
      startDate: "",
      dueDate: "",
      leadId: "",
      memberIds: [],
    },
  });

  const selectedLeadId = watch("leadId");
  const selectedMemberIds = watch("memberIds") || [];
  const startDate = watch("startDate");
  const dueDate = watch("dueDate");
  const rawDescription = watch("description") || "";
  const descriptionLength = rawDescription.trim().length;

  useEffect(() => {
    if (!open) {
      reset();
      setIsLeadDropdownOpen(false);
      setIsMembersDropdownOpen(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (startDate && dueDate) {
      if (new Date(startDate) > new Date(dueDate)) {
        setValue("dueDate", "", { shouldValidate: true });
      }
    }
  }, [startDate, dueDate, setValue]);

  const selectedLead = leadEligibleMembers.find((m) => m.id === selectedLeadId);
  const selectedMembers = allMembers.filter((m) => selectedMemberIds.includes(m.id));

  const onSubmit = async (values: CreateProjectFormValues) => {
    try {
      await createProject({
        name: values.name,
        code: values.code.toUpperCase().trim(),
        description: values.description || undefined,
        phase: values.phase,
        priority: values.priority || undefined,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        leadId: values.leadId,
        memberIds: values.memberIds?.length ? values.memberIds : undefined,
      });
      reset();
      onOpenChange(false);
    } catch {
      // Error toast handled in mutation hook
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    const current = watch("memberIds") || [];
    if (current.includes(memberId)) {
      setValue(
        "memberIds",
        current.filter((id) => id !== memberId),
        { shouldValidate: true }
      );
    } else {
      setValue("memberIds", [...current, memberId], { shouldValidate: true });
    }
  };

  const removeMember = (memberId: string) => {
    const current = watch("memberIds") || [];
    setValue(
      "memberIds",
      current.filter((id) => id !== memberId),
      { shouldValidate: true }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent showCloseButton className="sm:max-w-xl max-h-[90dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Set up a new project in this workspace and assign the people who will work on it.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Container with HIDDEN Scrollbar and breathing room for focus rings */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-1 px-1 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Project Name & Project Code */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="name" className="font-semibold">
                Project name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Nebula design system"
                className={cn("rounded-md", errors.name && "border-destructive focus-visible:ring-destructive/20")}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code" className="font-semibold">
                Code<span className="text-destructive">*</span> <span className="text-muted-foreground/70 font-normal">(e.g. PRJ)</span>
              </Label>
              <Input
                id="code"
                placeholder="PRJ"
                maxLength={10}
                className={cn("uppercase rounded-md", errors.code && "border-destructive focus-visible:ring-destructive/20")}
                {...register("code", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
              {errors.code && (
                <p className="text-xs text-destructive mt-1">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="font-semibold">
                Description<span className="text-muted-foreground/70 font-normal"> (optional)</span>
              </Label>
              <span
                className={cn(
                  "text-xs transition-colors",
                  descriptionLength >= 500 || errors.description
                    ? "text-destructive font-medium"
                    : "text-muted-foreground"
                )}
              >
                {descriptionLength} / 500 characters
              </span>
            </div>
            <Textarea
              id="description"
              disabled={isPending}
              rows={3}
              maxLength={500}
              placeholder="What is this project about?"
              className={cn(
                "min-h-24 resize-y rounded-md",
                (descriptionLength >= 500 || errors.description) && "border-destructive focus-visible:ring-destructive/20"
              )}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Status (REQUIRED) */}
            <div className="space-y-1.5">
              <Label htmlFor="phase" className="font-semibold">
                Status<span className="text-destructive">*</span>
              </Label>
              <Controller
                name="phase"
                control={control}
                render={({ field }) => {
                  const selectedOption = STATUS_OPTIONS.find((opt) => opt.value === field.value);
                  return (
                    <Select
                      value={field.value || ""}
                      onValueChange={(val) => field.onChange(val)}
                      disabled={isPending}
                    >
                      <SelectTrigger className={cn("w-full h-9 border border-input bg-transparent px-3 cursor-pointer rounded-md", errors.phase && "border-destructive focus-visible:ring-destructive/20")}>
                        <SelectValue placeholder="Select status">
                          {selectedOption?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false} className="p-1 rounded-md shadow-lg border border-border bg-popover min-w-[200px]">
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="py-2 px-3 cursor-pointer rounded-md transition-colors data-[selected]:bg-purple-100 data-[selected]:text-purple-900 dark:data-[selected]:bg-purple-950/60 dark:data-[selected]:text-purple-200 focus:bg-purple-50"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.phase && (
                <p className="text-xs text-destructive mt-1">{errors.phase.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label htmlFor="priority" className="font-semibold">
                Priority<span className="text-destructive">*</span>
              </Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => {
                  const selectedOption = PRIORITY_OPTIONS.find((opt) => opt.value === field.value);
                  return (
                    <Select
                      value={field.value || ""}
                      onValueChange={(val) => field.onChange(val)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full h-9 border border-input bg-transparent px-3 cursor-pointer rounded-md">
                        <SelectValue placeholder="Select priority">
                          {selectedOption?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false} className="p-1 rounded-md shadow-lg border border-border bg-popover min-w-[200px]">
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="py-2 px-3 rounded-md text-sm cursor-pointer transition-colors data-[selected]:bg-purple-100 data-[selected]:text-purple-900 dark:data-[selected]:bg-purple-950/60 dark:data-[selected]:text-purple-200 focus:bg-purple-50"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.priority && (
                <p className="text-xs text-destructive mt-1">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Start date & Due date */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="font-semibold">
                Start date<span className="text-muted-foreground/70 font-normal"> (optional)</span>
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                {!startDate && (
                  <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
                    Pick a starting date
                  </span>
                )}
                <Input
                  type="date"
                  disabled={isPending}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    if (!e.currentTarget.disabled) {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }
                  }}
                  className={cn(
                    "pl-9 rounded-md border-border/80 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                    !startDate && "[&::-webkit-datetime-edit]:hidden text-transparent",
                    errors.startDate && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...register("startDate")}
                />
              </div>
              {errors.startDate && (
                <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold">
                Due date<span className="text-muted-foreground/70 font-normal"> (optional)</span>
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                {!dueDate && (
                  <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
                    Pick a due date
                  </span>
                )}
                <Input
                  type="date"
                  disabled={!startDate || isPending}
                  min={startDate || undefined}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    if (!e.currentTarget.disabled) {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }
                  }}
                  className={cn(
                    "pl-9 rounded-md border-border/80 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                    !dueDate && "[&::-webkit-datetime-edit]:hidden text-transparent",
                    errors.dueDate && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  {...register("dueDate")}
                />
              </div>
              {errors.dueDate && (
                <p className="text-xs text-destructive mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Project lead (REQUIRED - Owner / Admin Only) */}
          <div className="space-y-1.5 relative">
            <Label className="font-semibold">
              Project lead<span className="text-destructive">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLeadDropdownOpen(!isLeadDropdownOpen);
                setIsMembersDropdownOpen(false);
              }}
              className="w-full h-auto flex items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-left hover:border-primary/50 font-normal cursor-pointer"
            >
              {selectedLead ? (
                <div className="flex items-center gap-2">
                  <span className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedLead.avatarColor}`}>
                    {selectedLead.initials}
                  </span>
                  <span className="font-medium text-foreground">{selectedLead.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedLead.roleColor}`}>
                    {selectedLead.role}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select a project lead</span>
              )}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>

            {/* Dropdown for Lead */}
            {isLeadDropdownOpen && (
              <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover p-1.5 shadow-lg">
                <p className="text-[11px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                  Lead Candidates (Owner & Admins)
                </p>
                {leadEligibleMembers.map((member) => {
                  const isSelected = member.id === selectedLeadId;
                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        setValue("leadId", member.id, { shouldValidate: true });
                        setIsLeadDropdownOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${member.avatarColor}`}>
                          {member.initials}
                        </span>
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${member.roleColor}`}>
                          {member.role}
                        </span>
                      </div>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                  );
                })}
              </div>
            )}
            {errors.leadId && (
              <p className="text-xs text-destructive mt-1">{errors.leadId.message}</p>
            )}
          </div>

          {/* Project members (OPTIONAL) */}
          <div className="space-y-1.5 relative">
            <Label className="font-semibold">
              Project members<span className="text-muted-foreground/70 font-normal">(optional)</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsMembersDropdownOpen(!isMembersDropdownOpen);
                setIsLeadDropdownOpen(false);
              }}
              className="w-full h-auto flex items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-left hover:border-primary/50 font-normal cursor-pointer"
            >
              <span className="text-muted-foreground">
                {selectedMemberIds.length > 0
                  ? `${selectedMemberIds.length} member${selectedMemberIds.length > 1 ? "s" : ""} selected`
                  : "Add members"}
              </span>
              <Plus className="size-4 text-muted-foreground" />
            </Button>

            {/* Dropdown for Members */}
            {isMembersDropdownOpen && (
              <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover p-1.5 shadow-lg">
                <p className="text-[11px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                  Workspace Members
                </p>
                {allMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMemberSelection(member.id)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${member.avatarColor}`}>
                          {member.initials}
                        </span>
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${member.roleColor}`}>
                          {member.role}
                        </span>
                      </div>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Member Chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/50 shadow-2xs transition-all hover:bg-secondary/80"
                  >
                    <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${m.avatarColor}`}>
                      {m.initials}
                    </span>
                    <span>{m.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeMember(m.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted size-4 h-auto w-auto min-w-0"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-brand text-white hover:opacity-90 shadow-glow"
            >
              {isPending ? "Creating..." : "+ Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

