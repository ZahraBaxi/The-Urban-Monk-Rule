/* ============================================================
   monk-data.js
   Static content for "The Urban Monk Rule" — quotes, prompts,
   checklists, and the craft database. No logic here, just data.
   Lists are kept long on purpose: js/monk-app.js draws from them
   with a shuffle-bag (every item shown once before any repeats),
   so the bigger the list, the longer it takes to feel familiar.
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
  "Nothing decorative unless it serves a purpose.",
  "The city is a forest if you look at it that way.",
  "A neighbor's name is worth more than a neighbor's approval.",
  "What you tend, tends to you.",
  "Enough is a place, not a number.",
  "The mend shows. Let it.",
  "A slow walk covers more ground than you'd think.",
  "Care is a skill before it is a feeling.",
  "The world is maintained by unglamorous hands.",
  "Practice the thing you'd want to be found doing.",
  "There is no away to throw things to.",
  "Belonging is built, not found."
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
  "Today I will greet the morning before my phone does.",
  "Today I will learn one neighbor's name.",
  "Today I will fix something instead of replacing it.",
  "Today I will spend money like it costs someone's time.",
  "Today I will thank someone whose work I usually overlook.",
  "Today I will do the small chore I keep postponing.",
  "Today I will look up more than I look down.",
  "Today I will give my full attention to one conversation.",
  "Today I will use less than I'm allowed to."
];

MONK.worldQuestions = [
  "What is one thing you consume that you could make instead?",
  "Who in your building or block do you not yet know?",
  "What would you do differently if you expected to live here forever?",
  "What does 'enough' look like for you today?",
  "What is one system you rely on that you don't understand?",
  "If you had one spare hour for this neighborhood, what would you do with it?",
  "What comfort could you give up for someone else's sake?",
  "What does your street need that you could actually provide?",
  "Who taught you something you never got to thank them for?",
  "What's something you were taught to throw away that could be repaired?",
  "Whose labor made your morning possible, and do you know their name?",
  "What's a small inconvenience you could accept to lighten someone else's load?",
  "What would change if you treated your possessions as borrowed?",
  "What's one thing in your daily route you've stopped truly seeing?",
  "Who could you check on today without being asked?",
  "What's a rule you follow that no longer serves anyone?",
  "What would this week look like if you measured it in attention instead of output?",
  "What's something you know how to do that a neighbor might not?"
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
  "What is the light doing?",
  "What's growing in a crack in the pavement?",
  "What did the ground feel like underfoot?",
  "What's the oldest thing in view?",
  "What material is the nearest building made of?",
  "What animal has adapted to living near people here?",
  "What sound is missing that you'd expect?",
  "What's in bloom, gone to seed, or bare right now?",
  "Where does the water go when it rains here?"
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
  "Do one chore as if it were the only task today.",
  "Fold laundry without a screen on.",
  "Notice the first three sounds you hear each hour, on the hour.",
  "Let your commute be the whole activity, not a gap between activities.",
  "Cook one meal without tasting it from a recipe screen.",
  "Say a full sentence of thanks before eating.",
  "Notice what your hands are doing right now.",
  "Sit through one uncomfortable silence without filling it.",
  "Put the phone in another room for one hour."
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
  "Sit with a single cup of coffee, nothing else.",
  "Take a walk with no destination.",
  "Sit in a park you've never visited.",
  "Spend an hour with a hobby you dropped years ago.",
  "Cook a meal just for yourself, properly.",
  "Sit by a window and do nothing else.",
  "Take yourself somewhere you'd normally only go with someone else.",
  "Write down a question you don't need to answer today."
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
  "Say less than you're tempted to.",
  "Ask someone what they're proud of lately.",
  "Let someone finish their sentence, fully.",
  "Admit when you don't know something today.",
  "Ask a question you already think you know the answer to.",
  "Notice who hasn't spoken yet, and make room for them.",
  "Thank someone specifically, not generally.",
  "Ask how someone is, and wait for the real answer.",
  "Repeat back what someone said before responding to it."
];

MONK.learning = {
  "Nature": ["Local bird calls", "Native plants nearby", "Cloud types", "Migration patterns", "Soil composition", "Local pollinators", "How your local watershed drains", "Native vs. introduced trees near you"],
  "History": ["Local founding history", "A historical trade route", "A forgotten craft guild", "An old map of your city", "A century-old newspaper", "Who lived on your land before it was built up", "A local labor history", "A building's original use"],
  "Craft": ["Hand-tool joinery", "Natural dye techniques", "Traditional knot-tying", "Bookbinding basics", "Whittling grain direction", "Basic blacksmithing terms", "Traditional roofing materials", "Hand-stitching techniques"],
  "Religion": ["A monastic daily rule", "A pilgrimage route", "A fasting tradition", "A contemplative practice", "A sacred architecture style", "A tradition of hospitality to strangers", "A ritual around food"],
  "Architecture": ["Vernacular building materials", "A local landmark's history", "Passive cooling design", "Roofline styles nearby", "Doorway symbolism", "How your city's oldest buildings were heated", "Local brick or stone sourcing"],
  "Ecology": ["A local watershed", "Companion planting", "Decomposition stages", "An invasive species nearby", "Pollinator behavior", "Urban heat islands", "How your city handles stormwater"],
  "Typography": ["A classic serif's history", "Letterpress terminology", "Kerning basics", "A type foundry's story", "Hand-lettering strokes", "A local sign-painting tradition"],
  "Botany": ["A plant family nearby", "Seed dispersal methods", "Leaf shape vocabulary", "A medicinal herb", "Grafting basics", "A plant your grandparents would recognize"],
  "Cooking": ["A regional bread tradition", "Knife sharpening angles", "A fermentation method", "A grandmother's recipe", "Stock-making basics", "A preservation technique from before refrigeration"],
  "Philosophy": ["Stoic morning practices", "A monastic virtue", "Slow living philosophy", "Craftsmanship ethics", "The idea of enough", "A mutual-aid tradition", "The commons, as an idea"],
  "Civics": ["How your local water system is run", "Who represents your district", "How your street gets repaired", "A local mutual-aid group", "How your city's waste is processed"],
  "Economics": ["Where your electricity actually comes from", "A local cooperative or credit union", "The idea of a repair economy", "What a supply chain for one everyday item looks like"]
};

MONK.craft = {
  "Cooking": ["Bake bread", "Make yogurt", "Make ghee", "Cook dal", "Pickle vegetables", "Ferment something", "Make stock from scraps", "Preserve something in season"],
  "Gardening": ["Plant herbs", "Harvest seeds", "Compost", "Prune something", "Repot a plant", "Start a cutting", "Build a small planter box"],
  "Repair": ["Visible mending", "Patch clothes", "Sharpen knives", "Oil leather", "Re-glue a chair", "Reattach a button properly", "Fix a wobbly table leg", "Re-sole or re-heel a shoe"],
  "Woodworking": ["Carve a spoon", "Make a shelf", "Sand something smooth", "Whittle a small object", "Build a small box", "Cut and sand a cutting board"],
  "Printing": ["Risograph a print", "Linocut", "Letterpress a card", "Stamp carving", "Print a small zine"],
  "Drawing": ["Field sketch", "Bird sketch", "Map making", "Still life", "Sketch a stranger's hands", "Draw your street from memory"],
  "Writing": ["Journal", "Essay", "Poem", "Field notes", "A letter to a friend", "A thank-you note you actually send", "A short profile of someone you know"],
  "Coding": ["Build a tiny website", "Refactor code", "Make an accessibility improvement", "Write a small script", "Automate one tedious task"],
  "Textiles": ["Hand-sew a small pouch", "Mend a sock", "Learn a new stitch", "Dye something with a plant"],
  "Community": ["Fix something for a neighbor", "Teach someone a skill you have", "Cook a meal to share", "Start a small tool-sharing list with neighbors"]
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
  "Fix something for a neighbor.",
  "Pick up litter on a street that isn't yours.",
  "Return a shopping cart, even if it isn't yours to return.",
  "Report a broken streetlight or pothole.",
  "Leave a public bathroom better than you found it.",
  "Give directions patiently to someone lost.",
  "Water a tree that looks thirsty.",
  "Offer your seat before anyone asks.",
  "Carry something heavy for someone struggling with it.",
  "Leave a good review for a small local business.",
  "Learn where your recycling actually goes, and sort it properly."
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
  "Call an old friend.",
  "Watch the sunrise on purpose.",
  "Eat something in season.",
  "Take the long way home.",
  "Learn one new word and use it today.",
  "Sit somewhere you can watch people go by.",
  "Play a song you haven't heard in years.",
  "Write down a small good thing that happened today."
];

/* ---------- personal life: plants, sourdough, watchlist ---------- */

