// Sorting products into categories, spotting brands, and forgiving search.
// Runs in the browser over every product from every sheet of a shop.

// Lowercase, no accents, punctuation turned into spaces: "Air-Force 1’s" -> "air force 1 s"
export const norm = (s) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();

// ---- categories --------------------------------------------------------
// Checked in this order; the first rule that matches wins. Clothing words come
// before shoe model names so "Jordan hoodie" is a hoodie and "Jordan 4" a shoe.
const RULES = [
  ["jerseys", /\b(jerseys?|kits?|football shirts?|soccer|nba|retro shirts?|maillot)\b/],
  ["perfume", /\b(perfumes?|parfums?|colognes?|fragrances?|eau de|edp|edt|colonia|perfume|\d+ ?ml)\b/],
  // sneaker models whose names would read as jewellery, cups, a team or jeans
  ["shoes", /\b(chain reaction|prada cups?|america s cup|mexico 66|onitsuka|screener|gel kayano|gel nyc|gel 1130)\b/],
  ["accessories", /\b(phone ?cases?|iphone cases?|airpods? cases?|cases? for)\b/],
  ["electronics", /\b(air ?pods?( pro| max)?|earbuds?|headphones?|headsets?|speakers?|iphone|smartphone|chargers?|power ?bank|apple watch|smart ?watch|jbl|beats|dyson|consoles?|ps5|nintendo|cameras?|keyboards?|tablets?|ipad|macbook|laptops?|gopro|electronics?|projector)\b/],
  ["jewelry", /\b(brooch(es)?|watch|watches|wrist ?watch(es)?|rolex|omega|cartier|audemars|patek|necklaces?|bracelets?|rings?|earrings?|pendants?|chains?|jewel\w*|van cleef|vca|tiffany)\b/],
  ["bags", /\b(hobo|bags?|backpacks?|totes?|purses?|handbags?|duffel|duffle|crossbody|messenger|luggage|suitcases?|pouch|clutch|bolsos?|mochilas?|fanny ?packs?|waist ?bags?|sacoche|keepall|neverfull)\b/],
  ["hats", /\b(hats?|caps?|beanies?|bucket|balaclavas?|visors?|gorras?|snapbacks?|trucker)\b/],
  ["accessories", /\b(key ?charms?|bag ?charms?|charms?|belts?|wallets?|card ?holders?|sunglasses|glasses|eyewear|scarf|scarves|gloves?|socks?|ties?|keychains?|key ?chains?|lanyards?|umbrellas?|underwear|boxers?|briefs|bras?|headbands?|towels?|masks?|cinturon\w*|gafas|calcetines|accessor\w*)\b/],
  ["home", /\b(lego|legos|figures?|figurines?|posters?|stickers?|lamps?|rugs?|carpets?|blankets?|pillows?|cushions?|decor|room|mugs?|(?<!world )cups?|bottles?|candles?|plush|toys?|bearbrick|kaws)\b/],
  ["sets", /\b(tracksuits?|track ?suits?|sets?|suits?|co ord|two piece|2 piece|conjuntos?|chandal|ensemble)\b/],
  ["hoodies", /\b(hoodies?|hoody|hooded|sweatshirts?|crewnecks?|crew neck|zip ?ups?|pullovers?|sudaderas?|half ?zip|quarter ?zip)\b/],
  ["jackets", /\b(jackets?|coats?|puffers?|down jacket|parkas?|windbreakers?|(?:puffer|down|padded|quilted|fleece|bubble) vests?|gilets?|bombers?|varsity|blazers?|anoraks?|chaquetas?|abrigos?|plumifero|doudoune|veste|jacke)\b/],
  ["sweaters", /\b(sweaters?|knit\w*|cardigans?|jumpers?|jersei)\b/],
  ["tshirts", /\b(t ?shirts?|tees?|camisetas?|long ?sleeve[sd]?|short ?sleeve[sd]?|tank ?tops?|tanks?|singlets?|vests?|sleeveless)\b/],
  ["shirts", /\b(shirts?|polos?|button ?(up|down)|flannels?|camisas?|overshirts?)\b/],
  ["shorts", /\b(shorts?|bermudas?|swim ?trunks?|trunks)\b/],
  ["pants", /\b(pants|jeans|trousers|joggers?|sweatpants|cargos?|track ?pants|denim|chinos|leggings|pantalon\w*|vaqueros|sweats)\b/],
  ["shoes", /\b(shoes?|sneakers?|trainers?|boots?|slides?|slippers?|sandals?|loafers?|mules?|clogs?|footwear|zapatillas|zapatos|cleats|chaussures)\b/],
  ["shoes", /\b(jordan ?\d+|aj ?\d+|retro ?\d+|dunks?|yeezy|yeezys|air ?force|af1|air ?max|airmax|vapormax|tn|max plus|new balance|nb ?\d+|550|9060|2002r|990|530|327|574|1906r|asics|gel|salomon|xt ?6|onitsuka|samba|gazelle|campus|spezial|superstar|stan smith|ozweego|converse|chuck|vans|old skool|crocs|ugg|uggs|birkenstock|timberland|dr martens|triple s|b22|b23|b27|b30|skel|golden goose|cloudswift|cloudmonster|hoka|air ?zoom|alphafly|vomero|travis scott|cactus jack)\b/],
];

