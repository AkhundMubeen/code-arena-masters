import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Play, Loader2, CheckCircle, XCircle, Terminal, FileText, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Question, ProgrammingLanguage, DifficultyLevel } from '@/lib/supabase-types';

interface CodeEditorProps {
  question: Question;
  competitionId?: string;
  onSubmissionResult?: (passed: boolean) => void;
  onClose?: () => void;
}

const LANGUAGE_CONFIG: Record<ProgrammingLanguage, { version: string; pistonLang: string }> = {
  python: { version: '3.10.0', pistonLang: 'python' },
  java: { version: '15.0.2', pistonLang: 'java' },
  cpp: { version: '10.2.0', pistonLang: 'cpp' },
};

export function CodeEditor({ question, competitionId, onSubmissionResult, onClose }: CodeEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState(question.default_code_python || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const [activeTab, setActiveTab] = useState('code');

  const getDefaultCode = (lang: ProgrammingLanguage) => {
    switch (lang) {
      case 'python': return question.default_code_python || '';
      case 'java': return question.default_code_java || '';
      case 'cpp': return question.default_code_cpp || '';
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

  const normalizeOutput = (str: string): string => {
    return str.replace(/^[\s\n\r]+|[\s\n\r]+$/g, '');
  };

  const executeCode = async () => {
    if (!user) return;
    setIsRunning(true);
    setOutput('Running code...');
    setResult(null);
    setActiveTab('output');

    try {
      const langId = language === 'python' ? 71 : language === 'java' ? 62 : 54;

      const response = await fetch("https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "judge029.p.rapidapi.com",
          "x-rapidapi-key": "5c9a36773fmshbc7bb16c4105494p14b958jsn1054869eb5af"
        },
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
          stdin: question.hidden_input || ""
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setOutput(`API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}\n\nMake sure you're subscribed to Judge0 CE on RapidAPI.`);
        setResult('fail');
        setIsRunning(false);
        return;
      }

      const compileError = (data.compile_output || '').trim();
      const stderr = (data.stderr || '').trim();
      const rawStdout = data.stdout || '';

      if (compileError) {
        setOutput(`Compilation Error:\n${compileError}`);
        setResult('fail');
      } else if (stderr) {
        setOutput(`Runtime Error:\n${stderr}`);
        setResult('fail');
      } else {
        const normalizedStdout = normalizeOutput(rawStdout);
        const normalizedExpected = normalizeOutput(question.expected_output);
        const passed = normalizedStdout === normalizedExpected;

        setResult(passed ? 'pass' : 'fail');
        setOutput(`Your Output:\n${normalizedStdout}\n\n${passed ? '✓ CORRECT!' : `✗ Expected:\n${normalizedExpected}`}`);

        const { error } = await db.from('submissions').insert({ user_id: user.id, competition_id: competitionId || null, question_id: question.id, language: language, code: code, auto_status: passed ? 'pass' : 'fail', manual_status: 'pending' });
        if (error) console.error('Error saving submission:', error);
        else { onSubmissionResult?.(passed); if (passed) toast({ title: 'Correct!', description: 'Your solution passed all test cases' }); }
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error executing code. Please try again.');
      setResult('fail');
      toast({ title: 'Execution Error', description: 'Failed to run your code', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="px-6 py-4 shrink-0 border-b border-border/50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{question.title}</h2>
          <Badge className={getDifficultyClass(question.difficulty)}>{question.difficulty.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={(val) => handleLanguageChange(val as ProgrammingLanguage)}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={executeCode} disabled={isRunning} size="sm" className={`neon-glow-green ${isRunning ? 'animate-pulse' : ''}`}>
            {isRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running...</> : <><Play className="mr-2 h-4 w-4" />Run Code</>}
          </Button>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-auto p-0">
          <TabsTrigger 
            value="problem" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <FileText className="h-4 w-4 mr-2" />
            Problem
          </TabsTrigger>
          <TabsTrigger 
            value="code" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Code2 className="h-4 w-4 mr-2" />
            Code
          </TabsTrigger>
          <TabsTrigger 
            value="output" 
            className={`rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 ${result === 'pass' ? 'text-primary' : result === 'fail' ? 'text-destructive' : ''}`}
          >
            <Terminal className="h-4 w-4 mr-2" />
            Output
            {result === 'pass' && <CheckCircle className="h-4 w-4 ml-2 text-primary" />}
            {result === 'fail' && <XCircle className="h-4 w-4 ml-2 text-destructive" />}
          </TabsTrigger>
        </TabsList>

        {/* Problem Tab */}
        <TabsContent value="problem" className="flex-1 m-0 p-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-primary prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                <ReactMarkdown>{question.description}</ReactMarkdown>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="flex-1 m-0 p-0 min-h-0">
          <div className="h-full w-full">
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
                automaticLayout: true
              }} 
            />
          </div>
        </TabsContent>

        {/* Output Tab */}
        <TabsContent value="output" className={`flex-1 m-0 p-0 min-h-0 ${result === 'pass' ? 'bg-primary/5' : result === 'fail' ? 'bg-destructive/5' : ''}`}>
          <ScrollArea className="h-full">
            <div className="p-6">
              <pre className="text-sm font-mono whitespace-pre-wrap text-foreground/90">
                {output || 'Click "Run Code" to execute your solution and see the output here.'}
              </pre>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
