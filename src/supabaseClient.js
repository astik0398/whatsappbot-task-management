import { createClient } from "@supabase/supabase-js"

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bWp6bWd2eGJvdHpmcWhpZHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMDUyNDQsImV4cCI6MjA1Mzg4MTI0NH0.IZMWBEoqdQ0gM4sFFHL_O9iSpkEXvmNASj0rkoELZt8"
const SUPABASE_URL = "https://rxmjzmgvxbotzfqhidzd.supabase.co"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase