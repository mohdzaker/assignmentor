import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignments } from '@/contexts/AssignmentContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssignmentModal({ open, onOpenChange }: CreateAssignmentModalProps) {
  const [subject, setSubject] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [moduleNumber, setModuleNumber] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addAssignment } = useAssignments();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !user) return;

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const assignment = await addAssignment({
      subject: subject.trim(),
      topic: '', // Topic will be entered in workspace chat
      assessmentName: assessmentName.trim() || undefined,
      moduleNumber: moduleNumber.trim() || undefined,
      moduleName: moduleNumber.trim() ? moduleName.trim() : undefined,
      content: '',
      userId: user.id,
    });

    setIsLoading(false);
    onOpenChange(false);
    navigate(`/workspace/${assignment.id}`);
  };

  // Clear module name when module number is cleared
  const handleModuleNumberChange = (value: string) => {
    setModuleNumber(value);
    if (!value.trim()) {
      setModuleName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Name *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessmentName">Assessment Name (Optional)</Label>
            <Input
              id="assessmentName"
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              placeholder="e.g., Internal Assessment 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moduleNumber">Module Number (Optional)</Label>
            <Input
              id="moduleNumber"
              value={moduleNumber}
              onChange={(e) => handleModuleNumberChange(e.target.value)}
              placeholder="e.g., 3"
            />
          </div>

          {moduleNumber.trim() && (
            <div className="space-y-2">
              <Label htmlFor="moduleName">Module Name</Label>
              <Input
                id="moduleName"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g., Data Structures"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !subject.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Assignment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
