import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignments } from '@/contexts/AssignmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIChatPanel } from '@/components/AIChatPanel';
import { DocumentPreview, DocumentPreviewHandle } from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, FileText, Save, Loader2, MessageSquare, FileCheck } from 'lucide-react';

export default function Workspace() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateAssignment } = useAssignments();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const documentPreviewRef = useRef<DocumentPreviewHandle>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAssignment = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setAssignment(data);
        } else {
          toast({ title: "Error", description: "Assignment not found", variant: "destructive" });
          navigate('/assignments');
        }
      } catch (error) {
        console.error("Failed to load assignment", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [id, isAuthenticated, navigate, toast]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!assignment) {
    return null;
  }

  const handleContentUpdate = (content: string) => {
    setIsStreaming(true);
    setAssignment((prev: any) => prev ? { ...prev, content } : prev);

    // End streaming after content is complete
    setTimeout(() => setIsStreaming(false), 100);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAssignment(assignment.id, { content: assignment.content });
      toast({
        title: "Saved successfully",
        description: "Your assignment has been saved.",
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleDownloadWord = () => {
    const content = `${assignment.topic || assignment.subject}

Subject: ${assignment.subject}
${assignment.moduleNumber ? `Module: ${assignment.moduleNumber}${assignment.moduleName ? ` - ${assignment.moduleName}` : ''}
` : ''}

${assignment.content || 'No content generated yet.'}`;

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
    // Call the PDF download function from DocumentPreview component
    if (documentPreviewRef.current) {
      documentPreviewRef.current.handleDownloadPDF();
    } else {
      toast({
        title: "Error",
        description: "PDF export is not available at the moment.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20 flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b shadow-sm no-print">
        <div className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/assignments')}
              className="shrink-0 hover:bg-muted/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate text-sm sm:text-base flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary shrink-0" />
                {assignment.topic ? `${assignment.subject} - ${assignment.topic}` : assignment.subject}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {assignment.moduleNumber ? `Module ${assignment.moduleNumber}${assignment.moduleName ? `: ${assignment.moduleName}` : ''}` : 'Start by entering your assignment topic in chat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="hidden xs:flex h-8 sm:h-9 px-2 sm:px-3 shadow-sm hover:shadow-md transition-all"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadWord}
              className="hidden xs:flex h-8 sm:h-9 px-2 sm:px-3 shadow-sm hover:shadow-md transition-all"
            >
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Word</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 sm:h-9 px-2 sm:px-3 shadow-sm hover:shadow-md transition-all"
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
      <div className="flex-1 lg:hidden flex flex-col workspace-mobile">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-background border-b">
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none h-full gap-2 border-b-2 border-transparent data-[state=active]:border-primary transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none h-full gap-2 border-b-2 border-transparent data-[state=active]:border-primary transition-all"
            >
              <FileCheck className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 m-0 p-0 overflow-hidden">
            <AIChatPanel
              onContentUpdate={handleContentUpdate}
              assignmentTopic={assignment.topic || assignment.subject}
              assignmentId={assignment.id}
              initialChats={assignment.chatHistory}
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0 p-3 overflow-auto">
            <DocumentPreview
              ref={documentPreviewRef}
              assignment={assignment}
              isStreaming={isStreaming}
              onUpdate={(content) => setAssignment(prev => prev ? { ...prev, content } : prev)}
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
      <div className="workspace-desktop hidden lg:flex flex-1 overflow-hidden">
        {/* AI Chat Panel - 40% */}
        <div className="chat-panel-container w-2/5 border-r bg-card/30 backdrop-blur-sm flex flex-col shadow-lg">
          <AIChatPanel
            onContentUpdate={handleContentUpdate}
            assignmentTopic={assignment.topic || assignment.subject}
            assignmentId={assignment.id}
            initialChats={assignment.chatHistory}
          />
        </div>

        {/* Document Preview - 60% */}
        <div className="preview-pane w-3/5 overflow-auto p-6 bg-gradient-to-br from-muted/10 to-muted/30">
          <DocumentPreview
            ref={documentPreviewRef}
            assignment={assignment}
            isStreaming={isStreaming}
            onUpdate={(content) => setAssignment(prev => prev ? { ...prev, content } : prev)}
          />
        </div>
      </div>


    </div>
  );
}
