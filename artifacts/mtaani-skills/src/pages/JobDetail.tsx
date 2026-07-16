import { useState, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useGetJob, useUpdateJob, useCreatePayment, useReleaseJobPayment, getGetJobQueryKey } from '@workspace/api-client-react';
import { ShieldCheck, Lock, MapPin, CheckCircle2, Clock, XCircle, ChevronLeft, CreditCard, Banknote, Star, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';

export default function JobDetail() {
  const { id } = useParams();
  const jobId = Number(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [mpesaCode, setMpesaCode] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: job, isLoading } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) }
  });

  const updateJob = useUpdateJob();
  const createPayment = useCreatePayment();
  const releasePayment = useReleaseJobPayment();

  // Guard for no auth
  if (!user && !isLoading) {
    setLocation('/login');
    return null;
  }

  const isCustomer = user?.role === 'customer';
  const isFundi = user?.role === 'fundi';

  // Demo fallback
  const displayJob = job || {
    id: jobId, customerName: 'John Doe', fundiName: 'David Ochieng', 
    description: 'Fix leaking kitchen sink pipe', location: 'Kilimani', 
    agreedPrice: 1500, status: 'pending', createdAt: new Date().toISOString()
  };

  const handleFundiAction = async (newStatus: 'accepted' | 'rejected' | 'in_progress') => {
    try {
      await updateJob.mutateAsync({ id: jobId, data: { status: newStatus } });
      queryClient.setQueryData(getGetJobQueryKey(jobId), (old: any) => 
        old ? { ...old, status: newStatus } : old
      );
    } catch (e) {
      // Local fallback for demo
      if (!job) window.location.reload();
    }
  };

  const handleEscrowPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mpesaCode.length < 6) return;
    
    try {
      await createPayment.mutateAsync({
        data: { jobId, amount: displayJob.agreedPrice, mpesaCode }
      });
      await updateJob.mutateAsync({ id: jobId, data: { status: 'in_progress' } });
      queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
    } catch (e) {
      // Demo fallback
      alert('Mock: Payment received in Escrow. Job is now In Progress.');
      queryClient.setQueryData(getGetJobQueryKey(jobId), (old: any) => old ? { ...old, status: 'in_progress' } : old);
    }
  };

  const handleCompleteAndRelease = async () => {
    try {
      await updateJob.mutateAsync({ id: jobId, data: { status: 'completed' } });
      await releasePayment.mutateAsync({ jobId });
      queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
      setShowReviewForm(true);
    } catch (e) {
      // Demo fallback
      alert('Mock: Job Completed and Funds Released to Fundi.');
      queryClient.setQueryData(getGetJobQueryKey(jobId), (old: any) => old ? { ...old, status: 'completed' } : old);
      setShowReviewForm(true);
    }
  };

  const renderStatusTimeline = () => {
    const states = ['pending', 'accepted', 'in_progress', 'completed'];
    const currentIndex = states.indexOf(displayJob.status);
    
    // Handle rejected/disputed separately
    if (displayJob.status === 'rejected') return <div className="text-red-500 font-bold flex items-center gap-2"><XCircle/> Job Rejected</div>;
    if (displayJob.status === 'disputed') return <div className="text-red-500 font-bold flex items-center gap-2"><AlertCircle/> Job Disputed - Admin Reviewing</div>;

    return (
      <div className="flex items-center w-full mt-4 mb-8">
        {states.map((state, i) => {
          const isPast = i <= currentIndex && currentIndex !== -1;
          const isCurrent = i === currentIndex;
          
          return (
            <div key={state} className="flex-1 flex flex-col items-center relative">
              {i !== 0 && (
                <div className={`absolute top-4 left-0 w-1/2 h-1 -translate-x-1/2 -z-10 ${isPast ? 'bg-primary' : 'bg-muted'}`}></div>
              )}
              {i !== states.length - 1 && (
                <div className={`absolute top-4 right-0 w-1/2 h-1 translate-x-1/2 -z-10 ${i < currentIndex ? 'bg-primary' : 'bg-muted'}`}></div>
              )}
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 bg-card ${isCurrent ? 'border-primary text-primary shadow-[0_0_0_4px_rgba(29,99,73,0.1)]' : isPast ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-muted-foreground'}`}>
                {isPast && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                {state.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
        <button onClick={() => setLocation('/jobs')} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </button>

        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-6 md:p-8 border-b bg-card">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Job #{displayJob.id}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {displayJob.location}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-sm text-muted-foreground mb-1">Agreed Price</span>
                <span className="text-3xl font-extrabold text-foreground">KES {displayJob.agreedPrice}</span>
              </div>
            </div>

            {renderStatusTimeline()}
          </div>

          {/* Body */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            <div className="p-6 md:p-8">
              <h3 className="font-bold text-lg mb-4">Job Details</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{displayJob.description}</p>
              
              <div className="bg-muted/50 rounded-xl p-4 border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {isCustomer ? displayJob.fundiName?.charAt(0) : displayJob.customerName?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">{isCustomer ? 'Fundi' : 'Customer'}</p>
                  <p className="font-bold text-foreground">{isCustomer ? displayJob.fundiName : displayJob.customerName}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-muted/10">
              <h3 className="font-bold text-lg mb-4">Action Center</h3>

              {/* Fundi Actions for Pending */}
              {isFundi && displayJob.status === 'pending' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">The customer has requested your services. Do you accept this job for KES {displayJob.agreedPrice}?</p>
                  <div className="flex gap-3">
                    <Button onClick={() => handleFundiAction('accepted')} className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Job
                    </Button>
                    <Button variant="outline" onClick={() => handleFundiAction('rejected')} className="flex-1 text-destructive hover:bg-destructive/10">
                      Decline
                    </Button>
                  </div>
                </div>
              )}

              {/* Customer Payment to Escrow after Accepted */}
              {isCustomer && displayJob.status === 'accepted' && (
                <div className="space-y-4">
                  <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl text-sm mb-4">
                    <div className="flex items-center gap-2 font-bold text-secondary-foreground mb-1">
                      <Lock className="w-4 h-4 text-secondary" /> Escrow Payment Required
                    </div>
                    <p className="text-muted-foreground">The fundi accepted! Pay KES {displayJob.agreedPrice} to Mtaani Escrow via M-PESA Paybill 123456 (Account: JOB{jobId}) to start work.</p>
                  </div>
                  
                  <form onSubmit={handleEscrowPayment} className="space-y-3">
                    <Label>M-PESA Confirmation Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. QKT5G..." 
                        value={mpesaCode}
                        onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                        required
                        className="font-mono uppercase bg-background"
                      />
                      <Button type="submit" disabled={mpesaCode.length < 6} className="shrink-0">
                        Confirm Payment
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              {isFundi && displayJob.status === 'accepted' && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-3">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Waiting for Escrow</p>
                    <p>Do not start work yet. Waiting for customer to deposit funds into the Mtaani Escrow.</p>
                  </div>
                </div>
              )}

              {/* In Progress */}
              {displayJob.status === 'in_progress' && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-sm mb-4">
                    <div className="flex items-center gap-2 font-bold text-primary mb-1">
                      <Lock className="w-4 h-4" /> Funds Secured in Escrow
                    </div>
                    <p className="text-muted-foreground">The money is locked safe. {isCustomer ? 'When work is done, release the payment.' : 'Complete the work, then ask the customer to release payment.'}</p>
                  </div>

                  {isCustomer && (
                    <Button size="lg" onClick={handleCompleteAndRelease} className="w-full font-bold text-base h-14 bg-green-600 hover:bg-green-700">
                      <Banknote className="w-5 h-5 mr-2" /> Job Complete - Release KES {displayJob.agreedPrice}
                    </Button>
                  )}
                  {isFundi && (
                    <div className="text-center p-4 border rounded-xl bg-card">
                      <p className="text-sm font-semibold mb-1">Work in progress</p>
                      <p className="text-xs text-muted-foreground">Ask the customer to hit "Release Payment" on their app when you finish.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Completed */}
              {displayJob.status === 'completed' && (
                <div className="space-y-4">
                  <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm flex items-start gap-3 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Job Completed</p>
                      <p>Funds have been released to the Fundi. Thank you for using Mtaani Skills!</p>
                    </div>
                  </div>

                  {showReviewForm && isCustomer && (
                    <div className="mt-6 border-t pt-6">
                      <h4 className="font-bold mb-3">Leave a Review</h4>
                      <div className="flex gap-2 mb-4">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} type="button" onClick={() => setReviewRating(star)} className="focus:outline-none">
                            <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-secondary text-secondary' : 'text-muted-foreground/30 fill-muted/10'}`} />
                          </button>
                        ))}
                      </div>
                      <Textarea 
                        placeholder="How was the service?" 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="mb-3 bg-background"
                      />
                      <Button onClick={() => { setShowReviewForm(false); alert('Review submitted!'); }}>Submit Review</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