MONK.plantStages = ["Seed", "Seedling", "Sprout", "Fruiting", "Harvestable"];

// Each recipe carries enough to fill a popup on its own — no
// outside lookup needed. Ingredients are written against roughly
// 1 cup (~227g) of discard or an active starter, and scale by eye.
MONK.sourdoughDiscardRecipes = [
  { title: "Discard crackers", ingredients: ["1 cup discard", "4 tbsp melted butter", "1/2 tsp salt", "Flaky salt, to finish"], steps: ["Mix discard, butter, and salt into a stiff dough.", "Roll thin between two sheets of parchment.", "Score into squares, dock with a fork, top with flaky salt.", "Bake at 350\u00b0F / 175\u00b0C for 15\u201320 min until golden and crisp."] },
  { title: "Discard pancakes", ingredients: ["1 cup discard", "1 egg", "2 tbsp milk", "1 tbsp sugar", "1/2 tsp baking soda", "Pinch of salt"], steps: ["Whisk discard, egg, milk, and sugar together.", "Fold in baking soda and salt right before cooking \u2014 it'll bubble.", "Cook on a hot buttered griddle until bubbles form, then flip.", "Serve warm."] },
  { title: "Discard waffles", ingredients: ["1 cup discard", "1 egg", "2 tbsp melted butter", "1 tbsp sugar", "1/2 tsp baking soda", "Pinch of salt"], steps: ["Whisk discard, egg, butter, and sugar together.", "Fold in baking soda and salt just before cooking.", "Pour onto a hot, greased waffle iron.", "Cook until golden and crisp, then serve."] },
  { title: "Discard flatbread", ingredients: ["1 cup discard", "1/2 cup flour", "2 tbsp olive oil", "1/2 tsp salt", "Water, as needed"], steps: ["Combine discard, flour, oil, and salt into a soft dough.", "Rest 20 minutes, then divide and roll thin.", "Cook each piece in a hot dry skillet, 1\u20132 min per side, until charred spots appear.", "Brush with oil or ghee and serve warm."] },
  { title: "Discard pizza crust", ingredients: ["1 cup discard", "1/2 cup flour", "1 tbsp olive oil", "1/2 tsp salt", "1/4 tsp baking powder"], steps: ["Mix everything into a shaggy dough and knead briefly.", "Rest 15 minutes, then press or roll onto a baking sheet.", "Par-bake at 425\u00b0F / 220\u00b0C for 8 min.", "Add toppings and bake 8\u201310 min more until done."] },
  { title: "Discard banana bread", ingredients: ["1 cup discard", "2 ripe bananas, mashed", "1/3 cup oil", "1/2 cup sugar", "1 egg", "1 1/2 cups flour", "1 tsp baking soda", "Pinch of salt"], steps: ["Mix wet ingredients and mashed banana together.", "Fold in flour, baking soda, and salt \u2014 don't overmix.", "Pour into a greased loaf pan.", "Bake at 350\u00b0F / 175\u00b0C for 50\u201360 min until a skewer comes out clean."] },
  { title: "Discard chocolate cake", ingredients: ["1 cup discard", "1 1/2 cups flour", "1 cup sugar", "1/3 cup cocoa powder", "1/2 cup oil", "1 tsp baking soda", "1 cup water or milk"], steps: ["Whisk dry ingredients together.", "Add discard, oil, and water/milk; whisk until smooth.", "Pour into a greased pan.", "Bake at 350\u00b0F / 175\u00b0C for 30\u201335 min until set."] },
  { title: "Discard tortillas", ingredients: ["1 cup discard", "1/2 cup flour", "1 tbsp oil", "1/2 tsp salt"], steps: ["Mix into a smooth, soft dough; knead 2\u20133 min.", "Rest 20 min, then divide into balls and roll thin.", "Cook each in a dry hot skillet, ~1 min per side, until lightly spotted.", "Stack under a towel to stay soft."] },
  { title: "Discard biscuits", ingredients: ["1 cup discard", "1 1/2 cups flour", "1 tbsp baking powder", "1/2 tsp salt", "6 tbsp cold butter, cubed", "1/4 cup cold milk"], steps: ["Cut cold butter into flour, baking powder, and salt until crumbly.", "Fold in discard and milk just until combined.", "Pat out 1 inch thick and cut rounds.", "Bake at 425\u00b0F / 220\u00b0C for 12\u201315 min until golden."] },
  { title: "Discard pretzels", ingredients: ["1 cup discard", "2 cups flour", "1 tbsp butter, melted", "1 tsp salt", "Baking soda water bath", "Coarse salt, to finish"], steps: ["Knead discard, flour, butter, and salt into a dough.", "Rest 30 min, then shape into ropes and pretzel knots.", "Dip briefly in a baking soda water bath, then top with coarse salt.", "Bake at 425\u00b0F / 220\u00b0C for 12\u201315 min until deep golden."] },
  { title: "Discard muffins", ingredients: ["1 cup discard", "1 1/2 cups flour", "1/2 cup sugar", "1/3 cup oil", "1 egg", "1 tsp baking powder", "1/2 tsp baking soda", "Mix-ins, optional (berries, nuts)"], steps: ["Whisk wet ingredients together.", "Fold in dry ingredients and any mix-ins just until combined.", "Divide into a lined muffin tin.", "Bake at 375\u00b0F / 190\u00b0C for 18\u201322 min until springy."] },
  { title: "Discard naan", ingredients: ["1 cup discard", "1 cup flour", "2 tbsp yogurt", "1 tbsp oil", "1/2 tsp salt", "1/2 tsp baking powder"], steps: ["Combine into a soft, slightly sticky dough.", "Rest 30 min, then divide and stretch each piece into an oval.", "Cook in a hot dry skillet until bubbled and charred in spots, flipping once.", "Brush with melted butter or ghee."] },
  { title: "Discard crepes", ingredients: ["1 cup discard", "2 eggs", "1/2 cup milk", "1 tbsp melted butter", "Pinch of salt"], steps: ["Whisk everything into a thin, pourable batter.", "Rest batter 10 minutes.", "Pour a thin layer into a hot, buttered pan; swirl to coat.", "Cook ~1 min per side until lacy and set."] },
  { title: "Discard breadsticks", ingredients: ["1 cup discard", "1 1/2 cups flour", "1 tbsp olive oil", "1 tsp salt", "1/2 tsp sugar"], steps: ["Mix into a smooth dough and knead 3\u20134 min.", "Rest 20 min, then divide and roll into ropes.", "Brush with olive oil and top with salt or herbs.", "Bake at 400\u00b0F / 200\u00b0C for 12\u201315 min until golden."] }
];

