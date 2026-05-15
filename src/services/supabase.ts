import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";
dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL as string) || "";
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY as string) || "";

// Initialize the Supabase client with WebSocket support for real-time features, which will be used by the taskAgent to interact with the "tasks" table in the database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    transport: ws as any,
  },
});
