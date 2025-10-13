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
import { TaskData, TaskStatus } from "../interfaces";
import { STATUS_CONFIG } from "../constants/taskConstants";
import { useTaskActions } from "../hooks/useTaskActions";

interface TaskProps extends TaskData {
  allTasks: TaskData[];
  onStatusUpdate: (taskName: string) => void;
}

export const Task = ({
  name,
  status,
  dependencies,
  allTasks,
  onStatusUpdate,
}: TaskProps) => {
  const { canProgress, buttonConfig } = useTaskActions(
    status as TaskStatus,
    dependencies,
    allTasks
  );

  const handleStatusUpdate = () => {
    if (canProgress) {
      onStatusUpdate(name);
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
              icon={<span>{STATUS_CONFIG[status as TaskStatus].icon}</span>}
              label={status}
              color={STATUS_CONFIG[status as TaskStatus].color}
              variant="filled"
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {dependencies.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                depends on: {dependencies.join(", ")}
              </Typography>
            )}

            <Button
              variant="contained"
              color={STATUS_CONFIG[status as TaskStatus].color}
              onClick={handleStatusUpdate}
              disabled={buttonConfig.disabled}
              size="small"
            >
              {buttonConfig.text}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