// Recipes built on active, fed starter rather than discard — these
// need real rise time, called out in the steps.
MONK.sourdoughRecipes = [
  { title: "Classic country loaf", ingredients: ["100g active starter", "375g water", "500g bread flour", "10g salt"], steps: ["Mix starter, water, and flour; rest 30 min (autolyse).", "Add salt, then stretch-and-fold every 30 min for 2\u20133 hours.", "Shape and proof, covered, until puffy \u2014 room temp 2\u20134 hrs or overnight in the fridge.", "Bake covered in a hot Dutch oven at 475\u00b0F / 245\u00b0C for 20 min, then uncovered 20\u201325 min more."] },
  { title: "Whole wheat sandwich loaf", ingredients: ["100g active starter", "300g whole wheat flour", "200g bread flour", "320g water", "10g salt", "20g honey", "20g oil"], steps: ["Mix everything into a shaggy dough; knead until smooth.", "Bulk ferment 4\u20136 hours, folding occasionally.", "Shape into a loaf and proof in a greased pan until domed above the rim.", "Bake at 375\u00b0F / 190\u00b0C for 35\u201340 min until it sounds hollow when tapped."] },
  { title: "Focaccia", ingredients: ["150g active starter", "450g water", "500g bread flour", "10g salt", "Olive oil, generous", "Flaky salt and herbs, to finish"], steps: ["Mix starter, water, and flour; rest 30 min, then add salt.", "Fold every 30 min for 2\u20133 hours in an oiled bowl.", "Pour into a well-oiled pan, dimple all over with oiled fingers, proof 1\u20132 hrs.", "Top with salt and herbs; bake at 450\u00b0F / 230\u00b0C for 20\u201325 min until deep golden."] },
  { title: "Sourdough pizza dough", ingredients: ["100g active starter", "325g water", "500g bread flour", "10g salt", "10g olive oil"], steps: ["Mix into a shaggy dough, then knead until smooth.", "Bulk ferment 4\u20136 hours (or overnight, cold).", "Divide into balls and rest 30 min before shaping.", "Stretch thin, top, and bake as hot as your oven goes until the crust blisters."] },
  { title: "Cinnamon rolls", ingredients: ["100g active starter", "250g milk", "450g flour", "50g sugar", "1 egg", "60g butter, soft", "Filling: brown sugar, cinnamon, butter", "Icing: powdered sugar, milk"], steps: ["Mix starter, milk, flour, sugar, egg, and butter into a soft dough; knead until smooth.", "Bulk ferment 4\u20136 hours until puffy.", "Roll out, spread with filling, roll up, and slice.", "Proof 1\u20132 hrs, bake at 375\u00b0F / 190\u00b0C for 25\u201330 min, then ice while warm."] },
  { title: "Baguettes", ingredients: ["100g active starter", "350g water", "500g bread flour", "10g salt"], steps: ["Mix starter, water, and flour; rest 30 min, then add salt.", "Bulk ferment 3\u20134 hours with folds every 30\u201345 min.", "Divide into 3, shape into batons, proof seam-down on a floured cloth 45\u201360 min.", "Score and bake with steam at 475\u00b0F / 245\u00b0C for 20\u201325 min until deep golden."] },
  { title: "English muffins", ingredients: ["100g active starter", "250g milk", "300g flour", "1 tbsp sugar", "1/2 tsp salt", "Cornmeal, for dusting"], steps: ["Mix into a soft, sticky dough.", "Bulk ferment 3\u20134 hours until puffy.", "Pat out 1/2 inch thick on cornmeal, cut rounds, proof 30\u201345 min.", "Cook slowly on a dry griddle, ~7 min per side, until golden and cooked through."] },
  { title: "Sourdough bagels", ingredients: ["100g active starter", "300g water", "500g bread flour", "10g salt", "20g sugar or malt syrup", "Boiling water with baking soda, for the bath"], steps: ["Mix into a very stiff dough; knead well.", "Bulk ferment 3\u20134 hours, then shape into rings.", "Cold-proof overnight in the fridge for flavor.", "Boil each bagel 30\u201360 sec per side, top, then bake at 425\u00b0F / 220\u00b0C for 20\u201325 min."] },
  { title: "Dinner rolls", ingredients: ["100g active starter", "200g milk", "350g flour", "40g sugar", "1 egg", "50g butter, soft", "1/2 tsp salt"], steps: ["Mix into a soft dough; knead until smooth and elastic.", "Bulk ferment 4\u20136 hours until doubled.", "Divide into rolls, place in a greased pan, proof 1\u20132 hrs.", "Brush with butter and bake at 375\u00b0F / 190\u00b0C for 18\u201322 min."] },
  { title: "Rye loaf", ingredients: ["100g active starter", "300g water", "300g rye flour", "200g bread flour", "10g salt", "1 tbsp caraway seeds, optional"], steps: ["Mix everything into a dense, tacky dough \u2014 it won't feel like white bread.", "Bulk ferment 3\u20134 hours; rye rises less dramatically than wheat.", "Shape into a boule or batard, proof 1\u20132 hrs.", "Bake covered at 450\u00b0F / 230\u00b0C for 20 min, then uncovered 25\u201330 min more."] },
  { title: "Sourdough donuts", ingredients: ["100g active starter", "200g milk", "350g flour", "50g sugar", "1 egg", "40g butter, soft", "1/2 tsp salt", "Oil, for frying", "Sugar or glaze, to finish"], steps: ["Mix into a soft, enriched dough; knead until smooth.", "Bulk ferment 4\u20136 hours until puffy.", "Roll and cut into rings, proof 45\u201360 min.", "Fry at 350\u00b0F / 175\u00b0C until golden, then toss in sugar or dip in glaze."] },
  { title: "Soft sourdough buns", ingredients: ["100g active starter", "220g milk", "400g flour", "40g sugar", "1 egg", "40g butter, soft", "1/2 tsp salt"], steps: ["Mix into a soft dough; knead until smooth and elastic.", "Bulk ferment 4\u20136 hours until doubled.", "Divide, shape into buns, proof 1\u20132 hrs until pillowy.", "Bake at 375\u00b0F / 190\u00b0C for 15\u201318 min until golden."] },
  { title: "Herb and cheese loaf", ingredients: ["100g active starter", "350g water", "500g bread flour", "10g salt", "1 cup shredded cheese", "2 tbsp chopped fresh herbs"], steps: ["Mix starter, water, and flour; rest 30 min, then add salt.", "Fold in cheese and herbs during the first stretch-and-fold.", "Bulk ferment 3\u20134 hours with regular folds.", "Shape, proof, and bake covered at 475\u00b0F / 245\u00b0C for 20 min, then uncovered 20\u201325 min more."] },
  { title: "Sourdough breadsticks", ingredients: ["100g active starter", "300g water", "500g bread flour", "10g salt", "Olive oil and coarse salt, to finish"], steps: ["Mix into a smooth dough; knead until elastic.", "Bulk ferment 3\u20134 hours.", "Divide and roll into ropes, brush with oil, top with salt.", "Bake at 425\u00b0F / 220\u00b0C for 12\u201315 min until golden and crisp."] }
];

/* ---------- wishlist: mull-over-it purchase list ---------- */

// How much a day counts toward "earning" a purchase, by default.
// Editable in the Wishlist chapter itself; kept here only as the
// starting value.
MONK.wishlistDefaultDailyRate = 10;

// The mull-over checklist — kept short and concrete on purpose.
// A "no" here doesn't block the purchase, it's just something to
// have actually looked at before buying.
MONK.wishlistChecks = [
  { id: "purpose", label: "Fulfills a real purpose" },
  { id: "aesthetic", label: "Matches my aesthetic" },
  { id: "notPlastic", label: "Not plastic" }
];

// A starter list so Watchlist isn't empty on first open — the user's
// own additions are what actually matter and persist to Back4App.
MONK.watchlistStarter = [
  { title: "My Octopus Teacher", note: "Patience and attention, on film." },
  { title: "The Biggest Little Farm", note: "Regenerative farming, start to finish." },
  { title: "Kings of Pastry", note: "Craft taken to an extreme." },
  { title: "Jiro Dreams of Sushi", note: "A whole life given to one craft." },
  { title: "Minimalism: A Documentary About the Important Things", note: "" }
];

