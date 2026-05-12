import { supabase } from "../services/supabase";

export const taskAgent = {
  async createTask(title: string, due_date?: string) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, due_date, status: "pending" }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  async getTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },
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

  async deleteTask(id: number) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return { success: true };
  },
};
