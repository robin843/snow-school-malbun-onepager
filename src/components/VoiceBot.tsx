import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import christophPortrait from "@/assets/christoph-portrait.png";

const vapi = new Vapi("b682d2e8-903c-43bd-9801-91836de8b403");

interface VoiceBotProps {
  isScrolled: boolean;
}

const VoiceBot = ({ isScrolled }: VoiceBotProps) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    vapi.on("call-start", () => {
      setIsCallActive(true);
      toast({
        title: "Gespräch gestartet",
        description: "Sie können jetzt mit dem Bot sprechen",
      });
    });

    vapi.on("call-end", () => {
      setIsCallActive(false);
      setIsSpeaking(false);
      toast({
        title: "Gespräch beendet",
        description: "Das Gespräch wurde beendet",
      });
    });

    vapi.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapi.on("error", (error) => {
      console.error("Vapi error:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    });

    return () => {
      vapi.stop();
    };
  }, [toast]);

  const toggleCall = async () => {
    try {
      if (isCallActive) {
        vapi.stop();
      } else {
        await vapi.start("4f2be95c-67f3-4e51-b542-7838961d2096");
      }
    } catch (error) {
      console.error("Error toggling call:", error);
      toast({
        title: "Fehler",
        description: "Konnte Gespräch nicht starten",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`
        ${isScrolled 
          ? "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
          : "absolute bottom-20 right-4 sm:bottom-24 sm:right-6 z-20"
        }
        flex flex-col items-end gap-3 transition-all duration-300
      `}
    >
      {!isCallActive && !isScrolled && (
        <div className="hidden sm:block bg-card/95 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border border-border animate-fade-in">
          <p className="text-base font-semibold text-foreground whitespace-nowrap">
            💬 Sprich mit Christoph
          </p>
        </div>
      )}
      
      <button
        onClick={toggleCall}
        className={`
          relative group
          ${isCallActive 
            ? "ring-2 ring-destructive/50"
            : "ring-2 ring-primary/50 hover:ring-primary/70"
          }
          ${isSpeaking ? "animate-pulse" : ""}
          rounded-full transition-all duration-300 hover:scale-105 shadow-premium
        `}
        aria-label={isCallActive ? "Gespräch beenden" : "Mit Christoph sprechen"}
      >
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-lg">
          <img
            src={christophPortrait}
            alt="Christoph"
            className="w-full h-full object-cover"
          />
          <div className={`
            absolute inset-0 flex items-center justify-center
            ${isCallActive 
              ? "bg-destructive/90" 
              : "bg-primary/0 group-hover:bg-primary/20"
            }
            transition-all duration-300
          `}>
            {isCallActive && (
              <PhoneOff className="text-white" size={20} />
            )}
          </div>
          
          {!isCallActive && (
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow-lg">
              <Phone className="text-primary-foreground" size={12} />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

export default VoiceBot;
