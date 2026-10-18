// Shop page texts in the same seven languages as flayfind.
// {name} is filled in; **text** is shown bold.

export const LANGS = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", zh: "中文",
};

const T = {
  en: {
    search: "Search products", all: "All", saved: "Saved", products: "{n} products", product: "1 product",
    loading: "Loading…", stillLoading: "still loading", nothing: "Nothing matches “{q}”.",
    nothingTip: "Try fewer words or another spelling.", empty: "Nothing here yet.",
    sort: "Sort", sortFeatured: "Featured", sortLow: "Price: low to high", sortHigh: "Price: high to low", sortName: "Name: A–Z",
    brand: "Brand", allBrands: "All brands", shopBy: "Shop by category", allProducts: "All products", items: "{n} items",
    photos: "See {n} photos", save: "Save", unsave: "Remove from saved",
    offerBar: "New to {agent}? Get **$800 + 40% off shipping**. Click here.",
    offerShort: "Get $800 + 40% off shipping",
    codeBar: "New to {agent}? Sign up with code **{code}**.",
    footer: "Buy links go to {agent}. Prices come from the sheet and may have changed; shipping is not included.",
    privacy: "Clicks on sign-up links are counted anonymously with Umami, without cookies.",
    settings: "Settings", language: "Language", currency: "Currency", appearance: "Appearance",
    introTitle: "Choose your language and currency", introText: "Prices will be shown in the currency you pick. You can change this later with 🌐.", accept: "Accept",
    light: "Light", dark: "Dark", auto: "Auto", share: "Share", copied: "Link copied", close: "Close",
    fromSheets: "{n} products · updated live",
    updatedAt: "{n} products · updated {date}", refreshed: "The list has just been updated",
    trustLabel: "With your {agent} account",
    trust1: "Quality check on every item", trust2: "All your buys in one parcel", trust3: "After-sales service", trust4: "Worldwide shipping",
    gateKicker: "One step before buying", gateTitle: "Get **$800** off + **40%** off shipping",
    gateS1t: "Open {agent} with our link", gateS1d: "Our invite code is already filled in",
    gateS2t: "Create your free account", gateS2d: "Takes under a minute",
    gateS3t: "Come back and buy this item", gateS3d: "With $800 off and 40% off shipping",
    gateCta: "Get my $800 + 40% off", gateSkip: "I already have an account · **go to the item →**",
    readyTitle: "Signed up?", readyText: "Finish in the {agent} tab, then tap below to open the item you wanted.",
    readyCta: "Yes, go to the item", readyAgain: "{agent} didn't open? Open it again",
    welKicker: "Welcome gift", welAmount: "$800", welLine: "in discounts **+ 40% off shipping**",
    welText: "Create your free {agent} account through our link and it's yours on your first orders.",
    welCta: "Claim my $800", welLater: "Maybe later",
    cats: {
      shoes: "Shoes", tshirts: "T-shirts", hoodies: "Hoodies", jackets: "Jackets & Coats", pants: "Pants & Jeans",
      shorts: "Shorts", sweaters: "Knitwear", shirts: "Shirts & Polos", sets: "Tracksuits & Sets", jerseys: "Jerseys",
      bags: "Bags", hats: "Hats & Caps", accessories: "Accessories", jewelry: "Watches & Jewelry", perfume: "Fragrances",
      electronics: "Electronics", home: "Home & Toys", other: "More",
    },
  },
  es: {
    search: "Buscar productos", all: "Todo", saved: "Guardados", products: "{n} productos", product: "1 producto",
    loading: "Cargando…", stillLoading: "aún cargando", nothing: "Nada coincide con «{q}».",
    nothingTip: "Prueba con menos palabras o escríbelo de otra forma.", empty: "Aún no hay nada aquí.",
    sort: "Ordenar", sortFeatured: "Destacados", sortLow: "Precio: de menor a mayor", sortHigh: "Precio: de mayor a menor", sortName: "Nombre: A–Z",
    brand: "Marca", allBrands: "Todas las marcas", shopBy: "Compra por categoría", allProducts: "Todos los productos", items: "{n} artículos",
    photos: "Ver {n} fotos", save: "Guardar", unsave: "Quitar de guardados",
    offerBar: "¿Nuevo en {agent}? Llévate **800 $ + 40% de descuento en el envío**. Haz clic aquí.",
    offerShort: "800 $ + 40% en el envío",
    codeBar: "¿Nuevo en {agent}? Regístrate con el código **{code}**.",
    footer: "Los enlaces de compra van a {agent}. Los precios vienen de la hoja y pueden haber cambiado; el envío no está incluido.",
    privacy: "Los clics en los enlaces de registro se cuentan de forma anónima con Umami, sin cookies.",
    settings: "Ajustes", language: "Idioma", currency: "Moneda", appearance: "Apariencia",
    introTitle: "Elige tu idioma y tu moneda", introText: "Los precios se mostrarán en la moneda que elijas. Puedes cambiarlo después con 🌐.", accept: "Aceptar",
    light: "Claro", dark: "Oscuro", auto: "Auto", share: "Compartir", copied: "Enlace copiado", close: "Cerrar",
    fromSheets: "{n} productos · actualizado al momento",
    updatedAt: "{n} productos · actualizado el {date}", refreshed: "La lista se acaba de actualizar",
    trustLabel: "Con tu cuenta de {agent}",
    trust1: "Revisión de calidad de cada prenda", trust2: "Todas tus compras en un solo paquete", trust3: "Servicio posventa", trust4: "Envío a todo el mundo",
    gateKicker: "Un paso antes de comprar", gateTitle: "Llévate **800 $** de descuento + **40%** en el envío",
    gateS1t: "Abre {agent} con nuestro enlace", gateS1d: "Nuestro código de invitación ya va puesto",
    gateS2t: "Crea tu cuenta gratis", gateS2d: "Tardas menos de un minuto",
    gateS3t: "Vuelve y compra este artículo", gateS3d: "Con 800 $ de descuento y 40% en el envío",
    gateCta: "Quiero mis 800 $ + 40%", gateSkip: "Ya tengo cuenta · **ir al artículo →**",
    readyTitle: "¿Ya te has registrado?", readyText: "Termina en la pestaña de {agent} y toca abajo para abrir el artículo que querías.",
    readyCta: "Sí, ir al artículo", readyAgain: "¿No se abrió {agent}? Ábrelo otra vez",
    welKicker: "Regalo de bienvenida", welAmount: "800 $", welLine: "en descuentos **+ 40% en el envío**",
    welText: "Crea tu cuenta gratis de {agent} con nuestro enlace y es tuyo en tus primeros pedidos.",
    welCta: "Quiero mis 800 $", welLater: "Ahora no",
    cats: {
      shoes: "Zapatillas", tshirts: "Camisetas", hoodies: "Sudaderas", jackets: "Chaquetas y abrigos", pants: "Pantalones y vaqueros",
      shorts: "Pantalones cortos", sweaters: "Punto", shirts: "Camisas y polos", sets: "Chándals y conjuntos", jerseys: "Camisetas de fútbol",
      bags: "Bolsos", hats: "Gorras y gorros", accessories: "Accesorios", jewelry: "Relojes y joyas", perfume: "Perfumes",
      electronics: "Electrónica", home: "Hogar y juguetes", other: "Más",
    },
  },
  fr: {
    search: "Rechercher des produits", all: "Tout", saved: "Favoris", products: "{n} produits", product: "1 produit",
    loading: "Chargement…", stillLoading: "chargement en cours", nothing: "Aucun résultat pour « {q} ».",
    nothingTip: "Essayez avec moins de mots ou une autre orthographe.", empty: "Rien ici pour l’instant.",
    sort: "Trier", sortFeatured: "En vedette", sortLow: "Prix croissant", sortHigh: "Prix décroissant", sortName: "Nom : A–Z",
    brand: "Marque", allBrands: "Toutes les marques", shopBy: "Acheter par catégorie", allProducts: "Tous les produits", items: "{n} articles",
    photos: "Voir {n} photos", save: "Enregistrer", unsave: "Retirer des favoris",
    offerBar: "Nouveau sur {agent} ? Obtenez **800 $ + 40 % sur la livraison**. Cliquez ici.",
    offerShort: "800 $ + 40 % sur la livraison",
    codeBar: "Nouveau sur {agent} ? Inscrivez-vous avec le code **{code}**.",
    footer: "Les liens d’achat mènent à {agent}. Les prix viennent de la feuille et ont pu changer ; livraison non comprise.",
    privacy: "Les clics sur les liens d’inscription sont comptés anonymement avec Umami, sans cookies.",
    settings: "Réglages", language: "Langue", currency: "Devise", appearance: "Apparence",
    introTitle: "Choisissez votre langue et votre devise", introText: "Les prix seront affichés dans la devise choisie. Vous pourrez la changer plus tard avec 🌐.", accept: "Accepter",
    light: "Clair", dark: "Sombre", auto: "Auto", share: "Partager", copied: "Lien copié", close: "Fermer",
    fromSheets: "{n} produits · mis à jour en direct",
    updatedAt: "{n} produits · mis à jour le {date}", refreshed: "La liste vient d’être mise à jour",
    trustLabel: "Avec votre compte {agent}",
    trust1: "Contrôle qualité de chaque article", trust2: "Tous vos achats dans un seul colis", trust3: "Service après-vente", trust4: "Livraison dans le monde entier",
    gateKicker: "Une étape avant d’acheter", gateTitle: "Obtenez **800 $** de réduction + **40 %** sur la livraison",
    gateS1t: "Ouvrez {agent} avec notre lien", gateS1d: "Notre code d’invitation est déjà rempli",
    gateS2t: "Créez votre compte gratuit", gateS2d: "Moins d’une minute",
    gateS3t: "Revenez et achetez cet article", gateS3d: "Avec 800 $ de réduction et 40 % sur la livraison",
    gateCta: "Je veux mes 800 $ + 40 %", gateSkip: "J’ai déjà un compte · **voir l’article →**",
    readyTitle: "Inscrit ?", readyText: "Terminez dans l’onglet {agent}, puis touchez ci-dessous pour ouvrir l’article.",
    readyCta: "Oui, voir l’article", readyAgain: "{agent} ne s’est pas ouvert ? Rouvrir",
    welKicker: "Cadeau de bienvenue", welAmount: "800 $", welLine: "de réductions **+ 40 % sur la livraison**",
    welText: "Créez votre compte {agent} gratuit avec notre lien et profitez-en sur vos premières commandes.",
    welCta: "Je récupère mes 800 $", welLater: "Plus tard",
    cats: {
      shoes: "Chaussures", tshirts: "T-shirts", hoodies: "Sweats à capuche", jackets: "Vestes et manteaux", pants: "Pantalons et jeans",
      shorts: "Shorts", sweaters: "Mailles", shirts: "Chemises et polos", sets: "Survêtements et ensembles", jerseys: "Maillots",
      bags: "Sacs", hats: "Casquettes et bonnets", accessories: "Accessoires", jewelry: "Montres et bijoux", perfume: "Parfums",
      electronics: "Électronique", home: "Maison et jouets", other: "Plus",
    },
  },
  de: {
    search: "Produkte suchen", all: "Alle", saved: "Gemerkt", products: "{n} Produkte", product: "1 Produkt",
    loading: "Wird geladen…", stillLoading: "lädt noch", nothing: "Keine Treffer für „{q}“.",
    nothingTip: "Versuch es mit weniger Wörtern oder einer anderen Schreibweise.", empty: "Hier ist noch nichts.",
    sort: "Sortieren", sortFeatured: "Empfohlen", sortLow: "Preis: aufsteigend", sortHigh: "Preis: absteigend", sortName: "Name: A–Z",
    brand: "Marke", allBrands: "Alle Marken", shopBy: "Nach Kategorie shoppen", allProducts: "Alle Produkte", items: "{n} Artikel",
    photos: "{n} Fotos ansehen", save: "Merken", unsave: "Nicht mehr merken",
    offerBar: "Neu bei {agent}? Hol dir **800 $ + 40 % Rabatt auf den Versand**. Hier klicken.",
    offerShort: "800 $ + 40 % auf den Versand",
    codeBar: "Neu bei {agent}? Registriere dich mit dem Code **{code}**.",
    footer: "Die Kauflinks führen zu {agent}. Die Preise stammen aus der Tabelle und können sich geändert haben; Versand nicht inbegriffen.",
    privacy: "Klicks auf Registrierungslinks werden anonym mit Umami gezählt, ohne Cookies.",
    settings: "Einstellungen", language: "Sprache", currency: "Währung", appearance: "Darstellung",
    introTitle: "Wähle Sprache und Währung", introText: "Die Preise werden in der gewählten Währung angezeigt. Du kannst das später über 🌐 ändern.", accept: "Übernehmen",
    light: "Hell", dark: "Dunkel", auto: "Auto", share: "Teilen", copied: "Link kopiert", close: "Schließen",
    fromSheets: "{n} Produkte · live aktualisiert",
    updatedAt: "{n} Produkte · aktualisiert am {date}", refreshed: "Die Liste wurde gerade aktualisiert",
    trustLabel: "Mit deinem {agent}-Konto",
    trust1: "Qualitätskontrolle jedes Artikels", trust2: "Alle Käufe in einem Paket", trust3: "Kundendienst nach dem Kauf", trust4: "Versand weltweit",
    gateKicker: "Ein Schritt vor dem Kauf", gateTitle: "Hol dir **800 $** Rabatt + **40 %** auf den Versand",
    gateS1t: "Öffne {agent} über unseren Link", gateS1d: "Unser Einladungscode ist schon eingetragen",
    gateS2t: "Erstelle dein kostenloses Konto", gateS2d: "Dauert keine Minute",
    gateS3t: "Komm zurück und kauf diesen Artikel", gateS3d: "Mit 800 $ Rabatt und 40 % auf den Versand",
    gateCta: "Meine 800 $ + 40 % holen", gateSkip: "Ich habe schon ein Konto · **zum Artikel →**",
    readyTitle: "Registriert?", readyText: "Schließ es im {agent}-Tab ab und tippe dann unten, um den Artikel zu öffnen.",
    readyCta: "Ja, zum Artikel", readyAgain: "{agent} hat sich nicht geöffnet? Nochmal öffnen",
    welKicker: "Willkommensgeschenk", welAmount: "800 $", welLine: "Rabatt **+ 40 % auf den Versand**",
    welText: "Erstelle dein kostenloses {agent}-Konto über unseren Link und nutze es bei deinen ersten Bestellungen.",
    welCta: "800 $ sichern", welLater: "Später",
    cats: {
      shoes: "Schuhe", tshirts: "T-Shirts", hoodies: "Hoodies", jackets: "Jacken & Mäntel", pants: "Hosen & Jeans",
      shorts: "Shorts", sweaters: "Strick", shirts: "Hemden & Polos", sets: "Trainingsanzüge & Sets", jerseys: "Trikots",
      bags: "Taschen", hats: "Caps & Mützen", accessories: "Accessoires", jewelry: "Uhren & Schmuck", perfume: "Düfte",
      electronics: "Elektronik", home: "Wohnen & Spielzeug", other: "Mehr",
    },
  },
  it: {
    search: "Cerca prodotti", all: "Tutto", saved: "Salvati", products: "{n} prodotti", product: "1 prodotto",
    loading: "Caricamento…", stillLoading: "ancora in caricamento", nothing: "Nessun risultato per «{q}».",
    nothingTip: "Prova con meno parole o un’altra grafia.", empty: "Ancora niente qui.",
    sort: "Ordina", sortFeatured: "In evidenza", sortLow: "Prezzo: crescente", sortHigh: "Prezzo: decrescente", sortName: "Nome: A–Z",
    brand: "Marca", allBrands: "Tutte le marche", shopBy: "Acquista per categoria", allProducts: "Tutti i prodotti", items: "{n} articoli",
    photos: "Vedi {n} foto", save: "Salva", unsave: "Rimuovi dai salvati",
    offerBar: "Nuovo su {agent}? Ottieni **800 $ + 40% di sconto sulla spedizione**. Clicca qui.",
    offerShort: "800 $ + 40% sulla spedizione",
    codeBar: "Nuovo su {agent}? Registrati con il codice **{code}**.",
    footer: "I link d’acquisto portano a {agent}. I prezzi vengono dal foglio e potrebbero essere cambiati; spedizione esclusa.",
    privacy: "I clic sui link di registrazione vengono contati in forma anonima con Umami, senza cookie.",
    settings: "Impostazioni", language: "Lingua", currency: "Valuta", appearance: "Aspetto",
    introTitle: "Scegli lingua e valuta", introText: "I prezzi verranno mostrati nella valuta scelta. Puoi cambiarla in seguito con 🌐.", accept: "Accetta",
    light: "Chiaro", dark: "Scuro", auto: "Auto", share: "Condividi", copied: "Link copiato", close: "Chiudi",
    fromSheets: "{n} prodotti · aggiornato in tempo reale",
    updatedAt: "{n} prodotti · aggiornato il {date}", refreshed: "L’elenco è appena stato aggiornato",
    trustLabel: "Con il tuo account {agent}",
    trust1: "Controllo qualità di ogni articolo", trust2: "Tutti i tuoi acquisti in un unico pacco", trust3: "Assistenza post-vendita", trust4: "Spedizione in tutto il mondo",
    gateKicker: "Un passo prima di comprare", gateTitle: "Ottieni **800 $** di sconto + **40%** sulla spedizione",
    gateS1t: "Apri {agent} con il nostro link", gateS1d: "Il nostro codice invito è già inserito",
    gateS2t: "Crea il tuo account gratuito", gateS2d: "Meno di un minuto",
    gateS3t: "Torna e compra questo articolo", gateS3d: "Con 800 $ di sconto e 40% sulla spedizione",
    gateCta: "Voglio i miei 800 $ + 40%", gateSkip: "Ho già un account · **vai all’articolo →**",
    readyTitle: "Registrato?", readyText: "Completa nella scheda di {agent}, poi tocca qui sotto per aprire l’articolo.",
    readyCta: "Sì, vai all’articolo", readyAgain: "{agent} non si è aperto? Riaprilo",
    welKicker: "Regalo di benvenuto", welAmount: "800 $", welLine: "di sconti **+ 40% sulla spedizione**",
    welText: "Crea il tuo account {agent} gratuito con il nostro link ed è tuo sui primi ordini.",
    welCta: "Voglio i miei 800 $", welLater: "Più tardi",
    cats: {
      shoes: "Scarpe", tshirts: "T-shirt", hoodies: "Felpe", jackets: "Giacche e cappotti", pants: "Pantaloni e jeans",
      shorts: "Shorts", sweaters: "Maglieria", shirts: "Camicie e polo", sets: "Tute e completi", jerseys: "Maglie da calcio",
      bags: "Borse", hats: "Cappelli", accessories: "Accessori", jewelry: "Orologi e gioielli", perfume: "Profumi",
      electronics: "Elettronica", home: "Casa e giochi", other: "Altro",
    },
  },
  pt: {
    search: "Procurar produtos", all: "Tudo", saved: "Guardados", products: "{n} produtos", product: "1 produto",
    loading: "A carregar…", stillLoading: "ainda a carregar", nothing: "Nada corresponde a “{q}”.",
    nothingTip: "Tenta com menos palavras ou outra grafia.", empty: "Ainda não há nada aqui.",
    sort: "Ordenar", sortFeatured: "Destaques", sortLow: "Preço: do mais baixo", sortHigh: "Preço: do mais alto", sortName: "Nome: A–Z",
    brand: "Marca", allBrands: "Todas as marcas", shopBy: "Comprar por categoria", allProducts: "Todos os produtos", items: "{n} artigos",
    photos: "Ver {n} fotos", save: "Guardar", unsave: "Remover dos guardados",
    offerBar: "Novo na {agent}? Ganha **800 $ + 40% de desconto no envio**. Clica aqui.",
    offerShort: "800 $ + 40% no envio",
    codeBar: "Novo na {agent}? Regista-te com o código **{code}**.",
    footer: "Os links de compra vão para a {agent}. Os preços vêm da folha e podem ter mudado; envio não incluído.",
    privacy: "Os cliques nos links de registo são contados de forma anónima com o Umami, sem cookies.",
    settings: "Definições", language: "Idioma", currency: "Moeda", appearance: "Aspeto",
    introTitle: "Escolhe o idioma e a moeda", introText: "Os preços serão mostrados na moeda que escolheres. Podes mudar depois em 🌐.", accept: "Aceitar",
    light: "Claro", dark: "Escuro", auto: "Auto", share: "Partilhar", copied: "Link copiado", close: "Fechar",
    fromSheets: "{n} produtos · atualizado ao vivo",
    updatedAt: "{n} produtos · atualizado a {date}", refreshed: "A lista acabou de ser atualizada",
    trustLabel: "Com a tua conta {agent}",
    trust1: "Controlo de qualidade de cada artigo", trust2: "Todas as compras num só pacote", trust3: "Apoio pós-venda", trust4: "Envio para todo o mundo",
    gateKicker: "Um passo antes de comprar", gateTitle: "Ganha **800 $** de desconto + **40%** no envio",
    gateS1t: "Abre a {agent} com o nosso link", gateS1d: "O nosso código de convite já vai preenchido",
    gateS2t: "Cria a tua conta grátis", gateS2d: "Demora menos de um minuto",
    gateS3t: "Volta e compra este artigo", gateS3d: "Com 800 $ de desconto e 40% no envio",
    gateCta: "Quero os meus 800 $ + 40%", gateSkip: "Já tenho conta · **ir para o artigo →**",
    readyTitle: "Já te registaste?", readyText: "Termina no separador da {agent} e toca abaixo para abrir o artigo.",
    readyCta: "Sim, ir para o artigo", readyAgain: "A {agent} não abriu? Abrir de novo",
    welKicker: "Presente de boas-vindas", welAmount: "800 $", welLine: "em descontos **+ 40% no envio**",
    welText: "Cria a tua conta grátis na {agent} com o nosso link e é teu nas primeiras encomendas.",
    welCta: "Quero os meus 800 $", welLater: "Agora não",
    cats: {
      shoes: "Sapatilhas", tshirts: "T-shirts", hoodies: "Sweats", jackets: "Casacos", pants: "Calças e jeans",
      shorts: "Calções", sweaters: "Malhas", shirts: "Camisas e polos", sets: "Fatos de treino e conjuntos", jerseys: "Camisolas de futebol",
      bags: "Malas", hats: "Bonés e gorros", accessories: "Acessórios", jewelry: "Relógios e joias", perfume: "Perfumes",
      electronics: "Eletrónica", home: "Casa e brinquedos", other: "Mais",
    },
  },
  zh: {
    search: "搜索商品", all: "全部", saved: "收藏", products: "{n} 件商品", product: "1 件商品",
    loading: "加载中…", stillLoading: "仍在加载", nothing: "没有与“{q}”匹配的商品。",
    nothingTip: "试试更少的词或换一种写法。", empty: "这里还没有商品。",
    sort: "排序", sortFeatured: "推荐", sortLow: "价格从低到高", sortHigh: "价格从高到低", sortName: "名称 A–Z",
    brand: "品牌", allBrands: "所有品牌", shopBy: "按类别购物", allProducts: "全部商品", items: "{n} 件",
    photos: "查看 {n} 张照片", save: "收藏", unsave: "取消收藏",
    offerBar: "第一次用 {agent}？领取 **800 $ + 运费 6 折**。点击这里。",
    offerShort: "800 $ + 运费 6 折",
    codeBar: "第一次用 {agent}？注册时填写邀请码 **{code}**。",
    footer: "购买链接会打开 {agent}。价格来自表格，可能已变动；不含运费。",
    privacy: "注册链接的点击通过 Umami 匿名统计，不使用 Cookie。",
    settings: "设置", language: "语言", currency: "货币", appearance: "外观",
    introTitle: "选择语言和货币", introText: "价格将以你选择的货币显示，之后可以通过 🌐 更改。", accept: "确定",
    light: "浅色", dark: "深色", auto: "自动", share: "分享", copied: "链接已复制", close: "关闭",
    fromSheets: "{n} 件商品 · 实时更新",
    updatedAt: "{n} 件商品 · 更新于 {date}", refreshed: "列表刚刚更新",
    trustLabel: "使用你的 {agent} 账户",
    trust1: "每件商品都有质检", trust2: "所有商品合并为一个包裹", trust3: "售后服务", trust4: "全球配送",
    gateKicker: "购买前的一步", gateTitle: "立减 **800 $** + 运费 **6 折**",
    gateS1t: "通过我们的链接打开 {agent}", gateS1d: "邀请码已自动填写",
    gateS2t: "免费注册账户", gateS2d: "不到一分钟",
    gateS3t: "回来购买这件商品", gateS3d: "立减 800 $，运费 6 折",
    gateCta: "领取 800 $ + 运费优惠", gateSkip: "我已有账户 · **前往商品 →**",
    readyTitle: "注册好了吗？", readyText: "在 {agent} 页面完成注册，然后点击下方打开你想要的商品。",
    readyCta: "好的，前往商品", readyAgain: "{agent} 没有打开？再打开一次",
    welKicker: "新人礼包", welAmount: "800 $", welLine: "优惠券 **+ 运费 6 折**",
    welText: "通过我们的链接免费注册 {agent}，首批订单即可使用。",
    welCta: "领取 800 $", welLater: "以后再说",
    cats: {
      shoes: "鞋履", tshirts: "T恤", hoodies: "卫衣", jackets: "外套", pants: "裤子和牛仔裤",
      shorts: "短裤", sweaters: "针织衫", shirts: "衬衫和 Polo", sets: "运动套装", jerseys: "球衣",
      bags: "包袋", hats: "帽子", accessories: "配饰", jewelry: "手表和首饰", perfume: "香水",
      electronics: "电子产品", home: "家居和玩具", other: "更多",
    },
  },
};

export function pickLang(saved) {
  if (saved && T[saved]) return saved;
  for (const l of navigator.languages || [navigator.language || "en"]) {
    const code = String(l).slice(0, 2).toLowerCase();
    if (T[code]) return code;
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

const REGION_CURRENCY = {
  US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", MX: "MXN", BR: "BRL", CH: "CHF", PL: "PLN", SE: "SEK", NO: "NOK",
  DK: "DKK", CZ: "CZK", HU: "HUF", RO: "RON", TR: "TRY", AE: "AED", SA: "SAR", IN: "INR", JP: "JPY", KR: "KRW", CN: "CNY",
};
const EURO = "AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK".split(" ");

export function pickCurrency(saved) {
  if (saved && CURRENCIES.includes(saved)) return saved;
  try {
    const region = new Intl.Locale(navigator.language || "en-US").maximize().region;
    if (EURO.includes(region)) return "EUR";
    if (REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  } catch {}
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (tz === "Europe/London") return "GBP";
  if (tz.startsWith("Europe/")) return "EUR";
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
