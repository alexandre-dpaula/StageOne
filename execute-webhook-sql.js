const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://tzdraygdkeudxgtpoetp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZHJheWdka2V1ZHhndHBvZXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg2MTgxMiwiZXhwIjoyMDgwNDM3ODEyfQ.MEV6UbhAIj5LzABQsnAzyz8e4o2V0l6fn9b01AlW5oM'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

async function executeSql() {
  const sql = fs.readFileSync('create-webhook-events-table.sql', 'utf8')

  // Split by semicolon and execute each statement
  const statements = sql.split(';').filter(s => s.trim())

  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.trim().substring(0, 100) + '...')

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement.trim()
      })

      if (error) {
        console.error('Error:', error)
      } else {
        console.log('Success!')
      }
    }
  }
}

executeSql().catch(console.error)
