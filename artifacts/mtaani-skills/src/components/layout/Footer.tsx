import { Link } from 'wouter';
import { ShieldCheck, Wrench, Lock, HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                Mtaani <span className="text-secondary">Skills</span>
              </span>
            </Link>
            <p className="max-w-xs text-muted-foreground leading-relaxed">
              Connecting Kenyan neighborhoods with verified, skilled TVET student Fundis. Safe, reliable, and community-driven.
            </p>
            <div className="mt-6 flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1"><Lock className="w-4 h-4"/> Escrow Protected</div>
              <div className="flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> TVET Verified</div>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Discover</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/fundis" className="hover:text-primary transition-colors">Find a Plumber</Link></li>
              <li><Link href="/fundis" className="hover:text-primary transition-colors">Find an Electrician</Link></li>
              <li><Link href="/fundis" className="hover:text-primary transition-colors">Find a Carpenter</Link></li>
              <li><Link href="/fundis" className="hover:text-primary transition-colors">Find a Painter</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Join as a Fundi</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Log in</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Mtaani Skills. Built with <HeartHandshake className="inline w-4 h-4 text-secondary mx-1"/> in Nairobi.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-primary transition-colors">Terms of Service</span>
            <span className="cursor-pointer hover:text-primary transition-colors">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
