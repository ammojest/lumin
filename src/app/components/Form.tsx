import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { initialTasks } from "../data/mocks/mockTasks";

export const Form = () => {
  type Task = {
    name: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    dependencies: string[];
  };

  const STORAGE_KEY = "lumin-tasks";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setIsHydrated] = useState(false);
  const [name, setName] = useState<string>("");
  const [dependencies, setDependencies] = useState<string[]>([]);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(initialTasks as Task[]);
        setDependencies([]);
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      setTasks(initialTasks as Task[]);
    }

    const handleTaskListUpdate = () => {
      try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          setTasks(parsedTasks);
          setDependencies((prev) =>
            prev.filter((dep) =>
              parsedTasks.some((task: Task) => task.name === dep)
            )
          );
        } else {
          setTasks(initialTasks as Task[]);
          setDependencies([]);
        }
      } catch (error) {
        console.error("Error syncing tasks from localStorage:", error);
        setTasks(initialTasks as Task[]);
      }
    };

    window.addEventListener("taskListUpdated", handleTaskListUpdate);

    return () => {
      window.removeEventListener("taskListUpdated", handleTaskListUpdate);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let currentTasks: Task[] = [];
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        currentTasks = JSON.parse(savedTasks);
      } else {
        currentTasks = tasks;
      }
    } catch (error) {
      console.error("Error loading current tasks:", error);
      currentTasks = tasks;
    }

    const taskExists = currentTasks.some(
      (task) => task.name.toLowerCase() === name.toLowerCase()
    );
    if (taskExists) {
      alert("A task with this name already exists!");
      return;
    }

    const taskDependencies = dependencies;

    const newTask: Task = {
      name,
      status: "PENDING",
      dependencies: taskDependencies,
    };

    const updatedTasks = [...currentTasks, newTask];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      window.dispatchEvent(new Event("taskListUpdated"));
    } catch (error) {
      console.error("Error saving new task:", error);
      alert("Failed to save task. Please try again.");
      return;
    }

    setName("");
    setDependencies([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            label="Task Name"
            variant="outlined"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText="Enter a unique name for your task"
          />
          <FormControl fullWidth>
            <InputLabel id="dependencies-label">Dependencies</InputLabel>
            <Select
              labelId="dependencies-label"
              id="dependencies-select"
              multiple
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Dependencies"
            >
              {tasks.length === 0 ? (
                <MenuItem disabled>
                  No tasks available yet. Add some tasks first!
                </MenuItem>
              ) : (
                tasks
                  .filter((task) => task.name !== name)
                  .map((task) => (
                    <MenuItem key={task.name} value={task.name}>
                      {task.name}
                    </MenuItem>
                  ))
              )}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!name.trim()}
          >
            Add Task to List
          </Button>
        </form>
      </div>
    </div>
  );
};
