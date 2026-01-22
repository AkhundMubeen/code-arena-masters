import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CodeEditor } from '@/components/arena/CodeEditor';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Code2 } from 'lucide-react';
import { Question, DifficultyLevel } from '@/lib/supabase-types';

export default function Practice() {
  const [searchParams] = useSearchParams();
  const difficultyFilter = searchParams.get('difficulty') as DifficultyLevel | null;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [difficultyFilter]);

  const fetchQuestions = async () => {
    try {
      let query = supabase
        .from('questions' as any)
        .select('*')
        .is('competition_id', null)
        .order('difficulty', { ascending: true });

      if (difficultyFilter) {
        query = query.eq('difficulty', difficultyFilter);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      setQuestions((data as Question[]) || []);
      if (data && data.length > 0) {
        setSelectedQuestion(data[0] as Question);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyClass = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'beast': return 'difficulty-beast';
      default: return '';
    }
  };

  const handleSubmissionResult = (passed: boolean, questionId: string) => {
    if (passed) {
      setSolvedQuestions(prev => new Set([...prev, questionId]));
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Question List - Left Sidebar */}
        <Card className="glass-card w-72 shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code2 className="h-5 w-5" />
              Practice Problems
            </CardTitle>
            <CardDescription>
              {questions.length} problems available
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-14rem)]">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : questions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No practice problems yet
                  </p>
                ) : (
                  questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedQuestion?.id === q.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{q.title}</span>
                        {solvedQuestions.has(q.id) && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      <Badge className={`mt-1 ${getDifficultyClass(q.difficulty)}`}>
                        {q.difficulty.toUpperCase()}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Editor Area */}
        <div className="flex-1 min-w-0">
          {selectedQuestion ? (
            <CodeEditor
              question={selectedQuestion}
              onSubmissionResult={(passed) => handleSubmissionResult(passed, selectedQuestion.id)}
            />
          ) : (
            <Card className="glass-card h-full flex items-center justify-center">
              <p className="text-muted-foreground">Select a problem to start coding</p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
