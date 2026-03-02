import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Code2, Zap, Trophy, Users } from 'lucide-react';

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome Back!',
        description: 'Successfully logged in to Code-Arena',
      });
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!signupUsername.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: signupUsername, department: signupDepartment },
      },
    });

    if (error) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Created!',
        description: 'Welcome to the Arena, warrior!',
      });
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col lg:flex-row min-h-screen items-center gap-12">
        {/* Left side - Branding */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Terminal className="h-12 w-12 text-primary neon-text-green" />
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-wider">
                <span className="text-primary neon-text-green">UNI</span>
                <span className="text-foreground"> CODE-ARENA</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0">
              Enter the battlefield. Prove your skills. Dominate the leaderboard.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-4 glass-card p-4 rounded-lg">
              <Code2 className="h-8 w-8 text-primary shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Real-time Code Execution</h3>
                <p className="text-sm text-muted-foreground">Python, Java, C++ supported</p>
              </div>
            </div>
            <div className="flex items-center gap-4 glass-card p-4 rounded-lg">
              <Trophy className="h-8 w-8 text-warning shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Live Competitions</h3>
                <p className="text-sm text-muted-foreground">Battle against peers in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-4 glass-card p-4 rounded-lg">
              <Zap className="h-8 w-8 text-accent shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">XP & Rankings</h3>
                <p className="text-sm text-muted-foreground">Level up your coding skills</p>
              </div>
            </div>
            <div className="flex items-center gap-4 glass-card p-4 rounded-lg">
              <Users className="h-8 w-8 text-neon-cyan shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Practice Arena</h3>
                <p className="text-sm text-muted-foreground">Hundreds of challenges await</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="w-full max-w-md">
          <Card className="glass-card gradient-border">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">ACCESS TERMINAL</CardTitle>
              <CardDescription>Initialize your session</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="warrior@uni.edu.pk"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="bg-input/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full neon-glow-green"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Authenticating...' : 'Enter Arena'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="CodeWarrior_X"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        required
                        className="bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="warrior@uni.edu.pk"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-department">Department (Optional)</Label>
                      <Input
                        id="signup-department"
                        type="text"
                        placeholder="Computer Science"
                        value={signupDepartment}
                        onChange={(e) => setSignupDepartment(e.target.value)}
                        className="bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-input/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full neon-glow-green"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Join the Arena'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
