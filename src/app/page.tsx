import Image from "next/image";
import { TaskList } from "./components/TaskList";

export default function Home() {
  return (
    <div className="font-sans p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
          <TaskList />
      </main>
    </div>
  );
}
