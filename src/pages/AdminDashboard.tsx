import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BattleCreator } from '@/components/admin/BattleCreator';
import { QuestionBank } from '@/components/admin/QuestionBank';
import { CompetitionManager } from '@/components/admin/CompetitionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, PlusCircle, BookOpen, Trophy } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <MainLayout requireAdmin>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold tracking-wide flex items-center gap-3">
            <Shield className="h-8 w-8 text-accent" />
            <span className="text-accent">ADMIN</span> CONTROL CENTER
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage competitions, questions, and monitor battles
          </p>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="competitions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="competitions" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Battles
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="competitions">
            <CompetitionManager />
          </TabsContent>

          <TabsContent value="create">
            <BattleCreator />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionBank />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
