"use client";

import React, { useState, useEffect } from 'react'
import { Task } from './Task'
import { initialTasks } from '../data /mocks/mockTasks';

import { Button } from '@mui/material';
import { Form } from './Form';

export type TaskType = {
  name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dependencies: string[];
};

const STORAGE_KEY = 'lumin-tasks';

export const TaskList = () => {
  // Always initialize with initialTasks to prevent hydration mismatch
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks as TaskType[]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration to prevent mismatch
  useEffect(() => {
    setIsHydrated(true);
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }

    // Listen for storage changes to sync with Form component
    const handleStorageChange = () => {
      try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Error syncing tasks from localStorage:', error);
      }
    };

    // Listen for custom event when Form updates localStorage
    window.addEventListener('taskListUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('taskListUpdated', handleStorageChange);
    };
  }, []);

  // Save tasks to localStorage only when status updates occur (not on initial load)
  const saveTasksToStorage = (updatedTasks: TaskType[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
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
      
      // Save to localStorage after status update
      saveTasksToStorage(updatedTasks as TaskType[]);
      return updatedTasks as TaskType[];
    });
  };

  const resetTasks = () => {
    setTasks(initialTasks as TaskType[]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  return (
    <>
    <div className='flex justify-between items-center'>
      <h2 className='text-lg font-bold underline'>Task List</h2>
    </div>
    {tasks.map((task: TaskType) => (
        <Task
          key={task.name}
          {...task}
          status={task.status as "PENDING" | "IN_PROGRESS" | "COMPLETED"}
          allTasks={tasks as TaskType[]}
          onStatusUpdate={handleStatusUpdate as (taskName: string) => void}
        />
    ))}

    <h2 className='text-lg font-bold underline'>Ready to start</h2>
    <ul>
        {tasks
            .filter((task: TaskType) => {
            // Only show tasks that are PENDING and have all dependencies completed
            if (task.status !== "PENDING") return false;
            
            return task.dependencies.every((depName: string) => {
                const depTask: TaskType | undefined = tasks.find((t: TaskType) => t.name === depName);
                return depTask?.status === "COMPLETED";
            });
            })
            .map((task: TaskType) => (
            <li key={task.name}>{task.name}</li>
            ))}
    </ul>
    <Form />
    <Button className='mt-4' variant="contained" color="secondary" onClick={resetTasks}>Reset Tasks</Button>
    
    </>
  )
}
