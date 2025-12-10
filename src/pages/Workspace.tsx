import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignments } from '@/contexts/AssignmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIChatPanel } from '@/components/AIChatPanel';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, FileText, Save, Loader2, MessageSquare, FileCheck } from 'lucide-react';

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAssignment, updateAssignment } = useAssignments();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(getAssignment(id || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('chat');

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
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/assignments')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate text-sm sm:text-base">
                {assignment.topic || assignment.subject}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {assignment.subject} {assignment.module && `• ${assignment.module}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              className="hidden xs:flex h-8 sm:h-9 px-2 sm:px-3"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadWord}
              className="hidden xs:flex h-8 sm:h-9 px-2 sm:px-3"
            >
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Word</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving}
              className="h-8 sm:h-9 px-2 sm:px-3"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <Save className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile View with Tabs */}
      <div className="flex-1 lg:hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-background border-b">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none h-full gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none h-full gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 m-0 p-3 overflow-hidden">
            <AIChatPanel
              onContentUpdate={handleContentUpdate}
              assignmentTopic={assignment.topic || assignment.subject}
              wordLimit={assignment.wordLimit}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 m-0 p-3 overflow-auto">
            <DocumentPreview 
              assignment={assignment} 
              isStreaming={isStreaming}
            />
          </TabsContent>
        </Tabs>
        
        {/* Mobile Download Actions */}
        <div className="xs:hidden p-3 bg-background border-t flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPDF}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadWord}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Word
          </Button>
        </div>
      </div>

      {/* Desktop Split View */}
      <div className="hidden lg:flex flex-1">
        {/* AI Chat Panel - 40% */}
        <div className="w-2/5 border-r bg-background/50 p-4 overflow-hidden flex flex-col">
          <AIChatPanel
            onContentUpdate={handleContentUpdate}
            assignmentTopic={assignment.topic || assignment.subject}
            wordLimit={assignment.wordLimit}
          />
        </div>

        {/* Document Preview - 60% */}
        <div className="w-3/5 overflow-auto p-6 bg-muted/20">
          <DocumentPreview 
            assignment={assignment} 
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
