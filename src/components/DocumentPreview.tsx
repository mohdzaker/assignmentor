import { useAuth } from '@/contexts/AuthContext';
import { Assignment } from '@/types';
import { FileText } from 'lucide-react';

interface DocumentPreviewProps {
  assignment: Assignment;
  isStreaming?: boolean;
}

export function DocumentPreview({ assignment, isStreaming }: DocumentPreviewProps) {
  const { user } = useAuth();

  return (
    <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
      {/* Preview Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Document Preview</span>
        {isStreaming && (
          <span className="ml-auto text-xs text-primary animate-pulse">Generating...</span>
        )}
      </div>

      {/* A4 Document Container */}
      <div className="p-4 sm:p-6 overflow-x-auto bg-muted/20">
        <div 
          className="bg-document mx-auto shadow-lg rounded-sm"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            maxWidth: '100%',
          }}
        >
          <div className="p-6 sm:p-8 md:p-12">
            {/* Document Header */}
            <div className="text-center mb-6 sm:mb-8 border-b pb-4 sm:pb-6">
              {user?.collegeName && (
                <h2 className="text-base sm:text-lg font-semibold text-document-text mb-1">
                  {user.collegeName}
                </h2>
              )}
              <div className="text-xs sm:text-sm text-muted-foreground space-y-0.5">
                {user?.name && <p>Student: {user.name}</p>}
                {user?.rollNumber && <p>Roll Number: {user.rollNumber}</p>}
                {user?.course && <p>Course: {user.course}</p>}
                {user?.semester && user?.section && (
                  <p>Semester: {user.semester} | Section: {user.section}</p>
                )}
              </div>
            </div>

            {/* Assignment Details */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-lg sm:text-xl font-bold text-center text-document-text mb-2">
                {assignment.topic || assignment.subject}
              </h1>
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                Subject: {assignment.subject}
                {assignment.module && ` | Module: ${assignment.module}`}
              </p>
            </div>

            {/* Content */}
            <div className="document-preview text-document-text text-sm sm:text-base">
              {assignment.content ? (
                <div className={isStreaming ? 'typing-cursor' : ''}>
                  {assignment.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground italic">
                    Start chatting with AI to generate your assignment content...
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 sm:pt-8">
              <p className="text-center text-xs text-muted-foreground">
                Page 1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
