import { supabase } from '@/integrations/supabase/client';

// Helper to bypass strict typing until types regenerate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;