export const CATEGORY_ORDER = [
  "shoes", "tshirts", "hoodies", "jackets", "pants", "shorts", "sweaters", "shirts", "sets",
  "jerseys", "bags", "hats", "accessories", "jewelry", "perfume", "electronics", "home", "other",
];

// ---- football ------------------------------------------------------------
// Team shirts rarely say "jersey": they read "2026 FIFA World Cup Argentina home
// Fan version" or "25/26 season Real Madrid away". A football marker, or a team
// with home / away / retro / a season, makes it a jersey, unless the name says
// it's another garment (team shorts, jackets and hoodies keep their category)
// or a souvenir.
const FOOTBALL = /\b(fan version|fans? edition|player version|player edition|thai version|world cup|fifa|goalkeeper|football shirts?|soccer|maillot|retro shirts?|jerseys?|kits?)\b/;
const TEAMS = /\b(real madrid|barcelona|barca|atletico|sevilla|betis|valencia|athletic|villarreal|milan|inter|juventus|napoli|roma|lazio|psg|paris saint germain|marseille|lyon|bayern|dortmund|leverkusen|arsenal|chelsea|liverpool|manchester|man utd|man city|tottenham|newcastle|aston villa|ajax|psv|feyenoord|benfica|porto|sporting|celtic|rangers|galatasaray|fenerbahce|boca|river plate|flamengo|santos|palmeiras|corinthians|al nassr|al hilal|al ittihad|inter miami|la galaxy|argentina|brazil|brasil|france|french|germany|german|spain|spanish|espana|italy|italian|portugal|portuguese|england|english|mexico|mexican|japan|japanese|korea|morocco|netherlands|holland|dutch|croatia|belgium|colombia|colombian|uruguay|chile|peru|ecuador|usa|canada|nigeria|senegal|ghana|cameroon|scotland|wales|ireland|norway|sweden|denmark|switzerland|austria|poland|turkey|national team)\b/;
const TEAM_KIT = /\b(home|away|third|retro|vintage|anniversary|commemorative|special edition|training|season|\d{4}|\d{2} ?\d{2})\b/;
const NOT_SHIRT = /\b(onitsuka|sneakers?|shoes?|trainers?|shorts|jackets?|windbreakers?|coats?|trench|parkas?|hoodies?|hooded|sweatshirts?|socks?|scarf|scarves|caps?|hats?|beanies?|stickers?|posters?|balls?|boots?|cleats|bags?|backpacks?|keychains?|figures?)\b/;
const isFootballShirt = (t) => !NOT_SHIRT.test(t) && (FOOTBALL.test(t) || (TEAMS.test(t) && TEAM_KIT.test(t)));

function ruleFor(text) {
  const t = " " + norm(text) + " ";
  if (isFootballShirt(t)) return "jerseys";
  for (const [cat, re] of RULES) if (re.test(t)) return cat;
  return null;
}

// The product's own name decides first; its section and tab names
// ("Shoes 👟", "HOODIES") only when the name says nothing.
export function categorize(p, tabName = "") {
  return ruleFor(p.name) || ruleFor(p.section) || ruleFor(tabName) || "other";
}

