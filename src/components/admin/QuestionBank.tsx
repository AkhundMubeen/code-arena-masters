import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { Question, DifficultyLevel } from '@/lib/supabase-types';

export function QuestionBank() {
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [hiddenInput, setHiddenInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await db.from('questions').select('*').is('competition_id', null).order('created_at', { ascending: false });
      if (error) throw error;
      setQuestions((data as Question[]) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !expectedOutput.trim()) { toast({ title: 'Missing Fields', description: 'Please fill in all required fields', variant: 'destructive' }); return; }
    setIsCreating(true);
    try {
      const { error } = await db.from('questions').insert({ title: title.trim(), description: description.trim(), difficulty, hidden_input: hiddenInput, expected_output: expectedOutput.trim(), competition_id: null });
      if (error) throw error;
      toast({ title: 'Question Created!', description: 'Added to the practice question bank' });
      setTitle(''); setDescription(''); setDifficulty('easy'); setHiddenInput(''); setExpectedOutput(''); setDialogOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
      toast({ title: 'Error', description: 'Failed to create question', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from('questions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Question Deleted' });
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({ title: 'Error', description: 'Failed to delete question', variant: 'destructive' });
    }
  };

  const getDifficultyClass = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'beast': return 'difficulty-beast';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle>Practice Question Bank</CardTitle><CardDescription>Manage practice problems available to all users</CardDescription></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="neon-glow-green"><PlusCircle className="mr-2 h-4 w-4" />Add Question</Button></DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader><DialogTitle>Add Practice Question</DialogTitle><DialogDescription>Create a new question for the practice arena</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Title</Label><Input placeholder="e.g., Two Sum" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(val) => setDifficulty(val as DifficultyLevel)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem><SelectItem value="beast">Beast</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe the problem in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Hidden Input (stdin)</Label><Textarea placeholder="Test input..." value={hiddenInput} onChange={(e) => setHiddenInput(e.target.value)} rows={3} className="font-mono text-sm" /></div>
                  <div className="space-y-2"><Label>Expected Output</Label><Textarea placeholder="Expected output..." value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} rows={3} className="font-mono text-sm" /></div>
                </div>
                <Button onClick={handleCreate} disabled={isCreating} className="w-full neon-glow-green">
                  {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Question'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No practice questions yet. Add your first question!</p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20">
                  <div>
                    <h3 className="font-medium">{q.title}</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{q.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getDifficultyClass(q.difficulty)}>{q.difficulty}</Badge>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
