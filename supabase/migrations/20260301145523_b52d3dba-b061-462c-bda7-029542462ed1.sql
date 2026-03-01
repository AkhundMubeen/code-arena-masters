
-- Function to award XP for first-time solve of a question
CREATE OR REPLACE FUNCTION public.award_xp_on_solve()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  xp_amount integer;
  question_difficulty difficulty_level;
  already_solved boolean;
BEGIN
  -- Only process passing submissions
  IF NEW.auto_status != 'pass' THEN
    RETURN NEW;
  END IF;

  -- Check if user already solved this question
  SELECT EXISTS(
    SELECT 1 FROM submissions
    WHERE user_id = NEW.user_id
      AND question_id = NEW.question_id
      AND auto_status = 'pass'
      AND id != NEW.id
  ) INTO already_solved;

  IF already_solved THEN
    RETURN NEW;
  END IF;

  -- Get question difficulty
  SELECT difficulty INTO question_difficulty
  FROM questions WHERE id = NEW.question_id;

  -- Calculate XP based on difficulty
  xp_amount := CASE question_difficulty
    WHEN 'easy' THEN 10
    WHEN 'medium' THEN 25
    WHEN 'hard' THEN 50
    WHEN 'beast' THEN 100
    ELSE 0
  END;

  -- Award XP
  UPDATE profiles SET xp = xp + xp_amount WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_award_xp_on_solve
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION public.award_xp_on_solve();
