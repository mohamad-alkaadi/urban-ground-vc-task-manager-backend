import { supabase } from "../services/supabase";

export const taskAgent = {
  // Create a new task with a title and optional due date, defaulting status to "pending"
  async createTask(title: string, due_date?: string) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, due_date, status: "pending" }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  // Retrieve all tasks, ordered by due date ascending
  async getTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },
  // Update an existing task by its ID and return the updated record
  async updateTask(
    id: number,
    updates: { title?: string; due_date?: string; status?: string },
  ) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  // Delete a task by its ID and return a success confirmation.
  async deleteTask(id: number) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return { success: true };
  },
};
