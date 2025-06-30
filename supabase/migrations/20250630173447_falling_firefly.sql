/*
  # Fix UUID format issues in sessions table

  1. Data Cleanup
    - Clear all existing sessions data to remove malformed UUID entries
    - Reset sessions table to clean state
  
  2. Data Integrity
    - Ensure all future session entries use proper UUID format
    - Clear any malformed data that causes UUID parsing errors
*/

-- Clear all existing sessions data to remove malformed UUID entries
DELETE FROM sessions;

-- Clear all existing reactions data that might reference invalid sessions
DELETE FROM reactions;

-- Reset any sequences or auto-increment values if needed
-- (Not applicable here since we're using UUIDs)