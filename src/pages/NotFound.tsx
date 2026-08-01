import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Sponsoren from "@/components/Sponsoren";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">Seite nicht gefunden</p>
          <p className="mb-8 text-muted-foreground">
            Die angeforderte Seite existiert leider nicht. Bitte überprüfen Sie die URL oder kehren Sie zur Startseite zurück.
          </p>
          <a href="/">
            <Button className="gap-2">
              <ArrowLeft size={16} />
              Zurück zur Startseite
            </Button>
          </a>
        </div>
      </div>

      <Sponsoren />
    </div>
  );
};

export default NotFound;
