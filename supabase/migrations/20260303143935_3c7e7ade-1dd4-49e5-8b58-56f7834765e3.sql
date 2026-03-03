-- Allow participants to view all submissions in competitions they're in
CREATE POLICY "Participants can view competition submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.participants
    WHERE participants.competition_id = submissions.competition_id
      AND participants.user_id = auth.uid()
  )
);