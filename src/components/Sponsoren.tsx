import { HeartHandshake } from "lucide-react";
import axaloAsset from "@/assets/sponsors/sponsor-axalo.png.asset.json";
import heideggerAsset from "@/assets/sponsors/sponsor-heidegger.png.asset.json";
import goldtestAsset from "@/assets/sponsors/sponsor-goldtest.png.asset.json";
import kayakAsset from "@/assets/sponsors/sponsor-kayak.png.asset.json";

const sponsors = [
  { name: "AXALO", src: axaloAsset.url },
  { name: "HEIDEGGER", src: heideggerAsset.url },
  { name: "GOLDTEST OF SWITZERLAND", src: goldtestAsset.url },
  { name: "KAYAK", src: kayakAsset.url },
];

const Sponsoren = () => {
  return (
    <section id="sponsoren" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md border border-primary/20">
            <HeartHandshake className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wider uppercase">Partner & Sponsoren</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Unterstützt von starken Partnern
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto items-stretch">
          {sponsors.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-center p-6 bg-card border-2 border-primary/10 rounded-lg hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={s.src}
                alt={`Logo ${s.name}`}
                className="max-h-32 w-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsoren;
