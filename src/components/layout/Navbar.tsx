import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Terminal, Trophy, Code2, Shield, LogOut, User, Zap } from 'lucide-react';

export function Navbar() {
  const { user, profile, role, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <Terminal className="h-8 w-8 text-primary group-hover:neon-text-green transition-all" />
            <span className="font-display text-xl font-bold tracking-wider">
              <span className="text-primary">CODE</span>
              <span className="text-foreground">-ARENA</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/practice"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Code2 className="h-4 w-4" />
              Practice
            </Link>
            <Link
              to="/competitions"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Trophy className="h-4 w-4" />
              Competitions
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {profile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">{profile.xp} XP</span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {profile?.username?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-card" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge
                      variant="outline"
                      className={isAdmin ? 'difficulty-beast w-fit mt-1' : 'difficulty-easy w-fit mt-1'}
                    >
                      {role?.toUpperCase()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
