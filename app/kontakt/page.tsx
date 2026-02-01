import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function Kontakt() {
    return (
        <div className="max-w-4xl mx-auto py-12 space-y-16">
            <section className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                    <div className="p-2 bg-primary/5 rounded-full border border-primary/10 text-primary/60">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Get in Touch</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Whether you have a suggestion, a question, or just want to share a favorite poem, I'd love to hear from you.
                </p>
            </section>

            <div className="grid md:grid-cols-5 gap-12">
                <div className="md:col-span-3">
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 shadow-sm">
                        <form className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold opacity-70">Name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        placeholder="Your name"
                                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold opacity-70">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        placeholder="Your email address"
                                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-xs uppercase tracking-wider font-semibold opacity-70">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Your message..."
                                    className="min-h-[180px] bg-background/50 border-border/40 focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 text-sm font-bold tracking-tight rounded-xl">
                                <Send className="mr-2 h-4 w-4" />
                                Send Message
                            </Button>

                            <p className="text-[10px] text-muted-foreground/60 text-center uppercase tracking-widest mt-4">
                                This is a concept form for demonstration purposes.
                            </p>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-primary/60">Correspondence</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            I am a solo bibliophile running this project out of a passion for great literature. I typically respond to messages within 1-2 business days.
                        </p>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                        <div className="flex items-center space-x-3 text-primary">
                            <Mail className="h-5 w-5" />
                            <span className="font-bold text-sm tracking-tight">Direct Email</span>
                        </div>
                        <a
                            href="mailto:hello@dailyreads.io"
                            className="block text-lg font-serif hover:text-primary transition-colors border-b border-border/50 pb-1"
                        >
                            hello@dailyreads.io
                        </a>
                        <p className="text-xs text-muted-foreground italic">
                            For press inquiries, collaboration requests, or just to say hi.
                        </p>
                    </div>

                    <div className="pt-4 italic text-sm text-muted-foreground/80 leading-relaxed border-l-2 border-primary/20 pl-4">
                        "A letter is an unannounced visit, the mailman the mediator of impolite surprises."
                        <span className="block not-italic font-bold text-[10px] uppercase mt-1 opacity-60">— Friedrich Nietzsche</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
