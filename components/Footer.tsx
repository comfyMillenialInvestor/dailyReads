import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t bg-muted/20 py-10 mt-20">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <h3 className="font-serif font-bold text-lg mb-4">Daily Reads</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
                        Three curated short texts every day. Expand your horizon with a story, a poem, and an idea.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/impressum" className="hover:underline">Impressum</Link></li>
                        <li><Link href="/datenschutz" className="hover:underline">Datenschutz</Link></li>
                        <li><Link href="/kontakt" className="hover:underline">Kontakt</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-4">About</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/ueber" className="hover:underline">Mission & Sources</Link></li>
                        <li><span className="text-xs">© 2026 Daily Reads</span></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
