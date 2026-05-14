"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const taskAgent_1 = require("./taskAgent");
(0, vitest_1.describe)("Task Agent CRUD", () => {
    (0, vitest_1.it)("should create a task successfully", async () => {
        const task = await taskAgent_1.taskAgent.createTask("Test Task", "2026-05-20T10:00:00Z");
        (0, vitest_1.expect)(task).toHaveProperty("id");
        (0, vitest_1.expect)(task.title).toBe("Test Task");
    });
    (0, vitest_1.it)("should fetch tasks as an array", async () => {
        const tasks = await taskAgent_1.taskAgent.getTasks();
        (0, vitest_1.expect)(Array.isArray(tasks)).toBe(true);
    });
});
//# sourceMappingURL=taskAgent.test.js.map