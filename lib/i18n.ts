import type { ShippingCountry } from "@/lib/commerce"

export type SiteLocale = "en" | "pt"

export function localeFromShippingCountry(country: ShippingCountry): SiteLocale {
  return country === "BR" ? "pt" : "en"
}

export const i18n = {
  en: {
    nav: {
      home: "Home",
      collaborations: "Collaborations",
      about: "About Us",
      shop: "Shop",
      subtitle: "Shop with a purpose",
    },
    footer: {
      tagline: "Graphic socks with a real mission.",
      description:
        "Shop standout socks, then follow the collaborations, donation work, and local proof that make the brand bigger than the product.",
      navigate: "Navigate",
      connect: "Connect",
      designGuide: "Design Guide",
      builtBy: "Designed and built by the OneMoreGood team.",
    },
    home: {
      chips: ["Sock shop", "Purpose-backed", "US + Brazil"],
      headline: "Graphic socks with personality, purpose, and",
      headlineAccent: "everyday comfort.",
      intro:
        "Choose bold crew socks for outfits, gifts, school days, game days, and small details that make people look twice. The shop is simple to browse, easy to buy from, and rooted in a mission that stays visible after checkout.",
      shopAll: "Shop all socks",
      seeImpact: "See our impact",
      pricingStats: [
        ["$8", "Most U.S. single pairs"],
        ["2 for $15", "U.S. bundle pricing"],
        ["R$25", "Brazil single-pair pricing"],
      ],
      featuredPair: "Featured pair",
      bestSeller: "Best seller",
      productMetaSuffix: "crew socks",
      productDescriptions: {
        "sock-brazil-yellow":
          "Bright color, soft knit, and the kind of pair that turns a basic outfit into something people remember.",
        "sock-cherry": "Sweet graphic. Soft cotton blend. Easy daily pair.",
        "sock-basketball": "Sporty design. Comfy fit. Everyday durability.",
        "sock-flying-money": "Loud design. Soft feel. Holds up after washes.",
        "sock-chicken-leg": "Bold graphic. Soft cotton blend. Stays comfy all day.",
        "sock-duff-simpsons": "Retro pop style. Comfortable crew fit. Durable knit.",
      },
      bestSellersKicker: "Best sellers",
      shopWallTitle: "Shop the sock wall",
      shopWallDesc:
        "Start with the pairs people notice first. Open the full shop when you want the complete catalog, filters, cart, and checkout.",
      seeEverything: "See Everything",
      detailsKicker: "Product details",
      detailsTitle: "Made for everyday rotation",
      detailsDesc:
        "One pair for the outfit, one pair for the drawer, one pair for a gift. The collection is built to be easy to wear and easy to come back to.",
      productNotes: [
        {
          title: "All-day comfort",
          text: "Soft crew socks with an easy stretch, clean finish, and a fit made for school days, travel days, and everything between.",
        },
        {
          title: "Standout designs",
          text: "Cartoon, sport, food, money, and Brazil-inspired styles that add personality without making the rest of the outfit complicated.",
        },
        {
          title: "Easy to buy",
          text: "Pick your pairs, build a small rotation, review the cart, and check out with pricing set for your shipping country.",
        },
      ],
      whyKicker: "Why shop here",
      whyTitle: "A better sock drawer starts here",
      whyDesc:
        "OneMoreGood keeps the store experience clear: strong product photos, direct pricing, useful bundles, and a brand story that gives every order more weight.",
      storePromise: "Store promise",
      shopReasons: [
        "Fresh graphic styles made for everyday rotation",
        "Two-pair U.S. bundle: 2 pairs for $15",
        "Brazil and U.S. pricing built into the shop",
        "Every purchase keeps OneMoreGood's local work moving",
      ],
      openShop: "Open the full shop",
      impactCollaborations: "Impact and collaborations",
      shopLabel: "Shop",
    },
    organization: {
      chips: ["Collaborations", "Santa Terezinha", "Proof over promises"],
      headline: "The impact work behind",
      headlineAccent: "OneMoreGood.",
      intro:
        "OneMoreGood begins with products people can buy and wear. The collaborations page shows where that momentum can go next: local relationships, donation work, community media, and proof that the mission is active.",
      shopToSupport: "Shop to support",
      backToSocks: "Back to socks",
      stats: [
        ["Local", "Specific people and places"],
        ["Visible", "Photos and videos that show the work"],
        ["Practical", "Clear needs, real actions, direct updates"],
      ],
      whereItStarts: "Where it starts",
      locationTitle: "Santa Terezinha, Pernambuco",
      locationText:
        "The local reference point that keeps OneMoreGood specific, grounded, and connected to people we can actually know, hear from, and support.",
      videosKicker: "Videos",
      videosTitle: "See the work, not just the words",
      videosDesc:
        "The collaboration page is built around real places and real media. Videos help supporters understand the people, setting, and relationships behind the mission.",
      videoLabel: "Proof video",
      watch: "Watch",
      videos: [
        {
          title: "Community walkthrough",
          text: "A closer look at the local environment connected to OneMoreGood's mission and future collaborations.",
        },
        {
          title: "Local proof video",
          text: "A second piece of context showing why the brand keeps its impact work connected to real people and real places.",
        },
      ],
      focusKicker: "Collaboration focus",
      focusTitle: "Where support can go",
      focusDesc:
        "The goal is to choose work that is specific enough to act on, meaningful enough to matter, and visible enough for supporters to follow.",
      focusAreas: [
        {
          title: "Families",
          text: "Practical help for local families when a need is clear, reachable, and meaningful.",
        },
        {
          title: "Children",
          text: "Collaborations connected to children, education, activities, and moments that strengthen the community.",
        },
        {
          title: "Proof",
          text: "A public record through photos, videos, notes, and updates so supporters can see the work behind the brand.",
        },
      ],
      galleryKicker: "Proof gallery",
      galleryTitle: "Photos from the community",
      galleryDesc:
        "As OneMoreGood grows, this page becomes the visual record of the people, places, and collaborations connected to each round of support.",
      photoLabels: [
        "Children's activities",
        "School community",
        "Local outreach",
        "Local setting",
      ],
      openPhoto: "Open photo",
      closePhoto: "Close photo",
      connectKicker: "How it connects",
      connectTitle: "A store that can keep giving",
      connectDesc:
        "The shop creates momentum. The collaborations give that momentum direction. Together, they let customers buy something they like and follow the good that comes after.",
      donationSteps: [
        {
          title: "Sell products people want",
          text: "OneMoreGood starts with a real product: graphic socks people can wear, gift, and reorder.",
        },
        {
          title: "Partner close to the need",
          text: "Support is guided by local context, trusted relationships, and specific needs that can be understood clearly.",
        },
        {
          title: "Show what happened",
          text: "Photos, videos, and updates turn each collaboration into a visible record supporters can follow.",
        },
      ],
      shopSocks: "Shop socks",
      backHome: "Back to main page",
    },
    shop: {
      kicker: "Shop",
      headline: "Good socks.",
      headlineAccent: "Real impact.",
      intro:
        "Every purchase helps OneMoreGood donate most of the profit to Instituto Semear in Pernambuco, Brazil.",
      search: "Search",
      clear: "Clear",
      clearSearch: "Clear search",
      placeholder: "Search socks...",
      tip: "Tip: try classic, crew, or purpose",
      all: "All",
      filterByTag: "Filter by tag",
      results: (count: number) => `${count} result${count === 1 ? "" : "s"}`,
      pricingUs: "US pricing: 1 pair $8 • 2 pairs $15 • U.S.-only checkout",
      pricingBr: "Brazil pricing: R$25.00 per sock • Brazil-only checkout",
      cart: "Cart",
      noMatches: "No matches",
      noMatchesText: "Try a different search or clear filters.",
      clearFilters: "Clear filters",
      sock: "Sock",
      add: "Add",
      view: "View",
      purposeBacked: "+ purpose-backed purchase",
      product: "Product",
      close: "Close",
      addToCart: "Add to cart",
      keepShopping: "Keep shopping",
      stockUnavailable: "Stock unavailable",
      outOfStock: "Out of stock",
      inStock: "In stock",
      left: (count: number) => `${count} left`,
      openProduct: (title: string) => `Open ${title}`,
      addProduct: (title: string) => `Add ${title} to cart`,
    },
    cart: {
      closeCart: "Close cart",
      drawer: "Cart drawer",
      yourCart: "Your cart",
      close: "Close",
      empty: "Cart is empty",
      emptyText: "Add a pair and it'll show up here.",
      remove: "Remove",
      clearCart: "Clear cart",
      country: "Country",
      subtotal: "Subtotal",
      promo: "Promo (2 for $15)",
      shipping: "Shipping",
      total: "Total",
      checkoutNote:
        "Checkout uses pricing, stock, and shipping rules for your detected country.",
      policiesBefore: "By checking out, you agree to the",
      policiesLink: "shipping and refund policies",
      policiesAfter: ".",
      contactTitle: "Contact us to buy",
      contactText:
        "Checkout for this country is handled directly. Send us a message and we will help finish the order.",
      perOrder: "per order",
      email: "Email",
      instagram: "Instagram",
      addNote: "Add a note",
      notePlaceholder: "Size, delivery, or order details",
      sendMessage: "Send message",
      cancel: "Cancel",
      decrease: (title: string) => `Decrease quantity of ${title}`,
      increase: (title: string) => `Increase quantity of ${title}`,
    },
  },
  pt: {
    nav: {
      home: "Início",
      collaborations: "Doações",
      about: "Sobre nós",
      shop: "Loja",
      subtitle: "Compre com propósito",
    },
    footer: {
      tagline: "Meias criativas com uma missão real.",
      description:
        "Compre meias marcantes e acompanhe as colaborações, doações e registros locais que fazem a marca ir além do produto.",
      navigate: "Navegar",
      connect: "Contato",
      designGuide: "Guia visual",
      builtBy: "Projetado e desenvolvido pela equipe OneMoreGood.",
    },
    home: {
      chips: ["Loja de meias", "Com propósito", "EUA + Brasil"],
      headline: "Meias criativas com personalidade, propósito e",
      headlineAccent: "conforto para o dia a dia.",
      intro:
        "Escolha meias estilosas para looks, presentes, escola, jogos e pequenos detalhes que chamam atenção. A loja é simples de navegar, fácil de comprar e conectada a uma missão que continua visível depois da compra.",
      shopAll: "Ver todas as meias",
      seeImpact: "Ver o impacto",
      pricingStats: [
        ["R$25", "Preço no Brasil por par"],
        ["US$8", "Preço nos EUA por par"],
        ["2 por US$15", "Combo nos EUA"],
      ],
      featuredPair: "Par em destaque",
      bestSeller: "Mais vendido",
      productMetaSuffix: "meia cano médio",
      productDescriptions: {
        "sock-brazil-yellow":
          "Cor vibrante, malha macia e um par que transforma um look básico em algo memorável.",
        "sock-cherry": "Estampa doce. Mistura macia de algodão. Fácil para usar todo dia.",
        "sock-basketball": "Design esportivo. Ajuste confortável. Durabilidade para o dia a dia.",
        "sock-flying-money": "Design chamativo. Toque macio. Resiste bem às lavagens.",
        "sock-chicken-leg": "Estampa divertida. Mistura macia de algodão. Confortável o dia todo.",
        "sock-duff-simpsons": "Estilo retrô pop. Cano confortável. Malha resistente.",
      },
      bestSellersKicker: "Mais vendidos",
      shopWallTitle: "Explore a coleção",
      shopWallDesc:
        "Comece pelos pares que mais chamam atenção. Abra a loja completa para ver catálogo, filtros, carrinho e checkout.",
      seeEverything: "Ver tudo",
      detailsKicker: "Detalhes do produto",
      detailsTitle: "Feitas para usar sempre",
      detailsDesc:
        "Um par para o look, um par para a gaveta, um par para presente. A coleção foi feita para ser fácil de usar e fácil de comprar de novo.",
      productNotes: [
        {
          title: "Conforto o dia todo",
          text: "Meias macias com elasticidade leve, acabamento limpo e ajuste pensado para escola, viagens e qualquer rotina.",
        },
        {
          title: "Designs marcantes",
          text: "Estilos inspirados em esporte, comida, dinheiro, Brasil e cultura pop para dar personalidade sem complicar o look.",
        },
        {
          title: "Compra fácil",
          text: "Escolha seus pares, monte uma rotação, revise o carrinho e finalize com preços definidos pelo seu país.",
        },
      ],
      whyKicker: "Por que comprar aqui",
      whyTitle: "Uma gaveta melhor começa aqui",
      whyDesc:
        "A OneMoreGood mantém a experiência clara: boas fotos, preços diretos, combos úteis e uma história que dá mais peso a cada pedido.",
      storePromise: "Promessa da loja",
      shopReasons: [
        "Estilos criativos para usar no dia a dia",
        "No Brasil: R$25 por par",
        "Preços para Brasil e EUA já integrados",
        "Cada compra ajuda a manter o trabalho local da OneMoreGood",
      ],
      openShop: "Abrir loja completa",
      impactCollaborations: "Impacto e doações",
      shopLabel: "Comprar",
    },
    organization: {
      chips: ["Doações", "Santa Terezinha", "Provas reais"],
      headline: "O trabalho social por trás da",
      headlineAccent: "OneMoreGood.",
      intro:
        "A OneMoreGood começa com produtos que as pessoas podem comprar e usar. A página de doações mostra para onde esse movimento pode ir: relações locais, ações práticas, vídeos, fotos e provas de que a missão está ativa.",
      shopToSupport: "Comprar e apoiar",
      backToSocks: "Voltar às meias",
      stats: [
        ["Local", "Pessoas e lugares específicos"],
        ["Visível", "Fotos e vídeos mostrando o trabalho"],
        ["Prático", "Necessidades claras, ações reais e atualizações diretas"],
      ],
      whereItStarts: "Onde começa",
      locationTitle: "Santa Terezinha, Pernambuco",
      locationText:
        "O ponto local que mantém a OneMoreGood específica, próxima e conectada a pessoas que podemos conhecer, ouvir e apoiar.",
      videosKicker: "Vídeos",
      videosTitle: "Veja o trabalho, não só as palavras",
      videosDesc:
        "A página de doações é construída com lugares e registros reais. Os vídeos ajudam quem apoia a entender as pessoas, o contexto e as relações por trás da missão.",
      videoLabel: "Vídeo de prova",
      watch: "Assistir",
      videos: [
        {
          title: "Passeio pela comunidade",
          text: "Um olhar mais próximo para o ambiente local conectado à missão e às futuras colaborações da OneMoreGood.",
        },
        {
          title: "Vídeo local de prova",
          text: "Mais um registro mostrando por que a marca mantém seu impacto conectado a pessoas e lugares reais.",
        },
      ],
      focusKicker: "Foco das doações",
      focusTitle: "Para onde o apoio pode ir",
      focusDesc:
        "A meta é escolher ações específicas o suficiente para acontecer, importantes o suficiente para importar e visíveis o suficiente para serem acompanhadas.",
      focusAreas: [
        {
          title: "Famílias",
          text: "Ajuda prática para famílias locais quando a necessidade é clara, possível e significativa.",
        },
        {
          title: "Crianças",
          text: "Colaborações ligadas a crianças, educação, atividades e momentos que fortalecem a comunidade.",
        },
        {
          title: "Provas",
          text: "Um registro público com fotos, vídeos, notas e atualizações para mostrar o trabalho por trás da marca.",
        },
      ],
      galleryKicker: "Galeria",
      galleryTitle: "Fotos da comunidade",
      galleryDesc:
        "Conforme a OneMoreGood cresce, esta página vira o registro visual das pessoas, lugares e colaborações ligados a cada rodada de apoio.",
      photoLabels: [
        "Atividades infantis",
        "Comunidade escolar",
        "Ação local",
        "Cenário local",
      ],
      openPhoto: "Abrir foto",
      closePhoto: "Fechar foto",
      connectKicker: "Como tudo se conecta",
      connectTitle: "Uma loja que pode continuar ajudando",
      connectDesc:
        "A loja cria movimento. As doações dão direção a esse movimento. Juntas, elas permitem que o cliente compre algo que gosta e acompanhe o bem que vem depois.",
      donationSteps: [
        {
          title: "Vender produtos que as pessoas querem",
          text: "A OneMoreGood começa com um produto real: meias criativas que as pessoas podem usar, presentear e comprar de novo.",
        },
        {
          title: "Atuar perto da necessidade",
          text: "O apoio é guiado por contexto local, relações de confiança e necessidades específicas que podem ser entendidas com clareza.",
        },
        {
          title: "Mostrar o que aconteceu",
          text: "Fotos, vídeos e atualizações transformam cada colaboração em um registro visível para quem apoia acompanhar.",
        },
      ],
      shopSocks: "Comprar meias",
      backHome: "Voltar ao início",
    },
    shop: {
      kicker: "Loja",
      headline: "Boas meias.",
      headlineAccent: "Impacto real.",
      intro:
        "Cada compra ajuda a OneMoreGood a doar a maior parte do lucro para o Instituto Semear em Pernambuco, Brasil.",
      search: "Buscar",
      clear: "Limpar",
      clearSearch: "Limpar busca",
      placeholder: "Buscar meias...",
      tip: "Dica: tente clássico, cano médio ou propósito",
      all: "Todos",
      filterByTag: "Filtrar por categoria",
      results: (count: number) => `${count} resultado${count === 1 ? "" : "s"}`,
      pricingUs: "Preços EUA: 1 par US$8 • 2 pares US$15 • checkout só nos EUA",
      pricingBr: "Preço Brasil: R$25,00 por par • checkout só no Brasil",
      cart: "Carrinho",
      noMatches: "Nenhum resultado",
      noMatchesText: "Tente outra busca ou limpe os filtros.",
      clearFilters: "Limpar filtros",
      sock: "Meia",
      add: "Adicionar",
      view: "Ver",
      purposeBacked: "+ compra com propósito",
      product: "Produto",
      close: "Fechar",
      addToCart: "Adicionar ao carrinho",
      keepShopping: "Continuar comprando",
      stockUnavailable: "Estoque indisponível",
      outOfStock: "Fora de estoque",
      inStock: "Em estoque",
      left: (count: number) => `${count} restantes`,
      openProduct: (title: string) => `Abrir ${title}`,
      addProduct: (title: string) => `Adicionar ${title} ao carrinho`,
    },
    cart: {
      closeCart: "Fechar carrinho",
      drawer: "Carrinho",
      yourCart: "Seu carrinho",
      close: "Fechar",
      empty: "Carrinho vazio",
      emptyText: "Adicione um par e ele aparecerá aqui.",
      remove: "Remover",
      clearCart: "Limpar carrinho",
      country: "País",
      subtotal: "Subtotal",
      promo: "Promoção (2 por US$15)",
      shipping: "Entrega",
      total: "Total",
      checkoutNote:
        "O checkout usa preços, estoque e regras de entrega do país detectado.",
      policiesBefore: "Ao finalizar, você concorda com as",
      policiesLink: "políticas de entrega e reembolso",
      policiesAfter: ".",
      contactTitle: "Fale conosco para comprar",
      contactText:
        "O checkout para este país é feito diretamente. Envie uma mensagem e ajudaremos a finalizar o pedido.",
      perOrder: "por pedido",
      email: "Email",
      instagram: "Instagram",
      addNote: "Adicionar observação",
      notePlaceholder: "Tamanho, entrega ou detalhes do pedido",
      sendMessage: "Enviar mensagem",
      cancel: "Cancelar",
      decrease: (title: string) => `Diminuir quantidade de ${title}`,
      increase: (title: string) => `Aumentar quantidade de ${title}`,
    },
  },
} as const
