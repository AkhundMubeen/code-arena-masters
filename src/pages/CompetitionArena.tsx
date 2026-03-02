import { useEffect, useState, useCallback } from 'react';
import { useParams, Navigate, useNavigate, useBlocker } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CodeEditor } from '@/components/arena/CodeEditor';
import { Leaderboard } from '@/components/arena/Leaderboard';
import { db } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCompetitionTimer } from '@/hooks/useCompetitionTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Check, Clock, Loader2, Trophy, AlertTriangle, LogOut } from 'lucide-react';
import { Question, Competition, DifficultyLevel, Participant } from '@/lib/supabase-types';

export default function CompetitionArena() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isKicked, setIsKicked] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavPath, setPendingNavPath] = useState<string | null>(null);

  const timer = useCompetitionTimer(competition?.start_time, competition?.duration_minutes);

  // Block navigation while competition is active
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !timer.isExpired && !!participant && !isKicked && currentLocation.pathname !== nextLocation.pathname
  );

  // When blocker triggers, show leave dialog
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setPendingNavPath(blocker.location.pathname);
      setShowLeaveDialog(true);
    }
  }, [blocker.state]);

  // Block browser tab close / refresh
  useEffect(() => {
    if (timer.isExpired || !participant || isKicked) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [timer.isExpired, participant, isKicked]);

  useEffect(() => {
    if (id && user) fetchCompetitionData();
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) return;
    const channel = supabase.channel('participant-status').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'participants', filter: `user_id=eq.${user.id}` }, (payload: any) => {
      if (payload.new.competition_id === id && (payload.new.status === 'kicked' || payload.new.status === 'banned')) setIsKicked(true);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, user]);

  const fetchCompetitionData = async () => {
    if (!id || !user) return;
    try {
      const { data: compData } = await db.from('competitions').select('*').eq('id', id).maybeSingle();
      setCompetition(compData as Competition);

      const { data: partData } = await db.from('participants').select('*').eq('competition_id', id).eq('user_id', user.id).maybeSingle();
      if (!partData) { setIsLoading(false); return; }
      if (partData.status === 'kicked' || partData.status === 'banned') { setIsKicked(true); setIsLoading(false); return; }
      setParticipant(partData as Participant);

      const { data: questionsData } = await db.from('questions').select('*').eq('competition_id', id).order('difficulty', { ascending: true });
      setQuestions((questionsData as Question[]) || []);
      if (questionsData?.length) setSelectedQuestion(questionsData[0] as Question);

      const { data: submissions } = await db.from('submissions').select('question_id, auto_status, manual_status').eq('competition_id', id).eq('user_id', user.id);
      if (submissions) {
        const solved = new Set(submissions.filter((s: any) => s.auto_status === 'pass' || s.manual_status === 'overridden').map((s: any) => s.question_id));
        setSolvedQuestions(solved as Set<string>);
      }
    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyClass = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'beast': return 'difficulty-beast';
    }
  };

  const handleSubmissionResult = (passed: boolean, questionId: string) => {
    if (passed) setSolvedQuestions(prev => new Set([...prev, questionId]));
  };

  const confirmLeave = () => {
    setShowLeaveDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else if (pendingNavPath) {
      navigate(pendingNavPath);
    }
    setPendingNavPath(null);
  };

  const cancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingNavPath(null);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  if (isLoading) return <MainLayout><div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;
  if (isKicked) return <MainLayout><Card className="glass-card max-w-md mx-auto mt-12"><CardContent className="py-12 text-center"><AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" /><h2 className="text-2xl font-display font-bold text-destructive">Access Denied</h2><p className="text-muted-foreground mt-2">You have been removed from this competition</p></CardContent></Card></MainLayout>;
  if (!participant) return <Navigate to="/competitions" replace />;
  if (!competition) return <Navigate to="/competitions" replace />;

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">{competition.title}</h1>
            <p className="text-muted-foreground">{solvedQuestions.size}/{questions.length} problems solved</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Leave button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLeaveDialog(true)}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>

            {/* Timer */}
            <Card className={`glass-card ${timer.isUrgent ? 'border-destructive neon-glow-red' : timer.isExpired ? 'border-muted' : ''}`}>
              <CardContent className="py-3 px-6 flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timer.isUrgent ? 'text-destructive animate-pulse' : timer.isExpired ? 'text-muted-foreground' : 'text-primary'}`} />
                <span className={`font-mono text-2xl font-bold ${timer.isUrgent ? 'text-destructive' : timer.isExpired ? 'text-muted-foreground' : ''}`}>
                  {timer.formatted}
                </span>
                {timer.isExpired && <Badge variant="destructive" className="ml-2">Ended</Badge>}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100vh-12rem)]">
          <Card className="glass-card w-56 shrink-0">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" />Problems</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="p-3 space-y-2">
                  {questions.map((q, index) => (
                    <button key={q.id} onClick={() => setSelectedQuestion(q)} className={`w-full text-left p-2 rounded-lg border transition-all text-sm ${selectedQuestion?.id === q.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium truncate">#{index + 1} {q.title}</span>
                        {solvedQuestions.has(q.id) && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <Badge className={`mt-1 text-xs ${getDifficultyClass(q.difficulty)}`}>{q.difficulty}</Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex-1 min-w-0">
            {selectedQuestion ? <CodeEditor question={selectedQuestion} competitionId={competition.id} onSubmissionResult={(passed) => handleSubmissionResult(passed, selectedQuestion.id)} /> : <Card className="glass-card h-full flex items-center justify-center"><p className="text-muted-foreground">Select a problem to start coding</p></Card>}
          </div>

          <Card className="glass-card w-64 shrink-0"><Leaderboard competitionId={competition.id} /></Card>
        </div>
      </div>

      {/* Leave Competition Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={(open) => { if (!open) cancelLeave(); }}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Leave Competition?
            </DialogTitle>
            <DialogDescription>
              Your progress and submissions will be preserved. You can rejoin using the access code, but the timer will keep running.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={cancelLeave}>Stay</Button>
            <Button variant="destructive" onClick={confirmLeave}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave Competition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
