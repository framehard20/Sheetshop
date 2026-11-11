// Shop page texts in the same seven languages as flayfind.
// {name} is filled in; **text** is shown bold.

export const LANGS = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", zh: "中文",
};

const T = {
  en: {
    popTitle: "Most popular", popSub: "What shoppers here tap Buy on most, plus everyday budget picks.", popSubAll: "Ranked by what shoppers here tap Buy on most.",
    disclosure: "{shop} doesn't sell anything: it links to {agent} and its sellers, who have their own terms and their own privacy policy. Links to {agent} carry our referral code, which gives you the discount when you sign up and may earn us a reward for recommending it.",
    mastSub: "The product list",
    search: "Search products", all: "All", saved: "Saved", products: "{n} products", product: "1 product",
    loading: "Loading…", stillLoading: "still loading", nothing: "Nothing matches “{q}”.",
    nothingTip: "Try fewer words or another spelling.", empty: "Nothing here yet.",
    sort: "Sort", sortFeatured: "Featured", sortLow: "Price: low to high", sortHigh: "Price: high to low", sortName: "Name: A–Z",
    brand: "Brand", allBrands: "All brands", shopBy: "Shop by category", allProducts: "All products", items: "{n} items",
    photos: "See {n} photos", save: "Save", unsave: "Remove from saved",
    codeBar: "New to {agent}? Sign up with code **{code}**.",
    footer: "Buy links go to {agent}. Prices come from the sheet and may have changed; shipping is not included.",
    settings: "Settings", language: "Language", currency: "Currency", appearance: "Appearance",
    introTitle: "Choose your language and currency", introText: "Prices will be shown in the currency you pick. You can change this later with 🌐.", accept: "Accept",
    light: "Light", dark: "Dark", auto: "Auto", share: "Share", copied: "Link copied", close: "Close",
    fromSheets: "{n} products · updated live",
    updatedAt: "{n} products · updated {date}", updatedMonthly: "{n} products · updated monthly", refreshed: "The list has just been updated",
    trustLabel: "With your {agent} account",
    trust1: "Quality check on every item", trust2: "All your buys in one parcel", trust3: "After-sales service", trust4: "Worldwide shipping",
    pmBuy: "Buy on {agent}", pmCta: "Sign up free", pmFine: "Free account · my invite code is already filled in", prev: "Previous photo", next: "Next photo", priceLbl: "Price",
    welKicker: "Welcome gift", welAmount: "$800", welLine: "FREE in coupons **+ 40% off shipping**",
    welText: "Create your free {agent} account",
    welCta: "Claim my $800", welLater: "Maybe later",
    regTag: "Free sign-up", regTitle: "Create your {agent} account", regCta: "Sign up free",
    regOffer: "With my link: **$800 FREE in coupons** + a **40% off shipping** coupon",
    regWhat: "The agent for buying from the Chinese market: you choose, they buy, check and ship.", regFine: "Opens {host} · my code is already filled in",
    help: "How it works", tourStep: "Step {n} of {m}", tour1t: "Find your product",
    tour1d: "Type a brand or a model in the search box at the top, or pick a category.", tour2t: "Sign up free on {agent}",
    tour2d: "It’s the agent that buys for you in China. With my link: **$800 FREE in coupons** + a **40% off shipping** coupon.", tour3t: "Buy in one tap",
    tour3d: "Open a product and tap Buy: {agent} buys it, checks it and ships it to you.", tour3dAny: "Open a product and tap Buy: it opens on {agent}.",
    tourNext: "Next", tourSkip: "Skip", tourDone: "Got it", stickyT: "Sign up free", stickyS: "$800 in coupons + 40% off shipping", navReg: "Free sign-up",
    seeAll: "See all products", seeInAll: "Search in every category ({n})",
    pmWhy: "{agent} buys it for you, checks it and ships it. You need a free account to order.", pmAgain: "No account yet? **Sign up free**",
    cats: {
      shoes: "Shoes", tshirts: "T-shirts", hoodies: "Hoodies", jackets: "Jackets & Coats", pants: "Pants & Jeans",
      shorts: "Shorts", sweaters: "Knitwear", shirts: "Shirts & Polos", sets: "Tracksuits & Sets", jerseys: "Jerseys",
      bags: "Bags", hats: "Hats & Caps", accessories: "Accessories", jewelry: "Watches & Jewelry", perfume: "Fragrances",
      electronics: "Electronics", home: "Home & Toys", other: "More",
    },
  },
  es: {
    popTitle: "Lo más popular", popSub: "Lo que más compra la gente aquí, más básicos baratos del día a día.", popSubAll: "Ordenado por lo que más compra la gente aquí.",
    disclosure: "{shop} no vende nada: enlaza a {agent} y a sus vendedores, que tienen sus propias condiciones y su propia política de privacidad. Los enlaces a {agent} llevan nuestro código de referido, que a ti te da el descuento al registrarte y a nosotros nos puede reportar un beneficio por recomendarlo.",
    mastSub: "Lista de productos",
    search: "Buscar productos", all: "Todo", saved: "Guardados", products: "{n} productos", product: "1 producto",
    loading: "Cargando…", stillLoading: "aún cargando", nothing: "Nada coincide con «{q}».",
    nothingTip: "Prueba con menos palabras o escríbelo de otra forma.", empty: "Aún no hay nada aquí.",
    sort: "Ordenar", sortFeatured: "Destacados", sortLow: "Precio: de menor a mayor", sortHigh: "Precio: de mayor a menor", sortName: "Nombre: A–Z",
    brand: "Marca", allBrands: "Todas las marcas", shopBy: "Compra por categoría", allProducts: "Todos los productos", items: "{n} artículos",
    photos: "Ver {n} fotos", save: "Guardar", unsave: "Quitar de guardados",
    codeBar: "¿Nuevo en {agent}? Regístrate con el código **{code}**.",
    footer: "Los enlaces de compra van a {agent}. Los precios vienen de la hoja y pueden haber cambiado; el envío no está incluido.",
    settings: "Ajustes", language: "Idioma", currency: "Moneda", appearance: "Apariencia",
    introTitle: "Elige tu idioma y tu moneda", introText: "Los precios se mostrarán en la moneda que elijas. Puedes cambiarlo después con 🌐.", accept: "Aceptar",
    light: "Claro", dark: "Oscuro", auto: "Auto", share: "Compartir", copied: "Enlace copiado", close: "Cerrar",
    fromSheets: "{n} productos · actualizado al momento",
    updatedAt: "{n} productos · actualizado en {date}", updatedMonthly: "{n} productos · se actualiza mensualmente", refreshed: "La lista se acaba de actualizar",
    trustLabel: "Con tu cuenta de {agent}",
    trust1: "Revisión de calidad de cada prenda", trust2: "Todas tus compras en un solo paquete", trust3: "Servicio posventa", trust4: "Envío a todo el mundo",
    pmBuy: "Comprar en {agent}", pmCta: "Registrarme gratis", pmFine: "Cuenta gratis · mi código de invitación ya va puesto", prev: "Foto anterior", next: "Foto siguiente", priceLbl: "Precio",
    welKicker: "Regalo de bienvenida", welAmount: "800 $", welLine: "GRATIS en cupones **+ 40% en el envío**",
    welText: "Crea tu cuenta gratis de {agent}",
    welCta: "Quiero mis 800 $", welLater: "Ahora no",
    regTag: "Registro gratis", regTitle: "Crea tu cuenta en {agent}", regCta: "Registrarme gratis",
    regOffer: "Con mi enlace: **800 $ GRATIS en cupones** + cupón del **40 % en el envío**",
    regWhat: "El agente para comprar en el mercado chino: tú eliges, ellos compran, revisan y envían.", regFine: "Se abre {host} · mi código ya va puesto",
    help: "Cómo funciona", tourStep: "Paso {n} de {m}", tour1t: "Busca tu producto",
    tour1d: "Escribe una marca o un modelo en el buscador de arriba, o elige una categoría.", tour2t: "Regístrate gratis en {agent}",
    tour2d: "Es el agente que compra por ti en China. Con mi enlace: **800 $ GRATIS en cupones** + cupón del **40 % en el envío**.",
    tour3t: "Compra con un toque", tour3d: "Abre un producto y pulsa Comprar: {agent} lo compra, lo revisa y te lo envía.",
    tour3dAny: "Abre un producto y pulsa Comprar: se abre en {agent}.", tourNext: "Siguiente", tourSkip: "Saltar", tourDone: "Entendido",
    stickyT: "Registrarme gratis", stickyS: "800 $ en cupones + 40 % en el envío", navReg: "Registro gratis", seeAll: "Ver todos los productos",
    seeInAll: "Buscar en todas las categorías ({n})",
    pmWhy: "{agent} lo compra por ti, lo revisa y te lo envía. Para pedir necesitas una cuenta gratis.", pmAgain: "¿Aún sin cuenta? **Regístrate gratis**",
    cats: {
      shoes: "Zapatillas", tshirts: "Camisetas", hoodies: "Sudaderas", jackets: "Chaquetas y abrigos", pants: "Pantalones y vaqueros",
      shorts: "Pantalones cortos", sweaters: "Punto", shirts: "Camisas y polos", sets: "Chándals y conjuntos", jerseys: "Camisetas de fútbol",
      bags: "Bolsos", hats: "Gorras y gorros", accessories: "Accesorios", jewelry: "Relojes y joyas", perfume: "Perfumes",
      electronics: "Electrónica", home: "Hogar y juguetes", other: "Más",
    },
  },
  fr: {
    popTitle: "Les plus populaires", popSub: "Ce que les visiteurs achètent le plus ici, plus des basiques pas chers.", popSubAll: "Classé selon ce que les visiteurs achètent le plus ici.",
    disclosure: "{shop} ne vend rien : le site renvoie vers {agent} et ses vendeurs, qui ont leurs propres conditions et leur propre politique de confidentialité. Les liens vers {agent} contiennent notre code de parrainage, qui vous donne la réduction à l’inscription et peut nous rapporter une récompense pour l’avoir recommandé.",
    mastSub: "La liste de produits",
    search: "Rechercher des produits", all: "Tout", saved: "Favoris", products: "{n} produits", product: "1 produit",
    loading: "Chargement…", stillLoading: "chargement en cours", nothing: "Aucun résultat pour « {q} ».",
    nothingTip: "Essayez avec moins de mots ou une autre orthographe.", empty: "Rien ici pour l’instant.",
    sort: "Trier", sortFeatured: "En vedette", sortLow: "Prix croissant", sortHigh: "Prix décroissant", sortName: "Nom : A–Z",
    brand: "Marque", allBrands: "Toutes les marques", shopBy: "Acheter par catégorie", allProducts: "Tous les produits", items: "{n} articles",
    photos: "Voir {n} photos", save: "Enregistrer", unsave: "Retirer des favoris",
    codeBar: "Nouveau sur {agent} ? Inscrivez-vous avec le code **{code}**.",
    footer: "Les liens d’achat mènent à {agent}. Les prix viennent de la feuille et ont pu changer ; livraison non comprise.",
    settings: "Réglages", language: "Langue", currency: "Devise", appearance: "Apparence",
    introTitle: "Choisissez votre langue et votre devise", introText: "Les prix seront affichés dans la devise choisie. Vous pourrez la changer plus tard avec 🌐.", accept: "Accepter",
    light: "Clair", dark: "Sombre", auto: "Auto", share: "Partager", copied: "Lien copié", close: "Fermer",
    fromSheets: "{n} produits · mis à jour en direct",
    updatedAt: "{n} produits · mis à jour en {date}", updatedMonthly: "{n} produits · mis à jour chaque mois", refreshed: "La liste vient d’être mise à jour",
    trustLabel: "Avec votre compte {agent}",
    trust1: "Contrôle qualité de chaque article", trust2: "Tous vos achats dans un seul colis", trust3: "Service après-vente", trust4: "Livraison dans le monde entier",
    pmBuy: "Acheter sur {agent}", pmCta: "M’inscrire gratuitement", pmFine: "Compte gratuit · mon code d’invitation est déjà rempli", prev: "Photo précédente", next: "Photo suivante", priceLbl: "Prix",
    welKicker: "Cadeau de bienvenue", welAmount: "800 $", welLine: "OFFERTS en bons **+ 40 % sur la livraison**",
    welText: "Crée ton compte {agent} gratuit",
    welCta: "Je récupère mes 800 $", welLater: "Plus tard",
    regTag: "Inscription gratuite", regTitle: "Crée ton compte {agent}", regCta: "M’inscrire gratuitement",
    regOffer: "Avec mon lien : **800 $ OFFERTS en bons** + un bon de **40 % sur la livraison**",
    regWhat: "L’agent pour acheter sur le marché chinois : tu choisis, ils achètent, vérifient et expédient.",
    regFine: "Ouvre {host} · mon code est déjà rempli", help: "Comment ça marche", tourStep: "Étape {n} sur {m}", tour1t: "Trouve ton produit",
    tour1d: "Écris une marque ou un modèle dans la recherche en haut, ou choisis une catégorie.", tour2t: "Inscris-toi gratuitement sur {agent}",
    tour2d: "C’est l’agent qui achète pour toi en Chine. Avec mon lien : **800 $ OFFERTS en bons** + un bon de **40 % sur la livraison**.",
    tour3t: "Achète en un geste", tour3d: "Ouvre un produit et touche Acheter : {agent} l’achète, le vérifie et te l’envoie.",
    tour3dAny: "Ouvre un produit et touche Acheter : il s’ouvre sur {agent}.", tourNext: "Suivant", tourSkip: "Passer", tourDone: "Compris",
    stickyT: "M’inscrire gratuitement", stickyS: "800 $ en bons + 40 % sur la livraison", navReg: "Inscription gratuite", seeAll: "Voir tous les produits",
    seeInAll: "Chercher dans toutes les catégories ({n})",
    pmWhy: "{agent} l’achète pour toi, le vérifie et te l’envoie. Il te faut un compte gratuit pour commander.", pmAgain: "Pas encore de compte ? **Inscris-toi gratuitement**",
    cats: {
      shoes: "Chaussures", tshirts: "T-shirts", hoodies: "Sweats à capuche", jackets: "Vestes et manteaux", pants: "Pantalons et jeans",
      shorts: "Shorts", sweaters: "Mailles", shirts: "Chemises et polos", sets: "Survêtements et ensembles", jerseys: "Maillots",
      bags: "Sacs", hats: "Casquettes et bonnets", accessories: "Accessoires", jewelry: "Montres et bijoux", perfume: "Parfums",
      electronics: "Électronique", home: "Maison et jouets", other: "Plus",
    },
  },
  de: {
    popTitle: "Am beliebtesten", popSub: "Was Besucher hier am meisten kaufen, plus günstige Alltags-Basics.", popSubAll: "Sortiert danach, was Besucher hier am meisten kaufen.",
    disclosure: "{shop} verkauft nichts: Die Seite verlinkt auf {agent} und dessen Verkäufer, die eigene Bedingungen und eine eigene Datenschutzerklärung haben. Die Links zu {agent} enthalten unseren Empfehlungscode, der dir bei der Registrierung den Rabatt gibt und uns für die Empfehlung eine Vergütung einbringen kann.",
    mastSub: "Die Produktliste",
    search: "Produkte suchen", all: "Alle", saved: "Gemerkt", products: "{n} Produkte", product: "1 Produkt",
    loading: "Wird geladen…", stillLoading: "lädt noch", nothing: "Keine Treffer für „{q}“.",
    nothingTip: "Versuch es mit weniger Wörtern oder einer anderen Schreibweise.", empty: "Hier ist noch nichts.",
    sort: "Sortieren", sortFeatured: "Empfohlen", sortLow: "Preis: aufsteigend", sortHigh: "Preis: absteigend", sortName: "Name: A–Z",
    brand: "Marke", allBrands: "Alle Marken", shopBy: "Nach Kategorie shoppen", allProducts: "Alle Produkte", items: "{n} Artikel",
    photos: "{n} Fotos ansehen", save: "Merken", unsave: "Nicht mehr merken",
    codeBar: "Neu bei {agent}? Registriere dich mit dem Code **{code}**.",
    footer: "Die Kauflinks führen zu {agent}. Die Preise stammen aus der Tabelle und können sich geändert haben; Versand nicht inbegriffen.",
    settings: "Einstellungen", language: "Sprache", currency: "Währung", appearance: "Darstellung",
    introTitle: "Wähle Sprache und Währung", introText: "Die Preise werden in der gewählten Währung angezeigt. Du kannst das später über 🌐 ändern.", accept: "Übernehmen",
    light: "Hell", dark: "Dunkel", auto: "Auto", share: "Teilen", copied: "Link kopiert", close: "Schließen",
    fromSheets: "{n} Produkte · live aktualisiert",
    updatedAt: "{n} Produkte · aktualisiert im {date}", updatedMonthly: "{n} Produkte · monatlich aktualisiert", refreshed: "Die Liste wurde gerade aktualisiert",
    trustLabel: "Mit deinem {agent}-Konto",
    trust1: "Qualitätskontrolle jedes Artikels", trust2: "Alle Käufe in einem Paket", trust3: "Kundendienst nach dem Kauf", trust4: "Versand weltweit",
    pmBuy: "Bei {agent} kaufen", pmCta: "Kostenlos registrieren", pmFine: "Kostenloses Konto · mein Einladungscode ist schon eingetragen", prev: "Vorheriges Foto", next: "Nächstes Foto", priceLbl: "Preis",
    welKicker: "Willkommensgeschenk", welAmount: "800 $", welLine: "GRATIS in Gutscheinen **+ 40 % auf den Versand**",
    welText: "Erstelle dein kostenloses {agent}-Konto",
    welCta: "800 $ sichern", welLater: "Später",
    regTag: "Kostenlos anmelden", regTitle: "Erstell dein {agent}-Konto", regCta: "Kostenlos registrieren",
    regOffer: "Mit meinem Link: **800 $ GRATIS in Gutscheinen** + ein Gutschein über **40 % auf den Versand**",
    regWhat: "Der Agent für Einkäufe auf dem chinesischen Markt: Du wählst aus, sie kaufen, prüfen und versenden.",
    regFine: "Öffnet {host} · mein Code ist schon eingetragen", help: "So funktioniert’s", tourStep: "Schritt {n} von {m}", tour1t: "Finde dein Produkt",
    tour1d: "Gib oben in der Suche eine Marke oder ein Modell ein oder wähle eine Kategorie.", tour2t: "Registriere dich kostenlos bei {agent}",
    tour2d: "Das ist der Agent, der in China für dich einkauft. Mit meinem Link: **800 $ GRATIS in Gutscheinen** + ein Gutschein über **40 % auf den Versand**.",
    tour3t: "Kaufen mit einem Tipp", tour3d: "Öffne ein Produkt und tippe auf Kaufen: {agent} kauft es, prüft es und schickt es dir.",
    tour3dAny: "Öffne ein Produkt und tippe auf Kaufen: Es öffnet sich bei {agent}.", tourNext: "Weiter", tourSkip: "Überspringen", tourDone: "Verstanden",
    stickyT: "Kostenlos registrieren", stickyS: "800 $ in Gutscheinen + 40 % auf den Versand", navReg: "Kostenlos anmelden",
    seeAll: "Alle Produkte ansehen", seeInAll: "In allen Kategorien suchen ({n})",
    pmWhy: "{agent} kauft es für dich, prüft es und schickt es dir. Zum Bestellen brauchst du ein kostenloses Konto.", pmAgain: "Noch kein Konto? **Kostenlos registrieren**",
    cats: {
      shoes: "Schuhe", tshirts: "T-Shirts", hoodies: "Hoodies", jackets: "Jacken & Mäntel", pants: "Hosen & Jeans",
      shorts: "Shorts", sweaters: "Strick", shirts: "Hemden & Polos", sets: "Trainingsanzüge & Sets", jerseys: "Trikots",
      bags: "Taschen", hats: "Caps & Mützen", accessories: "Accessoires", jewelry: "Uhren & Schmuck", perfume: "Düfte",
      electronics: "Elektronik", home: "Wohnen & Spielzeug", other: "Mehr",
    },
  },
  it: {
    popTitle: "I più popolari", popSub: "Ciò che i visitatori comprano di più qui, più basic economici di tutti i giorni.", popSubAll: "In ordine di ciò che i visitatori comprano di più qui.",
    disclosure: "{shop} non vende nulla: rimanda a {agent} e ai suoi venditori, che hanno condizioni e informative sulla privacy proprie. I link a {agent} contengono il nostro codice di invito, che a te dà lo sconto alla registrazione e a noi può far ottenere un compenso per averlo consigliato.",
    mastSub: "La lista dei prodotti",
    search: "Cerca prodotti", all: "Tutto", saved: "Salvati", products: "{n} prodotti", product: "1 prodotto",
    loading: "Caricamento…", stillLoading: "ancora in caricamento", nothing: "Nessun risultato per «{q}».",
    nothingTip: "Prova con meno parole o un’altra grafia.", empty: "Ancora niente qui.",
    sort: "Ordina", sortFeatured: "In evidenza", sortLow: "Prezzo: crescente", sortHigh: "Prezzo: decrescente", sortName: "Nome: A–Z",
    brand: "Marca", allBrands: "Tutte le marche", shopBy: "Acquista per categoria", allProducts: "Tutti i prodotti", items: "{n} articoli",
    photos: "Vedi {n} foto", save: "Salva", unsave: "Rimuovi dai salvati",
    codeBar: "Nuovo su {agent}? Registrati con il codice **{code}**.",
    footer: "I link d’acquisto portano a {agent}. I prezzi vengono dal foglio e potrebbero essere cambiati; spedizione esclusa.",
    settings: "Impostazioni", language: "Lingua", currency: "Valuta", appearance: "Aspetto",
    introTitle: "Scegli lingua e valuta", introText: "I prezzi verranno mostrati nella valuta scelta. Puoi cambiarla in seguito con 🌐.", accept: "Accetta",
    light: "Chiaro", dark: "Scuro", auto: "Auto", share: "Condividi", copied: "Link copiato", close: "Chiudi",
    fromSheets: "{n} prodotti · aggiornato in tempo reale",
    updatedAt: "{n} prodotti · ultimo aggiornamento: {date}", updatedMonthly: "{n} prodotti · aggiornato ogni mese", refreshed: "L’elenco è appena stato aggiornato",
    trustLabel: "Con il tuo account {agent}",
    trust1: "Controllo qualità di ogni articolo", trust2: "Tutti i tuoi acquisti in un unico pacco", trust3: "Assistenza post-vendita", trust4: "Spedizione in tutto il mondo",
    pmBuy: "Compra su {agent}", pmCta: "Registrati gratis", pmFine: "Account gratuito · il mio codice invito è già inserito", prev: "Foto precedente", next: "Foto successiva", priceLbl: "Prezzo",
    welKicker: "Regalo di benvenuto", welAmount: "800 $", welLine: "GRATIS in coupon **+ 40% sulla spedizione**",
    welText: "Crea il tuo account {agent} gratuito",
    welCta: "Voglio i miei 800 $", welLater: "Più tardi",
    regTag: "Registrazione gratuita", regTitle: "Crea il tuo account {agent}", regCta: "Registrati gratis",
    regOffer: "Con il mio link: **800 $ GRATIS in coupon** + un coupon del **40% sulla spedizione**",
    regWhat: "L’agente per comprare sul mercato cinese: tu scegli, loro comprano, controllano e spediscono.",
    regFine: "Si apre {host} · il mio codice è già inserito", help: "Come funziona", tourStep: "Passo {n} di {m}", tour1t: "Cerca il tuo prodotto",
    tour1d: "Scrivi una marca o un modello nella ricerca in alto, oppure scegli una categoria.", tour2t: "Registrati gratis su {agent}",
    tour2d: "È l’agente che compra per te in Cina. Con il mio link: **800 $ GRATIS in coupon** + un coupon del **40% sulla spedizione**.",
    tour3t: "Compra con un tocco", tour3d: "Apri un prodotto e tocca Compra: {agent} lo compra, lo controlla e te lo spedisce.",
    tour3dAny: "Apri un prodotto e tocca Compra: si apre su {agent}.", tourNext: "Avanti", tourSkip: "Salta", tourDone: "Ho capito",
    stickyT: "Registrati gratis", stickyS: "800 $ in coupon + 40% sulla spedizione", navReg: "Registrazione gratuita", seeAll: "Vedi tutti i prodotti",
    seeInAll: "Cerca in tutte le categorie ({n})",
    pmWhy: "{agent} lo compra per te, lo controlla e te lo spedisce. Per ordinare serve un account gratuito.", pmAgain: "Non hai ancora un account? **Registrati gratis**",
    cats: {
      shoes: "Scarpe", tshirts: "T-shirt", hoodies: "Felpe", jackets: "Giacche e cappotti", pants: "Pantaloni e jeans",
      shorts: "Shorts", sweaters: "Maglieria", shirts: "Camicie e polo", sets: "Tute e completi", jerseys: "Maglie da calcio",
      bags: "Borse", hats: "Cappelli", accessories: "Accessori", jewelry: "Orologi e gioielli", perfume: "Profumi",
      electronics: "Elettronica", home: "Casa e giochi", other: "Altro",
    },
  },
  pt: {
    popTitle: "Os mais populares", popSub: "O que as pessoas mais compram aqui, mais básicos baratos do dia a dia.", popSubAll: "Ordenado pelo que as pessoas mais compram aqui.",
    disclosure: "{shop} não vende nada: liga para a {agent} e para os seus vendedores, que têm as suas próprias condições e a sua própria política de privacidade. Os links para a {agent} levam o nosso código de referência, que te dá o desconto ao registares-te e nos pode render uma comissão por o recomendarmos.",
    mastSub: "Lista de produtos",
    search: "Procurar produtos", all: "Tudo", saved: "Guardados", products: "{n} produtos", product: "1 produto",
    loading: "A carregar…", stillLoading: "ainda a carregar", nothing: "Nada corresponde a “{q}”.",
    nothingTip: "Tenta com menos palavras ou outra grafia.", empty: "Ainda não há nada aqui.",
    sort: "Ordenar", sortFeatured: "Destaques", sortLow: "Preço: do mais baixo", sortHigh: "Preço: do mais alto", sortName: "Nome: A–Z",
    brand: "Marca", allBrands: "Todas as marcas", shopBy: "Comprar por categoria", allProducts: "Todos os produtos", items: "{n} artigos",
    photos: "Ver {n} fotos", save: "Guardar", unsave: "Remover dos guardados",
    codeBar: "Novo na {agent}? Regista-te com o código **{code}**.",
    footer: "Os links de compra vão para a {agent}. Os preços vêm da folha e podem ter mudado; envio não incluído.",
    settings: "Definições", language: "Idioma", currency: "Moeda", appearance: "Aspeto",
    introTitle: "Escolhe o idioma e a moeda", introText: "Os preços serão mostrados na moeda que escolheres. Podes mudar depois em 🌐.", accept: "Aceitar",
    light: "Claro", dark: "Escuro", auto: "Auto", share: "Partilhar", copied: "Link copiado", close: "Fechar",
    fromSheets: "{n} produtos · atualizado ao vivo",
    updatedAt: "{n} produtos · atualizado em {date}", updatedMonthly: "{n} produtos · atualizado mensalmente", refreshed: "A lista acabou de ser atualizada",
    trustLabel: "Com a tua conta {agent}",
    trust1: "Controlo de qualidade de cada artigo", trust2: "Todas as compras num só pacote", trust3: "Apoio pós-venda", trust4: "Envio para todo o mundo",
    pmBuy: "Comprar na {agent}", pmCta: "Registar-me grátis", pmFine: "Conta grátis · o meu código de convite já vai preenchido", prev: "Foto anterior", next: "Foto seguinte", priceLbl: "Preço",
    welKicker: "Presente de boas-vindas", welAmount: "800 $", welLine: "GRÁTIS em cupões **+ 40% no envio**",
    welText: "Cria a tua conta grátis na {agent}",
    welCta: "Quero os meus 800 $", welLater: "Agora não",
    regTag: "Registo grátis", regTitle: "Cria a tua conta na {agent}", regCta: "Registar-me grátis",
    regOffer: "Com o meu link: **800 $ GRÁTIS em cupões** + cupão de **40% no envio**",
    regWhat: "O agente para comprar no mercado chinês: tu escolhes, eles compram, verificam e enviam.",
    regFine: "Abre {host} · o meu código já vai preenchido", help: "Como funciona", tourStep: "Passo {n} de {m}", tour1t: "Procura o teu produto",
    tour1d: "Escreve uma marca ou um modelo na pesquisa em cima, ou escolhe uma categoria.", tour2t: "Regista-te grátis na {agent}",
    tour2d: "É o agente que compra por ti na China. Com o meu link: **800 $ GRÁTIS em cupões** + cupão de **40% no envio**.", tour3t: "Compra com um toque",
    tour3d: "Abre um produto e toca em Comprar: a {agent} compra, verifica e envia para ti.",
    tour3dAny: "Abre um produto e toca em Comprar: abre na {agent}.", tourNext: "Seguinte", tourSkip: "Saltar", tourDone: "Percebi",
    stickyT: "Registar-me grátis", stickyS: "800 $ em cupões + 40% no envio", navReg: "Registo grátis", seeAll: "Ver todos os produtos",
    seeInAll: "Procurar em todas as categorias ({n})",
    pmWhy: "A {agent} compra por ti, verifica e envia. Para encomendar precisas de uma conta grátis.", pmAgain: "Ainda sem conta? **Regista-te grátis**",
    cats: {
      shoes: "Sapatilhas", tshirts: "T-shirts", hoodies: "Sweats", jackets: "Casacos", pants: "Calças e jeans",
      shorts: "Calções", sweaters: "Malhas", shirts: "Camisas e polos", sets: "Fatos de treino e conjuntos", jerseys: "Camisolas de futebol",
      bags: "Malas", hats: "Bonés e gorros", accessories: "Acessórios", jewelry: "Relógios e joias", perfume: "Perfumes",
      electronics: "Eletrónica", home: "Casa e brinquedos", other: "Mais",
    },
  },
  zh: {
    popTitle: "最受欢迎", popSub: "这里最多人点击购买的商品，以及实惠的日常必备。", popSubAll: "按这里最多人点击购买的商品排序。",
    disclosure: "{shop} 不出售任何商品：本站链接到 {agent} 及其卖家，他们有各自的条款和隐私政策。指向 {agent} 的链接带有我们的推荐码，你注册时可获得优惠，我们也可能因推荐而获得奖励。",
    mastSub: "产品清单",
    search: "搜索商品", all: "全部", saved: "收藏", products: "{n} 件商品", product: "1 件商品",
    loading: "加载中…", stillLoading: "仍在加载", nothing: "没有与“{q}”匹配的商品。",
    nothingTip: "试试更少的词或换一种写法。", empty: "这里还没有商品。",
    sort: "排序", sortFeatured: "推荐", sortLow: "价格从低到高", sortHigh: "价格从高到低", sortName: "名称 A–Z",
    brand: "品牌", allBrands: "所有品牌", shopBy: "按类别购物", allProducts: "全部商品", items: "{n} 件",
    photos: "查看 {n} 张照片", save: "收藏", unsave: "取消收藏",
    codeBar: "第一次用 {agent}？注册时填写邀请码 **{code}**。",
    footer: "购买链接会打开 {agent}。价格来自表格，可能已变动；不含运费。",
    settings: "设置", language: "语言", currency: "货币", appearance: "外观",
    introTitle: "选择语言和货币", introText: "价格将以你选择的货币显示，之后可以通过 🌐 更改。", accept: "确定",
    light: "浅色", dark: "深色", auto: "自动", share: "分享", copied: "链接已复制", close: "关闭",
    fromSheets: "{n} 件商品 · 实时更新",
    updatedAt: "{n} 件商品 · 更新于 {date}", updatedMonthly: "{n} 件商品 · 每月更新", refreshed: "列表刚刚更新",
    trustLabel: "使用你的 {agent} 账户",
    trust1: "每件商品都有质检", trust2: "所有商品合并为一个包裹", trust3: "售后服务", trust4: "全球配送",
    pmBuy: "在 {agent} 购买", pmCta: "免费注册", pmFine: "免费账户 · 我的邀请码已自动填写", prev: "上一张", next: "下一张", priceLbl: "价格",
    welKicker: "新人礼包", welAmount: "800 $", welLine: "免费优惠券 **+ 运费 6 折**",
    welText: "免费注册 {agent} 账户",
    welCta: "领取 800 $", welLater: "以后再说",
    regTag: "免费注册", regTitle: "创建你的 {agent} 账户", regCta: "免费注册",
    regOffer: "通过我的链接：**免费 800 $ 优惠券** + **运费 6 折**券",
    regWhat: "帮你在中国市场购物的代购平台：你来选，他们代买、质检并发货。", regFine: "将打开 {host} · 我的邀请码已自动填写", help: "使用方法", tourStep: "第 {n} 步，共 {m} 步", tour1t: "搜索商品",
    tour1d: "在顶部搜索框输入品牌或型号，或选择一个类别。", tour2t: "免费注册 {agent}", tour2d: "它是帮你在中国购物的代购平台。通过我的链接：**免费 800 $ 优惠券** + **运费 6 折**券。", tour3t: "一键购买",
    tour3d: "打开商品并点击购买：{agent} 会代买、质检并寄给你。", tour3dAny: "打开商品并点击购买：将在 {agent} 打开。", tourNext: "下一步", tourSkip: "跳过", tourDone: "知道了", stickyT: "免费注册",
    stickyS: "800 $ 优惠券 + 运费 6 折", navReg: "免费注册", seeAll: "查看全部商品", seeInAll: "在所有类别中搜索（{n}）",
    pmWhy: "{agent} 会帮你代买、质检并寄出。下单需要一个免费账户。", pmAgain: "还没有账户？**免费注册**",
    cats: {
      shoes: "鞋履", tshirts: "T恤", hoodies: "卫衣", jackets: "外套", pants: "裤子和牛仔裤",
      shorts: "短裤", sweaters: "针织衫", shirts: "衬衫和 Polo", sets: "运动套装", jerseys: "球衣",
      bags: "包袋", hats: "帽子", accessories: "配饰", jewelry: "手表和首饰", perfume: "香水",
      electronics: "电子产品", home: "家居和玩具", other: "更多",
    },
  },
};

