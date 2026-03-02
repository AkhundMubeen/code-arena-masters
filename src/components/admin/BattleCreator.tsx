import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Trash2, Library, Search } from 'lucide-react';
import { DifficultyLevel, Question } from '@/lib/supabase-types';

interface QuestionInput {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  hidden_input: string;
  expected_output: string;
  default_code_python?: string;
  default_code_java?: string;
  default_code_cpp?: string;
}

export function BattleCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState([60]);
  const [startTime, setStartTime] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Existing questions picker
  const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<DifficultyLevel | 'all'>('all');
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const fetchExistingQuestions = async () => {
    setIsLoadingExisting(true);
    try {
      const { data, error } = await db
        .from('questions')
        .select('*')
        .is('competition_id', null)
        .order('difficulty', { ascending: true });
      if (error) throw error;
      setExistingQuestions((data as Question[]) || []);
    } catch (error) {
      console.error('Error fetching existing questions:', error);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  useEffect(() => {
    if (pickerOpen) fetchExistingQuestions();
  }, [pickerOpen]);

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const addQuestion = () => setQuestions([...questions, { title: '', description: '', difficulty: 'easy', hidden_input: '', expected_output: '' }]);
  const updateQuestion = (index: number, field: keyof QuestionInput, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

  const toggleSelectQuestion = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const filtered = getFilteredQuestions();
    const allSelected = filtered.every(q => selectedIds.has(q.id));
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(q => next.delete(q.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(q => next.add(q.id));
        return next;
      });
    }
  };

  const addSelectedQuestions = () => {
    const selected = existingQuestions.filter(q => selectedIds.has(q.id));
    const mapped: QuestionInput[] = selected.map(q => ({
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      hidden_input: q.hidden_input,
      expected_output: q.expected_output,
      default_code_python: q.default_code_python,
      default_code_java: q.default_code_java,
      default_code_cpp: q.default_code_cpp,
    }));
    setQuestions(prev => [...prev, ...mapped]);
    toast({ title: `${selected.length} question(s) added`, description: 'You can still add custom questions too' });
    setSelectedIds(new Set());
    setPickerOpen(false);
  };

  const getFilteredQuestions = () => {
    return existingQuestions.filter(q => {
      const matchesSearch = !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = diffFilter === 'all' || q.difficulty === diffFilter;
      return matchesSearch && matchesDiff;
    });
  };

  const getDifficultyClass = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'beast': return 'difficulty-beast';
    }
  };

  const handleCreate = async () => {
    if (!user || !title.trim() || !startTime) { toast({ title: 'Missing Fields', description: 'Please fill in all required fields', variant: 'destructive' }); return; }
    if (questions.length === 0) { toast({ title: 'No Questions', description: 'Add at least one question to the competition', variant: 'destructive' }); return; }

    setIsCreating(true);
    try {
      const accessCode = generateAccessCode();
      const { data: competition, error: compError } = await db.from('competitions').insert({ title: title.trim(), host_id: user.id, start_time: new Date(startTime).toISOString(), duration_minutes: duration[0], status: 'upcoming', access_code: accessCode }).select().single();
      if (compError) throw compError;

      const questionsToInsert = questions.map((q) => ({
        competition_id: competition.id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        hidden_input: q.hidden_input,
        expected_output: q.expected_output,
        default_code_python: q.default_code_python,
        default_code_java: q.default_code_java,
        default_code_cpp: q.default_code_cpp,
      }));
      const { error: questionsError } = await db.from('questions').insert(questionsToInsert);
      if (questionsError) throw questionsError;

      toast({ title: 'Competition Created!', description: `Access Code: ${accessCode}` });
      setTitle(''); setDuration([60]); setStartTime(''); setQuestions([]);
    } catch (error) {
      console.error('Error creating competition:', error);
      toast({ title: 'Error', description: 'Failed to create competition', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader><CardTitle>Create New Battle</CardTitle><CardDescription>Set up a new coding competition</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="title">Competition Title</Label><Input id="title" placeholder="e.g., UNI Coding Championship 2024" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="startTime">Start Time</Label><Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label>Duration: {duration[0]} minutes</Label>
            <Slider value={duration} onValueChange={setDuration} min={30} max={240} step={15} className="py-4" />
            <div className="flex justify-between text-xs text-muted-foreground"><span>30 min</span><span>4 hours</span></div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Questions ({questions.length})</CardTitle><CardDescription>Add problems from the question bank or create custom ones</CardDescription></div>
            <div className="flex gap-2">
              <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Library className="mr-2 h-4 w-4" />Pick from Bank</Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-2xl max-h-[85vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Pick from Question Bank</DialogTitle>
                    <DialogDescription>Select existing practice questions to add to this battle</DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Select value={diffFilter} onValueChange={(val) => setDiffFilter(val as DifficultyLevel | 'all')}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="beast">Beast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isLoadingExisting ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between py-2">
                        <Button variant="ghost" size="sm" onClick={selectAll}>
                          {filteredQuestions.length > 0 && filteredQuestions.every(q => selectedIds.has(q.id)) ? 'Deselect All' : 'Select All'} ({filteredQuestions.length})
                        </Button>
                        <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                      </div>
                      <ScrollArea className="flex-1 max-h-[400px] border rounded-lg">
                        <div className="space-y-1 p-2">
                          {filteredQuestions.map((q) => (
                            <label
                              key={q.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-secondary/40 ${selectedIds.has(q.id) ? 'bg-primary/10 border border-primary/30' : 'border border-transparent'}`}
                            >
                              <Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggleSelectQuestion(q.id)} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{q.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{q.description.slice(0, 80)}...</p>
                              </div>
                              <Badge className={getDifficultyClass(q.difficulty)} variant="outline">{q.difficulty}</Badge>
                            </label>
                          ))}
                          {filteredQuestions.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No questions found</p>
                          )}
                        </div>
                      </ScrollArea>
                      <Button onClick={addSelectedQuestions} disabled={selectedIds.size === 0} className="w-full neon-glow-green">
                        Add {selectedIds.size} Question{selectedIds.size !== 1 ? 's' : ''} to Battle
                      </Button>
                    </>
                  )}
                </DialogContent>
              </Dialog>
              <Button onClick={addQuestion} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" />Custom Question</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No questions added yet. Pick from the bank or create custom ones.</p>
          ) : (
            questions.map((q, index) => (
              <Card key={index} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Question #{index + 1}</CardTitle>
                      <Badge className={getDifficultyClass(q.difficulty)} variant="outline">{q.difficulty}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeQuestion(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Title</Label><Input placeholder="e.g., Two Sum" value={q.title} onChange={(e) => updateQuestion(index, 'title', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Difficulty</Label>
                      <Select value={q.difficulty} onValueChange={(val) => updateQuestion(index, 'difficulty', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem><SelectItem value="beast">Beast</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe the problem..." value={q.description} onChange={(e) => updateQuestion(index, 'description', e.target.value)} rows={3} /></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Hidden Input (stdin)</Label><Textarea placeholder="Test input..." value={q.hidden_input} onChange={(e) => updateQuestion(index, 'hidden_input', e.target.value)} rows={2} className="font-mono text-sm" /></div>
                    <div className="space-y-2"><Label>Expected Output</Label><Textarea placeholder="Expected output..." value={q.expected_output} onChange={(e) => updateQuestion(index, 'expected_output', e.target.value)} rows={2} className="font-mono text-sm" /></div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Button onClick={handleCreate} disabled={isCreating} className="w-full neon-glow-green" size="lg">
        {isCreating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating Battle...</> : <><PlusCircle className="mr-2 h-5 w-5" />Create Battle</>}
      </Button>
    </div>
  );
}
