import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CodeEditor } from '@/components/arena/CodeEditor';
import { SeedDatabase } from '@/components/admin/SeedDatabase';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Code2, X } from 'lucide-react';
import { Question, DifficultyLevel } from '@/lib/supabase-types';
import { useAuth } from '@/hooks/useAuth';

export default function Practice() {
  const [searchParams] = useSearchParams();
  const difficultyFilter = searchParams.get('difficulty') as DifficultyLevel | null;
  const { role } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuestions = async () => {
    try {
      let query = db
        .from('questions')
        .select('*')
        .is('competition_id', null)
        .order('difficulty', { ascending: true });

      if (difficultyFilter) {
        query = query.eq('difficulty', difficultyFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setQuestions((data as Question[]) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [difficultyFilter]);

  const getDifficultyClass = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'beast': return 'difficulty-beast';
      default: return '';
    }
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleSubmissionResult = (passed: boolean, questionId: string) => {
    if (passed) {
      setSolvedQuestions(prev => new Set([...prev, questionId]));
    }
  };

  const handleSeeded = () => {
    fetchQuestions();
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold tracking-wide flex items-center gap-3">
            <Code2 className="h-8 w-8 text-primary" />
            Practice <span className="text-primary">Arena</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {questions.length} problems available • Click any problem to start coding
          </p>
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={!difficultyFilter ? "default" : "outline"} 
            className={`cursor-pointer px-4 py-1.5 ${!difficultyFilter ? 'bg-primary' : 'hover:bg-primary/20'}`}
            onClick={() => window.location.href = '/practice'}
          >
            All
          </Badge>
          {(['easy', 'medium', 'hard', 'beast'] as DifficultyLevel[]).map(diff => (
            <Badge 
              key={diff}
              variant={difficultyFilter === diff ? "default" : "outline"}
              className={`cursor-pointer px-4 py-1.5 ${difficultyFilter === diff ? getDifficultyClass(diff) : `hover:bg-secondary`}`}
              onClick={() => window.location.href = `/practice?difficulty=${diff}`}
            >
              {diff.toUpperCase()}
            </Badge>
          ))}
        </div>

        {/* Questions Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading problems...</div>
        ) : questions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">No practice problems yet</p>
              {role === 'admin' && (
                <SeedDatabase compact onSeeded={handleSeeded} />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((q) => (
              <Card 
                key={q.id}
                onClick={() => handleQuestionClick(q)}
                className={`glass-card cursor-pointer transition-all hover:scale-[1.02] hover:border-primary/50 ${solvedQuestions.has(q.id) ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base truncate">{q.title}</CardTitle>
                    {solvedQuestions.has(q.id) && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className={getDifficultyClass(q.difficulty)}>{q.difficulty.toUpperCase()}</Badge>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{q.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Code Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden">
          {selectedQuestion && (
            <CodeEditor 
              question={selectedQuestion} 
              onSubmissionResult={(passed) => handleSubmissionResult(passed, selectedQuestion.id)} 
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
