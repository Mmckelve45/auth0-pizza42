-- Sessions table for account linking server
-- Stores session data in Postgres instead of memory for serverless compatibility

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- Auto-cleanup old sessions (optional but recommended)
-- DELETE FROM session WHERE expire < NOW();
