import { ShieldCheck, Lock, EyeOff, UserCheck, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Datenschutz() {
    return (
        <div className="max-w-4xl mx-auto py-12 space-y-16">
            <section className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/5 rounded-full border border-primary/10 text-primary/60">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-muted-foreground italic text-lg uppercase tracking-widest text-[10px]">Datenschutzerklärung (DSGVO)</p>
            </section>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-12">
                {/* 1. Einleitung */}
                <section className="bg-muted/30 border border-border/40 p-8 rounded-3xl relative overflow-hidden group">
                    <Lock className="absolute -right-4 -bottom-4 h-24 w-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
                    <h2 className="text-xl font-bold flex items-center space-x-2 mt-0">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">01.</span>
                        Datenschutz auf einen Blick
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie meine Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
                    </p>
                </section>

                {/* 2. Verantwortliche Stelle */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">02.</span>
                        Verantwortliche Stelle
                    </h2>
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                        <p className="text-sm font-bold text-foreground">Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            [Vorname Nachname]<br />
                            [Straße Hausnummer]<br />
                            [PLZ Ort]<br />
                            E-Mail: [E-Mail-Adresse]
                        </p>
                        <p className="text-xs text-muted-foreground mt-4 italic">
                            Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
                        </p>
                    </div>
                </section>

                {/* 3. Hosting (Vercel) */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">03.</span>
                        Hosting und Content Delivery Networks (CDN)
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Ich hoste die Inhalte meiner Website bei folgendem Anbieter:
                    </p>
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                        <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-primary" />
                            Vercel
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA (nachfolgend Vercel).
                            Vercel ist ein Cloud-Service, über den die Website bereitgestellt wird. Zur Bereitstellung der Website erhebt Vercel Verbindungsdaten (z. B. IP-Adresse), die technisch notwendig sind, um die Website auszuliefern. Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Ich habe ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung meiner Website.
                        </p>
                    </div>
                </section>

                {/* 4. Anmeldung, Tracking & Analytics */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">04.</span>
                        Datenerfassung auf dieser Website
                    </h2>

                    <div className="space-y-4">
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                <UserCheck className="h-4 w-4 text-primary" />
                                Registrierung / NextAuth
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Wenn Sie sich auf dieser Website registrieren (z.B. via Google Login), werden die von Ihnen eingegebenen Daten (Name, E-Mail-Adresse, Profilbild) gespeichert, um die Funktionen der Website (z. B. Tracking der Lesegewohnheiten) bereitzustellen. Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
                            </p>
                        </div>

                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                <EyeOff className="h-4 w-4 text-primary" />
                                Vercel Analytics
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Diese Website nutzt Vercel Analytics zur anonymen Analyse des Nutzerverhaltens. Es werden keine personenbezogenen Daten gespeichert, die IP-Adressen werden anonymisiert. Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Optimierung des Website-Angebots).
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. Ihre Rechte */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">05.</span>
                        Ihre Rechte (Betroffenenrechte)
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-4 list-none p-0">
                        {[
                            { title: 'Auskunft', desc: 'Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten.' },
                            { title: 'Berichtigung', desc: 'Recht auf Korrektur unrichtiger Daten.' },
                            { title: 'Löschung', desc: 'Recht auf Löschung Ihrer Daten (Recht auf Vergessenwerden).' },
                            { title: 'Widerspruch', desc: 'Recht auf Widerspruch gegen die Verarbeitung Ihrer Daten.' },
                        ].map((right, idx) => (
                            <li key={idx} className="p-4 bg-muted/20 border border-border/40 rounded-xl">
                                <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-primary">{right.title}</span>
                                <span className="text-xs text-muted-foreground">{right.desc}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="pt-12 border-t border-border/50 text-center space-y-4">
                    <p className="text-xs text-muted-foreground italic">
                        Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten wenden Sie sich bitte direkt an mich.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" className="rounded-full px-8 text-[10px] font-bold uppercase tracking-widest border-primary/20 hover:bg-primary/5" asChild>
                            <a href="/kontakt">Contact Support</a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
