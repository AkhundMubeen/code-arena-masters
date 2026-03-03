import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  solved_count: number;
  earliest_solve_time: number;
  status: 'active' | 'banned' | 'kicked';
}

interface LeaderboardProps {
  competitionId: string;
  totalQuestions?: number;
}

export function Leaderboard({ competitionId, totalQuestions = 10 }: LeaderboardProps) {
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
        .select(`user_id, question_id, auto_status, manual_status, submitted_at`)
        .eq('competition_id', competitionId);
      
      // Fetch participants with their status
      const { data: participants } = await db
        .from('participants')
        .select(`user_id, status`)
        .eq('competition_id', competitionId);

      if (!participants) return;

      // Get unique user IDs from participants
      const userIds = participants.map((p: any) => p.user_id);

      // Fetch profiles separately (no FK needed)
      const { data: profiles } = await db
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      // Create a map of participant info
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

      // Track unique solved questions per user with earliest solve time
      const userStats = new Map<string, { solvedQuestions: Set<string>; earliestSolveTime: number }>();

      for (const sub of submissions) {
        // Check if this submission passed (either auto or manual override)
        const isPassed = sub.auto_status === 'pass' || sub.manual_status === 'overridden';
        if (!isPassed) continue;

        const userId = sub.user_id;
        const questionId = sub.question_id;
        const submitTime = new Date(sub.submitted_at).getTime();

        if (!userStats.has(userId)) {
          userStats.set(userId, { solvedQuestions: new Set(), earliestSolveTime: Infinity });
        }

        const stats = userStats.get(userId)!;
        
        // Only count each question once (unique question_id)
        if (!stats.solvedQuestions.has(questionId)) {
          stats.solvedQuestions.add(questionId);
          // Track the time when they reached their current score
          stats.earliestSolveTime = Math.min(stats.earliestSolveTime, submitTime);
        }
      }

      // Build leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = [];
      
      for (const [userId, stats] of userStats) {
        const participantInfo = participantMap.get(userId);
        leaderboardEntries.push({
          user_id: userId,
          username: participantInfo?.username || 'Unknown',
          solved_count: stats.solvedQuestions.size,
          earliest_solve_time: stats.earliestSolveTime,
          status: participantInfo?.status || 'active',
        });
      }

      // Also include participants who haven't solved anything yet
      for (const [userId, info] of participantMap) {
        if (!userStats.has(userId)) {
          leaderboardEntries.push({
            user_id: userId,
            username: info.username,
            solved_count: 0,
            earliest_solve_time: Infinity,
            status: info.status,
          });
        }
      }

      // Sort: 1. Highest score (desc), 2. Earliest time to reach that score (asc)
      const sorted = leaderboardEntries.sort((a, b) => {
        if (b.solved_count !== a.solved_count) {
          return b.solved_count - a.solved_count;
        }
        return a.earliest_solve_time - b.earliest_solve_time;
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
              <div className="w-8 text-center">#</div>
              <div className="flex-1">Name</div>
              <div className="w-16 text-center">Score</div>
              <div className="w-16 text-center">Status</div>
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
                  className={`flex items-center gap-2 p-2 rounded-lg ${
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
                  <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.username}</p>
                  </div>
                  <Badge variant="outline" className="w-16 justify-center shrink-0">
                    {entry.solved_count}/{totalQuestions}
                  </Badge>
                  <div className="w-16 flex justify-center shrink-0">
                    {getStatusBadge(entry.status) || (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">Active</Badge>
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
