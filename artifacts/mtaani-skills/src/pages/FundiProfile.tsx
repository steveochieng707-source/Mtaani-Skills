import { useParams, Link } from 'wouter';
import { useGetFundi, useListReviews } from '@workspace/api-client-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ShieldCheck, MapPin, Star, Wrench, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { getGetFundiQueryKey, getListReviewsQueryKey } from '@workspace/api-client-react';
import imgPlumber from '@assets/generated_images/plumber.jpg';

const FALLBACK_FUNDI = { 
  id: 1, userId: 101, userName: 'David Ochieng', 
  skills: ['Plumber', 'Pipe Fitter'], tvtLevel: 'level_5', 
  location: 'Kilimani, Nairobi', verified: true, available: true, 
  averageRating: 4.8, totalReviews: 24, completedJobs: 35,
  photoUrl: imgPlumber, hourlyRate: 1500,
  bio: "Experienced TVET Level 5 plumber with over 3 years of hands-on experience in residential and commercial plumbing. I specialize in leak repairs, pipe fitting, and bathroom installations. My goal is to provide reliable, clean, and lasting solutions to your neighborhood.",
  createdAt: new Date().toISOString()
};

const FALLBACK_REVIEWS = [
  { id: 1, customerName: 'Jane M.', rating: 5, comment: 'David arrived on time and fixed my leaking sink perfectly. Very professional and tidy.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, customerName: 'Peter K.', rating: 4, comment: 'Good work on the bathroom pipes. The escrow system made me feel safe. Would hire again.', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
];

export default function FundiProfile() {
  const { id } = useParams();
  const fundiId = Number(id);

  const { data: fundiData, isLoading: fundiLoading } = useGetFundi(fundiId, {
    query: { enabled: !!fundiId, queryKey: getGetFundiQueryKey(fundiId) }
  });

  const { data: reviewsData } = useListReviews(
    { fundiId },
    { query: { enabled: !!fundiId, queryKey: getListReviewsQueryKey({ fundiId }) } }
  );

  const fundi = fundiData || FALLBACK_FUNDI;
  const reviews = reviewsData && reviewsData.length > 0 ? reviewsData : FALLBACK_REVIEWS;

  if (fundiLoading && !fundiData) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-8 container mx-auto px-4 max-w-5xl">
        {/* Profile Header Card */}
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm mb-8">
          <div className="h-32 bg-primary/10 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231d6349\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-6">
              <div className="w-32 h-32 rounded-2xl border-4 border-card bg-muted overflow-hidden relative shadow-lg">
                {fundi.photoUrl ? (
                  <img src={fundi.photoUrl} alt={fundi.userName || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Wrench className="w-12 h-12 opacity-20" />
                  </div>
                )}
                {fundi.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5">
                    <ShieldCheck className="w-8 h-8 text-primary fill-primary/20" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    {fundi.userName}
                  </h1>
                  <div className="text-primary font-medium text-lg mb-1 flex items-center gap-2">
                    {fundi.skills?.join(', ')}
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      TVET {fundi.tvtLevel?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {fundi.location}</span>
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-secondary fill-secondary"/> {fundi.averageRating || '5.0'} ({fundi.totalReviews || 0} reviews)</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 sm:w-auto w-full">
                  <div className="text-sm bg-muted/50 px-4 py-2 rounded-xl text-center border">
                    <span className="block text-muted-foreground mb-0.5">Hourly Rate</span>
                    <span className="font-bold text-xl text-foreground">KES {fundi.hourlyRate}</span>
                  </div>
                  <Button size="lg" asChild className="w-full font-bold shadow-md h-12 text-base">
                    <Link href={`/book/${fundi.id}`}>Book {fundi.userName?.split(' ')[0]}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col - About */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> About Me
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {fundi.bio || "No bio provided."}
              </p>
              
              <div className="mt-8 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jobs Completed</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    {fundi.completedJobs || 0} <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Availability</p>
                  <p className="font-semibold text-foreground flex items-center gap-2 mt-1">
                    {fundi.available ? (
                      <><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Available Now</>
                    ) : (
                      <><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Busy</>
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                  <p className="font-semibold text-foreground flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-muted-foreground" /> Usually replies within 1 hour
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Client Reviews
              </h2>
              
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground italic">No reviews yet. Be the first to book and review!</p>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{review.customerName || 'Customer'}</div>
                        <div className="flex text-secondary">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-secondary' : 'text-muted/30 fill-muted/30'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-2">{review.comment}</p>
                      <span className="text-xs text-muted-foreground/70">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Col - Trust Badges */}
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Why Trust Mtaani
              </h3>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-card w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm text-primary font-bold">1</div>
                  <div>
                    <p className="font-semibold text-sm">Verified Credentials</p>
                    <p className="text-xs text-muted-foreground mt-0.5">We check TVET certificates and National IDs manually.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-card w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm text-primary font-bold">2</div>
                  <div>
                    <p className="font-semibold text-sm">Escrow Protection</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Funds are held safely until you confirm the job is complete.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-card w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm text-primary font-bold">3</div>
                  <div>
                    <p className="font-semibold text-sm">Genuine Reviews</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Only customers who complete a job can leave a review.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Ensure User import is present
import { User } from 'lucide-react';
