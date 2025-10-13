import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Building2, Check, ArrowLeft, Heart, Users, Calendar, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import twintLogo from "@/assets/twint-logo.png";
import visaLogo from "@/assets/visa-logo.svg";

const Buchung = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kurstyp, setKurstyp] = useState<string>("privat");
  const [zahlungsmethode, setZahlungsmethode] = useState<string>("twint");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Vielen Dank für Ihre Buchung!",
        description: "Wir freuen uns darauf, Sie bald im Schnee zu sehen! 🎿",
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-8 border-b">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Kurs buchen
          </h1>
          <p className="text-white/90 text-lg">
            Wählen Sie Ihren Kurs und schliessen Sie die Buchung ab
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Kursauswahl */}
              <Card className="border shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl font-bold">Kursauswahl</CardTitle>
                  <CardDescription>Wählen Sie Ihren Kurs</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <RadioGroup value={kurstyp} onValueChange={setKurstyp} className="space-y-3">
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${kurstyp === 'privat' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                      <RadioGroupItem value="privat" id="privat" />
                      <Label htmlFor="privat" className="flex-1 cursor-pointer">
                        <span className="font-semibold block">Privatkurs</span>
                        <span className="text-sm text-muted-foreground">Individueller Unterricht</span>
                      </Label>
                      <span className="font-bold text-primary">ab CHF 75.-</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${kurstyp === 'gruppe' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                      <RadioGroupItem value="gruppe" id="gruppe" />
                      <Label htmlFor="gruppe" className="flex-1 cursor-pointer">
                        <span className="font-semibold block">Gruppenkurs</span>
                        <span className="text-sm text-muted-foreground">5 Tage à 4 Stunden</span>
                      </Label>
                      <span className="font-bold text-primary">CHF 320.-</span>
                    </div>
                  </RadioGroup>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="datum">Startdatum</Label>
                      <Input type="date" id="datum" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teilnehmer">Anzahl Teilnehmer</Label>
                      <Select defaultValue="1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Person</SelectItem>
                          <SelectItem value="2">2 Personen</SelectItem>
                          <SelectItem value="3">3 Personen</SelectItem>
                          <SelectItem value="4">4 Personen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kontaktdaten */}
              <Card className="border shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl font-bold">Kontaktdaten</CardTitle>
                  <CardDescription>Ihre Angaben für die Buchungsbestätigung</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vorname">Vorname</Label>
                      <Input id="vorname" required placeholder="z.B. Anna" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nachname">Nachname</Label>
                      <Input id="nachname" required placeholder="z.B. Müller" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input id="email" type="email" required placeholder="anna.mueller@beispiel.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input id="telefon" type="tel" required placeholder="+41 79 123 45 67" />
                  </div>
                </CardContent>
              </Card>

              {/* Zahlungsmethode */}
              <Card className="border shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl font-bold">Zahlungsmethode</CardTitle>
                  <CardDescription>Wählen Sie Ihre bevorzugte Zahlungsart</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <RadioGroup value={zahlungsmethode} onValueChange={setZahlungsmethode} className="space-y-3">
                    {/* TWINT */}
                    <div className={`rounded-lg border transition-colors cursor-pointer ${zahlungsmethode === 'twint' ? 'border-[#FFED00] bg-[#FFED00]/5' : 'border-border hover:bg-muted/30'}`}>
                      <div className="flex items-center space-x-3 p-4">
                        <RadioGroupItem value="twint" id="twint" />
                        <div className="w-20 flex items-center justify-center">
                          <img src={twintLogo} alt="TWINT" className="h-8" />
                        </div>
                        <Label htmlFor="twint" className="flex-1 cursor-pointer">
                          <span className="font-semibold block">TWINT</span>
                          <span className="text-sm text-muted-foreground">QR-Code scannen und bezahlen</span>
                        </Label>
                        {zahlungsmethode === 'twint' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Kreditkarte */}
                    <div className={`rounded-lg border transition-colors cursor-pointer ${zahlungsmethode === 'kreditkarte' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                      <div className="flex items-center space-x-3 p-4">
                        <RadioGroupItem value="kreditkarte" id="kreditkarte" />
                        <div className="w-20 flex items-center justify-center">
                          <img src={visaLogo} alt="Visa" className="h-6" />
                        </div>
                        <Label htmlFor="kreditkarte" className="flex-1 cursor-pointer">
                          <span className="font-semibold block">Kreditkarte</span>
                          <span className="text-sm text-muted-foreground">Visa, Mastercard, Amex</span>
                        </Label>
                        {zahlungsmethode === 'kreditkarte' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      {zahlungsmethode === 'kreditkarte' && (
                        <div className="px-4 pb-4 pt-2 space-y-3 border-t bg-muted/20">
                          <div className="space-y-2">
                            <Label htmlFor="cardnumber" className="text-sm">Kartennummer</Label>
                            <Input id="cardnumber" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="expiry" className="text-sm">Gültig bis</Label>
                              <Input id="expiry" placeholder="MM/JJ" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv" className="text-sm">CVV</Label>
                              <Input id="cvv" placeholder="123" maxLength={3} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Banküberweisung */}
                    <div className={`rounded-lg border transition-colors cursor-pointer ${zahlungsmethode === 'ueberweisung' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                      <div className="flex items-center space-x-3 p-4">
                        <RadioGroupItem value="ueberweisung" id="ueberweisung" />
                        <div className="w-20 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <Label htmlFor="ueberweisung" className="flex-1 cursor-pointer">
                          <span className="font-semibold block">Banküberweisung</span>
                          <span className="text-sm text-muted-foreground">Rechnung per E-Mail</span>
                        </Label>
                        {zahlungsmethode === 'ueberweisung' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* PostFinance */}
                    <div className={`rounded-lg border transition-colors cursor-pointer ${zahlungsmethode === 'postfinance' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
                      <div className="flex items-center space-x-3 p-4">
                        <RadioGroupItem value="postfinance" id="postfinance" />
                        <div className="w-20 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-[#FFCC00]" />
                        </div>
                        <Label htmlFor="postfinance" className="flex-1 cursor-pointer">
                          <span className="font-semibold block">PostFinance</span>
                          <span className="text-sm text-muted-foreground">Weiterleitung zu PostFinance</span>
                        </Label>
                        {zahlungsmethode === 'postfinance' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl font-bold">Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kurstyp:</span>
                      <span className="font-semibold capitalize">{kurstyp}kurs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teilnehmer:</span>
                      <span className="font-semibold">1 Person</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-primary">CHF {kurstyp === 'privat' ? '75' : '320'}.-</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird bearbeitet...' : 'Jetzt buchen'}
                  </Button>

                  <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      Sofortige Bestätigung per E-Mail
                    </p>
                    <p className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      Kostenlose Stornierung bis 24h vorher
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Buchung;
