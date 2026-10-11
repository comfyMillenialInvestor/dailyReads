const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'dailyReads';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Content';

const VALID_THEMES = [
    'philosophy',
    'science',
    'history',
    'personal growth',
    'technology',
    'environment',
    'literature',
    'mystery',
    'fantasy',
    'art',
    'politics',
    'economy'
];

function categorizePoem(title, content, author) {
    const text = (title + ' ' + content).toLowerCase();

    if (text.includes('tyrant') || text.includes('liberty') || text.includes('freedom') || text.includes('chains') || text.includes('justice') || text.includes('slave') || text.includes('republic') || text.includes('we wear the mask')) {
        return 'politics';
    }
    if (text.includes('star') || text.includes('planet') || text.includes('cosmos') || text.includes('sun') || text.includes('moon') || text.includes('astronomy') || text.includes('atom') || text.includes('science')) {
        return 'science';
    }
    if (text.includes('ancient') || text.includes('ruin') || text.includes('ozymandias') || text.includes('antiquity') || text.includes('history') || text.includes('rome') || text.includes('greece') || text.includes('trojan') || text.includes('centuries')) {
        return 'history';
    }
    if (text.includes('night') || text.includes('raven') || text.includes('dark') || text.includes('shadow') || text.includes('tomb') || text.includes('midnight') || text.includes('ghost') || text.includes('grave') || text.includes('unseen') || text.includes('mystery')) {
        return 'mystery';
    }
    if (text.includes('wood') || text.includes('forest') || text.includes('tree') || text.includes('sea') || text.includes('ocean') || text.includes('autumn') || text.includes('spring') || text.includes('winter') || text.includes('summer') || text.includes('flower') || text.includes('daffodil') || text.includes('bird') || text.includes('nature') || text.includes('wind') || text.includes('river') || text.includes('cloud')) {
        return 'environment';
    }
    if (text.includes('courage') || text.includes('road') || text.includes('hope') || text.includes('strength') || text.includes('patience') || text.includes('endurance') || text.includes('persevere') || text.includes('strive') || text.includes('yield') || text.includes('soul') || text.includes('heart') || text.includes('dream')) {
        return 'personal growth';
    }
    if (text.includes('art') || text.includes('beauty') || text.includes('song') || text.includes('music') || text.includes('lyre') || text.includes('paint') || text.includes('sculpture') || text.includes('fair') || text.includes('grace')) {
        return 'art';
    }
    if (text.includes('book') || text.includes('word') || text.includes('pen') || text.includes('read') || text.includes('poet') || text.includes('verse') || text.includes('rhyme') || text.includes('page') || text.includes('story')) {
        return 'literature';
    }
    if (text.includes('fairy') || text.includes('spirit') || text.includes('magic') || text.includes('enchant') || text.includes('phantom') || text.includes('elf') || text.includes('witch') || text.includes('goblin') || text.includes('wonderland')) {
        return 'fantasy';
    }
    if (text.includes('gold') || text.includes('coin') || text.includes('wealth') || text.includes('rich') || text.includes('treasure') || text.includes('poverty') || text.includes('penny')) {
        return 'economy';
    }
    if (text.includes('forge') || text.includes('engine') || text.includes('wheel') || text.includes('ship') || text.includes('rail') || text.includes('mast') || text.includes('craft')) {
        return 'technology';
    }

    // Default to philosophy or literature
    return 'philosophy';
}

function estimateReadTime(wordCount) {
    const mins = Math.max(1, Math.round(wordCount / 130));
    return `${mins} min`;
}

