import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Eye, Play, Square, Trash2, Users, Loader2, Copy, Check } from 'lucide-react';
import { Competition, CompetitionStatus, ParticipantWithProfile } from '@/lib/supabase-types';

export function CompetitionManager() {
  const { toast } = useToast();
  
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => { fetchCompetitions(); }, []);
  useEffect(() => { if (selectedCompetition) fetchParticipants(selectedCompetition.id); }, [selectedCompetition]);

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await db.from('competitions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCompetitions((data as Competition[]) || []);
      if (data?.length) setSelectedCompetition(data[0] as Competition);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async (competitionId: string) => {
    try {
      const { data, error } = await db.from('participants').select(`*, profiles:user_id (id, user_id, username, department)`).eq('competition_id', competitionId);
      if (error) throw error;
      setParticipants((data as ParticipantWithProfile[]) || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const updateCompetitionStatus = async (id: string, status: CompetitionStatus) => {
    try {
      const { error } = await db.from('competitions').update({ status }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Status Updated', description: `Competition is now ${status}` });
      fetchCompetitions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const kickParticipant = async (participantId: string) => {
    try {
      const { error } = await db.from('participants').update({ status: 'kicked' }).eq('id', participantId);
      if (error) throw error;
      toast({ title: 'Participant Kicked' });
      if (selectedCompetition) fetchParticipants(selectedCompetition.id);
    } catch (error) {
      console.error('Error kicking participant:', error);
      toast({ title: 'Error', description: 'Failed to kick participant', variant: 'destructive' });
    }
  };

  const copyAccessCode = (code: string) => { navigator.clipboard.writeText(code); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000); };

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case 'live': return <Badge className="bg-destructive/20 text-destructive border-destructive/30">LIVE</Badge>;
      case 'upcoming': return <Badge variant="outline">Upcoming</Badge>;
      case 'ended': return <Badge variant="secondary">Ended</Badge>;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="glass-card">
        <CardHeader><CardTitle>All Battles</CardTitle><CardDescription>Manage your competitions</CardDescription></CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {competitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No competitions yet. Create your first battle!</p>
              ) : (
                competitions.map((comp) => (
                  <div key={comp.id} onClick={() => setSelectedCompetition(comp)} className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedCompetition?.id === comp.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-medium">{comp.title}</h3><p className="text-sm text-muted-foreground">{comp.duration_minutes} min • {new Date(comp.start_time).toLocaleDateString()}</p></div>
                      {getStatusBadge(comp.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedCompetition && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{selectedCompetition.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              Access Code: <code className="bg-secondary px-2 py-1 rounded font-mono">{selectedCompetition.access_code}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyAccessCode(selectedCompetition.access_code)}>
                {copiedCode === selectedCompetition.access_code ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedCompetition.status === 'upcoming' && <Button onClick={() => updateCompetitionStatus(selectedCompetition.id, 'live')} className="bg-destructive hover:bg-destructive/90"><Play className="mr-2 h-4 w-4" />Start Battle</Button>}
              {selectedCompetition.status === 'live' && (
                <>
                  <Button onClick={() => updateCompetitionStatus(selectedCompetition.id, 'ended')} variant="outline"><Square className="mr-2 h-4 w-4" />End Battle</Button>
                  <Button asChild variant="outline" className="border-accent text-accent"><Link to={`/god-view/${selectedCompetition.id}`}><Eye className="mr-2 h-4 w-4" />God View</Link></Button>
                </>
              )}
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3"><Users className="h-4 w-4" />Participants ({participants.filter(p => p.status === 'active').length})</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {participants.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No participants yet</p>
                  ) : (
                    participants.map((p) => (
                      <div key={p.id} className={`flex items-center justify-between p-2 rounded-lg border ${p.status !== 'active' ? 'border-destructive/30 bg-destructive/5 opacity-50' : 'border-border'}`}>
                        <div><p className="font-medium text-sm">{(p.profiles as any)?.username || 'Unknown'}</p><p className="text-xs text-muted-foreground">{(p.profiles as any)?.department || 'No department'}</p></div>
                        {p.status === 'active' ? <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => kickParticipant(p.id)}><Trash2 className="h-4 w-4" /></Button> : <Badge variant="destructive" className="text-xs">{p.status}</Badge>}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
