"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  // const tasks = useQuery(api.tasks.getAllTasks);

  // // Helper function to safely format dates
  // const formatDate = (date: any) => {
  //   if (!date) return "No date available";
  //   try {
  //     return new Date(date).toDateString();
  //   } catch (error) {
  //     return "Invalid date";
  //   }
  // };

  return <h1>Hello from NextJS Frontend</h1>;
}
