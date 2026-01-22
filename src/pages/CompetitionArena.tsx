import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CodeEditor } from '@/components/arena/CodeEditor';
import { Leaderboard } from '@/components/arena/Leaderboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Clock, Loader2, Trophy, AlertTriangle } from 'lucide-react';
import { Question, Competition, DifficultyLevel, Participant } from '@/lib/supabase-types';

export default function CompetitionArena() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchCompetitionData();
    }
  }, [id, user]);

  // Countdown timer
  useEffect(() => {
    if (!competition) return;

    const endTime = new Date(competition.start_time).getTime() + competition.duration_minutes * 60 * 1000;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [competition]);

  // Subscribe to participant status changes (for kick detection)
  useEffect(() => {
    if (!id || !user) return;

    const channel = supabase
      .channel('participant-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'participants',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new.competition_id === id) {
            if (payload.new.status === 'kicked' || payload.new.status === 'banned') {
              setIsKicked(true);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const fetchCompetitionData = async () => {
    if (!id || !user) return;

    try {
      // Fetch competition
      const { data: compData, error: compError } = await (supabase
        .from('competitions' as any)
        .select('*')
        .eq('id', id)
        .single() as any);

      if (compError) throw compError;
      setCompetition(compData as Competition);

      // Fetch participant status
      const { data: partData, error: partError } = await (supabase
        .from('participants' as any)
        .select('*')
        .eq('competition_id', id)
        .eq('user_id', user.id)
        .single() as any);

      if (partError) {
        // Not a participant - should join first
        setIsLoading(false);
        return;
      }

      if (partData.status === 'kicked' || partData.status === 'banned') {
        setIsKicked(true);
        setIsLoading(false);
        return;
      }

      setParticipant(partData as Participant);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await (supabase
        .from('questions' as any)
        .select('*')
        .eq('competition_id', id)
        .order('difficulty', { ascending: true }) as any);

      if (questionsError) throw questionsError;
      setQuestions((questionsData as Question[]) || []);
      if (questionsData && questionsData.length > 0) {
        setSelectedQuestion(questionsData[0] as Question);
      }

      // Fetch solved questions
      const { data: submissions } = await (supabase
        .from('submissions' as any)
        .select('question_id, auto_status, manual_status')
        .eq('competition_id', id)
        .eq('user_id', user.id) as any);

      if (submissions) {
        const solved = new Set(
          submissions
            .filter((s: any) => s.auto_status === 'pass' || s.manual_status === 'overridden')
            .map((s: any) => s.question_id)
        );
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
      default: return '';
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmissionResult = (passed: boolean, questionId: string) => {
    if (passed) {
      setSolvedQuestions(prev => new Set([...prev, questionId]));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (isKicked) {
    return (
      <MainLayout>
        <Card className="glass-card max-w-md mx-auto mt-12">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-display font-bold text-destructive">Access Denied</h2>
            <p className="text-muted-foreground mt-2">
              You have been removed from this competition
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!participant) {
    return <Navigate to="/competitions" replace />;
  }

  if (!competition) {
    return <Navigate to="/competitions" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header with timer */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">{competition.title}</h1>
            <p className="text-muted-foreground">
              {solvedQuestions.size}/{questions.length} problems solved
            </p>
          </div>
          <Card className={`glass-card ${timeLeft < 300000 ? 'border-destructive neon-glow-red' : ''}`}>
            <CardContent className="py-3 px-6 flex items-center gap-2">
              <Clock className={`h-5 w-5 ${timeLeft < 300000 ? 'text-destructive' : 'text-primary'}`} />
              <span className={`font-mono text-2xl font-bold ${timeLeft < 300000 ? 'text-destructive' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Main Arena Layout */}
        <div className="flex gap-4 h-[calc(100vh-12rem)]">
          {/* Question List - Left Sidebar */}
          <Card className="glass-card w-56 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                Problems
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="p-3 space-y-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className={`w-full text-left p-2 rounded-lg border transition-all text-sm ${
                        selectedQuestion?.id === q.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium truncate">
                          #{index + 1} {q.title}
                        </span>
                        {solvedQuestions.has(q.id) && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      <Badge className={`mt-1 text-xs ${getDifficultyClass(q.difficulty)}`}>
                        {q.difficulty}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Code Editor - Center */}
          <div className="flex-1 min-w-0">
            {selectedQuestion ? (
              <CodeEditor
                question={selectedQuestion}
                competitionId={competition.id}
                onSubmissionResult={(passed) => handleSubmissionResult(passed, selectedQuestion.id)}
              />
            ) : (
              <Card className="glass-card h-full flex items-center justify-center">
                <p className="text-muted-foreground">Select a problem to start coding</p>
              </Card>
            )}
          </div>

          {/* Leaderboard - Right Sidebar */}
          <Card className="glass-card w-64 shrink-0">
            <Leaderboard competitionId={competition.id} />
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
