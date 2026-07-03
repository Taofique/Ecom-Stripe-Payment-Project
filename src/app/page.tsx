"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
export default function Home() {
  const tasks = useQuery(api.tasks.getAllTasks);

  return (
    <main>
      <h1>All Tasks are listed below:</h1>
      <br></br>
      {tasks?.map((task) => (
        <div>
          <h2>
            {task.text}:{" "}
            {task.isCompleted ? (
              <span>✅ Completed</span>
            ) : (
              <span>⏳ Incomplete</span>
            )}
          </h2>
        </div>
      ))}
    </main>
  );
}
