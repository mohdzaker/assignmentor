import { ReactNode } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  LogOut, 
  Plus,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  onCreateAssignment?: () => void;
}

export function DashboardLayout({ children, onCreateAssignment }: DashboardLayoutProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r bg-card/50 backdrop-blur-xl",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {!sidebarCollapsed && (
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Assignmentor
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                !sidebarCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Create Assignment Button */}
          {onCreateAssignment && (
            <div className="p-3 border-t">
              <Button
                onClick={onCreateAssignment}
                className={cn(
                  "w-full shadow-sm",
                  sidebarCollapsed && "px-0"
                )}
                size={sidebarCollapsed ? "icon" : "default"}
                title={sidebarCollapsed ? "Create Assignment" : undefined}
              >
                <Plus className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-2">New Assignment</span>}
              </Button>
            </div>
          )}

          {/* User Profile Section */}
          <div className="border-t p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    sidebarCollapsed && "px-0 justify-center"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex flex-col items-start text-left">
                        <p className="text-sm font-medium truncate max-w-[150px]">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">
                {navigation.find(item => item.href === location.pathname)?.name || 'Assignmentor'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="container max-w-7xl py-8 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
