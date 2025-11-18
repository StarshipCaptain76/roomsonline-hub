import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | RoomsOnline</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="mb-6 mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Home className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
          <p className="mb-8 text-xl text-foreground/70">Oops! Page not found</p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
