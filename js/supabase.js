import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://nwhjgialubqocbbmbmug.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53aGpnaWFsdWJxb2NiYm1ibXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODMxNjEsImV4cCI6MjA5Mjg1OTE2MX0.il3DW8g9jZdw8yCVytul1_MAjpHFzRjE5Ur6tG8g76M' // paste your anon public key here

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
