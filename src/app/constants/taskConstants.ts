import { TaskStatus } from "../interfaces";

export const STATUS_CONFIG = {
  PENDING: {
    icon: "⏳",
    color: "primary" as const,
    label: "Pending",
  },
  IN_PROGRESS: {
    icon: "🔄",
    color: "warning" as const,
    label: "In Progress",
  },
  COMPLETED: {
    icon: "✅",
    color: "success" as const,
    label: "Completed",
  },
} as const;

export type StatusConfigKey = keyof typeof STATUS_CONFIG;

export const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
  switch (currentStatus) {
    case "PENDING":
      return "IN_PROGRESS";
    case "IN_PROGRESS":
      return "COMPLETED";
    case "COMPLETED":
      return null;
    default:
      return null;
  }
};

export const canProgressTask = (
  status: TaskStatus,
  dependencies: string[],
  allTasks: Array<{ name: string; status: string }>
): boolean => {
  if (status === "COMPLETED") return false;

  return dependencies.every((depName) => {
    const depTask = allTasks.find((task) => task.name === depName);
    return depTask?.status === "COMPLETED";
  });
};
