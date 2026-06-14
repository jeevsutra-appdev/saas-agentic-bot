CREATE TABLE IF NOT EXISTS local_db_store (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Disable RLS so the API can read/write without complex policies
ALTER TABLE local_db_store DISABLE ROW LEVEL SECURITY;