// Well-known German classics & world poetry with full authentic bilingual texts
const CURATED_CLASSIC_POEMS = [
    // ── GOETHE ──
    {
        title: "Wandrers Nachtlied (Ein Gleiches)",
        author: "Johann Wolfgang von Goethe",
        source: "Goethes Werke",
        theme: "environment",
        content_de: `Über allen Gipfeln
Ist Ruh,
In allen Wipfeln
Spürest du
Kaum einen Hauch;
Die Vögelein schweigen im Walde.
Warte nur, balde
Ruhest du auch.`,
        content_en: `Over all the hilltops
Is peace,
In all treetops
You perceive
Scarcely a breath;
The little birds are silent in the woods.
Only wait, soon
You too shall rest.`
    },
    {
        title: "Prometheus",
        author: "Johann Wolfgang von Goethe",
        source: "Goethes Werke",
        theme: "personal growth",
        content_de: `Bedecke deinen Himmel, Zeus,
Mit Wolkendunst,
Und übe, dem Knaben gleich,
Der Disteln köpft,
An Eichen dich und Bergeshöhn;
Mußt mir meine Erde
Doch lassen stehn,
Und meine Hütte, die du nicht gebaut,
Und meinen Herd,
Um dessen Glut
Du mich beneidest.

Ich kenne nichts Ärmeres
Unter der Sonn als euch, Götter!
Ihr nähret kümmerlich
Von Opfersteuern
Und Gebetshauch
Eure Majestät...

Hier sitz ich, forme Menschen
Nach meinem Bilde,
Ein Geschlecht, das mir gleich sei,
Zu leiden, zu weinen,
Zu genießen und zu freuen sich,
Und dein nicht zu achten,
Wie ich!`,
        content_en: `Cover your heavens, Zeus,
With cloudy mist,
And practice, like a boy
Decapitating thistles,
On oaks and mountain peaks;
Yet you must leave my earth
Untouched,
And my hut, which you did not build,
And my hearth,
Whose glowing fire
You envy me.

I know nothing poorer
Under the sun than you, gods!
You nourish wretchedly
On sacrificial taxes
And breath of prayers
Your majesty...

Here I sit, forming human beings
In my own image,
A race that shall be like me:
To suffer, to weep,
To enjoy and to rejoice,
And to heed you not,
As I!`
    },
    {
        title: "Das Göttliche",
        author: "Johann Wolfgang von Goethe",
        source: "Goethes Werke",
        theme: "philosophy",
        content_de: `Edel sei der Mensch,
Hilfreich und gut!
Denn das allein
Unterscheidet ihn
Von allen Wesen,
Die wir kennen.

Heil den unbekannten
Höhern Wesen,
Die wir ahnen!
Ihnen gleiche der Mensch;
Sein Beispiel lehr uns
Jene glauben.

Denn unfühlend
Ist die Natur:
Es leuchtet die Sonne
Über Bös und Gute,
Und dem Verbrecher
Glänzen wie dem Besten
Der Stern und der Mond.

Nur allein der Mensch
Vermag das Unmögliche:
Er unterscheidet,
Wählet und richtet;
Er kann dem Augenblick
Dauer verleihen.`,
        content_en: `Noble be man,
Helpful and good!
For that alone
Distinguishes him
From all beings
That we know.

Hail to the unknown
Higher beings
Whom we divine!
May man be like them;
May his example teach us
To believe in them.

For unfeeling
Is nature:
The sun shines
Upon evil and good,
And for the criminal
As for the best
Shine the stars and the moon.

Man alone
Can achieve the impossible:
He distinguishes,
Chooses and judges;
He can to the passing moment
Lend endurance.`
    },
    {
        title: "Gefunden",
        author: "Johann Wolfgang von Goethe",
        source: "Goethes Werke",
        theme: "art",
        content_de: `Ich ging im Walde
So für mich hin,
Und nichts zu suchen,
Das war mein Sinn.

Im Schatten sah ich
Ein Blümchen stehn,
Wie Sterne leuchtend,
Wie Äuglein schön.

Ich wollt es brechen,
Da sagt' es fein:
Soll ich zum Welken
Gebrochen sein?

Ich grub's mit allen
Den Würzlein aus,
Zum Garten trug ich's
Am hübschen Haus.

Und pflanzt es wieder
Am stillen Ort;
Nun zweigt es immer
Und blüht so fort.`,
        content_en: `I walked in the woods
All by myself,
And to seek nothing,
That was my mind.

In the shade I saw
A little flower stand,
Like stars beaming,
Like lovely little eyes.

I wanted to pluck it,
Then softly it said:
Shall I be broken
Only to wilt?

I dug it up
With all its little roots,
And bore it to the garden
By the charming house.

And planted it again
In a quiet place;
Now it branches evermore
And blossoms on.`
    },

    // ── SCHILLER ──
    {
        title: "An die Freude (Ode to Joy)",
        author: "Friedrich Schiller",
        source: "Thalia",
        theme: "philosophy",
        content_de: `Freude, schöner Götterfunken,
Tochter aus Elysium,
Wir betreten feuertrunken,
Himmlische, dein Heiligtum!
Deine Zauber binden wieder,
Was die Mode streng geteilt;
Alle Menschen werden Brüder,
Wo dein sanfter Flügel weilt.

Seid umschlungen, Millionen!
Diesen Kuß der ganzen Welt!
Brüder, überm Sternenzelt
Muß ein lieber Vater wohnen.

Wem der große Wurf gelungen,
Eines Freundes Freund zu sein;
Wer ein holdes Weib errungen,
Mische seinen Jubel ein!`,
        content_en: `Joy, beautiful spark of divinity,
Daughter of Elysium,
We enter, drunk with fire,
Heavenly one, thy sanctuary!
Thy magic binds again
What custom strictly divided;
All men become brothers
Where thy gentle wing abides.

Be embraced, ye millions!
This kiss to the whole world!
Brothers, above the starry canopy
A loving Father must dwell.

Whoever has had the great fortune
To be a friend unto a friend;
Whoever has won a devoted wife,
Let him join in our rejoicing!`
    },
    {
        title: "Hoffnung",
        author: "Friedrich Schiller",
        source: "Gedichte",
        theme: "personal growth",
        content_de: `Es reden und träumen die Menschen viel
Von bessern künftigen Tagen;
Nach einem glücklichen, goldenen Ziel
Sieht man sie rennen und jagen.
Die Welt wird alt und wird wieder jung,
Doch der Mensch hofft immer Verbesserung.

Die Hoffnung führt ihn ins Leben ein,
Sie umflattert den fröhlichen Knaben,
Den Jüngling locket ihr Zauberschein,
Sie wird mit dem Greis nicht begraben;
Denn beschließt er am Grabe den müden Lauf,
Noch am Grabe pflanzt er die Hoffnung auf.

Es ist kein leerer, schmeichelnder Wahn,
Erzeugt im Gehirne des Toren,
Im Herzen kündet es laut sich an:
Zu was Besserm sind wir geboren!
Und was die innere Stimme spricht,
Das täuscht die hoffende Seele nicht.`,
        content_en: `Men speak and dream so very much
Of better future days;
Toward a happy, golden goal
We see them run and race.
The world grows old and grows young again,
Yet man ever hopes for improvement.

Hope leads him into life at birth,
It flutters about the happy boy,
Its magic sheen lures the youth,
It is not buried with the old man;
For when he ends his weary race at the grave,
Even at the grave he plants his hope.

It is no empty, flattering delusion,
Begotten in the brain of the fool;
In the heart it loudly announces itself:
For something better we were born!
And what that inner voice declares
Does not deceive the hoping soul.`
    },

    // ── RILKE ──
    {
        title: "Der Panther",
        author: "Rainer Maria Rilke",
        source: "Neue Gedichte",
        theme: "art",
        content_de: `Sein Blick ist vom Vorübergehn der Stäbe
so müd geworden, daß er nichts mehr hält.
Ihm ist, als ob es tausend Stäbe gäbe
und hinter tausend Stäben keine Welt.

Der weiche Gang geschmeidig starker Schritte,
der sich im allerkleinsten Kreise dreht,
ist wie ein Tanz von Kraft um eine Mitte,
in der betäubt ein großer Wille steht.

Nur manchmal schiebt der Vorhang der Pupille
sich lautlos auf —. Dann geht ein Bild hinein,
geht durch der Glieder angespannte Stille —
und hört im Herzen auf zu sein.`,
        content_en: `His vision, from the constantly passing bars,
has grown so weary that it cannot hold a thing.
It seems to him there are a thousand bars;
and behind the thousand bars, no world.

The supple stride of buoyant, powerful footsteps,
which circles down to the smallest ring,
is like a dance of strength around a center
in which a mighty will stands numb and still.

Only sometimes the curtain of his pupil
slides soundlessly open—. An image enters then,
glides through the tensed stillness of his muscles—
and ceases in his heart to exist.`
    },
    {
        title: "Herbsttag",
        author: "Rainer Maria Rilke",
        source: "Das Buch der Bilder",
        theme: "environment",
        content_de: `Herr: es ist Zeit. Der Sommer war sehr groß.
Leg deinen Schatten auf die Sonnenuhren,
und auf den Fluren laß die Winde los.

Befiehl den letzten Früchten voll zu sein;
gieb ihnen noch zwei südlichere Tage,
dränge sie zur Vollendung hin und jage
die letzte Süße in den schweren Wein.

Wer jetzt kein Haus hat, baut sich keines mehr.
Wer jetzt allein ist, wird es lange bleiben,
wird wachen, lesen, lange Briefe schreiben
und wird in den Alleen hin und her
unruhig wandern, wenn die Blätter treiben.`,
        content_en: `Lord: it is time. The summer was immense.
Lay your shadow upon the sundials,
and let the winds run loose across the plains.

Command the last fruits to be full;
give them two more southern days,
urge them toward completion and chase
the final sweetness into the heavy wine.

Whoever has no house now, will never build one.
Whoever is alone now, will long remain so,
will wake, read, write long letters,
and wander restless up and down avenues
where dead leaves are blowing.`
    },
    {
        title: "Ich lebe mein Leben in wachsenden Ringen",
        author: "Rainer Maria Rilke",
        source: "Das Stunden-Buch",
        theme: "philosophy",
        content_de: `Ich lebe mein Leben in wachsenden Ringen,
die sich über die Dinge ziehn.
Ich werde den letzten vielleicht nicht vollbringen,
aber versuchen will ich ihn.

Ich kreise um Gott, um den uralten Turm,
und ich kreise jahrtausendelang;
und ich weiß noch nicht: bin ich ein Falke, ein Sturm
oder ein großer Gesang.`,
        content_en: `I live my life in widening circles
that reach out across the world.
I may not complete this last one,
but I give myself to the attempt.

I circle around God, around the primordial tower.
I've been circling for thousands of years
and I still don't know: am I a falcon, a storm,
or a great song?`
    },

    // ── HEINRICH HEINE ──
    {
        title: "Die Loreley",
        author: "Heinrich Heine",
        source: "Buch der Lieder",
        theme: "mystery",
        content_de: `Ich weiß nicht, was soll es bedeuten,
Daß ich so traurig bin;
Ein Märchen aus alten Zeiten,
Das kommt mir nicht aus dem Sinn.

Die Luft ist kühl und es dunkelt,
Und ruhig fließt der Rhein;
Der Gipfel des Berges funkelt
Im Abendsonnenschein.

Die schönste Jungfrau sitzet
Dort oben wunderbar,
Ihr goldnes Geschmeide blitzet,
Sie kämmt ihr goldenes Haar.

Sie kämmt es mit goldenem Kamme
Und singt ein Lied dabei;
Das hat eine wundersame,
Gewaltige Melodei.`,
        content_en: `I do not know what it can mean
That I am so full of sorrow;
A tale from the days of old
Refuses to leave my mind.

The air is cool and night is falling,
And quietly flows the Rhine;
The mountain summit glistens
In the evening sunshine.

The fairest maiden is sitting
Up there so wondrously,
Her golden jewels are gleaming,
She combs her golden hair.

She combs it with a comb of gold
And sings a melody;
It has a wondrous,
Mighty sorcery.`
    },

    // ── ROBERT FROST ──
    {
        title: "The Road Not Taken",
        author: "Robert Frost",
        source: "Mountain Interval",
        theme: "personal growth",
        content_en: `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`,
        content_de: `Zwei Wege trennten sich im gelben Wald,
Und traurig, daß ich nicht beide gehn
Und nur ein Reisender sein konnt, hielt ich an,
Und schaute den einen hinab so weit ich konnt,
Bis er bog im Buschwerk und verschwand;

Dann wählte ich den andern, ebenso schön,
Der vielleicht den bessern Anspruch trug,
Weil er grasbewachsen war und unbegangen;
Obgleich für das Gehen darauf
Sie beide eigentlich gleich zertreten waren,

Und beide an jenem Morgen still lagen
Im Laub, das kein Schritt geschwärzt.
Oh, ich sparte den ersten für einen andern Tag!
Doch wissend, wie ein Weg zum nächsten führt,
Zweifelte ich, je wiederzukehren.

Ich werde dies mit einem Seufzer erzählen,
Irgendwo nach vielen, vielen Jahren:
Zwei Wege trennten sich im Wald, und ich—
Ich nahm den, den weniger betreten hatten,
Und das hat den ganzen Unterschied gemacht.`
    },
    {
        title: "Stopping by Woods on a Snowy Evening",
        author: "Robert Frost",
        source: "New Hampshire",
        theme: "environment",
        content_en: `Whose woods these are I think I know.   
His house is in the village though;   
He will not see me stopping here   
To watch his woods fill up with snow.   

My little horse must think it queer   
To stop without a farmhouse near   
Between the woods and frozen lake   
The darkest evening of the year.   

He gives his harness bells a shake   
To ask if there is some mistake.   
The only other sound’s the sweep   
Of easy wind and downy flake.   

The woods are lovely, dark and deep,   
But I have promises to keep,   
And miles to go before I sleep,   
And miles to go before I sleep.`,
        content_de: `Wem dieser Wald gehört, ich glaub ich weiß es.
Sein Haus steht drüben im Dorf indessen;
Er sieht mich nicht hier halten im Leisen,
Zu sehn wie der Wald sich füllt mit Schnee.

Mein kleines Pferd muß es seltsam finden,
Zu halten wo nirgends Höfe münden,
Zwischen Wald und zugefrorenem See,
Am dunkelsten Abend im Jahreskreise.

Es schüttelt die Glocken am Geschirr,
Als frage es, ob ein Irrtum wär.
Der einzge andre Laut: der weiche Zug
Von leisem Wind und Flockenflug.

Die Wälder sind lieblich, dunkel und tief,
Doch hab ich Versprechen, die ich rief,
Und Meilen zu gehn, bevor ich schlaf,
Und Meilen zu gehn, bevor ich schlaf.`
    },
    {
        title: "Nothing Gold Can Stay",
        author: "Robert Frost",
        source: "New Hampshire",
        theme: "philosophy",
        content_en: `Nature’s first green is gold,
Her hardest hue to hold.
Her early leaf’s a flower;
But only so an hour.
Then leaf subsides to leaf.
So Eden sank to grief,
So dawn goes down to day.
Nothing gold can stay.`,
        content_de: `Des Frühlings erstes Grün ist Gold,
Der Farbton, den sie kaum behält.
Ihr frühes Blatt ist eine Blüte;
Jedoch nur für eine Stunde Güte.
Dann sinkt ein Blatt zum Blatt herab.
So sank auch Eden in den Schmerz,
So bricht das Morgenlicht zum Tag.
Nichts Goldenes verweilen mag.`
    },

    // ── KHALIL GIBRAN ──
    {
        title: "On Joy and Sorrow",
        author: "Kahlil Gibran",
        source: "The Prophet",
        theme: "philosophy",
        content_en: `Your joy is your sorrow unmasked.
And the selfsame well from which your laughter rises was often filled with your tears.
And how else can it be?
The deeper that sorrow carves into your being, the more joy you can contain.
Is not the cup that holds your wine the very cup that was burned in the potter's oven?
And is not the lute that soothes your spirit, the very wood that was hollowed with knives?
When you are joyous, look deep into your heart and you shall find it is only that which has given you sorrow that is giving you joy.
When you are sorrowful look again in your heart, and you shall see that in truth you are weeping for that which has been your delight.`,
        content_de: `Eure Freude ist eure unverhüllte Trauer.
Und derselbe Brunnen, aus dem euer Lachen aufsteigt, war oft gefüllt mit euren Tränen.
Und wie könnte es anders sein?
Je tiefer sich die Trauer in euer Wesen eingräbt, desto mehr Freude könnt ihr fassen.
Ist nicht der Becher, der euren Wein enthält, derselbe, der im Ofen des Töpfers gebrannt wurde?
Und ist nicht die Laute, die euren Geist besänftigt, dasselbe Holz, das mit Messern ausgehöhlt ward?
Wenn ihr fröhlich seid, blickt tief in euer Herz, und ihr werdet finden: nur das, was euch Trauer brachte, schenkt euch nun Freude.
Wenn ihr traurig seid, blickt wieder in euer Herz, und ihr werdet sehen: in Wahrheit weint ihr um das, was eure Wonne war.`
    },

    // ── RUMI ──
    {
        title: "The Guest House",
        author: "Rumi",
        source: "The Masnavi",
        theme: "personal growth",
        content_en: `This being human is a guest house.
Every morning a new arrival.

A joy, a depression, a meanness,
some momentary awareness comes
as an unexpected visitor.

Welcome and entertain them all!
Even if they’re a crowd of sorrows,
who violently sweep your house
empty of its furniture,
still, treat each guest honorably.
He may be clearing you out
for some new delight.

The dark thought, the shame, the malice,
meet them at the door laughing,
and invite them in.

Be grateful for whoever comes,
because each has been sent
as a guide from beyond.`,
        content_de: `Das Menschsein gleicht einem Gasthaus.
Jeden Morgen eine neue Ankunft.

Eine Freude, eine Schwermut, eine Niedertracht,
ein flüchtiges Erkennen kommt
als unerwarteter Gast herein.

Heiß sie alle willkommen und bewirte sie!
Selbst wenn es eine Schar von Sorgen ist,
die gewaltsam dein Haus
von allem Mobiliar leeren,
behandle dennoch jeden Gast mit Ehren.
Vielleicht räumt er dich aus
für eine neue Freude.

Den finstern Gedanken, die Scham, die Bosheit –
tritt ihnen lachend an der Tür entgegen
und lade sie herein.

Sei dankbar für jeden, der kommt,
denn jeder wurde gesandt
als Wegweiser aus dem Jenseits.`
    },

    // ── LANGSTON HUGHES ──
    {
        title: "Dreams",
        author: "Langston Hughes",
        source: "The Weary Blues",
        theme: "personal growth",
        content_en: `Hold fast to dreams
For if dreams die
Life is a broken-winged bird
That cannot fly.

Hold fast to dreams
For when dreams go
Life is a barren field
Frozen with snow.`,
        content_de: `Halte fest an deinen Träumen,
Denn wenn Träume sterben,
Ist das Leben ein Vogel mit gebrochnen Schwingen,
Der nicht mehr fliegen kann.

Halte fest an deinen Träumen,
Denn wenn Träume schwinden,
Ist das Leben ein karges Feld,
Gefroren unter Schnee.`
    },

    // ── RABINDRANATH TAGORE ──
    {
        title: "Where the Mind is Without Fear",
        author: "Rabindranath Tagore",
        source: "Gitanjali",
        theme: "politics",
        content_en: `Where the mind is without fear and the head is held high;
Where knowledge is free;
Where the world has not been broken up into fragments
By narrow domestic walls;
Where words come out from the depth of truth;
Where tireless striving stretches its arms towards perfection;
Where the clear stream of reason has not lost its way
Into the dreary desert sand of dead habit;
Where the mind is led forward by thee
Into ever-widening thought and action—
Into that heaven of freedom, my Father, let my country awake.`,
        content_de: `Wo der Geist ohne Furcht ist und das Haupt erhoben;
Wo das Wissen frei ist;
Wo die Welt nicht in Bruchstücke zersplittert ist
Durch enge häusliche Mauern;
Wo Worte aus den Tiefen der Wahrheit hervorgehen;
Wo rastloses Streben die Arme nach Vollendung ausstreckt;
Wo der klare Strom der Vernunft sich nicht verirrt hat
Im öden Wüstensand toter Gewohnheit;
Wo der Geist von dir vorwärtsgeführt wird
In immer weiteres Denken und Handeln—
In jenen Himmel der Freiheit, mein Vater, laß mein Land erwachen.`
    }
];

