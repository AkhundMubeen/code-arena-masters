import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { DifficultyLevel } from '@/lib/supabase-types';

interface QuestionInput {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  hidden_input: string;
  expected_output: string;
}

export function BattleCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState([60]);
  const [startTime, setStartTime] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: '',
        description: '',
        difficulty: 'easy',
        hidden_input: '',
        expected_output: '',
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof QuestionInput, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!user || !title.trim() || !startTime) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: 'No Questions',
        description: 'Add at least one question to the competition',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const accessCode = generateAccessCode();

      // Create competition
      const { data: competition, error: compError } = await (supabase
        .from('competitions' as any)
        .insert({
          title: title.trim(),
          host_id: user.id,
          start_time: new Date(startTime).toISOString(),
          duration_minutes: duration[0],
          status: 'upcoming',
          access_code: accessCode,
        })
        .select()
        .single() as any);

      if (compError) throw compError;

      // Create questions
      const questionsToInsert = questions.map((q) => ({
        competition_id: competition.id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        hidden_input: q.hidden_input,
        expected_output: q.expected_output,
      }));

      const { error: questionsError } = await (supabase
        .from('questions' as any)
        .insert(questionsToInsert) as any);

      if (questionsError) throw questionsError;

      toast({
        title: 'Competition Created!',
        description: `Access Code: ${accessCode}`,
      });

      // Reset form
      setTitle('');
      setDuration([60]);
      setStartTime('');
      setQuestions([]);
    } catch (error) {
      console.error('Error creating competition:', error);
      toast({
        title: 'Error',
        description: 'Failed to create competition',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Competition Details */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Create New Battle</CardTitle>
          <CardDescription>Set up a new coding competition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Competition Title</Label>
              <Input
                id="title"
                placeholder="e.g., MUET Coding Championship 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration: {duration[0]} minutes</Label>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={30}
              max={240}
              step={15}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 min</span>
              <span>4 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions ({questions.length})</CardTitle>
              <CardDescription>Add problems for participants to solve</CardDescription>
            </div>
            <Button onClick={addQuestion} variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No questions added yet. Click "Add Question" to get started.
            </p>
          ) : (
            questions.map((q, index) => (
              <Card key={index} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Question #{index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="e.g., Two Sum"
                        value={q.title}
                        onChange={(e) => updateQuestion(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={q.difficulty}
                        onValueChange={(val) => updateQuestion(index, 'difficulty', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="beast">Beast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the problem..."
                      value={q.description}
                      onChange={(e) => updateQuestion(index, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Hidden Input (stdin)</Label>
                      <Textarea
                        placeholder="Test input..."
                        value={q.hidden_input}
                        onChange={(e) => updateQuestion(index, 'hidden_input', e.target.value)}
                        rows={2}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <Textarea
                        placeholder="Expected output..."
                        value={q.expected_output}
                        onChange={(e) => updateQuestion(index, 'expected_output', e.target.value)}
                        rows={2}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Create Button */}
      <Button
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full neon-glow-green"
        size="lg"
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Battle...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Battle
          </>
        )}
      </Button>
    </div>
  );
}
