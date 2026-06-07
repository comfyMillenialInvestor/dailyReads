import { ShieldCheck, Lock, EyeOff, UserCheck, CreditCard, Globe, Database, FileText, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Datenschutz() {
    return (
        <div className="max-w-4xl mx-auto py-12 space-y-16">
            <section className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/5 rounded-full border border-primary/10 text-primary/60">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Datenschutzerklärung</h1>
                <p className="text-muted-foreground text-sm">Privacy Policy gemäß DSGVO / GDPR</p>
                <p className="text-xs text-muted-foreground">Stand: Februar 2026</p>
            </section>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-12">
                {/* 1. Einleitung */}
                <section className="bg-muted/30 border border-border/40 p-8 rounded-3xl relative overflow-hidden group">
                    <Lock className="absolute -right-4 -bottom-4 h-24 w-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
                    <h2 className="text-xl font-bold flex items-center space-x-2 mt-0">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">01.</span>
                        Datenschutz auf einen Blick
                    </h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mt-6">
                            <div className="p-4 bg-background/50 rounded-xl border border-border/30">
                                <Database className="h-5 w-5 text-primary mb-2" />
                                <p className="text-xs font-medium text-foreground">Datenerfassung</p>
                                <p className="text-xs opacity-80">Wir erheben nur Daten, die für den Betrieb notwendig sind.</p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-xl border border-border/30">
                                <Lock className="h-5 w-5 text-primary mb-2" />
                                <p className="text-xs font-medium text-foreground">Verschlüsselung</p>
                                <p className="text-xs opacity-80">Alle Daten werden SSL/TLS-verschlüsselt übertragen.</p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-xl border border-border/30">
                                <UserCheck className="h-5 w-5 text-primary mb-2" />
                                <p className="text-xs font-medium text-foreground">Ihre Kontrolle</p>
                                <p className="text-xs opacity-80">Dateneexport und Kontolöschung jederzeit möglich.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Verantwortliche Stelle */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">02.</span>
                        Verantwortliche Stelle
                    </h2>
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                        <p className="text-sm font-bold text-foreground">Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            <p className="font-medium text-foreground">Lennart Severin</p>
                            <p>[Straße Hausnummer]</p>
                            <p>[PLZ Ort], Deutschland</p>
                            <p className="mt-2">
                                <Mail className="inline h-3 w-3 mr-1" />
                                E-Mail: <a href="mailto:support@dailyreads.eu" className="text-primary hover:underline">support@dailyreads.eu</a>
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 italic border-t pt-4 border-border/30">
                            Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.
                        </p>
                    </div>
                </section>

                {/* 3. Hosting */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">03.</span>
                        Hosting und Content Delivery
                    </h2>
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-4">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            Vercel Inc.
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>
                                Diese Website wird bei <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, USA gehostet.
                            </p>
                            <p>
                                Beim Besuch unserer Website werden automatisch Informationen in sogenannten Server-Log-Dateien gespeichert, die Ihr Browser automatisch übermittelt:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>IP-Adresse (anonymisiert)</li>
                                <li>Browsertyp und -version</li>
                                <li>Betriebssystem</li>
                                <li>Referrer URL</li>
                                <li>Uhrzeit der Serveranfrage</li>
                            </ul>
                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 mt-4">
                                <p className="text-xs">
                                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der technisch fehlerfreien Darstellung und Optimierung der Website).
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mt-2">
                                <p className="text-xs flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <span><strong>Drittlandtransfer:</strong> Vercel ist unter dem EU-U.S. Data Privacy Framework zertifiziert. Für die Datenübertragung in die USA bestehen angemessene Garantien gemäß Art. 45 DSGVO.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Datenerfassung */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">04.</span>
                        Datenerfassung auf dieser Website
                    </h2>

                    {/* Registrierung */}
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                        <h4 className="font-bold flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            Registrierung und Nutzerkonto
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>Sie können sich auf unserer Website registrieren, um zusätzliche Funktionen nutzen zu können. Die dabei eingegebenen Daten verwenden wir nur für die Nutzung des jeweiligen Dienstes.</p>
                            <p><strong>Erhobene Daten bei der Registrierung:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Name</li>
                                <li>E-Mail-Adresse</li>
                                <li>Passwort (verschlüsselt gespeichert mit bcrypt)</li>
                                <li>Profilbild (bei Google-Login)</li>
                            </ul>
                            <p><strong>Zusätzliche Nutzungsdaten:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Lesefortschritt und Streak-Daten</li>
                                <li>Abgeschlossene Lesungen mit Datum</li>
                                <li>Abonnementstatus</li>
                            </ul>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/30 mt-4">
                                <p className="text-xs"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) sowie Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
                                <p className="text-xs mt-1"><strong>Speicherdauer:</strong> Bis zur Löschung des Nutzerkontos.</p>
                            </div>
                        </div>
                    </div>

                    {/* Cookies */}
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                        <h4 className="font-bold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Cookies und Session-Speicher
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.</p>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/30">
                                        <th className="text-left py-2 font-medium">Cookie</th>
                                        <th className="text-left py-2 font-medium">Zweck</th>
                                        <th className="text-left py-2 font-medium">Dauer</th>
                                    </tr>
                                </thead>
                                <tbody className="opacity-80">
                                    <tr className="border-b border-border/20">
                                        <td className="py-2 font-mono">next-auth.session-token</td>
                                        <td className="py-2">Authentifizierung</td>
                                        <td className="py-2">30 Tage</td>
                                    </tr>
                                    <tr className="border-b border-border/20">
                                        <td className="py-2 font-mono">cookie-consent</td>
                                        <td className="py-2">Cookie-Einwilligung</td>
                                        <td className="py-2">1 Jahr</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/30 mt-4">
                                <p className="text-xs"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (technisch notwendige Cookies) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung für optionale Cookies).</p>
                            </div>
                        </div>
                    </div>

                    {/* Vercel Analytics */}
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                        <h4 className="font-bold flex items-center gap-2">
                            <EyeOff className="h-4 w-4 text-primary" />
                            Vercel Web Analytics
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>
                                Diese Website nutzt <strong>Vercel Web Analytics</strong>, einen datenschutzfreundlichen Analysedienst der Vercel Inc.
                            </p>
                            <div className="grid md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <p className="font-medium text-green-700 dark:text-green-400">✓ Keine Cookies</p>
                                    <p className="opacity-80">Funktioniert ohne Tracking-Cookies</p>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <p className="font-medium text-green-700 dark:text-green-400">✓ Anonymisiert</p>
                                    <p className="opacity-80">IP-Adressen werden nicht gespeichert</p>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <p className="font-medium text-green-700 dark:text-green-400">✓ Kein Cross-Site-Tracking</p>
                                    <p className="opacity-80">Besucher werden nicht seitenübergreifend verfolgt</p>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <p className="font-medium text-green-700 dark:text-green-400">✓ Aggregierte Daten</p>
                                    <p className="opacity-80">Nur anonymisierte Statistiken</p>
                                </div>
                            </div>
                            <p className="text-xs">
                                Erfasst werden: Seitenaufrufe, Referrer, Land (aus IP abgeleitet, dann anonymisiert), Gerätetyp und Browsertyp. Eine Identifizierung einzelner Nutzer ist nicht möglich.
                            </p>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/30 mt-4">
                                <p className="text-xs"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Analyse und Optimierung unseres Webangebots).</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Zahlungsdienstleister */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">05.</span>
                        Zahlungsdienstleister
                    </h2>

                    {/* Stripe */}
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-4">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Stripe
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>
                                Für Zahlungsvorgänge nutzen wir den Dienst <strong>Stripe</strong> der Stripe, Inc., 510 Townsend Street, San Francisco, CA 94103, USA (für EU: Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irland).
                            </p>
                            <p><strong>Übermittelte Daten an Stripe:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Name und E-Mail-Adresse</li>
                                <li>Zahlungsinformationen (Kreditkartendaten, IBAN)</li>
                                <li>IP-Adresse</li>
                                <li>Rechnungsadresse</li>
                                <li>Kaufbetrag und Transaktionsdetails</li>
                            </ul>
                            <p className="text-xs mt-2">
                                Stripe verarbeitet diese Daten als <strong>eigenständiger Verantwortlicher</strong> (nicht als Auftragsverarbeiter). Ein separater Auftragsverarbeitungsvertrag ist daher nicht erforderlich.
                            </p>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/30 mt-4 space-y-2">
                                <p className="text-xs"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
                                <p className="text-xs"><strong>Drittlandtransfer:</strong> Stripe ist unter dem EU-U.S. Data Privacy Framework zertifiziert und verwendet Standardvertragsklauseln.</p>
                                <p className="text-xs"><strong>Datenschutzerklärung Stripe:</strong> <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/de/privacy</a></p>
                            </div>
                        </div>
                    </div>

                    {/* PayPal */}
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-4">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            PayPal
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>
                                Wir bieten Zahlung via <strong>PayPal</strong> an. Anbieter ist die PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg.
                            </p>
                            <p><strong>Übermittelte Daten an PayPal:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Name und E-Mail-Adresse</li>
                                <li>Zahlungsinformationen (PayPal-Kontodaten, Bankverbindung)</li>
                                <li>IP-Adresse</li>
                                <li>Rechnungs- und Lieferadresse</li>
                                <li>Kaufbetrag und Transaktionsdetails</li>
                            </ul>
                            <p className="text-xs mt-2">
                                PayPal verarbeitet diese Daten als <strong>eigenständiger Verantwortlicher</strong>. PayPal kann Daten an verbundene Unternehmen und Dienstleister weitergeben.
                            </p>
                            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mt-2">
                                <p className="text-xs flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <span><strong>Hinweis:</strong> PayPal war zum Stand Januar 2024 nicht unter dem EU-U.S. Data Privacy Framework zertifiziert. Die Datenübertragung erfolgt auf Basis von Standardvertragsklauseln (SCCs).</span>
                                </p>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg border border-border/30 mt-4 space-y-2">
                                <p className="text-xs"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
                                <p className="text-xs"><strong>Datenschutzerklärung PayPal:</strong> <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paypal.com/de/privacy</a></p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Datensicherheit */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">06.</span>
                        Datensicherheit
                    </h2>
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-4">
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>
                                Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder Zugriff unberechtigter Personen zu schützen:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><strong>SSL/TLS-Verschlüsselung:</strong> Alle Datenübertragungen erfolgen verschlüsselt</li>
                                <li><strong>Passwort-Hashing:</strong> Passwörter werden mit bcrypt gehashed (nicht im Klartext gespeichert)</li>
                                <li><strong>Zugriffskontrolle:</strong> Nur autorisierte Personen haben Zugriff auf personenbezogene Daten</li>
                                <li><strong>Regelmäßige Updates:</strong> Software und Systeme werden regelmäßig aktualisiert</li>
                                <li><strong>Rate Limiting:</strong> Schutz vor Brute-Force-Angriffen auf Authentifizierungsendpunkte</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 7. Ihre Rechte */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">07.</span>
                        Ihre Rechte (Betroffenenrechte)
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit folgende Rechte:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: 'Auskunft (Art. 15 DSGVO)', desc: 'Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger sowie den Zweck der Datenverarbeitung.' },
                            { title: 'Berichtigung (Art. 16 DSGVO)', desc: 'Recht auf Berichtigung unrichtiger oder Vervollständigung unvollständiger Daten.' },
                            { title: 'Löschung (Art. 17 DSGVO)', desc: 'Recht auf Löschung Ihrer Daten („Recht auf Vergessenwerden"), sofern keine gesetzlichen Aufbewahrungspflichten bestehen.' },
                            { title: 'Einschränkung (Art. 18 DSGVO)', desc: 'Recht auf Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.' },
                            { title: 'Datenübertragbarkeit (Art. 20 DSGVO)', desc: 'Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.' },
                            { title: 'Widerspruch (Art. 21 DSGVO)', desc: 'Recht auf Widerspruch gegen die Verarbeitung Ihrer Daten, die auf Art. 6 Abs. 1 lit. f DSGVO beruht.' },
                            { title: 'Widerruf (Art. 7 Abs. 3 DSGVO)', desc: 'Recht, eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen.' },
                            { title: 'Beschwerde', desc: 'Recht auf Beschwerde bei einer Aufsichtsbehörde, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen die DSGVO verstößt.' },
                        ].map((right, idx) => (
                            <div key={idx} className="p-4 bg-muted/20 border border-border/40 rounded-xl">
                                <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-primary">{right.title}</span>
                                <span className="text-xs text-muted-foreground">{right.desc}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 mt-6 space-y-4">
                        <h4 className="font-bold text-foreground">So üben Sie Ihre Rechte aus:</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="p-4 bg-background/50 rounded-xl border border-border/30">
                                <p className="font-medium text-foreground mb-2">📥 Daten exportieren</p>
                                <p className="text-xs text-muted-foreground mb-3">Laden Sie alle Ihre Daten als JSON-Datei herunter.</p>
                                <Button variant="outline" size="sm" className="rounded-full text-xs" asChild>
                                    <Link href="/portal">Zum Portal</Link>
                                </Button>
                            </div>
                            <div className="p-4 bg-background/50 rounded-xl border border-border/30">
                                <p className="font-medium text-foreground mb-2">🗑️ Konto löschen</p>
                                <p className="text-xs text-muted-foreground mb-3">Löschen Sie Ihr Konto und alle zugehörigen Daten dauerhaft.</p>
                                <Button variant="outline" size="sm" className="rounded-full text-xs" asChild>
                                    <Link href="/portal">Zum Portal</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. Speicherdauer */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">08.</span>
                        Speicherdauer
                    </h2>
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-4">
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>
                                Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Verarbeitungszwecke erforderlich ist:
                            </p>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/30">
                                        <th className="text-left py-2 font-medium">Datenart</th>
                                        <th className="text-left py-2 font-medium">Speicherdauer</th>
                                    </tr>
                                </thead>
                                <tbody className="opacity-80">
                                    <tr className="border-b border-border/20">
                                        <td className="py-2">Kontodaten</td>
                                        <td className="py-2">Bis zur Kontolöschung</td>
                                    </tr>
                                    <tr className="border-b border-border/20">
                                        <td className="py-2">Lesefortschritt / Streaks</td>
                                        <td className="py-2">Bis zur Kontolöschung</td>
                                    </tr>
                                    <tr className="border-b border-border/20">
                                        <td className="py-2">Zahlungsdaten</td>
                                        <td className="py-2">10 Jahre (gesetzl. Aufbewahrungspflicht)</td>
                                    </tr>
                                    <tr className="border-b border-border/20">
                                        <td className="py-2">Server-Logs</td>
                                        <td className="py-2">7 Tage (Vercel)</td>
                                    </tr>
                                    <tr className="border-b border-border/20">
                                        <td className="py-2">Analytics-Daten</td>
                                        <td className="py-2">Anonymisiert, kein Personenbezug</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 9. Aktualität */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2 text-sm">09.</span>
                        Aktualität und Änderungen
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Februar 2026. Durch die Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Fassung kann jederzeit auf dieser Seite abgerufen werden.
                    </p>
                </section>

                <div className="pt-12 border-t border-border/50 text-center space-y-4">
                    <p className="text-xs text-muted-foreground italic">
                        Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten wenden Sie sich bitte an uns.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" className="rounded-full px-8 text-[10px] font-bold uppercase tracking-widest border-primary/20 hover:bg-primary/5" asChild>
                            <Link href="/kontakt">Kontakt aufnehmen</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
