import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/lib/auth';
import { ShieldCheck, UserCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight text-foreground">
              Mtaani <span className="text-secondary">Skills</span>
            </span>
          </Link>
          <div className="hidden gap-6 md:flex">
            <Link href="/fundis" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Find a Fundi
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              How it works
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'customer' && (
                <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  My Jobs
                </Link>
              )}
              {user.role === 'fundi' && (
                <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Incoming Jobs
                </Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  <span className="flex items-center gap-1"><LayoutDashboard className="w-4 h-4"/> Admin</span>
                </Link>
              )}
              
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="hidden sm:inline-block">{user.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Log in
              </Link>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md">
                <Link href="/login">Join Mtaani</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
