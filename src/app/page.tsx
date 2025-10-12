"use client";

import { TaskList } from "./components/TaskList";
import { useState, useEffect } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="font-sans p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        {isClient ? (
          <TaskList />
        ) : (
          <div className="flex justify-center items-center min-h-screen">
            <p>Loading Task Management Dashboard...</p>
          </div>
        )}
      </main>
    </div>
  );
}
