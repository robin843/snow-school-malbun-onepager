import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, MicOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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
    <Button
      onClick={toggleCall}
      size="lg"
      className={`
        ${isScrolled 
          ? "fixed bottom-8 right-8 z-50 shadow-lg" 
          : "absolute bottom-24 right-8 z-20"
        }
        ${isCallActive 
          ? "bg-destructive hover:bg-destructive/90" 
          : "bg-primary hover:bg-primary/90"
        }
        ${isSpeaking ? "animate-pulse" : ""}
        rounded-full w-16 h-16 p-0 transition-all duration-300
      `}
      aria-label={isCallActive ? "Gespräch beenden" : "Gespräch starten"}
    >
      {isCallActive ? (
        isSpeaking ? <MicOff size={28} /> : <Phone size={28} />
      ) : (
        <Mic size={28} />
      )}
    </Button>
  );
};

export default VoiceBot;