// Curated classic quotes from Top 100 Famous Poets
const CURATED_POET_QUOTES = [
    {
        author: 'William Shakespeare',
        source: 'Hamlet',
        theme: 'philosophy',
        quote: 'There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy.',
        quote_de: 'Es gibt mehr Dinge im Himmel und auf Erden, Horatio, als eure Schulweisheit sich träumt.'
    },
    {
        author: 'William Shakespeare',
        source: 'As You Like It',
        theme: 'art',
        quote: 'All the world’s a stage, and all the men and women merely players.',
        quote_de: 'Die ganze Welt ist eine Bühne, und alle Frauen und Männer bloße Spieler.'
    },
    {
        author: 'Emily Dickinson',
        source: 'Complete Poems',
        theme: 'personal growth',
        quote: 'Hope is the thing with feathers that perches in the soul and sings the tune without the words and never stops at all.',
        quote_de: 'Hoffnung ist das Ding mit Federn, das in der Seele nistet und die Melodie ohne Worte singt und niemals aufhört.'
    },
    {
        author: 'Emily Dickinson',
        source: 'Complete Poems',
        theme: 'literature',
        quote: 'There is no Frigate like a Book to take us Lands away.',
        quote_de: 'Es gibt kein Schiff wie ein Buch, um uns in ferne Länder zu tragen.'
    },
    {
        author: 'Oscar Wilde',
        source: 'Lady Windermere’s Fan',
        theme: 'philosophy',
        quote: 'We are all in the gutter, but some of us are looking at the stars.',
        quote_de: 'Wir liegen alle in der Gosse, aber einige von uns blicken zu den Sternen.'
    },
    {
        author: 'Oscar Wilde',
        source: 'De Profundis',
        theme: 'personal growth',
        quote: 'Be yourself; everyone else is already taken.',
        quote_de: 'Sei du selbst; alle anderen sind bereits vergeben.'
    },
    {
        author: 'John Keats',
        source: 'Ode on a Grecian Urn',
        theme: 'art',
        quote: 'Beauty is truth, truth beauty,—that is all ye know on earth, and all ye need to know.',
        quote_de: 'Schönheit ist Wahrheit, Wahrheit Schönheit,—das ist alles, was ihr auf Erden wisst, und alles, was ihr wissen müsst.'
    },
    {
        author: 'Percy Bysshe Shelley',
        source: 'A Defence of Poetry',
        theme: 'politics',
        quote: 'Poets are the unacknowledged legislators of the world.',
        quote_de: 'Dichter sind die unanerkannten Gesetzgeber der Welt.'
    },
    {
        author: 'William Blake',
        source: 'Auguries of Innocence',
        theme: 'philosophy',
        quote: 'To see a World in a Grain of Sand and a Heaven in a Wild Flower, Hold Infinity in the palm of your hand and Eternity in an hour.',
        quote_de: 'Die Welt in einem Sandkorn sehn und einen Himmel in einer wilden Blume, die Unendlichkeit in deiner Hand halten und die Ewigkeit in einer Stunde.'
    },
    {
        author: 'Walt Whitman',
        source: 'Song of Myself',
        theme: 'personal growth',
        quote: 'Do I contradict myself? Very well then I contradict myself, (I am large, I contain multitudes.)',
        quote_de: 'Widerspreche ich mir selbst? Nun gut, dann widerspreche ich mir eben, (Ich bin groß, ich enthalte Vielheiten.)'
    },
    {
        author: 'Johann Wolfgang von Goethe',
        source: 'Faust I',
        theme: 'personal growth',
        quote: 'Whatever you can do or dream you can, begin it. Boldness has genius, power, and magic in it.',
        quote_de: 'Was immer du tun kannst oder träumst es zu können, beginne es. Kühnheit besitzt Genie, Kraft und Zauber.'
    },
    {
        author: 'Friedrich Schiller',
        source: 'Wallenstein',
        theme: 'philosophy',
        quote: 'Deep meaning often lies in childish plays.',
        quote_de: 'Tiefere Bedeutung liegt oft in kindischem Spiel.'
    },
    {
        author: 'Rainer Maria Rilke',
        source: 'Letters to a Young Poet',
        theme: 'personal growth',
        quote: 'Be patient toward all that is unsolved in your heart and try to love the questions themselves.',
        quote_de: 'Habe Geduld gegen alles Ungelöste in deinem Herzen und versuche, die Fragen selbst lieb zu haben.'
    },
    {
        author: 'Rumi',
        source: 'The Masnavi',
        theme: 'personal growth',
        quote: 'The wound is the place where the Light enters you.',
        quote_de: 'Die Wunde ist der Ort, an dem das Licht in dich eintritt.'
    },
    {
        author: 'Kahlil Gibran',
        source: 'The Prophet',
        theme: 'philosophy',
        quote: 'Work is love made visible.',
        quote_de: 'Arbeit ist sichtbar gemachte Liebe.'
    },
    {
        author: 'Robert Frost',
        source: 'A Servant to Servants',
        theme: 'personal growth',
        quote: 'The best way out is always through.',
        quote_de: 'Der beste Ausweg führt immer mitten hindurch.'
    },
    {
        author: 'Ralph Waldo Emerson',
        source: 'Self-Reliance',
        theme: 'personal growth',
        quote: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
        quote_de: 'In einer Welt, die unablässig versucht, dich zu etwas anderem zu machen, du selbst zu sein, ist die größte Vollbringung.'
    },
    {
        author: 'Henry David Thoreau',
        source: 'Walden',
        theme: 'environment',
        quote: 'I went to the woods because I wished to live deliberately, to front only the essential facts of life.',
        quote_de: 'Ich ging in die Wälder, weil ich bewusst leben wollte, um nur den wesentlichen Tatsachen des Lebens ins Auge zu sehn.'
    }
];

