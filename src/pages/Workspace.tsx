import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignments } from '@/contexts/AssignmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIChatPanel } from '@/components/AIChatPanel';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, FileText, Save, Loader2 } from 'lucide-react';

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAssignment, updateAssignment } = useAssignments();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(getAssignment(id || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!assignment) {
      navigate('/assignments');
    }
  }, [assignment, isAuthenticated, navigate]);

  if (!assignment) {
    return null;
  }

  const handleContentUpdate = (content: string) => {
    setIsStreaming(true);
    setAssignment(prev => prev ? { ...prev, content } : prev);
    
    // End streaming after content is complete
    setTimeout(() => setIsStreaming(false), 100);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    updateAssignment(assignment.id, { content: assignment.content });
    toast({
      title: "Saved successfully",
      description: "Your assignment has been saved.",
    });
    setIsSaving(false);
  };

  const handleDownloadWord = () => {
    const content = `${assignment.topic || assignment.subject}\n\nSubject: ${assignment.subject}\n${assignment.module ? `Module: ${assignment.module}\n` : ''}\n\n${assignment.content || 'No content generated yet.'}`;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.topic || assignment.subject}.doc`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Downloading as Word document.",
    });
  };

  const handleDownloadPDF = () => {
    // For now, download as text - PDF generation would require a library
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
      description: "Downloading as PDF (text format).",
    });
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/assignments')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">
                {assignment.topic || assignment.subject}
              </h1>
              <p className="text-sm text-muted-foreground">
                {assignment.subject} {assignment.module && `• ${assignment.module}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadWord}>
              <FileText className="mr-2 h-4 w-4" />
              Word
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* AI Chat Panel - 40% */}
        <div className="w-2/5 border-r bg-background p-4 overflow-hidden flex flex-col">
          <AIChatPanel
            onContentUpdate={handleContentUpdate}
            assignmentTopic={assignment.topic || assignment.subject}
            wordLimit={assignment.wordLimit}
          />
        </div>

        {/* Document Preview - 60% */}
        <div className="w-3/5 overflow-auto p-4">
          <DocumentPreview 
            assignment={assignment} 
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