// The device's languages, e.g. ["es-ES", "en"].
const deviceLangs = () => (typeof navigator === "undefined" ? [] : navigator.languages?.length ? navigator.languages : [navigator.language || ""]);

/** The visitor's choice; on a first visit the device's language when the shop
 *  has it, else English. */
export function pickLang(saved) {
  if (saved && T[saved]) return saved;
  for (const l of deviceLangs()) {
    const base = String(l).toLowerCase().split("-")[0];
    if (T[base]) return base;
  }
  return "en";
}

export function translator(lang) {
  const d = T[lang] || T.en;
  const t = (key, vars = {}) => {
    const s = d[key] ?? T.en[key] ?? key;
    return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  };
  t.cat = (id) => d.cats[id] || T.en.cats[id] || id;
  // Fills an element with text where **part** is bold.
  t.into = (node, key, vars) => {
    node.replaceChildren(...t(key, vars).split(/\*\*(.+?)\*\*/).map((part, i) => {
      if (i % 2 === 0) return document.createTextNode(part);
      const b = document.createElement("b");
      b.textContent = part;
      return b;
    }));
    return node;
  };
  return t;
}

// ---- currencies ---------------------------------------------------------
export const CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "MXN", "BRL", "CHF", "PLN", "SEK", "NOK", "DKK", "CZK", "HUF", "RON",
  "TRY", "AED", "SAR", "INR", "JPY", "KRW", "CNY",
];

