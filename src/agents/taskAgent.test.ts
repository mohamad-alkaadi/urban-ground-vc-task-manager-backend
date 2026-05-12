import { describe, it, expect, beforeAll } from "vitest";
import { taskAgent } from "./taskAgent";

describe("Task Agent CRUD", () => {
  it("should create a task successfully", async () => {
    const task = await taskAgent.createTask(
      "Test Task",
      "2026-05-20T10:00:00Z",
    );
    expect(task).toHaveProperty("id");
    expect(task.title).toBe("Test Task");
  });

  it("should fetch tasks as an array", async () => {
    const tasks = await taskAgent.getTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });
});
