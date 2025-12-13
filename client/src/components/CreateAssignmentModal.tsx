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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssignmentModal({ open, onOpenChange }: CreateAssignmentModalProps) {
  const [subject, setSubject] = useState('');
  const [module, setModule] = useState('');
  const [wordLimit, setWordLimit] = useState('500');
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
      module: module.trim(),
      wordLimit: parseInt(wordLimit),
      content: '',
      userId: user.id,
    });

    setIsLoading(false);
    onOpenChange(false);
    navigate(`/workspace/${assignment.id}`);
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
            <Label htmlFor="module">Module (Optional)</Label>
            <Input
              id="module"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="e.g., Module 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wordLimit">Word Limit</Label>
            <Select value={wordLimit} onValueChange={setWordLimit}>
              <SelectTrigger>
                <SelectValue placeholder="Select word limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">200 words</SelectItem>
                <SelectItem value="500">500 words</SelectItem>
                <SelectItem value="1000">1000 words</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