// The currency of the device's country ("es-ES" → EUR), for a first visit.
const EURO = ["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"];
const REGION_CURRENCY = { US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", MX: "MXN", BR: "BRL", CH: "CHF", PL: "PLN", SE: "SEK", NO: "NOK", DK: "DKK",
  CZ: "CZK", HU: "HUF", RO: "RON", TR: "TRY", AE: "AED", SA: "SAR", IN: "INR", JP: "JPY", KR: "KRW", CN: "CNY" };

/** The visitor's choice, else the one of their device's country, else US dollars. */
export function pickCurrency(saved) {
  if (saved && CURRENCIES.includes(saved)) return saved;
  for (const l of deviceLangs()) {
    const region = String(l).split("-")[1]?.toUpperCase();
    if (!region) continue;
    if (EURO.includes(region)) return "EUR";
    if (REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  }
  return "USD";
}

// A category's name in every language, so searching "zapatillas" or
// "chaussures" finds shoes whatever language the page is in.
export const catNames = (id) => Object.values(T).map((d) => d.cats[id] || "").join(" ");

// Locale used to write numbers and prices.
export const localeFor = (lang) => {
  const nav = navigator.language || "";
  return nav.toLowerCase().startsWith(lang) ? nav : { en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT", pt: "pt-PT", zh: "zh-CN" }[lang] || "en-US";
};
