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
import { initialTasks } from "../data /mocks/mockTasks";

export const Form = () => {
  type Task = {
    name: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    dependencies: string[];
  };

  const STORAGE_KEY = "lumin-tasks";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [name, setName] = useState<string>("");
  const [dependencies, setDependencies] = useState<string[]>([]);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Load initial tasks if no saved tasks exist
        setTasks(initialTasks as Task[]);
        setDependencies([]);
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      // Fallback to initial tasks on error
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
          // If localStorage is cleared (reset), load initial tasks
          setTasks(initialTasks as Task[]);
          setDependencies([]);
        }
      } catch (error) {
        console.error("Error syncing tasks from localStorage:", error);
        // Fallback to initial tasks on error
        setTasks(initialTasks as Task[]);
      }
    };

    window.addEventListener("taskListUpdated", handleTaskListUpdate);

    return () => {
      window.removeEventListener("taskListUpdated", handleTaskListUpdate);
    };
  }, []);

  // Remove automatic localStorage saving - only save when explicitly adding tasks

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let currentTasks: Task[] = [];
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        currentTasks = JSON.parse(savedTasks);
      } else {
        // If no saved tasks, use current component state (which includes initial tasks)
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
        <h3 className="text-xl font-bold mb-4">Add New Task</h3>
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
                      {task.name} ({task.status})
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
