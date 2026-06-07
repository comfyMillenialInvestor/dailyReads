import { Scale, Building, Mail, Phone, Globe, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Impressum() {
    return (
        <div className="max-w-4xl mx-auto py-12 space-y-12">
            <section className="text-center space-y-4 border-b pb-12 border-border/50">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/5 rounded-full border border-primary/10 text-primary/60">
                        <Scale className="h-8 w-8" />
                    </div>
                </div>
                <h1 className="text-4xl font-serif font-bold tracking-tight">Impressum</h1>
                <p className="text-muted-foreground italic">Legal Disclosure / Anbieterkennzeichnung</p>
                <p className="text-xs text-muted-foreground">gemäß § 5 DDG (Digitale-Dienste-Gesetz)</p>
            </section>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Left Column - Core Information */}
                <section className="space-y-8">
                    {/* Anbieter */}
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-primary/60 flex items-center gap-2">
                            <Building className="h-3 w-3" />
                            Diensteanbieter
                        </h3>
                        <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 leading-relaxed">
                            <p className="font-medium text-foreground">Lennart Severin</p>
                            <p className="text-muted-foreground">[Straße Hausnummer]</p>
                            <p className="text-muted-foreground">[PLZ Ort]</p>
                            <p className="text-muted-foreground">Deutschland</p>
                        </div>
                    </div>

                    {/* Kontakt */}
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-primary/60 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Kontakt
                        </h3>
                        <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-2">
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">[Telefonnummer]</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href="mailto:support@dailyreads.eu" className="font-mono text-sm text-primary hover:underline">support@dailyreads.eu</a>
                            </p>
                        </div>
                    </div>

                    {/* Inhaltlich Verantwortlicher */}
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-primary/60 flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            Inhaltlich Verantwortlicher
                        </h3>
                        <p className="text-xs text-muted-foreground italic px-1">gemäß § 18 Abs. 2 MStV:</p>
                        <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 leading-relaxed">
                            <p className="font-medium text-foreground">Lennart Severin</p>
                            <p className="text-muted-foreground">[Straße Hausnummer]</p>
                            <p className="text-muted-foreground">[PLZ Ort]</p>
                        </div>
                    </div>

                    {/* Optional: Umsatzsteuer-ID (falls vorhanden) */}
                    {/* 
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-primary/60">
                            Umsatzsteuer-ID
                        </h3>
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                            <p className="text-sm text-muted-foreground">
                                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
                                <span className="font-mono">DE XXX XXX XXX</span>
                            </p>
                        </div>
                    </div>
                    */}
                </section>

                {/* Right Column - Legal Texts */}
                <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
                    {/* Haftung für Inhalte */}
                    <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h4 className="font-bold text-foreground">Haftung für Inhalte</h4>
                        <p>
                            Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                        </p>
                        <p>
                            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
                        </p>
                    </div>

                    {/* Haftung für Links */}
                    <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h4 className="font-bold text-foreground">Haftung für Links</h4>
                        <p>
                            Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                        </p>
                        <p>
                            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
                        </p>
                    </div>

                    {/* Urheberrecht */}
                    <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h4 className="font-bold text-foreground">Urheberrecht</h4>
                        <p>
                            Die durch mich erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                        </p>
                        <p>
                            Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
                        </p>
                    </div>

                    {/* Hinweis zu den literarischen Inhalten */}
                    <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10 border-dashed">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Hinweis zu literarischen Inhalten
                        </h4>
                        <p className="text-xs">
                            Die auf dieser Website bereitgestellten literarischen Texte (Kurzgeschichten, Gedichte, Essays) stammen ausschließlich aus dem <strong>Public Domain (Gemeinfreiheit)</strong>. Wir erheben keine urheberrechtlichen Ansprüche auf diese Originalwerke.
                        </p>
                        <p className="text-xs">
                            <strong>KI-generierte Metadaten:</strong> Bei historischen Werken können Metadaten (z.B. Autor, Entstehungsjahr) teilweise unvollständig sein. In diesen Fällen werden Zuordnungen mithilfe von KI-gestützten Verfahren <em>angenommen</em>. Wir übernehmen keine Gewähr für die absolute Korrektheit dieser Zuordnungen.
                        </p>
                    </div>
                </section>
            </div>

            {/* Third-Party Services Section */}
            <section className="space-y-6 pt-8 border-t border-border/50">
                <h2 className="text-lg font-bold text-center">Verwendete Drittanbieter-Dienste</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/20 rounded-xl border border-border/40 text-center">
                        <Globe className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="font-medium text-sm">Hosting</p>
                        <p className="text-xs text-muted-foreground">Vercel Inc., USA</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl border border-border/40 text-center">
                        <Globe className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="font-medium text-sm">Zahlungsabwicklung</p>
                        <p className="text-xs text-muted-foreground">Stripe, PayPal</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl border border-border/40 text-center">
                        <Globe className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="font-medium text-sm">Web Analytics</p>
                        <p className="text-xs text-muted-foreground">Vercel Analytics (anonymisiert)</p>
                    </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                    Details zur Datenverarbeitung dieser Dienste finden Sie in unserer{' '}
                    <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>.
                </p>
            </section>

            {/* EU Streitschlichtung */}
            <section className="space-y-6 pt-8 border-t border-border/50">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border border-border/40 rounded-xl">
                        <h4 className="font-bold text-foreground uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                            <ExternalLink className="h-3 w-3" />
                            EU-Streitschlichtung
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                            <a
                                href="https://ec.europa.eu/consumers/odr/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                            >
                                https://ec.europa.eu/consumers/odr/
                            </a>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Unsere E-Mail-Adresse finden Sie oben im Impressum.
                        </p>
                    </div>

                    <div className="p-6 border border-border/40 rounded-xl">
                        <h4 className="font-bold text-foreground uppercase tracking-wider text-xs mb-3">
                            Verbraucherstreitbeilegung
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center pt-8 border-t border-border/50 space-y-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Erstellt nach den Vorgaben von{' '}
                    <a
                        href="https://www.e-recht24.de"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors underline underline-offset-4"
                    >
                        eRecht24
                    </a>
                </p>
                <p className="text-xs text-muted-foreground">
                    Stand: Februar 2026 | Letzte Aktualisierung: DDG ersetzt TMG (Mai 2024)
                </p>
            </footer>
        </div>
    );
}
