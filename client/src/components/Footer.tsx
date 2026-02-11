export function Footer() {
  return (
    <footer className="w-full border-t border-border py-6 bg-background">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>© 2024 SensorLab Project. Open source academic software.</p>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}
