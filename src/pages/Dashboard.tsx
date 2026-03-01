import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code2, Trophy, Zap, Target, Clock, Users, ArrowRight, Shield } from 'lucide-react';
import { Competition } from '@/lib/supabase-types';

export default function Dashboard() {
  const { user, profile, isAdmin } = useAuth();
  const [liveCompetitions, setLiveCompetitions] = useState<Competition[]>([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<Competition[]>([]);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [competitionsJoined, setCompetitionsJoined] = useState(0);

  useEffect(() => {
    fetchCompetitions();
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      // Count distinct questions solved (passed)
      const { data: solvedData } = await db
        .from('submissions')
        .select('question_id')
        .eq('user_id', user!.id)
        .eq('auto_status', 'pass');
      
      if (solvedData) {
        const uniqueQuestions = new Set(solvedData.map((s: any) => s.question_id));
        setProblemsSolved(uniqueQuestions.size);
      }

      // Count competitions participated
      const { count } = await db
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      
      setCompetitionsJoined(count || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const { data: live } = await db
        .from('competitions')
        .select('*')
        .eq('status', 'live')
        .order('start_time', { ascending: true })
        .limit(3);

      const { data: upcoming } = await db
        .from('competitions')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_time', { ascending: true })
        .limit(3);

      setLiveCompetitions((live as Competition[]) || []);
      setUpcomingCompetitions((upcoming as Competition[]) || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-wide">
              Welcome back, <span className="text-primary neon-text-green">{profile?.username}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Ready to dominate the leaderboard?</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="neon-glow-green">
              <Link to="/practice"><Code2 className="mr-2 h-4 w-4" />Practice</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/competitions"><Trophy className="mr-2 h-4 w-4" />Competitions</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10">
                <Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin Panel</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-2xl font-bold text-warning">{profile?.xp || 0} XP</p>
                </div>
                <Zap className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Problems Solved</p>
                  <p className="text-2xl font-bold text-primary">{problemsSolved}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Competitions</p>
                  <p className="text-2xl font-bold text-accent">{competitionsJoined}</p>
                </div>
                <Trophy className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="text-lg font-bold truncate">{profile?.department || 'Not Set'}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {liveCompetitions.length > 0 && (
          <Card className="glass-card border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <CardTitle className="text-destructive">LIVE NOW</CardTitle>
              </div>
              <CardDescription>Active competitions you can join</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {liveCompetitions.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div>
                      <h3 className="font-semibold">{comp.title}</h3>
                      <p className="text-sm text-muted-foreground">{comp.duration_minutes} minutes • Started {new Date(comp.start_time).toLocaleTimeString()}</p>
                    </div>
                    <Button asChild size="sm" className="neon-glow-red bg-destructive hover:bg-destructive/90">
                      <Link to={`/competition/${comp.id}`}>Join <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Upcoming Battles</CardTitle>
                <CardDescription>Prepare yourself for these competitions</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/competitions">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingCompetitions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming competitions. Check back later!</p>
            ) : (
              <div className="grid gap-4">
                {upcomingCompetitions.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                    <div>
                      <h3 className="font-semibold">{comp.title}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(comp.start_time).toLocaleDateString()} at {new Date(comp.start_time).toLocaleTimeString()} • {comp.duration_minutes} minutes</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5" />Practice Arena</CardTitle>
            <CardDescription>Sharpen your skills with practice problems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/practice?difficulty=easy" className="p-4 rounded-lg text-center difficulty-easy border transition-transform hover:scale-105">
                <p className="font-bold text-lg">Easy</p>
                <p className="text-sm opacity-70">Beginner</p>
              </Link>
              <Link to="/practice?difficulty=medium" className="p-4 rounded-lg text-center difficulty-medium border transition-transform hover:scale-105">
                <p className="font-bold text-lg">Medium</p>
                <p className="text-sm opacity-70">Intermediate</p>
              </Link>
              <Link to="/practice?difficulty=hard" className="p-4 rounded-lg text-center difficulty-hard border transition-transform hover:scale-105">
                <p className="font-bold text-lg">Hard</p>
                <p className="text-sm opacity-70">Advanced</p>
              </Link>
              <Link to="/practice?difficulty=beast" className="p-4 rounded-lg text-center difficulty-beast border transition-transform hover:scale-105">
                <p className="font-bold text-lg">Beast</p>
                <p className="text-sm opacity-70">Expert</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
