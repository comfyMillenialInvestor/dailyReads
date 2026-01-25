import { ShieldCheck, Lock, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Datenschutz() {
    return (
        <div className="max-w-3xl mx-auto py-12 space-y-16">
            <section className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/5 rounded-full border border-primary/10 text-primary/60">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-muted-foreground italic text-lg uppercase tracking-widest text-[10px]">Datenschutzerklärung</p>
            </section>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-12">
                <section className="bg-muted/30 border border-border/40 p-8 rounded-3xl relative overflow-hidden group">
                    <Lock className="absolute -right-4 -bottom-4 h-24 w-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
                    <h2 className="text-xl font-bold flex items-center space-x-2 mt-0">
                        <span className="text-primary/50 font-serif italic mr-2">01.</span>
                        Datenschutz auf einen Blick
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2">02.</span>
                        Hosting & Infrastructure
                    </h2>
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-sm border-l-2 border-primary/20 pl-4">
                            Wir hosten die Inhalte unserer Website bei folgendem Anbieter: <br />
                            <span className="font-bold text-primary tracking-tight">[Name des Hosters, z.B. Vercel Inc.]</span>
                        </p>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2">03.</span>
                        Advertising & Analytics
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Diese Website nutzt Google AdSense. Anbieter ist die Google Ireland Limited. Wenn Sie dies nicht wünschen, können Sie personalisierte Werbung in Ihren Google-Einstellungen deaktivieren.
                    </p>
                    <div className="bg-yellow-500/5 p-6 rounded-2xl border border-yellow-500/20 flex space-x-4 items-start">
                        <EyeOff className="h-5 w-5 text-yellow-600/60 mt-0.5 shrink-0" />
                        <p className="text-xs text-yellow-900/60 dark:text-yellow-100/40 italic m-0">
                            Hinweis: Hier wird der genaue Text für Google AdSense eingefügt, sobald der Dienst aktiv ist und der Code integriert wurde.
                        </p>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span className="text-primary/50 font-serif italic mr-2">04.</span>
                        Communications
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular zwecks Bearbeitung der Anfrage bei uns gespeichert.
                    </p>
                </section>

                <div className="pt-12 border-t border-border/50 text-center">
                    <p className="text-xs text-muted-foreground italic mb-6">
                        Ausführliche Informationen entnehmen Sie bitte unserer vollständigen Datenschutzerklärung.
                    </p>
                    <Button variant="outline" className="rounded-full px-8 text-[11px] font-bold uppercase tracking-widest border-primary/20 hover:bg-primary/5">
                        Download PDF Policy
                    </Button>
                </div>
            </div>
        </div>
    );
}
