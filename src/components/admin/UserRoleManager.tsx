import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AppRole, Profile } from '@/lib/supabase-types';
import { Loader2, Users, Shield, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserWithRole extends Profile {
  role: AppRole;
  role_id: string;
}

export function UserRoleManager() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        db.from('profiles').select('id, user_id, username, department, xp, avatar_url, created_at, updated_at'),
        db.from('user_roles').select('id, user_id, role'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const profiles = (profilesRes.data || []) as Profile[];
      const roleMap = new Map(
        (rolesRes.data || []).map((r: { id: string; user_id: string; role: AppRole }) => [r.user_id, r])
      );

      const merged: UserWithRole[] = profiles.map((p) => {
        const row = roleMap.get(p.user_id);
        return {
          ...p,
          role: (row?.role ?? 'student') as AppRole,
          role_id: row?.id ?? '',
        };
      });

      setUsers(merged);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, newRole: AppRole) => {
    setUpdatingUserId(userId);
    try {
      const { error } = await db
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
      toast({
        title: 'Role updated',
        description: `User role set to ${newRole}.`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User roles
        </CardTitle>
        <CardDescription>
          Promote or demote users between Admin and Student. Changes take effect immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-[180px]">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.username}</span>
                      {currentUser?.id === u.user_id && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.department || '—'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(value) => updateRole(u.user_id, value as AppRole)}
                      disabled={updatingUserId === u.user_id}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                        {updatingUserId === u.user_id && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">
                          <span className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Student
                          </span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
