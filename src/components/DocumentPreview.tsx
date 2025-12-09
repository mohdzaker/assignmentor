import { useAuth } from '@/contexts/AuthContext';
import { Assignment } from '@/types';

interface DocumentPreviewProps {
  assignment: Assignment;
  isStreaming?: boolean;
}

export function DocumentPreview({ assignment, isStreaming }: DocumentPreviewProps) {
  const { user } = useAuth();

  return (
    <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
      {/* A4 Document */}
      <div 
        className="bg-document mx-auto my-6 p-12 shadow-sm"
        style={{ 
          width: '210mm', 
          minHeight: '297mm',
          maxWidth: '100%',
        }}
      >
        {/* Document Header */}
        <div className="text-center mb-8 border-b pb-6">
          {user?.collegeName && (
            <h2 className="text-lg font-semibold text-document-text mb-1">
              {user.collegeName}
            </h2>
          )}
          <div className="text-sm text-muted-foreground space-y-0.5">
            {user?.name && <p>Student: {user.name}</p>}
            {user?.rollNumber && <p>Roll Number: {user.rollNumber}</p>}
            {user?.course && <p>Course: {user.course}</p>}
            {user?.semester && user?.section && (
              <p>Semester: {user.semester} | Section: {user.section}</p>
            )}
          </div>
        </div>

        {/* Assignment Details */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-center text-document-text mb-2">
            {assignment.topic || assignment.subject}
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Subject: {assignment.subject}
            {assignment.module && ` | Module: ${assignment.module}`}
          </p>
        </div>

        {/* Content */}
        <div className="document-preview text-document-text">
          {assignment.content ? (
            <div className={isStreaming ? 'typing-cursor' : ''}>
              {assignment.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic text-center py-12">
              Start chatting with AI to generate your assignment content...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <p className="text-center text-xs text-muted-foreground">
            Page 1
          </p>
        </div>
      </div>
    </div>
  );
}
