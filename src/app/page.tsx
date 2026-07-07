"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.getAllTasks);

  // Helper function to safely format dates
  const formatDate = (date: any) => {
    if (!date) return "No date available";
    try {
      return new Date(date).toDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <main>
      <h1>All Tasks are listed below:</h1>
      <br />
      {tasks?.map((task, index) => (
        <div key={task._id || index}>
          <h2>
            {task.text}:{" "}
            {task.isCompleted ? (
              <span>✅ Completed</span>
            ) : (
              <span>⏳ Incomplete</span>
            )}
          </h2>
          <p>Created at: {formatDate(task.createdAt)}</p>
          {/* Optional: Debug - uncomment to see what's in the task */}
          {/* <pre>{JSON.stringify(task, null, 2)}</pre> */}
        </div>
      ))}
    </main>
  );
}
