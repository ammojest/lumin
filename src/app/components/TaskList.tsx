"use client";

import React, { useState, useEffect } from "react";
import { Task } from "./Task";
import { initialTasks } from "../data /mocks/mockTasks";

import {
  Button,
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { Form } from "./Form";

export type TaskType = {
  name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dependencies: string[];
};

const STORAGE_KEY = "lumin-tasks";

export const TaskList = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Only set initial tasks if no saved tasks exist
        setTasks(initialTasks as TaskType[]);
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      // Fallback to initial tasks on error
      setTasks(initialTasks as TaskType[]);
    }

    const handleStorageChange = () => {
      try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error("Error syncing tasks from localStorage:", error);
      }
    };

    window.addEventListener("taskListUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("taskListUpdated", handleStorageChange);
    };
  }, []);

  const saveTasksToStorage = (updatedTasks: TaskType[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  };

  const handleStatusUpdate = (taskName: string) => {
    setTasks((prevTasks: TaskType[]) => {
      const updatedTasks = prevTasks.map((task: TaskType) => {
        if (task.name === taskName) {
          if (task.status === "PENDING") {
            return { ...task, status: "IN_PROGRESS" as const };
          } else if (task.status === "IN_PROGRESS") {
            return { ...task, status: "COMPLETED" as const };
          }
        }
        return task;
      });

      saveTasksToStorage(updatedTasks as TaskType[]);
      return updatedTasks as TaskType[];
    });
  };

  const resetTasks = () => {
    setTasks(initialTasks as TaskType[]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  // Show loading state during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Task Management Dashboard
            </Typography>
          </Box>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Loading tasks...
            </Typography>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Task Management Dashboard
          </Typography>
        </Box>

        {/* Task List Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            All Tasks
          </Typography>
          <Stack spacing={2}>
            {tasks.map((task: TaskType) => (
              <Task
                key={task.name}
                {...task}
                status={task.status as "PENDING" | "IN_PROGRESS" | "COMPLETED"}
                allTasks={tasks as TaskType[]}
                onStatusUpdate={
                  handleStatusUpdate as (taskName: string) => void
                }
              />
            ))}
          </Stack>
        </Paper>

        {/* Ready to Start Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
            Ready to Start
          </Typography>
          <List>
            {tasks
              .filter((task: TaskType) => {
                if (task.status !== "PENDING") return false;
                return task.dependencies.every((depName: string) => {
                  const depTask: TaskType | undefined = tasks.find(
                    (t: TaskType) => t.name === depName
                  );
                  return depTask?.status === "COMPLETED";
                });
              })
              .map((task: TaskType) => (
                <ListItem key={task.name} divider>
                  <ListItemText
                    primary={task.name}
                    secondary="All dependencies completed - ready to start!"
                  />
                </ListItem>
              ))}
            {tasks.filter((task: TaskType) => {
              if (task.status !== "PENDING") return false;
              return task.dependencies.every((depName: string) => {
                const depTask: TaskType | undefined = tasks.find(
                  (t: TaskType) => t.name === depName
                );
                return depTask?.status === "COMPLETED";
              });
            }).length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No tasks ready to start"
                  secondary="Complete dependencies to unlock more tasks"
                />
              </ListItem>
            )}
          </List>
        </Paper>

        {/* Add New Task Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            Add New Task
          </Typography>
          <Form />
        </Paper>

        {/* Actions */}
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="error"
            onClick={resetTasks}
            size="large"
          >
            Reset All Tasks
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};
