export default function Impressum() {
    return (
        <div className="max-w-3xl mx-auto py-12 space-y-12">
            <section className="text-center space-y-4 border-b pb-12 border-border/50">
                <h1 className="text-4xl font-serif font-bold tracking-tight">Impressum</h1>
                <p className="text-muted-foreground italic">Legal disclosure and ownership information.</p>
            </section>

            <div className="grid md:grid-cols-2 gap-12">
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-primary/60">Angaben gemäß § 5 TMG</h3>
                        <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 leading-relaxed">
                            [Vorname Nachname]<br />
                            [Straße Hausnummer]<br />
                            [PLZ Ort]<br />
                            Deutschland
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-primary/60">Kontakt</h3>
                        <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 space-y-1">
                            <p>Telefon: <span className="font-mono text-sm opacity-80">[Telefonnummer]</span></p>
                            <p>E-Mail: <span className="font-mono text-sm opacity-80">[E-Mail-Adresse]</span></p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-primary/60">Inhaltliche Verantwortlichkeit</h3>
                        <p className="text-xs text-muted-foreground italic mb-2 px-1">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</p>
                        <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 leading-relaxed">
                            [Vorname Nachname]<br />
                            [Straße Hausnummer]<br />
                            [PLZ Ort]
                        </div>
                    </div>
                </section>

                <section className="space-y-8 text-sm leading-relaxed text-muted-foreground">
                    <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h4 className="font-bold text-foreground">Haftung für Inhalte</h4>
                        <p>
                            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
                        </p>
                    </div>

                    <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h4 className="font-bold text-foreground">Haftung für Links</h4>
                        <p>
                            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                        </p>
                    </div>

                    <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h4 className="font-bold text-foreground">Urheberrecht</h4>
                        <p>
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung bedürfen der schriftlichen Zustimmung.
                        </p>
                    </div>
                </section>
            </div>

            <footer className="text-center pt-8 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Quelle: <a href="https://www.e-recht24.de" className="hover:text-primary transition-colors underline underline-offset-4">e-recht24.de</a>
                </p>
            </footer>
        </div>
    );
}
