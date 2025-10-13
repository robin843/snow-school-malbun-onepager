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
import twintLogo from "@/assets/twint-logo.svg";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary py-8 shadow-xl">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Startseite
          </Button>
          <div className="flex items-center gap-4 mb-3">
            <Heart className="w-10 h-10 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Bereit für Ihr Schneeerlebnis?
            </h1>
          </div>
          <p className="text-white/95 text-lg">
            Nur noch wenige Schritte bis zu Ihrem unvergesslichen Skikurs in Malbun
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
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-2xl font-bold">Welcher Kurs passt zu Ihnen?</CardTitle>
                      <CardDescription>Wählen Sie die Option, die am besten zu Ihren Wünschen passt</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <RadioGroup value={kurstyp} onValueChange={setKurstyp} className="space-y-3">
                      <div className={`flex items-center space-x-3 p-5 rounded-xl border-2 transition-all cursor-pointer ${kurstyp === 'privat' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="privat" id="privat" />
                        <Label htmlFor="privat" className="flex-1 cursor-pointer">
                          <span className="font-bold text-lg block mb-1">Privatkurs – Ganz persönlich</span>
                          <span className="text-sm text-muted-foreground">Unser Lehrer konzentriert sich voll und ganz auf Sie oder Ihre Gruppe</span>
                        </Label>
                        <span className="font-bold text-primary">ab CHF 75.-</span>
                      </div>
                      <div className={`flex items-center space-x-3 p-5 rounded-xl border-2 transition-all cursor-pointer ${kurstyp === 'gruppe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="gruppe" id="gruppe" />
                        <Label htmlFor="gruppe" className="flex-1 cursor-pointer">
                          <span className="font-bold text-lg block mb-1">Gruppenkurs – Gemeinsam Spass haben</span>
                          <span className="text-sm text-muted-foreground">Neue Freunde finden und zusammen die Pisten erobern</span>
                        </Label>
                        <span className="font-bold text-primary">CHF 320.-</span>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="datum" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Wann möchten Sie starten?
                      </Label>
                      <Input type="date" id="datum" required className="border-2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teilnehmer" className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Wie viele Personen nehmen teil?
                      </Label>
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
                  <CardTitle className="text-2xl font-bold">Wie können wir Sie erreichen?</CardTitle>
                  <CardDescription>Damit wir Ihnen alle wichtigen Informationen zukommen lassen können</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vorname">Ihr Vorname *</Label>
                      <Input id="vorname" required className="border-2" placeholder="z.B. Anna" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nachname">Ihr Nachname *</Label>
                      <Input id="nachname" required className="border-2" placeholder="z.B. Müller" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Ihre E-Mail-Adresse *</Label>
                    <Input id="email" type="email" required className="border-2" placeholder="anna.mueller@beispiel.com" />
                    <p className="text-xs text-muted-foreground">Hierhin senden wir Ihre Buchungsbestätigung</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Ihre Telefonnummer *</Label>
                    <Input id="telefon" type="tel" required className="border-2" placeholder="+41 79 123 45 67" />
                    <p className="text-xs text-muted-foreground">Für Rückfragen oder falls wir Sie kurzfristig erreichen müssen</p>
                  </div>
                </CardContent>
              </Card>

              {/* Zahlungsmethode */}
              <Card className="border-2 border-secondary/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-secondary" />
                    <div>
                      <CardTitle className="text-2xl font-bold">Wie möchten Sie bezahlen?</CardTitle>
                      <CardDescription>Alle Zahlungsmethoden sind sicher und verschlüsselt</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <RadioGroup value={zahlungsmethode} onValueChange={setZahlungsmethode} className="space-y-3">
                    {/* TWINT */}
                    <div className={`group relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${zahlungsmethode === 'twint' ? 'border-[#FFED00] bg-[#FFED00]/10' : 'border-border hover:border-[#FFED00]/50'}`}>
                      <div className="flex items-center space-x-4 p-5">
                        <RadioGroupItem value="twint" id="twint" />
                        <div className="w-16 h-12 flex items-center justify-center">
                          <img src={twintLogo} alt="TWINT" className="h-10 w-auto" />
                        </div>
                        <Label htmlFor="twint" className="flex-1 cursor-pointer">
                          <span className="font-bold text-lg block mb-1">Mit TWINT bezahlen</span>
                          <span className="text-sm text-muted-foreground">Einfach QR-Code scannen – fertig in Sekunden</span>
                        </Label>
                        {zahlungsmethode === 'twint' && (
                          <Check className="w-6 h-6 text-[#FFED00]" />
                        )}
                      </div>
                      {zahlungsmethode === 'twint' && (
                        <div className="px-5 pb-5 space-y-3 bg-[#FFED00]/5">
                          <Separator />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Nach Ihrer Buchung erhalten Sie einen QR-Code per E-Mail. Einfach mit der TWINT-App scannen und bezahlen – ganz bequem vom Handy aus.
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
                          <span className="font-bold text-lg block mb-1">Kreditkarte</span>
                          <span className="text-sm text-muted-foreground">Visa, Mastercard oder American Express</span>
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
                          <span className="font-bold text-lg block mb-1">Banküberweisung</span>
                          <span className="text-sm text-muted-foreground">Klassisch per Überweisung auf unser Konto</span>
                        </Label>
                        {zahlungsmethode === 'ueberweisung' && (
                          <Check className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      {zahlungsmethode === 'ueberweisung' && (
                        <div className="px-5 pb-5 space-y-3 bg-secondary/5">
                          <Separator />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Wir schicken Ihnen eine Rechnung mit allen Bankdaten per E-Mail. Sie können dann in Ruhe überweisen.
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
                          <span className="font-bold text-lg block mb-1">PostFinance</span>
                          <span className="text-sm text-muted-foreground">Direkt mit Ihrem PostFinance-Konto bezahlen</span>
                        </Label>
                        {zahlungsmethode === 'postfinance' && (
                          <Check className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      {zahlungsmethode === 'postfinance' && (
                        <div className="px-5 pb-5 space-y-3 bg-secondary/5">
                          <Separator />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Sie werden sicher zu PostFinance weitergeleitet und können dort wie gewohnt bezahlen.
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
                  <CardTitle className="text-2xl font-bold">Ihre Buchung im Überblick</CardTitle>
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
                    className="w-full font-bold text-lg py-6 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Einen Moment bitte...' : 'Verbindlich buchen'}
                  </Button>

                  <div className="space-y-2 pt-4 text-xs text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      Ihre Daten sind bei uns sicher
                    </p>
                    <p className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      Sie erhalten sofort eine Bestätigung
                    </p>
                    <p className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      Kostenlos stornieren bis 24 Stunden vorher
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
