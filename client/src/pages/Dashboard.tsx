import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignments } from '@/contexts/AssignmentContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateAssignmentModal } from '@/components/CreateAssignmentModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Clock, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { assignments } = useAssignments();

  const recentAssignments = assignments.slice(-3).reverse();

  return (
    <DashboardLayout onCreateAssignment={() => setIsModalOpen(true)}>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold md:text-4xl text-foreground flex items-center gap-3">
              <span className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </span>
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl text-lg">
              Ready to work on your assignments? Your AI assistant is here to help you draft and organize your tasks efficiently.
            </p>
            <Button
              size="lg"
              className="mt-6 shadow-md hover:shadow-xl transition-all hover:scale-105"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Assignment
            </Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/15 to-transparent"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card border hover:border-primary/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{assignments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Assignments created
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border hover:border-orange-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center shadow-sm">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {assignments.filter(a => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(a.createdAt) > weekAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Created in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border hover:border-green-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Stats
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">98%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completion Rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assignments */}
        <Card className="glass-card border hover:border-primary/20 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Assignments
                </CardTitle>
                <CardDescription>Your latest created assignments</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentAssignments.length > 0 ? (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="group flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-all hover:border-primary/20 hover:shadow-sm bg-card/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{assignment.topic || assignment.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.subject} • {assignment.wordLimit} words
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-muted">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">No assignments yet</h3>
                <p className="text-muted-foreground mb-6">Get started by creating your first assignment with AI.</p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="shadow-md"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAssignmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </DashboardLayout>
  );
}
