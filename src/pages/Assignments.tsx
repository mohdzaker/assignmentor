import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignments } from '@/contexts/AssignmentContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateAssignmentModal } from '@/components/CreateAssignmentModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Eye, Download, Trash2, FileText } from 'lucide-react';

export default function Assignments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { assignments, deleteAssignment } = useAssignments();
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredAssignments = assignments.filter(a =>
    a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteAssignment(deleteId);
      toast({
        title: "Assignment deleted",
        description: "The assignment has been removed.",
      });
      setDeleteId(null);
    }
  };

  const handleDownload = (assignment: typeof assignments[0]) => {
    // Simple text download for now
    const content = `${assignment.topic || assignment.subject}\n\nSubject: ${assignment.subject}\n${assignment.module ? `Module: ${assignment.module}\n` : ''}\n\n${assignment.content || 'No content generated yet.'}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.topic || assignment.subject}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your assignment is being downloaded.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all your created assignments.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Assignments</CardTitle>
                <CardDescription>
                  {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by subject or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.subject}</TableCell>
                      <TableCell>{assignment.topic || '-'}</TableCell>
                      <TableCell>{assignment.module || '-'}</TableCell>
                      <TableCell>
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/workspace/${assignment.id}`)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(assignment)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(assignment.id)}
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No assignments match your search' : 'No assignments yet'}
                </p>
                {!searchQuery && (
                  <Button 
                    className="mt-4"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Create your first assignment
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAssignmentModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
