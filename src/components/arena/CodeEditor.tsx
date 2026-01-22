import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Play, Loader2, CheckCircle, XCircle, Terminal } from 'lucide-react';
import { Question, ProgrammingLanguage, DifficultyLevel } from '@/lib/supabase-types';

interface CodeEditorProps {
  question: Question;
  competitionId?: string;
  onSubmissionResult?: (passed: boolean) => void;
}

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_CONFIG: Record<ProgrammingLanguage, { version: string; pistonLang: string }> = {
  python: { version: '3.10.0', pistonLang: 'python' },
  java: { version: '15.0.2', pistonLang: 'java' },
  cpp: { version: '10.2.0', pistonLang: 'cpp' },
};

export function CodeEditor({ question, competitionId, onSubmissionResult }: CodeEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState(question.default_code_python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);

  const getDefaultCode = (lang: ProgrammingLanguage) => {
    switch (lang) {
      case 'python': return question.default_code_python;
      case 'java': return question.default_code_java;
      case 'cpp': return question.default_code_cpp;
    }
  };

  const handleLanguageChange = (newLang: ProgrammingLanguage) => {
    setLanguage(newLang);
    setCode(getDefaultCode(newLang));
    setOutput('');
    setResult(null);
  };

  const getDifficultyClass = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'beast': return 'difficulty-beast';
    }
  };

  const executeCode = async () => {
    if (!user) return;
    
    setIsRunning(true);
    setOutput('Running code...');
    setResult(null);

    try {
      const config = LANGUAGE_CONFIG[language];
      
      const response = await fetch(PISTON_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: config.pistonLang,
          version: config.version,
          files: [{ content: code }],
          stdin: question.hidden_input,
        }),
      });

      if (!response.ok) {
        throw new Error('Execution failed');
      }

      const data = await response.json();
      
      // Get the output
      const stdout = data.run?.stdout?.trim() || '';
      const stderr = data.run?.stderr?.trim() || '';
      const compileError = data.compile?.stderr?.trim() || '';

      if (compileError) {
        setOutput(`Compilation Error:\n${compileError}`);
        setResult('fail');
      } else if (stderr) {
        setOutput(`Runtime Error:\n${stderr}`);
        setResult('fail');
      } else {
        // Compare with expected output
        const expected = question.expected_output.trim();
        const passed = stdout === expected;
        
        setResult(passed ? 'pass' : 'fail');
        setOutput(
          `Your Output:\n${stdout}\n\n${passed ? '✓ CORRECT!' : `✗ Expected:\n${expected}`}`
        );

        // Save submission to database
        const { error } = await (supabase
          .from('submissions' as any)
          .insert({
            user_id: user.id,
            competition_id: competitionId || null,
            question_id: question.id,
            language: language,
            code: code,
            auto_status: passed ? 'pass' : 'fail',
            manual_status: 'pending',
          }) as any);

        if (error) {
          console.error('Error saving submission:', error);
        } else {
          onSubmissionResult?.(passed);
          
          if (passed) {
            toast({
              title: 'Correct!',
              description: 'Your solution passed all test cases',
            });
          }
        }
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error executing code. Please try again.');
      setResult('fail');
      toast({
        title: 'Execution Error',
        description: 'Failed to run your code',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Problem Description */}
      <Card className="glass-card lg:w-1/3 shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{question.title}</CardTitle>
            <Badge className={getDifficultyClass(question.difficulty)}>
              {question.difficulty.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100%-2rem)] pr-4">
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{question.description}</div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Editor and Output */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <Select value={language} onValueChange={(val) => handleLanguageChange(val as ProgrammingLanguage)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={executeCode}
            disabled={isRunning}
            className={`neon-glow-green ${isRunning ? 'animate-pulse' : ''}`}
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        </div>

        {/* Monaco Editor */}
        <Card className="glass-card flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </Card>

        {/* Output Console */}
        <Card className={`glass-card ${result === 'pass' ? 'border-primary neon-glow-green' : result === 'fail' ? 'border-destructive neon-glow-red' : ''}`}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Output
              {result === 'pass' && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
              {result === 'fail' && <XCircle className="h-4 w-4 text-destructive ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ScrollArea className="h-32">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {output || 'Click "Run Code" to execute your solution'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
