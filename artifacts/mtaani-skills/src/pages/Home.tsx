import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useGetTopFundis } from '@workspace/api-client-react';
import { MapPin, Star, ShieldCheck, Lock, CheckCircle2, ChevronRight, Search, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Using actual image paths generated via GenerateImage tool
import imgPlumber from '@assets/generated_images/plumber.jpg';
import imgElectrician from '@assets/generated_images/electrician.jpg';
import imgCarpenter from '@assets/generated_images/carpenter.jpg';
import imgPainter from '@assets/generated_images/painter.jpg';

const FAKE_TOP_FUNDIS = [
  { id: 1, name: 'David Ochieng', skill: 'Plumber', location: 'Kilimani', rating: 4.8, reviews: 24, photo: imgPlumber, level: 'Level 5' },
  { id: 2, name: 'Grace Wanjiku', skill: 'Electrician', location: 'Westlands', rating: 4.9, reviews: 31, photo: imgElectrician, level: 'Level 6' },
  { id: 3, name: 'Kevin Mutua', skill: 'Carpenter', location: 'Langata', rating: 4.7, reviews: 18, photo: imgCarpenter, level: 'Level 4' },
  { id: 4, name: 'Sarah Achieng', skill: 'Painter', location: 'Ngong', rating: 5.0, reviews: 42, photo: imgPainter, level: 'Level 5' },
];

export default function Home() {
  const [skillQuery, setSkillQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Try to use API if available, else fallback
  const { data: topFundisData } = useGetTopFundis({ limit: 4 }, { query: { queryKey: ['topFundis'] } });
  
  // For design purposes, we'll use the fake data if API is empty/fails
  const displayFundis = topFundisData && topFundisData.length > 0 ? topFundisData : FAKE_TOP_FUNDIS;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-primary px-4 pt-24 pb-32 md:pt-32 md:pb-40 text-primary-foreground">
          {/* Subtle noise/texture background */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
          
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 blur-3xl opacity-20 bg-secondary w-96 h-96 rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 blur-3xl opacity-20 bg-primary-foreground w-96 h-96 rounded-full pointer-events-none"></div>

          <div className="container relative z-10 mx-auto max-w-5xl text-center">
            <span className="inline-block rounded-full bg-secondary/20 px-4 py-1.5 text-sm font-semibold text-secondary mb-6 ring-1 ring-secondary/50">
              Kenya's Trusted TVET Marketplace
            </span>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Verified neighborhood <br className="hidden sm:block"/>
              skills you can <span className="text-secondary relative whitespace-nowrap">
                trust
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
              Book certified plumbers, electricians, and carpenters in your area. Your money is held safely in escrow until the job is done right.
            </p>

            {/* SEARCH BAR */}
            <div className="mx-auto max-w-3xl rounded-2xl bg-background p-2 shadow-2xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="What service do you need?" 
                  className="pl-12 h-14 border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0 text-base"
                  value={skillQuery}
                  onChange={(e) => setSkillQuery(e.target.value)}
                />
              </div>
              <div className="hidden md:block w-px bg-border my-2"></div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="Where? (e.g. Kilimani)" 
                  className="pl-12 h-14 border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0 text-base"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
              <Button asChild size="lg" className="h-14 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-xl w-full md:w-auto">
                <Link href={`/fundis?skill=${encodeURIComponent(skillQuery)}&location=${encodeURIComponent(locationQuery)}`}>
                  Search
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm font-medium text-primary-foreground/90">
              <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-secondary"/> Secure Escrow Payments</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-secondary"/> TVET Certificate Verified</div>
              <div className="flex items-center gap-2"><Star className="w-5 h-5 text-secondary fill-secondary"/> 100% Genuine Reviews</div>
            </div>
          </div>
        </section>

        {/* FEATURED FUNDIS */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Top-rated Fundis</h2>
                <p className="text-muted-foreground mt-2">Verified TVET graduates ready for work</p>
              </div>
              <Button variant="outline" asChild className="group">
                <Link href="/fundis">
                  View all Fundis <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayFundis.map((fundi: any) => (
                <Link key={fundi.id} href={`/fundis/${fundi.id}`}>
                  <div className="group rounded-2xl border bg-card overflow-hidden hover-elevate transition-all duration-300 hover:border-primary/50 cursor-pointer h-full flex flex-col">
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      {fundi.photo || fundi.photoUrl ? (
                        <img 
                          src={fundi.photo || fundi.photoUrl} 
                          alt={fundi.name || fundi.userName} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <Wrench className="w-12 h-12 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur px-2.5 py-1 text-xs font-semibold text-primary shadow-sm border border-primary/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        TVET {fundi.level || fundi.tvtLevel?.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{fundi.name || fundi.userName}</h3>
                        <div className="flex items-center gap-1 text-sm font-semibold bg-secondary/10 text-secondary-foreground px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                          {fundi.rating || fundi.averageRating || '5.0'}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm font-medium mb-4">{fundi.skill || (fundi.skills && fundi.skills[0]) || 'Specialist'}</p>
                      <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {fundi.location}
                        </div>
                        <span className="font-medium text-foreground">{fundi.reviews || fundi.totalReviews || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">How Mtaani Skills Works</h2>
              <p className="text-muted-foreground text-lg">A process designed to protect both you and the fundi, ensuring quality work every time.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10"></div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-card border shadow-sm flex items-center justify-center mb-6 relative z-10 mx-auto text-primary">
                  <Search className="w-10 h-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center border-4 border-muted">1</div>
                </div>
                <h3 className="text-xl font-bold mb-2">Find a Verified Fundi</h3>
                <p className="text-muted-foreground">Browse local TVET-certified professionals. Check their real reviews, past work, and skill level.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-card border shadow-sm flex items-center justify-center mb-6 relative z-10 mx-auto text-primary">
                  <Lock className="w-10 h-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center border-4 border-muted">2</div>
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Escrow Payment</h3>
                <p className="text-muted-foreground">Agree on a price. You pay into Mtaani's secure escrow via M-PESA. The fundi knows the money is there, but they can't touch it yet.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-card border shadow-sm flex items-center justify-center mb-6 relative z-10 mx-auto text-primary">
                  <CheckCircle2 className="w-10 h-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center border-4 border-muted">3</div>
                </div>
                <h3 className="text-xl font-bold mb-2">Job Done, Money Released</h3>
                <p className="text-muted-foreground">Once you're satisfied with the work, hit release. The fundi gets paid instantly. Leave a review to help the community.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="rounded-3xl bg-primary p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 blur-3xl opacity-30 bg-secondary w-96 h-96 rounded-full"></div>
              
              <div className="relative z-10">
                <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-secondary" />
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Are you a TVET student or graduate?</h2>
                <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
                  Build your reputation, find local clients, and guarantee your payment. Join Mtaani Skills as a verified Fundi today.
                </p>
                <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-14 px-8 text-lg rounded-xl">
                  <Link href="/login">Apply to Join</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
