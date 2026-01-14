export default function Ueber() {
    return (
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
            <h1 className="text-4xl font-serif font-bold mb-6 text-center">About Daily Reads</h1>

            <p className="lead text-xl text-center text-muted-foreground mb-10">
                Our mission is to bring a moment of reflection and beauty to your daily digital routine.
            </p>

            <h3>The Concept</h3>
            <p>
                In a world of infinite scrolling and dopamine hits, <strong>Daily Reads</strong> offers a finite, curated experience.
                Every day, we present exactly three texts:
            </p>
            <ul>
                <li><strong>A Short Story</strong> to ignite your imagination.</li>
                <li><strong>A Poem</strong> to touch your soul.</li>
                <li><strong>An Essay</strong> to challenge your mind.</li>
            </ul>

            <h3>Our Sources</h3>
            <p>
                The texts found on this platform are carefully curated from the public domain or published with permission.
                We rely on vast libraries of classic literature, ensuring that the wisdom of the past remains accessible today.
                Authors like <em>Anton Chekhov</em>, <em>Emily Dickinson</em>, and <em>Ralph Waldo Emerson</em> are regulars here.
            </p>

            <h3>Who We Are</h3>
            <p>
                Daily Reads is a passion project built by a team of literature enthusiasts and developers.
                We believe that reading, even for just 5 minutes a day, can transform your perspective.
            </p>

            <hr className="my-10" />

            <p className="text-center text-sm text-muted-foreground">
                Built with Next.js & MongoDB in Germany.
            </p>
        </div>
    );
}
