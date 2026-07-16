import { useState } from 'react';
import { useLocation } from 'wouter';
import { setAuthUser, UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, User, Wrench, ShieldAlert } from 'lucide-react';
import { useCreateUser, getCreateUserMutationOptions } from '@workspace/api-client-react';
import { UserInputRole } from '@workspace/api-client-react/src/generated/api.schemas';

export default function Login() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  const createUser = useCreateUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 9) return;

    try {
      // Simulate real API creation for full fidelity
      const res = await createUser.mutateAsync({
        data: { name, phone, role: role as UserInputRole }
      });
      
      setAuthUser({
        userId: res.id,
        name: res.name,
        role: res.role as UserRole
      });
      
      if (role === 'admin') setLocation('/admin');
      else if (role === 'fundi') setLocation('/jobs');
      else setLocation('/fundis');
      
    } catch (err) {
      // Fallback if API is completely unavailable
      const fallbackId = role === 'admin' ? 3 : role === 'fundi' ? 2 : 1;
      setAuthUser({ userId: fallbackId, name: name || 'Demo User', role });
      
      if (role === 'admin') setLocation('/admin');
      else if (role === 'fundi') setLocation('/jobs');
      else setLocation('/fundis');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Join Mtaani Skills</h1>
          <p className="text-muted-foreground mt-2">Enter your details to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="07XX XXX XXX" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>I want to use Mtaani Skills to...</Label>
            <div className="grid grid-cols-1 gap-3">
              <label className={`relative flex cursor-pointer rounded-xl border p-4 hover:bg-muted/50 transition-colors ${role === 'customer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}>
                <input type="radio" name="role" value="customer" className="sr-only" checked={role === 'customer'} onChange={() => setRole('customer')} />
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Hire a Fundi</p>
                    <p className="text-sm text-muted-foreground">Book trusted local professionals</p>
                  </div>
                </div>
              </label>

              <label className={`relative flex cursor-pointer rounded-xl border p-4 hover:bg-muted/50 transition-colors ${role === 'fundi' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}>
                <input type="radio" name="role" value="fundi" className="sr-only" checked={role === 'fundi'} onChange={() => setRole('fundi')} />
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role === 'fundi' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Work as a Fundi</p>
                    <p className="text-sm text-muted-foreground">Offer services & build reputation</p>
                  </div>
                </div>
              </label>

              <label className={`relative flex cursor-pointer rounded-xl border p-4 hover:bg-muted/50 transition-colors ${role === 'admin' ? 'border-secondary bg-secondary/5 ring-1 ring-secondary' : 'border-border'}`}>
                <input type="radio" name="role" value="admin" className="sr-only" checked={role === 'admin'} onChange={() => setRole('admin')} />
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role === 'admin' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Admin Portal</p>
                    <p className="text-sm text-muted-foreground">Manage verifications & escrow</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full text-base h-12" size="lg" disabled={createUser.isPending}>
            {createUser.isPending ? 'Logging in...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
