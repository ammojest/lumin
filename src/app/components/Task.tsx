"use client";

import { Button } from '@mui/material';
import React from 'react'

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

export const Task = ({ name, status, dependencies, allTasks, onStatusUpdate }: TasksProps) => {
  const handleStatusUpdate = () => {
    if (areAllDependenciesCompleted()) {
      onStatusUpdate(name);
    }
  };

  const areAllDependenciesCompleted = () => {
    return dependencies.every(depName => {
      const depTask = allTasks.find(task => task.name === depName);
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
    }
  } as const;

  const getButtonText = () => {
    if (!areAllDependenciesCompleted() && status === "PENDING") {
      return "🔒 Waiting for dependencies";
    }
    const config = STATUS_CONFIG[status];
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

  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "IN_PROGRESS":
        return "text-amber-600 bg-amber-100 border-amber-200";
      case "COMPLETED":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  return (
    <div className='flex gap-4 items-center my-2 w-full'>
      <p className='text-lg font-medium w-35'>{name}</p>
      <p>-</p>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor()}`}>
        {STATUS_CONFIG[status].icon} {status}
      </span>
      <div className='flex flex-end items-center'>
        <p className='text-lg p-5'>(depends on: {dependencies.join(", ")})</p>
      <Button 
        variant="contained"
        color={STATUS_CONFIG[status].color}
        onClick={handleStatusUpdate}
        disabled={status === "COMPLETED" || !areAllDependenciesCompleted()}
        >
        {getButtonText()}
      </Button>
        </div>
    </div>
  )
}
