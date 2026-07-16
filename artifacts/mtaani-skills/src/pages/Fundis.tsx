import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link, useLocation } from 'wouter';
import { useListFundis } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ShieldCheck, Star, Filter, Wrench } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Using actual image paths generated via GenerateImage tool
import imgPlumber from '@assets/generated_images/plumber.jpg';
import imgElectrician from '@assets/generated_images/electrician.jpg';
import imgCarpenter from '@assets/generated_images/carpenter.jpg';
import imgPainter from '@assets/generated_images/painter.jpg';

const FALLBACK_FUNDIS = [
  { id: 1, userId: 101, userName: 'David Ochieng', skills: ['Plumber'], tvtLevel: 'level_5', location: 'Kilimani', verified: true, available: true, averageRating: 4.8, totalReviews: 24, photoUrl: imgPlumber, hourlyRate: 1500 },
  { id: 2, userId: 102, userName: 'Grace Wanjiku', skills: ['Electrician'], tvtLevel: 'level_6', location: 'Westlands', verified: true, available: true, averageRating: 4.9, totalReviews: 31, photoUrl: imgElectrician, hourlyRate: 2000 },
  { id: 3, userId: 103, userName: 'Kevin Mutua', skills: ['Carpenter'], tvtLevel: 'level_4', location: 'Langata', verified: true, available: true, averageRating: 4.7, totalReviews: 18, photoUrl: imgCarpenter, hourlyRate: 1200 },
  { id: 4, userId: 104, userName: 'Sarah Achieng', skills: ['Painter'], tvtLevel: 'level_5', location: 'Ngong', verified: true, available: true, averageRating: 5.0, totalReviews: 42, photoUrl: imgPainter, hourlyRate: 1000 },
];

export default function Fundis() {
  const [searchParams] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  
  const [skill, setSkill] = useState(urlParams.get('skill') || '');
  const [location, setLocation] = useState(urlParams.get('location') || '');
  const [category, setCategory] = useState<string>('all');

  const { data: fundis, isLoading } = useListFundis(
    { skill: skill || undefined, location: location || undefined, verified: true },
    { query: { queryKey: ['fundis', skill, location] } }
  );

  const displayFundis = fundis && fundis.length > 0 ? fundis : FALLBACK_FUNDIS;

  const filteredFundis = displayFundis.filter(f => {
    if (category !== 'all' && f.skills && !f.skills[0].toLowerCase().includes(category.toLowerCase())) return false;
    if (skill && !f.skills?.join(' ').toLowerCase().includes(skill.toLowerCase()) && !f.userName?.toLowerCase().includes(skill.toLowerCase())) return false;
    if (location && !f.location?.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-8 container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Find a Verified Fundi</h1>
          <p className="text-muted-foreground">Browse top-rated TVET graduates in your neighborhood.</p>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-2xl p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search skill or name..." 
              className="pl-9 h-12 bg-muted/50"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
          </div>
          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Location..." 
              className="pl-9 h-12 bg-muted/50"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 bg-muted/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="plumber">Plumbing</SelectItem>
                <SelectItem value="electrician">Electrical</SelectItem>
                <SelectItem value="carpenter">Carpentry</SelectItem>
                <SelectItem value="painter">Painting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading && (!fundis) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl border bg-card p-4 h-80 animate-pulse flex flex-col">
                <div className="w-full h-40 bg-muted rounded-xl mb-4"></div>
                <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded mb-auto"></div>
                <div className="h-10 w-full bg-muted rounded mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredFundis.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No fundis found</h3>
            <p className="text-muted-foreground">Try adjusting your search or location filters.</p>
            <Button variant="outline" className="mt-6" onClick={() => {setSkill(''); setLocation(''); setCategory('all');}}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFundis.map((fundi: any) => (
              <Link key={fundi.id} href={`/fundis/${fundi.id}`}>
                <div className="group rounded-2xl border bg-card overflow-hidden hover-elevate transition-all duration-300 hover:border-primary/50 cursor-pointer h-full flex flex-col">
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    {fundi.photoUrl ? (
                      <img 
                        src={fundi.photoUrl} 
                        alt={fundi.userName} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <Wrench className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur px-2.5 py-1 text-xs font-semibold text-primary shadow-sm border border-primary/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      TVET {fundi.tvtLevel?.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{fundi.userName}</h3>
                      <div className="flex items-center gap-1 text-sm font-semibold bg-secondary/10 text-secondary-foreground px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                        {fundi.averageRating || '5.0'}
                      </div>
                    </div>
                    
                    <p className="text-primary font-medium mb-3">{fundi.skills && fundi.skills[0]}</p>
                    
                    <div className="space-y-2 mt-auto text-sm text-muted-foreground border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {fundi.location}
                        </div>
                        <span className="font-medium text-foreground">{fundi.totalReviews || 0} reviews</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Hourly Rate</span>
                        <span className="font-bold text-foreground text-base">KES {fundi.hourlyRate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