// ---- brands -------------------------------------------------------------
const BRANDS = [
  ["Nike", "nike|nocta|nike sb"], ["Jordan", "jordan|air jordan|aj ?\\d+"], ["Adidas", "adidas"],
  ["Yeezy", "yeezy|yeezys"], ["New Balance", "new balance|nb ?\\d{3,4}"], ["Asics", "asics|onitsuka"],
  ["Puma", "puma"], ["Converse", "converse"], ["Vans", "vans"], ["Salomon", "salomon"],
  ["On", "on running|on cloud\\w*|cloudswift|cloudmonster"], ["Hoka", "hoka"], ["The North Face", "the north face|north face|tnf"],
  ["Stüssy", "stussy"], ["Supreme", "supreme"], ["Bape", "bape|a bathing ape"], ["Palace", "palace"],
  ["Corteiz", "corteiz|crtz"], ["Trapstar", "trapstar"], ["Essentials", "essentials|fear of god|fog"],
  ["Gallery Dept", "gallery dept\\w*"], ["Chrome Hearts", "chrome hearts"], ["Amiri", "amiri"], ["Rhude", "rhude"],
  ["Represent", "represent"], ["Off-White", "off ?white"], ["Palm Angels", "palm angels"], ["Stone Island", "stone island"],
  ["C.P. Company", "cp company|c p company"], ["Moncler", "moncler"], ["Canada Goose", "canada goose"],
  ["Arc'teryx", "arc ?teryx|arcteryx"], ["Ralph Lauren", "ralph lauren|polo ralph|rl"], ["Lacoste", "lacoste"],
  ["Tommy Hilfiger", "tommy hilfiger|tommy"], ["Calvin Klein", "calvin klein|ck"], ["Hugo Boss", "hugo boss|boss"],
  ["Burberry", "burberry"], ["Gucci", "gucci"], ["Louis Vuitton", "louis vuitton|lv"], ["Dior", "dior"],
  ["Prada", "prada"], ["Miu Miu", "miu ?miu"], ["Balenciaga", "balenciaga"], ["Versace", "versace"],
  ["Fendi", "fendi"], ["Givenchy", "givenchy"], ["Saint Laurent", "saint laurent|ysl"], ["Celine", "celine"],
  ["Loewe", "loewe"], ["Bottega Veneta", "bottega\\w*"], ["Valentino", "valentino"], ["Alexander McQueen", "alexander mcqueen|mcqueen"],
  ["Rick Owens", "rick owens"], ["Maison Margiela", "margiela|mm6"], ["Golden Goose", "golden goose|ggdb"],
  ["Acne Studios", "acne studios?|acne"], ["Ami", "ami paris|ami"], ["Casablanca", "casablanca"], ["Jacquemus", "jacquemus"],
  ["Kenzo", "kenzo"], ["Hermès", "hermes"], ["Chanel", "chanel"], ["Cartier", "cartier"], ["Rolex", "rolex"],
  ["Omega", "omega"], ["Audemars Piguet", "audemars piguet|audemars|ap"], ["Patek Philippe", "patek\\w*"],
  ["Van Cleef", "van cleef\\w*|vca"], ["Tiffany", "tiffany"], ["Apple", "apple|airpods?"], ["Beats", "beats"],
  ["Sony", "sony"], ["Dyson", "dyson"], ["Lego", "lego|legos"], ["Ugg", "ugg|uggs"], ["Birkenstock", "birkenstock"],
  ["Crocs", "crocs"], ["Timberland", "timberland"], ["Carhartt", "carhartt"], ["Dickies", "dickies"], ["Vlone", "vlone"],
  ["Sp5der", "sp5der|spider"], ["Hellstar", "hellstar"], ["Broken Planet", "broken planet"], ["Denim Tears", "denim tears"],
  ["Eric Emanuel", "eric emanuel|ee"], ["Syna World", "syna world|syna"], ["Aimé Leon Dore", "aime leon dore|ald"],
  ["Kith", "kith"], ["Travis Scott", "travis scott|cactus jack"], ["Patagonia", "patagonia"], ["Oakley", "oakley"],
  ["Byredo", "byredo"], ["Creed", "creed"], ["Tom Ford", "tom ford"], ["Le Labo", "le labo"], ["Jo Malone", "jo malone"],
  ["Polene", "polene"], ["Goyard", "goyard"], ["Bvlgari", "bvlgari|bulgari"], ["Swarovski", "swarovski"],
].map(([name, re]) => [name, new RegExp(`(?:^| )(?:${re})(?= |$)`)]);

