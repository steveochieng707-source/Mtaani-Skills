import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { useGetDashboardStats, useGetPendingVerifications, useGetRecentJobs } from '@workspace/api-client-react';
import { Users, CheckCircle, ShieldAlert, Banknote, Briefcase, ChevronRight, Activity } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  // Use queries, fallback to dummy data if API empty
  const { data: stats } = useGetDashboardStats({ query: { queryKey: ['adminStats'] } });
  const { data: pending } = useGetPendingVerifications({ query: { queryKey: ['adminPending'] } });
  const { data: recentJobs } = useGetRecentJobs({ limit: 5 }, { query: { queryKey: ['adminRecent'] } });

  const displayStats = stats || {
    totalFundis: 142, verifiedFundis: 120, pendingVerifications: 5,
    totalJobs: 840, activeJobs: 34, completedJobs: 790,
    totalRevenue: 2500000, commissionEarned: 250000, totalCustomers: 560
  };

  const displayPending = pending || [
    { id: 10, userName: 'Brian Kimani', tvtLevel: 'level_5', location: 'Ruiru' },
    { id: 11, userName: 'Esther Njeri', tvtLevel: 'level_4', location: 'Thika' },
  ];

  const StatCard = ({ title, value, icon, subtitle }: any) => (
    <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-foreground mb-1">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="p-3 bg-muted rounded-xl text-primary">
        {icon}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-8 container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management.</p>
          </div>
          <div className="bg-secondary/10 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-bold border border-secondary/20 flex items-center gap-2">
            <Activity className="w-4 h-4" /> System Healthy
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Revenue" value={`KES ${(displayStats.totalRevenue / 1000).toFixed(1)}k`} icon={<Banknote />} subtitle={`Commissions: KES ${displayStats.commissionEarned}`} />
          <StatCard title="Total Jobs" value={displayStats.totalJobs} icon={<Briefcase />} subtitle={`${displayStats.activeJobs} active right now`} />
          <StatCard title="Verified Fundis" value={displayStats.verifiedFundis} icon={<CheckCircle />} subtitle={`${displayStats.totalFundis} total registered`} />
          <StatCard title="Customers" value={displayStats.totalCustomers} icon={<Users />} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Table - Recent Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b flex justify-between items-center bg-card">
                <h2 className="font-bold text-lg">Recent Escrow Jobs</h2>
                <button className="text-sm text-primary font-medium hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Job ID</th>
                      <th className="px-6 py-4 font-medium">Fundi</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(recentJobs || [
                      { id: 401, fundiName: 'David Ochieng', agreedPrice: 2000, status: 'in_progress' },
                      { id: 402, fundiName: 'Grace Wanjiku', agreedPrice: 5000, status: 'completed' },
                      { id: 403, fundiName: 'Sarah Achieng', agreedPrice: 1500, status: 'pending' },
                    ]).map((job: any) => (
                      <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">#{job.id}</td>
                        <td className="px-6 py-4">{job.fundiName}</td>
                        <td className="px-6 py-4 font-bold text-foreground">KES {job.agreedPrice}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'in_progress' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Pending Verifications */}
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b flex justify-between items-center bg-amber-50/50">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" /> Pending Verification
                </h2>
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">{displayPending.length}</span>
              </div>
              <div className="divide-y">
                {displayPending.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No pending verifications.</div>
                ) : (
                  displayPending.map((p: any) => (
                    <Link key={p.id} href={`/admin/verify/${p.id}`}>
                      <div className="p-5 hover:bg-muted/50 transition-colors cursor-pointer group flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{p.userName}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">TVET {p.tvtLevel?.split('_')[1]}</span>
                            {p.location}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
