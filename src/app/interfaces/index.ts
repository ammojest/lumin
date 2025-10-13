export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface TaskData {
  name: string;
  status: TaskStatus;
  dependencies: string[];
}
