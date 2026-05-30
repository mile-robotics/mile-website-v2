-- Add structured multi-select columns for Q6 follow-up (replacing open-text)
-- Existing q6_data_open column is retained for backward compatibility with existing data.
ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS q6_approaches text[],
  ADD COLUMN IF NOT EXISTS q6_approaches_other text;
