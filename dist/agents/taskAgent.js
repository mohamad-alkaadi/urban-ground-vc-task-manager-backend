"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskAgent = void 0;
const supabase_1 = require("../services/supabase");
exports.taskAgent = {
    async createTask(title, due_date) {
        const { data, error } = await supabase_1.supabase
            .from("tasks")
            .insert([{ title, due_date, status: "pending" }])
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    async getTasks() {
        const { data, error } = await supabase_1.supabase
            .from("tasks")
            .select("*")
            .order("due_date", { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    },
    async updateTask(id, updates) {
        const { data, error } = await supabase_1.supabase
            .from("tasks")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    async deleteTask(id) {
        const { error } = await supabase_1.supabase.from("tasks").delete().eq("id", id);
        if (error)
            throw new Error(error.message);
        return { success: true };
    },
};
//# sourceMappingURL=taskAgent.js.map