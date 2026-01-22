import { supabase } from '@/integrations/supabase/client';

// Bypass strict typing until Supabase types regenerate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;
