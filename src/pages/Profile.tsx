import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Building, Star, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const { user, profile, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </MainLayout>
    );
  }

  if (!user || !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </MainLayout>
    );
  }

  const initials = profile.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold">Profile</h1>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.username}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{role || 'student'}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm ml-auto">{user.email}</span>
              </div>

              {profile.department && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Department</span>
                  <span className="text-sm ml-auto">{profile.department}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">XP</span>
                <span className="text-sm font-bold ml-auto">{profile.xp}</span>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge className="ml-auto capitalize">{role || 'student'}</Badge>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm ml-auto">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