// Model names that only one brand makes.
const MODELS = [
  ["Nike", /(?:^| )(?:air ?force|af1|air ?max|airmax|dunks?|vapormax|tn|max plus|cortez|blazer mid|pegasus|tech fleece)(?= |$)/],
  ["Adidas", /(?:^| )(?:samba|gazelle|campus|spezial|superstar|stan smith|ozweego|forum low)(?= |$)/],
];

export function brandOf(name) {
  const t = norm(name);
  for (const [brand, re] of MODELS) if (re.test(t)) {
    const own = BRANDS.find(([b]) => b === brand)[1];
    if (!own.test(t) && !/(?:^| )jordan(?= |$)/.test(t)) return brand;
  }
  let best = null, at = Infinity;
  for (const [brand, re] of BRANDS) {
    const m = re.exec(t);
    if (m && m.index < at) { best = brand; at = m.index; }
  }
  return best;
}

// ---- search -------------------------------------------------------------
// Short forms people type, spelled out the way product names spell them.
const ALIASES = {
  af1: "airforce1", aj: "jordan", tee: "tshirt", tees: "tshirt", tshirts: "tshirt", hoody: "hoodie",
  nb: "newbalance", lv: "louisvuitton", tnf: "thenorthface", ysl: "saintlaurent", cdg: "commedesgarcons",
  fog: "fearofgod", sneaker: "shoe", sneakers: "shoe", trainers: "shoe", kicks: "shoe", jeans: "jean",
  zapatillas: "shoe", sudadera: "hoodie", camiseta: "tshirt", chaqueta: "jacket", pantalon: "pant",
};

export function indexText(p, extra = "") {
  const base = norm(`${p.name} ${p.brand || ""} ${p.section || ""} ${extra}`).split(" ").filter(Boolean);
  const words = [...base, ...base.filter((w) => ALIASES[w]).map((w) => ALIASES[w])];
  const text = words.join(" ");
  return { text, words, compact: words.join("") };
}

// Edit distance where swapping two neighbouring letters counts as one mistake.
function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

// Turns what the visitor typed into a matcher: spaces don't matter ("air
// force" = "airforce"), plurals and short forms are understood, and a typo or
// two in longer words is forgiven ("jordna" finds "jordan").
export function makeQuery(q) {
  const tokens = norm(q).split(" ").filter(Boolean);
  if (!tokens.length) return null;
  const whole = tokens.join("");
  const forms = tokens.map((t) => {
    const f = new Set([t]);
    if (ALIASES[t]) f.add(ALIASES[t]);
    if (t.length > 3 && t.endsWith("s")) f.add(t.slice(0, -1));
    if (t.length > 4 && t.endsWith("es")) f.add(t.slice(0, -2));
    return [...f];
  });
  return function score(ix) {
    if (ix.compact.includes(whole)) return 100 - Math.min(50, ix.compact.indexOf(whole));
    let total = 0;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      let s = 0;
      if (/^\d+$/.test(t)) {
        // a lone number must be a word of its own or stick to the word before ("jordan 4")
        if (ix.words.includes(t) || (i && forms[i - 1].some((f) => ix.compact.includes(f + t)))) s = 10;
      } else if (forms[i].some((f) => ix.compact.includes(f))) {
        s = ix.words.some((w) => forms[i].includes(w)) ? 10 : 7;
      } else if (t.length >= 4) {
        const max = t.length >= 7 ? 2 : 1;
        if (ix.words.some((w) => w.length >= 3 && lev(t, w, max) <= max)) s = 4;
        else if (t.length >= 5 && ix.words.some((w, j) => j < ix.words.length - 1 && lev(t, w + ix.words[j + 1], max) <= max)) s = 4;
      }
      if (!s) return 0;
      total += s;
    }
    return total;
  };
}
