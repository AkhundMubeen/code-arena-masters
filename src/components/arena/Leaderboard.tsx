import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  solved_count: number;
  total_time_ms: number;
}

interface LeaderboardProps {
  competitionId: string;
}

export function Leaderboard({ competitionId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    subscribeToUpdates();
  }, [competitionId]);

  const fetchLeaderboard = async () => {
    try {
      // Get all successful submissions for this competition
      const { data: submissions } = await (supabase
        .from('submissions' as any)
        .select(`
          user_id,
          question_id,
          auto_status,
          manual_status,
          submitted_at,
          profiles:user_id (username)
        `)
        .eq('competition_id', competitionId) as any);

      if (!submissions) return;

      // Process leaderboard data
      const userStats = new Map<string, LeaderboardEntry>();

      for (const sub of submissions) {
        const isPassed = sub.auto_status === 'pass' || sub.manual_status === 'overridden';
        if (!isPassed) continue;

        const userId = sub.user_id;
        const username = (sub.profiles as any)?.username || 'Unknown';

        if (!userStats.has(userId)) {
          userStats.set(userId, {
            user_id: userId,
            username,
            solved_count: 0,
            total_time_ms: 0,
          });
        }

        const stats = userStats.get(userId)!;
        stats.solved_count += 1;
        stats.total_time_ms += new Date(sub.submitted_at).getTime();
      }

      // Sort by solved count (desc), then by total time (asc)
      const sorted = Array.from(userStats.values()).sort((a, b) => {
        if (b.solved_count !== a.solved_count) {
          return b.solved_count - a.solved_count;
        }
        return a.total_time_ms - b.total_time_ms;
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `competition_id=eq.${competitionId}`,
        },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-300" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="w-4 text-center text-sm text-muted-foreground">{rank}</span>;
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
          <div className="p-3 space-y-1">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4 text-sm">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No submissions yet</p>
            ) : (
              entries.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    index === 0
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : index === 1
                      ? 'bg-gray-400/10 border border-gray-400/30'
                      : index === 2
                      ? 'bg-amber-600/10 border border-amber-600/30'
                      : 'bg-secondary/30'
                  }`}
                >
                  <div className="w-6 flex justify-center">{getRankIcon(index + 1)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.username}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {entry.solved_count} solved
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