async function run() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const coll = db.collection(COLLECTION_NAME);

        console.log('--- 1. IDENTIFYING RITUAL-REFERENCED POEMS TO PROTECT ---');
        const rituals = await db.collection('dailyrituals').find().toArray();
        const protectedIds = new Set();
        rituals.forEach(r => {
            if (Array.isArray(r.contentIds)) {
                r.contentIds.forEach(id => protectedIds.add(id.toString()));
            }
        });
        console.log(`Protected content IDs from daily rituals: ${protectedIds.size}`);

        console.log('--- 2. FETCHING CLASSIC POEMS FROM POETRYDB ---');
        // Selected classic authors from PoetrySoup Top 100
        const authorsToFetch = [
            'William Shakespeare',
            'Emily Dickinson',
            'Edgar Allan Poe',
            'Walt Whitman',
            'John Keats',
            'Percy Bysshe Shelley',
            'William Blake',
            'Lord Alfred Tennyson',
            'Robert Browning',
            'Christina Rossetti',
            'John Donne',
            'Robert Burns',
            'Robert Herrick',
            'Robert Louis Stevenson',
            'Matthew Arnold',
            'Oscar Wilde'
        ];

        const fetchedPoems = [];

        for (const author of authorsToFetch) {
            try {
                const encoded = encodeURIComponent(author);
                const res = await fetch(`https://poetrydb.org/author/${encoded}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Filter: take good poems with reasonable length (between 4 and 80 lines)
                    // limit per author so one author doesn't dominate (e.g. max 35 per author)
                    const filtered = data
                        .filter(p => Array.isArray(p.lines) && p.lines.length >= 4 && p.lines.length <= 80)
                        .slice(0, 35);

                    console.log(`Fetched ${filtered.length} poems for ${author}`);
                    for (const p of filtered) {
                        const content = p.lines.join('\n').trim();
                        const wordCount = content.split(/\s+/).length;
                        const theme = categorizePoem(p.title, content, author);
                        fetchedPoems.push({
                            title: p.title.replace(/^Sonnet\s+(\d+):?\s*/i, 'Sonnet $1: ').trim(),
                            author: author,
                            source: 'Classic Poetry Collection',
                            theme: theme,
                            content: content,
                            content_en: content,
                            title_en: p.title,
                            estimatedWords: wordCount,
                            readTime: estimateReadTime(wordCount),
                            type: 'poem',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch poems for ${author}:`, err.message);
            }
        }

        console.log(`\nTotal fetched poems from PoetryDB: ${fetchedPoems.length}`);

        // Translate English titles and prepare German descriptions/content for key classic poems
        // For poems, German content: for curated German ones, authentic German; for fetched ones, bilingual title and German content where available
        console.log('--- 3. ADDING CURATED WORLD & GERMAN CLASSICS ---');
        const curatedDocs = CURATED_CLASSIC_POEMS.map(p => {
            const words = (p.content_en || p.content_de).split(/\s+/).length;
            return {
                title: p.title,
                author: p.author,
                source: p.source,
                theme: p.theme,
                content: p.content_en || p.content_de,
                content_en: p.content_en,
                content_de: p.content_de,
                title_en: p.title,
                title_de: p.title,
                estimatedWords: words,
                readTime: estimateReadTime(words),
                type: 'poem',
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });

        console.log(`Added ${curatedDocs.length} curated masterwork poems (Goethe, Schiller, Rilke, Heine, Frost, Gibran, Rumi, Hughes, Tagore).`);

        console.log('--- 4. CLEANING OUT OLD POEMS (PRESERVING RITUALS) ---');
        const deleteFilter = {
            type: 'poem',
            _id: { $nin: Array.from(protectedIds).map(id => new ObjectId(id)) }
        };
        const deleteResult = await coll.deleteMany(deleteFilter);
        console.log(`Deleted ${deleteResult.deletedCount} old poems.`);

        console.log('--- 5. INSERTING CLASSIC POEMS INTO DATABASE ---');
        const allNewPoems = [...curatedDocs, ...fetchedPoems];
        // Ensure every poem has title_en, content_en, title_de, content_de
        allNewPoems.forEach(p => {
            if (!p.title_en) p.title_en = p.title;
            if (!p.content_en) p.content_en = p.content;
            if (!p.title_de) p.title_de = p.title;
            if (!p.content_de) p.content_de = p.content_en; // fallback to English if direct German verse isn't provided
        });

        const insertResult = await coll.insertMany(allNewPoems);
        console.log(`Successfully inserted ${insertResult.insertedCount} classic poems!`);

        console.log('--- 6. INSERTING ADDITIONAL CLASSIC POET QUOTES ---');
        const quoteDocs = CURATED_POET_QUOTES.map(q => {
            const words = q.quote.split(/\s+/).length;
            const contentEn = `> "${q.quote}"\n\n— **${q.author}**${q.source ? `, *${q.source}*` : ''}`;
            const contentDe = `> "${q.quote_de}"\n\n— **${q.author}**${q.source ? `, *${q.source}*` : ''}`;
            return {
                type: 'idea',
                subType: 'quote',
                theme: q.theme,
                title: `${q.author} on ${q.theme.charAt(0).toUpperCase() + q.theme.slice(1)}`,
                author: q.author,
                source: q.source,
                content: contentEn,
                content_en: contentEn,
                content_de: contentDe,
                title_en: `${q.author} on ${q.theme.charAt(0).toUpperCase() + q.theme.slice(1)}`,
                title_de: `${q.author} über ${q.theme.charAt(0).toUpperCase() + q.theme.slice(1)}`,
                estimatedWords: words,
                readTime: '1 min',
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });

        const quoteInsertResult = await coll.insertMany(quoteDocs);
        console.log(`Successfully inserted ${quoteInsertResult.insertedCount} classic poet quotes into ideas!`);

        console.log('--- 7. FINAL BREAKDOWN ---');
        const poemBreakdown = await coll.aggregate([
            { $match: { type: 'poem' } },
            { $group: { _id: "$author", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        console.log('Top Classic Poem Authors in DB:');
        poemBreakdown.slice(0, 20).forEach(a => console.log(`  - ${a._id}: ${a.count} poems`));

        const themeBreakdown = await coll.aggregate([
            { $match: { type: 'poem' } },
            { $group: { _id: "$theme", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        console.log('\nPoem Theme Breakdown:');
        themeBreakdown.forEach(t => console.log(`  - ${t._id}: ${t.count} poems`));

    } catch (err) {
        console.error('Error during poem reset:', err);
    } finally {
        await client.close();
    }
}

run();
