// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dqtpjqmaoagdwxcjcsap.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdHBqcW1hb2FnZHd4Y2pjc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTk4NzcsImV4cCI6MjA2NTQ5NTg3N30.MRnTLA1UKYVSR3fk511xca5YOPxcO1qWh2nyjNbPkG4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);