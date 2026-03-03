import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { db } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';
import { useCompetitionTimer } from '@/hooks/useCompetitionTimer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle, Clock, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Competition, SubmissionWithDetails } from '@/lib/supabase-types';
import Editor from '@monaco-editor/react';

export default function GodView() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOverriding, setIsOverriding] = useState(false);

  const timer = useCompetitionTimer(competition?.start_time, competition?.duration_minutes);

  useEffect(() => {
    if (id) { fetchData(); subscribeToSubmissions(); }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const { data: compData } = await db.from('competitions').select('*').eq('id', id).maybeSingle();
      setCompetition(compData as Competition);
      await fetchSubmissions();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!id) return;
    // Fetch submissions without FK joins
    const { data: subsData } = await db.from('submissions').select('*').eq('competition_id', id).order('submitted_at', { ascending: false });
    
    if (!subsData || subsData.length === 0) {
      setSubmissions([]);
      return;
    }

    // Get unique user_ids and question_ids
    const userIds = [...new Set(subsData.map((s: any) => s.user_id))];
    const questionIds = [...new Set(subsData.map((s: any) => s.question_id))];

    // Fetch profiles and questions separately
    const [{ data: profiles }, { data: questions }] = await Promise.all([
      db.from('profiles').select('user_id, username').in('user_id', userIds),
      db.from('questions').select('id, title, difficulty').in('id', questionIds),
    ]);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    const questionMap = new Map((questions || []).map((q: any) => [q.id, q]));

    // Attach profile and question data to submissions
    const enriched = subsData.map((sub: any) => ({
      ...sub,
      profiles: profileMap.get(sub.user_id) || { username: 'Unknown' },
      questions: questionMap.get(sub.question_id) || { title: 'Unknown', difficulty: 'easy' },
    }));

    setSubmissions(enriched as SubmissionWithDetails[]);
  };

  const subscribeToSubmissions = () => {
    if (!id) return;
    const channel = supabase.channel('god-view-submissions').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions', filter: `competition_id=eq.${id}` }, () => fetchSubmissions()).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'submissions', filter: `competition_id=eq.${id}` }, () => fetchSubmissions()).subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const handleForceCorrect = async () => {
    if (!selectedSubmission) return;
    setIsOverriding(true);
    try {
      const { error } = await db.from('submissions').update({ manual_status: 'overridden' }).eq('id', selectedSubmission.id);
      if (error) throw error;
      toast({ title: 'Override Successful', description: 'Submission marked as correct' });
      setSelectedSubmission(null);
      await fetchSubmissions();
    } catch (error) {
      console.error('Error overriding submission:', error);
      toast({ title: 'Error', description: 'Failed to override submission', variant: 'destructive' });
    } finally {
      setIsOverriding(false);
    }
  };

  const getStatusBadge = (sub: SubmissionWithDetails) => {
    if (sub.manual_status === 'overridden') return <Badge className="bg-accent/20 text-accent border-accent/30"><CheckCircle className="h-3 w-3 mr-1" />OVERRIDDEN</Badge>;
    if (sub.auto_status === 'pass') return <Badge className="difficulty-easy"><CheckCircle className="h-3 w-3 mr-1" />PASS</Badge>;
    if (sub.auto_status === 'fail') return <Badge className="difficulty-hard"><XCircle className="h-3 w-3 mr-1" />FAIL</Badge>;
    return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />PENDING</Badge>;
  };

  if (isLoading) return <MainLayout requireAdmin><div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;

  return (
    <MainLayout requireAdmin>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon"><Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Eye className="h-6 w-6 text-accent" />GOD VIEW</h1>
              <p className="text-muted-foreground">{competition?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Card className={`glass-card ${timer.isUrgent ? 'border-destructive neon-glow-red' : timer.isExpired ? 'border-muted' : ''}`}>
              <CardContent className="py-2 px-4 flex items-center gap-2">
                <Clock className={`h-4 w-4 ${timer.isUrgent ? 'text-destructive animate-pulse' : timer.isExpired ? 'text-muted-foreground' : 'text-primary'}`} />
                <span className={`font-mono text-lg font-bold ${timer.isUrgent ? 'text-destructive' : timer.isExpired ? 'text-muted-foreground' : ''}`}>
                  {timer.formatted}
                </span>
                {timer.isExpired && <Badge variant="destructive" className="text-xs">Ended</Badge>}
              </CardContent>
            </Card>
            <Button onClick={fetchSubmissions} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />Live Submissions</CardTitle>
            <CardDescription>Real-time feed of all submissions. Click on a failed submission to review and override.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {submissions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No submissions yet. Waiting for participants...</p>
                ) : (
                  submissions.map((sub) => (
                    <div key={sub.id} className={`p-4 rounded-lg border transition-all ${sub.auto_status === 'fail' && sub.manual_status !== 'overridden' ? 'border-destructive/50 bg-destructive/5 cursor-pointer hover:bg-destructive/10' : 'border-border bg-secondary/20'}`} onClick={() => { if (sub.auto_status === 'fail' && sub.manual_status !== 'overridden') setSelectedSubmission(sub); }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{(sub.profiles as any)?.username || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{(sub.questions as any)?.title || 'Unknown Question'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="font-mono">{sub.language.toUpperCase()}</Badge>
                          {getStatusBadge(sub)}
                          <span className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="glass-card max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>{(selectedSubmission?.profiles as any)?.username} - {(selectedSubmission?.questions as any)?.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                <Editor height="100%" language={selectedSubmission?.language === 'cpp' ? 'cpp' : selectedSubmission?.language} value={selectedSubmission?.code || ''} theme="vs-dark" options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
                <Button onClick={handleForceCorrect} disabled={isOverriding} className="bg-accent hover:bg-accent/90">
                  {isOverriding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Overriding...</> : <><CheckCircle className="mr-2 h-4 w-4" />Force Mark Correct</>}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
