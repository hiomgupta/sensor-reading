import { Link } from "wouter";
import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">SensorLab</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            Documentation
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            Source
          </a>
          <div className="w-px h-4 bg-border"></div>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-mono">
            v1.0.0
          </span>
        </nav>
      </div>
    </header>
  );
}
