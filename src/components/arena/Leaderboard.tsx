import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy, Medal, Award, Clock } from 'lucide-react';

const PENALTY_MINUTES_PER_WRONG = 20;

interface LeaderboardEntry {
  user_id: string;
  username: string;
  solved_count: number;
  total_penalty: number; // total time in minutes (ICPC-style)
  wrong_attempts: number;
  status: 'active' | 'banned' | 'kicked';
}

interface LeaderboardProps {
  competitionId: string;
  totalQuestions?: number;
  contestStartTime?: string; // ISO string of competition start
}

export function Leaderboard({ competitionId, totalQuestions = 10, contestStartTime }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const cleanup = subscribeToUpdates();
    return cleanup;
  }, [competitionId]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch all submissions for this competition
      const { data: submissions } = await db
        .from('submissions')
        .select('user_id, question_id, auto_status, manual_status, submitted_at')
        .eq('competition_id', competitionId);

      // Fetch participants
      const { data: participants } = await db
        .from('participants')
        .select('user_id, status')
        .eq('competition_id', competitionId);

      if (!participants) return;

      // Fetch contest start time if not provided
      let startMs: number;
      if (contestStartTime) {
        startMs = new Date(contestStartTime).getTime();
      } else {
        const { data: comp } = await db
          .from('competitions')
          .select('start_time')
          .eq('id', competitionId)
          .maybeSingle();
        startMs = comp ? new Date(comp.start_time).getTime() : 0;
      }

      // Fetch profiles
      const userIds = participants.map((p: any) => p.user_id);
      const { data: profiles } = await db
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      const profileMap = new Map<string, string>();
      if (profiles) {
        for (const p of profiles) {
          profileMap.set(p.user_id, p.username);
        }
      }

      const participantMap = new Map<string, { username: string; status: 'active' | 'banned' | 'kicked' }>();
      for (const p of participants) {
        participantMap.set(p.user_id, {
          username: profileMap.get(p.user_id) || 'Unknown',
          status: p.status as 'active' | 'banned' | 'kicked',
        });
      }

      // ICPC-style scoring:
      // For each solved question: time = minutes from contest start to first accepted submission
      // + 20 min penalty per wrong submission BEFORE the accepted one
      // Total penalty = sum of time for all solved questions

      // Group submissions by user → question
      const userQuestionSubs = new Map<string, Map<string, { wrongCount: number; solvedAt: number | null }>>();

      if (submissions) {
        // Sort by submitted_at ascending to process in order
        const sorted = [...submissions].sort(
          (a: any, b: any) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        );

        for (const sub of sorted) {
          const userId = sub.user_id;
          const questionId = sub.question_id;
          const isPassed = sub.auto_status === 'pass' || sub.manual_status === 'overridden';
          const submitTime = new Date(sub.submitted_at).getTime();

          if (!userQuestionSubs.has(userId)) {
            userQuestionSubs.set(userId, new Map());
          }
          const userMap = userQuestionSubs.get(userId)!;

          if (!userMap.has(questionId)) {
            userMap.set(questionId, { wrongCount: 0, solvedAt: null });
          }
          const qStats = userMap.get(questionId)!;

          // Only count submissions before the first accepted one
          if (qStats.solvedAt !== null) continue;

          if (isPassed) {
            qStats.solvedAt = submitTime;
          } else {
            qStats.wrongCount++;
          }
        }
      }

      // Build leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = [];

      for (const [userId, info] of participantMap) {
        const userMap = userQuestionSubs.get(userId);
        let solvedCount = 0;
        let totalPenalty = 0;
        let totalWrongAttempts = 0;

        if (userMap) {
          for (const [, qStats] of userMap) {
            if (qStats.solvedAt !== null) {
              solvedCount++;
              // Time from contest start in minutes
              const solveMinutes = Math.floor((qStats.solvedAt - startMs) / 60000);
              // Add penalty for wrong attempts
              totalPenalty += solveMinutes + qStats.wrongCount * PENALTY_MINUTES_PER_WRONG;
              totalWrongAttempts += qStats.wrongCount;
            }
          }
        }

        leaderboardEntries.push({
          user_id: userId,
          username: info.username,
          solved_count: solvedCount,
          total_penalty: totalPenalty,
          wrong_attempts: totalWrongAttempts,
          status: info.status,
        });
      }

      // Sort: 1. Most problems solved (desc), 2. Lowest total penalty (asc)
      const sorted = leaderboardEntries.sort((a, b) => {
        if (b.solved_count !== a.solved_count) {
          return b.solved_count - a.solved_count;
        }
        return a.total_penalty - b.total_penalty;
      });

      setEntries(sorted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `competition_id=eq.${competitionId}` }, () => fetchLeaderboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `competition_id=eq.${competitionId}` }, () => fetchLeaderboard())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-4 w-4 text-warning" />;
      case 2: return <Medal className="h-4 w-4 text-muted-foreground" />;
      case 3: return <Award className="h-4 w-4 text-accent" />;
      default: return <span className="w-4 text-center text-sm text-muted-foreground">{rank}</span>;
    }
  };

  const getStatusBadge = (status: 'active' | 'banned' | 'kicked') => {
    switch (status) {
      case 'banned':
        return <Badge variant="destructive" className="text-xs">Banned</Badge>;
      case 'kicked':
        return <Badge variant="outline" className="text-xs text-muted-foreground">Kicked</Badge>;
      default:
        return null;
    }
  };

  const formatPenalty = (minutes: number) => {
    if (minutes === 0) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          {/* Header row */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="w-6 text-center">#</div>
              <div className="flex-1">Name</div>
              <div className="w-12 text-center">Solved</div>
              <div className="w-14 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Time
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-48">
                      ICPC-style: Sum of solve times from contest start + {PENALTY_MINUTES_PER_WRONG}min penalty per wrong attempt
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          
          <div className="p-3 space-y-1">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4 text-sm">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No participants yet</p>
            ) : (
              entries.map((entry, index) => (
                <div 
                  key={entry.user_id} 
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    entry.status !== 'active' 
                      ? 'bg-destructive/10 opacity-60' 
                      : index === 0 
                        ? 'bg-warning/10 border border-warning/30' 
                        : index === 1 
                          ? 'bg-muted/30 border border-muted/50' 
                          : index === 2 
                            ? 'bg-accent/10 border border-accent/30' 
                            : 'bg-secondary/30'
                  }`}
                >
                  <div className="w-6 flex justify-center">{getRankIcon(index + 1)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.username}</p>
                    {entry.wrong_attempts > 0 && (
                      <p className="text-xs text-destructive/70">
                        +{entry.wrong_attempts * PENALTY_MINUTES_PER_WRONG}m penalty
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="w-12 justify-center shrink-0 font-mono text-xs">
                    {entry.solved_count}/{totalQuestions}
                  </Badge>
                  <div className="w-14 text-center shrink-0">
                    {entry.solved_count > 0 ? (
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatPenalty(entry.total_penalty)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
