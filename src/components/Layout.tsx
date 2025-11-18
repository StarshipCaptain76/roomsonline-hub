import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isPropertyPage = location.pathname.startsWith("/property/");
  const isBookingPage = location.pathname.startsWith("/booking/");
  const hideHeader = isHomePage || isPropertyPage || isBookingPage;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideHeader && (
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Rooms Online Booking</span>
              </Link>

              <nav className="flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/search" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Search
                </Link>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-card/30 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Rooms Online Booking – All rights reserved
        </div>
      </footer>
    </div>
  );
};
