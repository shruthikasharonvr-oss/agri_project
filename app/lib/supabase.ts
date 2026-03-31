import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://redfeurgszxuqfwrurvc.supabase.co"
const supabaseKey = "sb_publishable_5FI1mgBvAg5-fZu1ppPVvA_ftb_1J9B"

export const supabase = createClient(supabaseUrl, supabaseKey)