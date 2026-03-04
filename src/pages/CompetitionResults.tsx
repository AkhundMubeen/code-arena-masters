import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Trophy, Medal, Clock, CheckCircle, XCircle, ArrowLeft, Loader2, Crown, Info,
} from 'lucide-react';
import { Competition, Question, DifficultyLevel } from '@/lib/supabase-types';

const PENALTY_MINUTES_PER_WRONG = 20;

interface PlayerResult {
  userId: string;
  username: string;
  department: string | null;
  solved: number;
  totalPenalty: number;
  problems: Record<string, {
    solved: boolean;
    attempts: number;
    solveTimeMin: number | null;
    penaltyMin: number;
  }>;
}

export default function CompetitionResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchResults();
  }, [id]);

  const fetchResults = async () => {
    if (!id) return;
    try {
      const [compRes, questRes, partRes, subRes] = await Promise.all([
        db.from('competitions').select('*').eq('id', id).maybeSingle(),
        db.from('questions').select('*').eq('competition_id', id).order('difficulty', { ascending: true }),
        db.from('participants').select('*').eq('competition_id', id).eq('status', 'active'),
        db.from('submissions').select('*').eq('competition_id', id),
      ]);

      const comp = compRes.data as Competition;
      const qs = (questRes.data as Question[]) || [];
      const participants = partRes.data || [];
      const submissions = subRes.data || [];

      setCompetition(comp);
      setQuestions(qs);

      if (!comp) { setIsLoading(false); return; }

      const contestStart = new Date(comp.start_time).getTime();

      // Fetch profiles
      const userIds = participants.map((p: any) => p.user_id);
      const { data: profiles } = await db.from('profiles').select('user_id, username, department').in('user_id', userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p as { user_id: string; username: string; department: string | null }]));

      // Build results per user
      const playerResults: PlayerResult[] = userIds.map((uid: string) => {
        const profile = profileMap.get(uid);
        const userSubs = submissions.filter((s: any) => s.user_id === uid);

        const problems: PlayerResult['problems'] = {};
        let totalSolved = 0;
        let totalPenalty = 0;

        for (const q of qs) {
          const qSubs = userSubs
            .filter((s: any) => s.question_id === q.id)
            .sort((a: any, b: any) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());

          const firstPass = qSubs.find((s: any) => s.auto_status === 'pass' || s.manual_status === 'overridden');
          const wrongBefore = firstPass
            ? qSubs.filter((s: any) => new Date(s.submitted_at).getTime() < new Date(firstPass.submitted_at).getTime() && s.auto_status === 'fail').length
            : qSubs.filter((s: any) => s.auto_status === 'fail').length;

          const solved = !!firstPass;
          const solveTimeMin = firstPass
            ? Math.floor((new Date(firstPass.submitted_at).getTime() - contestStart) / 60000)
            : null;
          const penaltyMin = solved
            ? (solveTimeMin || 0) + wrongBefore * PENALTY_MINUTES_PER_WRONG
            : 0;

          if (solved) {
            totalSolved++;
            totalPenalty += penaltyMin;
          }

          problems[q.id] = {
            solved,
            attempts: qSubs.length,
            solveTimeMin,
            penaltyMin,
          };
        }

        return {
          userId: uid,
          username: (profile as any)?.username || 'Unknown',
          department: (profile as any)?.department || null,
          solved: totalSolved,
          totalPenalty,
          problems,
        };
      });

      // Sort: most solved desc, then penalty asc
      playerResults.sort((a, b) => b.solved - a.solved || a.totalPenalty - b.totalPenalty);
      setResults(playerResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyClass = (d: DifficultyLevel) => {
    switch (d) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'beast': return 'difficulty-beast';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-warning" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-warning/70" />;
    return <span className="w-5 text-center text-muted-foreground font-mono text-sm">{rank}</span>;
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

  if (!competition) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Competition not found</p>
          <Button className="mt-4" onClick={() => navigate('/competitions')}>Back to Competitions</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate('/competitions')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Trophy className="h-8 w-8 text-warning" />
              {competition.title} — Results
            </h1>
            <p className="text-muted-foreground mt-1">
              {results.length} participants • {questions.length} problems • {competition.duration_minutes} minutes
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 cursor-help">
                <Info className="h-3 w-3" /> ICPC Scoring
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              Ranked by most problems solved. Ties broken by lowest total penalty. Penalty = solve time (min) + 20 min per wrong attempt before first AC.
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Podium for top 3 */}
        {results.length >= 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 0, 2].map((idx) => {
              const player = results[idx];
              if (!player) return <div key={idx} />;
              const rank = idx + 1;
              const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              return (
                <Card
                  key={player.userId}
                  className={`glass-card text-center transition-all ${
                    actualRank === 1
                      ? 'border-warning/50 bg-warning/5 sm:scale-105 sm:-translate-y-2'
                      : actualRank === 2
                      ? 'border-muted-foreground/30 bg-muted/20'
                      : 'border-warning/30 bg-warning/5'
                  }`}
                >
                  <CardContent className="pt-6 pb-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`text-3xl font-bold ${
                        actualRank === 1 ? 'text-warning' : actualRank === 2 ? 'text-muted-foreground' : 'text-warning/70'
                      }`}>
                        #{actualRank}
                      </div>
                      <h3 className="text-lg font-display font-bold">{player.username}</h3>
                      {player.department && (
                        <span className="text-xs text-muted-foreground">{player.department}</span>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{player.solved}/{questions.length}</div>
                          <div className="text-xs text-muted-foreground">Solved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{player.totalPenalty}</div>
                          <div className="text-xs text-muted-foreground">Penalty</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detailed Scoreboard Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Detailed Scoreboard</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-[600px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-12">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Participant</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Solved</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                        <span className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" /> Penalty
                        </span>
                      </th>
                      {questions.map((q, i) => (
                        <th key={q.id} className="text-center py-3 px-3 font-medium text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">
                              <div className="flex flex-col items-center gap-1">
                                <span>P{i + 1}</span>
                                <Badge className={`text-[10px] px-1 py-0 ${getDifficultyClass(q.difficulty)}`}>
                                  {q.difficulty[0].toUpperCase()}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{q.title}</TooltipContent>
                          </Tooltip>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((player, idx) => (
                      <tr
                        key={player.userId}
                        className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                          idx < 3 ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            {getRankIcon(idx + 1)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium">{player.username}</span>
                            {player.department && (
                              <span className="text-xs text-muted-foreground ml-2">{player.department}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-bold text-primary">{player.solved}</span>
                          <span className="text-muted-foreground">/{questions.length}</span>
                        </td>
                        <td className="text-center py-3 px-4 font-mono">{player.totalPenalty}</td>
                        {questions.map((q) => {
                          const prob = player.problems[q.id];
                          if (!prob || prob.attempts === 0) {
                            return (
                              <td key={q.id} className="text-center py-3 px-3">
                                <span className="text-muted-foreground/40">—</span>
                              </td>
                            );
                          }
                          return (
                            <td key={q.id} className="text-center py-3 px-3">
                              <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                  <div className={`inline-flex flex-col items-center gap-0.5 rounded px-2 py-1 ${
                                    prob.solved
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}>
                                    {prob.solved ? (
                                      <CheckCircle className="h-3.5 w-3.5" />
                                    ) : (
                                      <XCircle className="h-3.5 w-3.5" />
                                    )}
                                    <span className="text-[10px] font-mono">
                                      {prob.solved ? `${prob.solveTimeMin}m` : `${prob.attempts}×`}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  {prob.solved ? (
                                    <>Solved in {prob.solveTimeMin} min • {prob.attempts} attempt{prob.attempts > 1 ? 's' : ''} • +{prob.penaltyMin} penalty</>
                                  ) : (
                                    <>{prob.attempts} failed attempt{prob.attempts > 1 ? 's' : ''}</>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr>
                        <td colSpan={4 + questions.length} className="text-center py-8 text-muted-foreground">
                          No participants found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
