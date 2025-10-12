"use client";

import {
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import React from "react";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

type TaskData = {
  name: string;
  status: string;
  dependencies: string[];
};

type TasksProps = {
  name: string;
  status: TaskStatus;
  dependencies: string[];
  allTasks: TaskData[];
  onStatusUpdate: (taskName: string) => void;
};

export const Task = ({
  name,
  status,
  dependencies,
  allTasks,
  onStatusUpdate,
}: TasksProps) => {
  const handleStatusUpdate = () => {
    if (areAllDependenciesCompleted()) {
      onStatusUpdate(name);
    }
  };

  const areAllDependenciesCompleted = () => {
    return dependencies.every((depName) => {
      const depTask = allTasks.find((task) => task.name === depName);
      return depTask?.status === "COMPLETED";
    });
  };

  const STATUS_CONFIG = {
    PENDING: {
      icon: "⏳",
      color: "primary" as const,
    },
    IN_PROGRESS: {
      icon: "🔄",
      color: "warning" as const,
    },
    COMPLETED: {
      icon: "✅",
      color: "success" as const,
    },
  } as const;

  const getButtonText = () => {
    if (!areAllDependenciesCompleted() && status === "PENDING") {
      return "🔒 Waiting for dependencies";
    }
    switch (status) {
      case "PENDING":
        return `Start Task`;
      case "IN_PROGRESS":
        return `Complete Task`;
      case "COMPLETED":
        return `Completed`;
      default:
        return "Action";
    }
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontWeight: 500, minWidth: 175 }}
            >
              {name}
            </Typography>
            <Chip
              icon={<span>{STATUS_CONFIG[status].icon}</span>}
              label={status}
              color={STATUS_CONFIG[status].color}
              variant="filled"
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {dependencies.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Depends on: {dependencies.join(", ")}
              </Typography>
            )}

            <Button
              variant="contained"
              color={STATUS_CONFIG[status].color}
              onClick={handleStatusUpdate}
              disabled={
                status === "COMPLETED" || !areAllDependenciesCompleted()
              }
              size="small"
            >
              {getButtonText()}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
