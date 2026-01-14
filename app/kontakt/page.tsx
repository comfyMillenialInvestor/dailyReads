import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Kontakt() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-serif font-bold mb-8 text-center">Contact Us</h1>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <form className="space-y-6">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input type="text" id="name" placeholder="Your name" />
                    </div>

                    <div className="grid w-full gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" placeholder="Your email address" />
                    </div>

                    <div className="grid w-full gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" />
                    </div>

                    <Button type="submit" className="w-full">Send Message</Button>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                        This is a demo form. In a real deployment, connect this to Formspree or Netlify Forms.
                    </p>
                </form>
            </div>

            <div className="mt-12 text-center text-muted-foreground">
                <p>Alternatively, email us at:</p>
                <a href="mailto:info@example.com" className="text-primary font-bold hover:underline">info@example.com</a>
            </div>
        </div>
    );
}
