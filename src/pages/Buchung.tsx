import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Building2, Smartphone, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
        title: "Buchung erfolgreich!",
        description: "Sie erhalten eine Bestätigung per E-Mail.",
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary py-6 shadow-xl">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Startseite
          </Button>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Kurs buchen
          </h1>
          <p className="text-white/90 text-lg mt-2">
            Wählen Sie Ihren Kurs und Ihre bevorzugte Zahlungsmethode
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Kursauswahl */}
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="text-2xl font-black">Kursauswahl</CardTitle>
                  <CardDescription>Wählen Sie Ihren gewünschten Kurs</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-bold">Kurstyp</Label>
                    <RadioGroup value={kurstyp} onValueChange={setKurstyp} className="space-y-3">
                      <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${kurstyp === 'privat' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="privat" id="privat" />
                        <Label htmlFor="privat" className="flex-1 cursor-pointer">
                          <span className="font-bold block">Privatkurs</span>
                          <span className="text-sm text-muted-foreground">Individueller Unterricht</span>
                        </Label>
                        <span className="font-bold text-primary">ab CHF 75.-</span>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${kurstyp === 'gruppe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="gruppe" id="gruppe" />
                        <Label htmlFor="gruppe" className="flex-1 cursor-pointer">
                          <span className="font-bold block">Gruppenkurs</span>
                          <span className="text-sm text-muted-foreground">5 Tage à 4 Stunden</span>
                        </Label>
                        <span className="font-bold text-primary">CHF 320.-</span>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="datum">Startdatum</Label>
                      <Input type="date" id="datum" required className="border-2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teilnehmer">Anzahl Teilnehmer</Label>
                      <Select defaultValue="1">
                        <SelectTrigger className="border-2">
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
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="text-2xl font-black">Kontaktdaten</CardTitle>
                  <CardDescription>Ihre persönlichen Informationen</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vorname">Vorname *</Label>
                      <Input id="vorname" required className="border-2" placeholder="Max" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nachname">Nachname *</Label>
                      <Input id="nachname" required className="border-2" placeholder="Mustermann" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input id="email" type="email" required className="border-2" placeholder="max@beispiel.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input id="telefon" type="tel" required className="border-2" placeholder="+41 79 123 45 67" />
                  </div>
                </CardContent>
              </Card>

              {/* Zahlungsmethode */}
              <Card className="border-2 border-secondary/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
                  <CardTitle className="text-2xl font-black">Zahlungsmethode</CardTitle>
                  <CardDescription>Wählen Sie Ihre bevorzugte Zahlungsart</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <RadioGroup value={zahlungsmethode} onValueChange={setZahlungsmethode} className="space-y-3">
                    {/* TWINT */}
                    <div className={`group relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${zahlungsmethode === 'twint' ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'}`}>
                      <div className="flex items-center space-x-4 p-5">
                        <RadioGroupItem value="twint" id="twint" />
                        <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-secondary" />
                        </div>
                        <Label htmlFor="twint" className="flex-1 cursor-pointer">
                          <span className="font-bold text-lg block">TWINT</span>
                          <span className="text-sm text-muted-foreground">Schnell & sicher mit TWINT bezahlen</span>
                        </Label>
                        {zahlungsmethode === 'twint' && (
                          <Check className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      {zahlungsmethode === 'twint' && (
                        <div className="px-5 pb-5 space-y-3 bg-secondary/5">
                          <Separator />
                          <p className="text-sm text-muted-foreground">
                            Sie erhalten nach der Buchung einen QR-Code per E-Mail, den Sie mit der TWINT-App scannen können.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Kreditkarte */}
                    <div className={`group relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${zahlungsmethode === 'kreditkarte' ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'}`}>
                      <div className="flex items-center space-x-4 p-5">
                        <RadioGroupItem value="kreditkarte" id="kreditkarte" />
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <Label htmlFor="kreditkarte" className="flex-1 cursor-pointer">
                          <span className="font-bold text-lg block">Kreditkarte</span>
                          <span className="text-sm text-muted-foreground">Visa, Mastercard, American Express</span>
                        </Label>
                        {zahlungsmethode === 'kreditkarte' && (
                          <Check className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      {zahlungsmethode === 'kreditkarte' && (
                        <div className="px-5 pb-5 space-y-4 bg-secondary/5">
                          <Separator />
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="cardnumber">Kartennummer</Label>
                              <Input id="cardnumber" placeholder="1234 5678 9012 3456" className="border-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry">Gültig bis</Label>
                                <Input id="expiry" placeholder="MM/JJ" className="border-2" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" maxLength={3} className="border-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Banküberweisung */}
                    <div className={`group relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${zahlungsmethode === 'ueberweisung' ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'}`}>
                      <div className="flex items-center space-x-4 p-5">
                        <RadioGroupItem value="ueberweisung" id="ueberweisung" />
                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-accent" />
                        </div>
                        <Label htmlFor="ueberweisung" className="flex-1 cursor-pointer">
                          <span className="font-bold text-lg block">Banküberweisung</span>
                          <span className="text-sm text-muted-foreground">Überweisung auf unser Bankkonto</span>
                        </Label>
                        {zahlungsmethode === 'ueberweisung' && (
                          <Check className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      {zahlungsmethode === 'ueberweisung' && (
                        <div className="px-5 pb-5 space-y-3 bg-secondary/5">
                          <Separator />
                          <p className="text-sm text-muted-foreground">
                            Sie erhalten nach der Buchung eine Rechnung mit unseren Bankverbindungsdaten per E-Mail.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* PostFinance */}
                    <div className={`group relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${zahlungsmethode === 'postfinance' ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'}`}>
                      <div className="flex items-center space-x-4 p-5">
                        <RadioGroupItem value="postfinance" id="postfinance" />
                        <div className="w-12 h-12 bg-[#FFCC00]/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-[#FFCC00]" />
                        </div>
                        <Label htmlFor="postfinance" className="flex-1 cursor-pointer">
                          <span className="font-bold text-lg block">PostFinance</span>
                          <span className="text-sm text-muted-foreground">Bezahlen mit PostFinance</span>
                        </Label>
                        {zahlungsmethode === 'postfinance' && (
                          <Check className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      {zahlungsmethode === 'postfinance' && (
                        <div className="px-5 pb-5 space-y-3 bg-secondary/5">
                          <Separator />
                          <p className="text-sm text-muted-foreground">
                            Sie werden zu PostFinance weitergeleitet, um die Zahlung abzuschließen.
                          </p>
                        </div>
                      )}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border-2 border-accent/30 shadow-2xl">
                <CardHeader className="bg-gradient-to-br from-accent/20 to-accent/10">
                  <CardTitle className="text-2xl font-black">Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kurstyp:</span>
                      <span className="font-bold capitalize">{kurstyp}kurs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Teilnehmer:</span>
                      <span className="font-bold">1 Person</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-bold">CHF {kurstyp === 'privat' ? '75' : '320'}.-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MwSt. (inkl.):</span>
                      <span className="font-bold">CHF 0.-</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black">Total:</span>
                      <span className="text-3xl font-black text-primary">CHF {kurstyp === 'privat' ? '75' : '320'}.-</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full font-black text-lg py-6 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird bearbeitet...' : 'Jetzt kostenpflichtig buchen'}
                  </Button>

                  <div className="space-y-2 pt-4 text-xs text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      Sichere Zahlung mit SSL-Verschlüsselung
                    </p>
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
