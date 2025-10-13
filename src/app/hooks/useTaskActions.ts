import { useMemo } from "react";
import { TaskData, TaskStatus } from "../interfaces";
import { canProgressTask } from "../constants/taskConstants";

export const useTaskActions = (
  status: TaskStatus,
  dependencies: string[],
  allTasks: TaskData[]
) => {
  const canProgress = useMemo(() => {
    return canProgressTask(status, dependencies, allTasks);
  }, [status, dependencies, allTasks]);

  const buttonConfig = useMemo(() => {
    if (!canProgress && status === "PENDING") {
      return {
        text: "🔒 Waiting for dependencies",
        disabled: true,
      };
    }

    switch (status) {
      case "PENDING":
        return {
          text: "Start Task",
          disabled: false,
        };
      case "IN_PROGRESS":
        return {
          text: "Complete Task",
          disabled: false,
        };
      case "COMPLETED":
        return {
          text: "Completed",
          disabled: true,
        };
      default:
        return {
          text: "Action",
          disabled: true,
        };
    }
  }, [status, canProgress]);

  return {
    canProgress,
    buttonConfig,
  };
};
