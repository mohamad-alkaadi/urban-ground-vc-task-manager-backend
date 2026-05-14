import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";
dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL as string) || "";
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY as string) || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Any existing auth configs stay here...

  // Inject the WebSocket transport for realtime connections
  realtime: {
    transport: ws as any,
  },
});
