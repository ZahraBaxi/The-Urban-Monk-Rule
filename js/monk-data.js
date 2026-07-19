/* ============================================================
   monk-data.js
   Static content for "The Urban Monk Rule" — quotes, prompts,
   checklists, and the craft database. No logic here, just data.
   ============================================================ */

var MONK = {};

MONK.quotes = [
  "Own less. Notice more.",
  "The work of the hands quiets the work of the mind.",
  "A task done slowly is still done.",
  "Attention is the rarest form of generosity.",
  "Begin the day before the day begins for you.",
  "Repair what you can. Discard what you must.",
  "Silence is not empty. It is full of an answer.",
  "Let the weather teach you something today.",
  "One task at a time is a whole philosophy.",
  "The kitchen clean is the mind clean.",
  "Small rituals build a large life.",
  "Notice the doorway. Notice the threshold.",
  "Craft is prayer with your hands.",
  "Nothing decorative unless it serves a purpose."
];

MONK.vows = [
  "Today I will do one thing slowly.",
  "Today I will listen without planning my reply.",
  "Today I will notice something growing.",
  "Today I will leave a place cleaner than I found it.",
  "Today I will make something with my hands.",
  "Today I will walk without headphones.",
  "Today I will ask before I answer.",
  "Today I will rest without guilt.",
  "Today I will mend instead of replace.",
  "Today I will greet the morning before my phone does."
];

MONK.morningReminder = "Wake before the light asks you to. The first hour belongs to you, not to your phone.";
MONK.eveningReminder = "Close the day the way you'd close a good book. Slowly, and with care for what comes next.";

MONK.rhythm = {
  morning: [
    { id: "m1", label: "Wake before 6" },
    { id: "m2", label: "Shower" },
    { id: "m3", label: "Open curtains" },
    { id: "m4", label: "No phone" },
    { id: "m5", label: "Drink water" },
    { id: "m6", label: "Step outside" },
    { id: "m7", label: "Observe weather" },
    { id: "m8", label: "Journal" },
    { id: "m9", label: "Read" }
  ],
  evening: [
    { id: "e1", label: "Kitchen clean" },
    { id: "e2", label: "Tea" },
    { id: "e3", label: "Read" },
    { id: "e4", label: "Journal" },
    { id: "e5", label: "Phone away" },
    { id: "e6", label: "Bed before 10" }
  ]
};

MONK.placePrompts = [
  "What bird did you hear today?",
  "What tree did you notice?",
  "What flowers are blooming?",
  "What changed since yesterday?",
  "What direction is the wind?",
  "What does the air smell like?",
  "What insect crossed your path?",
  "What color is the sky right now?",
  "What sound surprised you?",
  "What is the light doing?"
];

MONK.presencePrompts = [
  "Wash dishes slowly.",
  "Walk without headphones.",
  "Eat without your phone.",
  "Notice every doorway you walk through.",
  "Take five deep breaths before opening your laptop.",
  "One task at a time.",
  "Drink your tea with both hands.",
  "Let the phone ring twice before answering.",
  "Notice your feet on the ground.",
  "Do one chore as if it were the only task today."
];

MONK.solitudePractices = [
  "Make tea.",
  "Read for 30 minutes.",
  "Sit outside.",
  "Walk one mile.",
  "Watch the sunset.",
  "Garden.",
  "Sketch.",
  "Write a letter.",
  "Visit the library.",
  "Sit on a bench.",
  "Leave your phone in your pocket.",
  "Watch clouds pass for ten minutes.",
  "Sit with a single cup of coffee, nothing else."
];

MONK.humilityPrompts = [
  "Ask two more questions.",
  "Interrupt nobody.",
  "Notice someone's passion.",
  "Remember one person's name.",
  "Let silence happen.",
  "Listen without planning your reply.",
  "Learn one thing about someone's life.",
  "Give credit before you take it.",
  "Ask what they need before offering advice.",
  "Say less than you're tempted to."
];

MONK.learning = {
  "Nature": ["Local bird calls", "Native plants nearby", "Cloud types", "Migration patterns", "Soil composition"],
  "History": ["Local founding history", "A historical trade route", "A forgotten craft guild", "An old map of your city", "A century-old newspaper"],
  "Craft": ["Hand-tool joinery", "Natural dye techniques", "Traditional knot-tying", "Bookbinding basics", "Whittling grain direction"],
  "Religion": ["A monastic daily rule", "A pilgrimage route", "A fasting tradition", "A contemplative practice", "A sacred architecture style"],
  "Architecture": ["Vernacular building materials", "A local landmark's history", "Passive cooling design", "Roofline styles nearby", "Doorway symbolism"],
  "Ecology": ["A local watershed", "Companion planting", "Decomposition stages", "An invasive species nearby", "Pollinator behavior"],
  "Typography": ["A classic serif's history", "Letterpress terminology", "Kerning basics", "A type foundry's story", "Hand-lettering strokes"],
  "Botany": ["A plant family nearby", "Seed dispersal methods", "Leaf shape vocabulary", "A medicinal herb", "Grafting basics"],
  "Cooking": ["A regional bread tradition", "Knife sharpening angles", "A fermentation method", "A grandmother's recipe", "Stock-making basics"],
  "Philosophy": ["Stoic morning practices", "A monastic virtue", "Slow living philosophy", "Craftsmanship ethics", "The idea of enough"]
};

MONK.craft = {
  "Cooking": ["Bake bread", "Make yogurt", "Make ghee", "Cook dal", "Pickle vegetables", "Ferment something"],
  "Gardening": ["Plant herbs", "Harvest seeds", "Compost", "Prune something", "Repot a plant"],
  "Repair": ["Visible mending", "Patch clothes", "Sharpen knives", "Oil leather", "Re-glue a chair"],
  "Woodworking": ["Carve a spoon", "Make a shelf", "Sand something smooth", "Whittle a small object"],
  "Printing": ["Risograph a print", "Linocut", "Letterpress a card", "Stamp carving"],
  "Drawing": ["Field sketch", "Bird sketch", "Map making", "Still life"],
  "Writing": ["Journal", "Essay", "Poem", "Field notes", "A letter to a friend"],
  "Coding": ["Build a tiny website", "Refactor code", "Make an accessibility improvement", "Write a small script"]
};

MONK.stewardshipActs = [
  "Pick up litter.",
  "Water a plant.",
  "Clean your desk.",
  "Repair something.",
  "Donate an item.",
  "Oil your boots.",
  "Organize a drawer.",
  "Leave somewhere cleaner.",
  "Sweep a shared space.",
  "Fix something for a neighbor."
];

MONK.joys = [
  "Watch clouds.",
  "Drink coffee outside.",
  "Listen to birds.",
  "Wear your favorite sweater.",
  "Read poetry.",
  "Buy flowers from a farmer.",
  "Visit a museum.",
  "Walk after rain.",
  "Make soup.",
  "Bake cookies.",
  "Read under a tree.",
  "Light a candle for no reason.",
  "Call an old friend."
];
