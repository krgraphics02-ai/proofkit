import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxbkeggeuiqgefymyhyu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4YmtlZ2dldWlxZ2VmeW15aHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjA4MzIsImV4cCI6MjA5NTgzNjgzMn0.RPq4xl0GwSiMtytYj7fNIg09H8_ERnEP35ZyubFW5d0'

export const supabase = createClient(supabaseUrl, supabaseKey)