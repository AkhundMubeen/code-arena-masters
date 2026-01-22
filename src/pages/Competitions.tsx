import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Clock, Users, ArrowRight, Key, Loader2 } from 'lucide-react';
import { Competition, CompetitionStatus } from '@/lib/supabase-types';

export default function Competitions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCompetitions();
    const channel = supabase.channel('competitions-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, () => fetchCompetitions()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await db.from('competitions').select('*').in('status', ['upcoming', 'live']).order('start_time', { ascending: true });
      if (error) throw error;
      setCompetitions((data as Competition[]) || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWithCode = async () => {
    if (!accessCode.trim() || !user) return;
    setIsJoining(true);
    try {
      const { data: competition, error: compError } = await db.from('competitions').select('*').eq('access_code', accessCode.trim()).maybeSingle();
      if (compError || !competition) {
        toast({ title: 'Invalid Code', description: 'No competition found with this access code', variant: 'destructive' });
        return;
      }
      const { data: existing } = await db.from('participants').select('*').eq('competition_id', competition.id).eq('user_id', user.id).maybeSingle();
      if (existing) {
        if (existing.status === 'banned' || existing.status === 'kicked') {
          toast({ title: 'Access Denied', description: 'You have been removed from this competition', variant: 'destructive' });
          return;
        }
        navigate(`/competition/${competition.id}`);
        return;
      }
      const { error: joinError } = await db.from('participants').insert({ competition_id: competition.id, user_id: user.id, status: 'active' });
      if (joinError) throw joinError;
      toast({ title: 'Joined!', description: `You've joined ${competition.title}` });
      setDialogOpen(false);
      navigate(`/competition/${competition.id}`);
    } catch (error) {
      console.error('Error joining competition:', error);
      toast({ title: 'Error', description: 'Failed to join competition', variant: 'destructive' });
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case 'live': return <Badge className="bg-destructive/20 text-destructive border-destructive/30 animate-pulse"><span className="w-2 h-2 bg-destructive rounded-full mr-2" />LIVE</Badge>;
      case 'upcoming': return <Badge variant="outline">Upcoming</Badge>;
      case 'ended': return <Badge variant="secondary">Ended</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-wide flex items-center gap-3"><Trophy className="h-8 w-8 text-warning" />Competitions</h1>
            <p className="text-muted-foreground mt-1">Join live coding battles and prove your skills</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="neon-glow-green"><Key className="mr-2 h-4 w-4" />Join with Code</Button></DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Enter Access Code</DialogTitle>
                <DialogDescription>Enter the competition access code shared by your host</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="ACCESS-CODE" value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())} className="text-center text-lg tracking-widest font-mono" />
                <Button onClick={handleJoinWithCode} disabled={!accessCode.trim() || isJoining} className="w-full neon-glow-green">
                  {isJoining ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Joining...</> : 'Join Competition'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : competitions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Active Competitions</h3>
              <p className="text-muted-foreground mt-1">Check back later or use an access code to join a private battle</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {competitions.map((comp) => (
              <Card key={comp.id} className={`glass-card transition-all hover:border-primary/50 ${comp.status === 'live' ? 'border-destructive/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{comp.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{comp.duration_minutes} minutes</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" />TBD participants</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(comp.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {comp.status === 'live' ? <span className="text-destructive font-medium">Started {new Date(comp.start_time).toLocaleTimeString()}</span> : <>Starts: {new Date(comp.start_time).toLocaleDateString()} at {new Date(comp.start_time).toLocaleTimeString()}</>}
                    </div>
                    {comp.status === 'live' && (
                      <Button asChild size="sm" className="neon-glow-red bg-destructive hover:bg-destructive/90">
                        <Link to={`/competition/${comp.id}`}>Enter Arena <ArrowRight className="ml-1 h-4 w-4" /></Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
