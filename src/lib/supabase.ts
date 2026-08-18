import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://baslngnfxzexrosegisj.supabase.co';
const supabaseAnonKey =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhc2xuZ25meHpleHJvc2VnaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMzk3MjYsImV4cCI6MjEwMjYxNTcyNn0.70A65HCpFhoDY3sma_BCN8oFi50GDF3NjfPX0wLINgA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);