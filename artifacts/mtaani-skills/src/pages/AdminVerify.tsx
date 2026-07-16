import { useAuth } from '@/hooks/use-auth';
import { useLocation, useParams } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { useGetFundi, useVerifyFundi, getGetFundiQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ShieldCheck, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminVerify() {
  const { id } = useParams();
  const fundiId = Number(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (!user || user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const { data: fundi, isLoading } = useGetFundi(fundiId, {
    query: { enabled: !!fundiId, queryKey: getGetFundiQueryKey(fundiId) }
  });

  const verifyFundi = useVerifyFundi();

  const handleVerify = async (verified: boolean) => {
    try {
      await verifyFundi.mutateAsync({ id: fundiId, data: { verified, rejectionReason: verified ? undefined : 'Invalid documents' } });
      setLocation('/admin');
    } catch (e) {
      alert(`Mock: Fundi ${verified ? 'Verified' : 'Rejected'}`);
      setLocation('/admin');
    }
  };

  const displayFundi = fundi || {
    id: fundiId, userName: 'Brian Kimani', tvtLevel: 'level_5', location: 'Ruiru', skills: ['Masonry'],
    certificateUrl: 'mock-url', idNumber: '12345678', verified: false
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
        <button onClick={() => setLocation('/admin')} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b bg-card">
            <h1 className="text-2xl font-bold text-foreground mb-2">Verify Fundi</h1>
            <p className="text-muted-foreground">Review TVET credentials and approve profile.</p>
          </div>

          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Profile Details</h3>
                <div className="bg-muted/30 border rounded-xl p-4 space-y-3">
                  <div><span className="text-muted-foreground text-sm">Name:</span> <span className="font-semibold float-right">{displayFundi.userName}</span></div>
                  <div><span className="text-muted-foreground text-sm">Location:</span> <span className="font-semibold float-right">{displayFundi.location}</span></div>
                  <div><span className="text-muted-foreground text-sm">Skills:</span> <span className="font-semibold float-right">{displayFundi.skills?.join(', ')}</span></div>
                  <div><span className="text-muted-foreground text-sm">ID Number:</span> <span className="font-semibold float-right">{displayFundi.idNumber || 'Not provided'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">TVET Certification</h3>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="font-bold text-primary text-lg mb-1">Level {displayFundi.tvtLevel?.split('_')[1]}</p>
                  <p className="text-sm text-muted-foreground mb-4">Certificate uploaded by user</p>
                  <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                    <FileText className="w-4 h-4 mr-2" /> View Certificate Document
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Action</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  By approving this fundi, they will receive the trusted Mtaani verified badge and be visible in customer search results. Ensure the TVET certificate matches the National ID.
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-4">
                <Button size="lg" onClick={() => handleVerify(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Approve & Verify
                </Button>
                <Button variant="outline" size="lg" onClick={() => handleVerify(false)} className="w-full text-destructive border-destructive/50 hover:bg-destructive/10 h-14">
                  <XCircle className="w-5 h-5 mr-2" /> Reject Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
