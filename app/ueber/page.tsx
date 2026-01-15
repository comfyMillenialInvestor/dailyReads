import { BookOpen, PenTool, Quote, Library, Heart, Sparkles, Linkedin, Twitter } from 'lucide-react';

export default function Ueber() {
    return (
        <div className="max-w-4xl mx-auto space-y-16 py-8">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-muted/50 rounded-full border border-border/50">
                        <Library className="h-8 w-8 text-primary/80" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">
                    Preserving the Essence of Literature
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                    A daily sanctuary for the thoughtful reader. Finite, curated, and timeless.
                </p>
            </section>

            {/* Concept Grid */}
            <section className="grid md:grid-cols-3 gap-6">
                <div className="group p-8 bg-muted/30 rounded-2xl border border-border/50 transition-all hover:bg-muted/50 hover:-translate-y-1">
                    <PenTool className="h-6 w-6 mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <h3 className="text-xl font-bold mb-3">Short Story</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        A complete narrative arc captured in minutes. Designed to ignite your imagination and transport you to other worlds.
                    </p>
                </div>
                <div className="group p-8 bg-muted/30 rounded-2xl border border-border/50 transition-all hover:bg-muted/50 hover:-translate-y-1">
                    <Quote className="h-6 w-6 mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <h3 className="text-xl font-bold mb-3">Poetry</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        The distillation of human experience. Rhythms and rhymes that touch the soul and linger long after reading.
                    </p>
                </div>
                <div className="group p-8 bg-muted/30 rounded-2xl border border-border/50 transition-all hover:bg-muted/50 hover:-translate-y-1">
                    <BookOpen className="h-6 w-6 mb-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <h3 className="text-xl font-bold mb-3">Essay</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Thought-provoking arguments and reflections. Challenges your perspective and deepens your understanding of the world.
                    </p>
                </div>
            </section>

            {/* Sources & Philosophy */}
            <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" />
                            <span>The Collection</span>
                        </div>
                        <h2 className="text-3xl font-serif font-bold">Wisdom of the Past, Accessible Today</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We meticulously curate our library from the public domain, ensuring that the greatest works of human history remain alive in the digital age.
                            From the psychological depth of <em>Chekhov</em> to the transcendentalist vision of <em>Emerson</em>, our sources are the pillars of world literature.
                        </p>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative p-8 bg-card rounded-2xl border border-border/50 shadow-sm italic text-lg leading-relaxed text-center">
                            "Literature is the most agreeable way of ignoring life."
                            <div className="mt-4 not-italic font-bold text-sm text-primary/60">— Fernando Pessoa</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission / Who We Are */}
            <section className="max-w-2xl mx-auto text-center space-y-6">
                <div className="inline-block p-2 bg-muted/50 rounded-full border border-border/50 mb-2">
                    <Heart className="h-5 w-5 text-destructive/70" />
                </div>
                <h2 className="text-2xl font-bold">A Passion for Reading</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Daily Reads is a tribute to the written word. In an age of noise, we offer clarity.
                    Created by bibliophiles for bibliophiles, we believe that five minutes of focused reading can be the most transformative part of your day.
                </p>
                <div className="pt-8 flex flex-col items-center space-y-6">
                    <div className="h-px w-24 bg-border/50" />
                    <div className="flex items-center gap-4">
                        <a href="https://linkedin.com/company/dailyreads" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted/50 rounded-full border border-border/50 hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                            <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="https://x.com/dailyreads" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted/50 rounded-full border border-border/50 hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                            <Twitter className="h-5 w-5" />
                        </a>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium tracking-tight uppercase">Built for the joy of discovery</p>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Est. 2026 • Germany</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
