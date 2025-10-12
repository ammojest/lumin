import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box } from '@mui/material'
import React, { useState, useEffect } from 'react';

export const Form = () => {

    type Task = {
        name: string;
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
        dependencies: string[];
    };

    const STORAGE_KEY = 'lumin-tasks';
    
    // Always initialize with empty array to prevent hydration mismatch
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [name, setName] = useState<string>('');
    const [dependencies, setDependencies] = useState<string[]>([]);

    // Load from localStorage after hydration to prevent mismatch
    useEffect(() => {
        setIsHydrated(true);
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY);
            if (savedTasks) {
                setTasks(JSON.parse(savedTasks));
            } else {
                // If no saved tasks, reset dependencies as well
                setDependencies([]);
            }
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
        }

        // Listen for task list updates (including resets)
        const handleTaskListUpdate = () => {
            try {
                const savedTasks = localStorage.getItem(STORAGE_KEY);
                if (savedTasks) {
                    const parsedTasks = JSON.parse(savedTasks);
                    setTasks(parsedTasks);
                    // Reset dependencies if any selected dependencies no longer exist
                    setDependencies(prev => 
                        prev.filter(dep => parsedTasks.some((task: Task) => task.name === dep))
                    );
                } else {
                    // If localStorage is cleared (reset), clear everything
                    setTasks([]);
                    setDependencies([]);
                }
            } catch (error) {
                console.error('Error syncing tasks from localStorage:', error);
            }
        };

        window.addEventListener('taskListUpdated', handleTaskListUpdate);
        
        return () => {
            window.removeEventListener('taskListUpdated', handleTaskListUpdate);
        };
    }, []);

    // Save tasks to localStorage whenever tasks change (only after hydration)
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            } catch (error) {
                console.error('Error saving tasks to localStorage:', error);
            }
        }
    }, [tasks, isHydrated]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Always get the latest tasks from localStorage before adding
        let currentTasks: Task[] = [];
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY);
            if (savedTasks) {
                currentTasks = JSON.parse(savedTasks);
            }
        } catch (error) {
            console.error('Error loading current tasks:', error);
            currentTasks = tasks; // Fallback to component state
        }

        // Check if task name already exists in current tasks
        const taskExists = currentTasks.some(task => task.name.toLowerCase() === name.toLowerCase());
        if (taskExists) {
            alert('A task with this name already exists!');
            return;
        }

        // Dependencies are already an array, no need to parse
        const taskDependencies = dependencies;

        // Create new task
        const newTask: Task = {
            name,
            status: "PENDING",
            dependencies: taskDependencies
        };

        // Add to current tasks and save directly to localStorage
        const updatedTasks = [...currentTasks, newTask];
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
            // Update component state to immediately refresh the task dropdown
            setTasks(updatedTasks);
            // Dispatch event to notify TaskList component
            window.dispatchEvent(new Event('taskListUpdated'));
        } catch (error) {
            console.error('Error saving new task:', error);
            alert('Failed to save task. Please try again.');
            return;
        }
        
        // Clear form
        setName('');
        setDependencies([]);
        
    };

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-xl font-bold mb-4'>Add New Task</h3>
                <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                    <TextField
                        label="Task Name"
                        variant="outlined"
                        fullWidth
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
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
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                                    .filter(task => task.name !== name) // Don't allow self-dependency
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
    )
}

