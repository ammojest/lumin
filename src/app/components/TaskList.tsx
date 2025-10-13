"use client";

import React, { useState, useEffect } from "react";
import { Task } from "./Task";
import { initialTasks } from "../data /mocks/mockTasks";
import { TaskData } from "../interfaces";

import {
  Button,
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import { Form } from "./Form";

const STORAGE_KEY = "lumin-tasks";

export const TaskList = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(initialTasks as TaskData[]);
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      setTasks(initialTasks as TaskData[]);
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

  const saveTasksToStorage = (updatedTasks: TaskData[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  };

  const handleStatusUpdate = (taskName: string) => {
    setTasks((prevTasks: TaskData[]) => {
      const updatedTasks = prevTasks.map((task: TaskData) => {
        if (task.name === taskName) {
          if (task.status === "PENDING") {
            return { ...task, status: "IN_PROGRESS" as const };
          } else if (task.status === "IN_PROGRESS") {
            return { ...task, status: "COMPLETED" as const };
          }
        }
        return task;
      });

      saveTasksToStorage(updatedTasks as TaskData[]);
      return updatedTasks as TaskData[];
    });
  };

  const resetTasks = () => {
    setTasks(initialTasks as TaskData[]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("taskListUpdated"));
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

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
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mb: 3, fontWeight: 600 }}
          >
            All Tasks
          </Typography>
          <Stack spacing={2}>
            {tasks.map((task: TaskData) => (
              <Task
                key={task.name}
                {...task}
                status={task.status as "PENDING" | "IN_PROGRESS" | "COMPLETED"}
                allTasks={tasks as TaskData[]}
                onStatusUpdate={
                  handleStatusUpdate as (taskName: string) => void
                }
              />
            ))}
          </Stack>
        </Paper>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Ready to Start
          </Typography>
          <List>
            {tasks
              .filter((task: TaskData) => {
                if (task.status !== "PENDING") return false;
                return task.dependencies.every((depName: string) => {
                  const depTask: TaskData | undefined = tasks.find(
                    (t: TaskData) => t.name === depName
                  );
                  return depTask?.status === "COMPLETED";
                });
              })
              .map((task: TaskData) => (
                <ListItem key={task.name} divider>
                  <ListItemText
                    primary={task.name}
                    secondary="All dependencies completed - ready to start!"
                  />
                </ListItem>
              ))}
            {tasks.filter((task: TaskData) => {
              if (task.status !== "PENDING") return false;
              return task.dependencies.every((depName: string) => {
                const depTask: TaskData | undefined = tasks.find(
                  (t: TaskData) => t.name === depName
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

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Add New Task
          </Typography>
          <Form />
        </Paper>

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
