import { ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-muted/40 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Assignmentor
          </h1>
          <p className="text-muted-foreground text-center text-sm max-w-[260px]">
            Your intelligent assistant for crafting perfect academic assignments
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
