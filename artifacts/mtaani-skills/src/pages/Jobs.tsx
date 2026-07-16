import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { useListJobs, getListJobsQueryKey } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, ArrowRight, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

const FALLBACK_JOBS = [
  { id: 101, fundiName: 'David Ochieng', description: 'Fix leaking kitchen sink pipe', location: 'Kilimani', agreedPrice: 1500, status: 'pending', createdAt: new Date().toISOString() },
  { id: 102, fundiName: 'Grace Wanjiku', description: 'Install new chandelier in living room', location: 'Kilimani', agreedPrice: 2500, status: 'in_progress', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 103, fundiName: 'Sarah Achieng', description: 'Paint master bedroom', location: 'Kilimani', agreedPrice: 8000, status: 'completed', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const FALLBACK_FUNDI_JOBS = [
  { id: 101, customerName: 'John Doe', description: 'Fix leaking kitchen sink pipe', location: 'Kilimani', agreedPrice: 1500, status: 'pending', createdAt: new Date().toISOString() },
  { id: 102, customerName: 'Alice M.', description: 'Install new chandelier in living room', location: 'Kilimani', agreedPrice: 2500, status: 'in_progress', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export default function Jobs() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    return null;
  }

  const isCustomer = user.role === 'customer';
  const params = isCustomer ? { customerId: user.userId } : { fundiId: user.userId };
  
  const { data: jobs, isLoading } = useListJobs(
    params,
    { query: { enabled: !!user.userId, queryKey: getListJobsQueryKey(params) } }
  );

  const displayJobs = jobs && jobs.length > 0 ? jobs : (isCustomer ? FALLBACK_JOBS : FALLBACK_FUNDI_JOBS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'disputed': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'in_progress': return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  const formatStatus = (status: string) => status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-10 container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isCustomer ? 'My Jobs' : 'Job Requests'}
          </h1>
          <p className="text-muted-foreground">Manage your bookings and payments.</p>
        </div>

        {isLoading && !jobs ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-card border rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center shadow-sm">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No jobs yet</h3>
            <p className="text-muted-foreground mb-6">When you {isCustomer ? 'book a fundi' : 'receive a booking'}, it will appear here.</p>
            {isCustomer && (
              <Link href="/fundis" className="text-primary font-semibold hover:underline">Browse Fundis</Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {displayJobs.map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="bg-card border rounded-2xl p-5 md:p-6 shadow-sm hover-elevate transition-all group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {formatStatus(job.status)}
                      </span>
                      <span className="text-sm text-muted-foreground">#{job.id} • {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {job.description}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <span className="text-muted-foreground">{isCustomer ? 'Fundi:' : 'Customer:'}</span>
                        {isCustomer ? job.fundiName : job.customerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 pl-0 md:pl-6 md:border-l">
                    <div className="text-left md:text-right">
                      <span className="block text-xs text-muted-foreground mb-0.5">Agreed Price</span>
                      <span className="font-bold text-xl text-foreground">KES {job.agreedPrice}</span>
                    </div>
                    <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
