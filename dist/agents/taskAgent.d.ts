export declare const taskAgent: {
    createTask(title: string, due_date?: string): Promise<any>;
    getTasks(): Promise<any[]>;
    updateTask(id: number, updates: {
        title?: string;
        due_date?: string;
        status?: string;
    }): Promise<any>;
    deleteTask(id: number): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=taskAgent.d.ts.map