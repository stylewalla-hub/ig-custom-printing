
/* =====================================================
   IG CUSTOM PRINTING — PRODUCT CATALOG INTERACTIONS
   Search • Filters • Product Details • Quote
===================================================== */

(() => {
  "use strict";

  const catalog = document.querySelector(".ig-catalog-page");
  if (!catalog) return;

  const searchInput = catalog.querySelector("#ig-product-search");
  const categoryButtons = [
    ...catalog.querySelectorAll(".ig-category-button")
  ];
  const productCards = [
    ...catalog.querySelectorAll(".ig-product-card")
  ];

  const productGrid = catalog.querySelector("#ig-product-grid");
  const productCount = catalog.querySelector("#ig-product-count");
  const emptyMessage = catalog.querySelector("#ig-product-empty");

  const modal = catalog.querySelector("#ig-product-modal");

  if (!modal) return;

  const modalImage = modal.querySelector("#ig-modal-image");
  const modalCategory = modal.querySelector("#ig-modal-category");
  const modalTitle = modal.querySelector("#ig-modal-title");
  const modalDescription = modal.querySelector("#ig-modal-description");
  const modalDetails = modal.querySelector("#ig-modal-details");
  const modalQuote = modal.querySelector("#ig-modal-quote");

  const requestedCategory = new URLSearchParams(
  window.location.search
).get("category");

let activeCategory = categoryButtons.some(
  button => button.dataset.category === requestedCategory
)
  ? requestedCategory
  : "all";
  let searchQuery = "";
  /* ================================================
   UPDATE SIDEBAR CATEGORY COUNTS
================================================ */

function updateCategoryCounts() {
  const counts = {
    all: productCards.length
  };

  productCards.forEach((card) => {
    const category = card.dataset.category || "";

    counts[category] = (counts[category] || 0) + 1;
  });

  categoryButtons.forEach((button) => {
    const category = button.dataset.category || "all";

    let countElement = button.querySelector(".ig-category-count");

    if (!countElement) {
      countElement = document.createElement("span");
      countElement.className = "ig-category-count";
      button.appendChild(countElement);
    }

    countElement.dataset.count = category;
    countElement.textContent = counts[category] || 0;
  });
}
  let lastFocusedElement = null;


  /* =========================================
     CATEGORY NAMES
  ========================================= */

  const categoryNames = {
    apparel: "CUSTOM APPAREL",
    signs: "SIGNS & BANNERS",
    printing: "BUSINESS PRINTING",
    promotional: "PROMOTIONAL PRODUCTS",
    stickers: "STICKERS & DECALS",
    events: "EVENT & TRADE SHOW",
    vehicle: "VEHICLE GRAPHICS",
    embroidery: "EMBROIDERY & TEAMWEAR"
  };



/* =========================================
   IG SMART SEARCH ENGINE
========================================= */

// Product and industry search synonyms
const productSearchSynonyms = {
  "t-shirt": "t shirts tee tees tshirt tshirts shirt shirts custom clothing apparel uniform",
  "hoodie": "hoodies sweatshirt sweatshirts pullover fleece",
  "polo shirt": "polo polos golf shirt uniform workwear",
  "long sleeve shirt": "long sleeve longsleeve full sleeve",
  "custom jackets": "jacket jackets coat coats outerwear",
  "tank tops": "tank top sleeveless vest muscle shirt",
  "crewneck sweatshirts": "crewneck crew neck sweatshirt",
  "zip-up hoodies": "zip hoodie zipup zipper hoodie",
  "performance shirts": "sports shirt athletic shirt dry fit dri fit",
  "athletic jerseys": "jersey jerseys sports uniform team jersey",
  "sportswear": "sports clothing athletic wear activewear",
  "work shirts": "workwear uniform employee clothing",
  "workwear": "work clothes work uniform",
  "tank jerseys": "sleeveless jersey basketball jersey",
  "aprons": "apron kitchen uniform chef apron",
  "custom shorts": "shorts athletic shorts",
  "windbreakers": "wind breaker jacket",
  "custom beanies": "beanie beanies winter hat caps",

  "vinyl banners": "banner banners flex banner outdoor advertising",
  "retractable banners": "roll up banner pull up banner stand banner",
  "a-frame signs": "a frame sidewalk sign sandwich board",
  "yard signs": "lawn signs garden signs real estate lawn sign",
  "acrylic signs": "plexiglass signs clear plastic signage",
  "real estate signs": "property signs realtor signs for sale signs",
  "construction signs": "jobsite signs contractor signs worksite signs",
  "corrugated plastic signs": "coroplast signs coro signs plastic yard signs",
  "aluminum signs": "metal aluminum panel signage",
  "metal signs": "steel signs aluminium signs",
  "pvc signs": "plastic pvc board signs",
  "foam board signs": "foamcore foam core display boards",
  "storefront signs": "shop signs business front signage",
  "window signs": "window graphics glass signs shop window lettering",
  "wall signs": "wall graphics indoor signage",
  "floor graphics": "floor decals floor stickers",
  "directional signs": "wayfinding signs navigation signs",
  "parking signs": "parking lot signs traffic signs",
  "safety signs": "warning signs caution signs workplace signs",
  "mesh banners": "mesh fence banner wind resistant banner",
  "fabric banners": "cloth banners textile banners",
  "feather flags": "feather flag teardrop advertising flags",
  "teardrop flags": "teardrop flag beach flag promotional flag",
  "illuminated signs": "lighted signs led signs backlit signs lightbox",

  "business cards": "visiting cards name cards contact cards calling cards business card printing",
  "flyers": "leaflets handouts pamphlets promotional flyers",
  "brochures": "booklets pamphlets folded leaflets",
  "postcards": "mail cards direct mail cards promotional cards",
  "rack cards": "rackcard display cards hotel cards",
  "door hangers": "doorhanger door knob hangers advertising hangers",
  "booklets": "booklet catalogs catalogues multi page printing",
  "product catalogs": "product catalog product catalogue lookbook",
  "restaurant menus": "menu menus takeaway menu food menu cafe menu",
  "presentation folders": "pocket folders document folders business folders",
  "letterheads": "letter head stationery company stationery",
  "envelopes": "printed envelope mailing envelopes",
  "notepads": "note pads memo pads writing pads",
  "invitations": "invite invites invitation cards event invitations",
  "greeting cards": "greeting card holiday cards thank you cards",
  "posters": "poster prints large format prints advertising posters",
  "calendars": "calendar wall calendar desk calendar",
  "carbonless forms": "ncr forms duplicate forms triplicate forms invoice books",
  "tickets": "event tickets admission tickets raffle tickets",
  "table tents": "tent cards tabletop displays menu tents",

  "custom pens": "pen pens ballpoint pens promotional pens",
  "keychains": "key chains key rings keyrings",
  "branded notebooks": "notebook notebooks journals diaries",
  "water bottles": "bottle bottles drink bottles reusable bottles",
  "tumblers": "tumbler travel mugs insulated cups",
  "coffee mugs": "mug mugs cups drinkware",
  "tote bags": "tote bag shopping bags reusable bags",

  "stickers": "sticker stickers labels adhesive labels decals",
  "decals": "decal decals vinyl stickers graphics",
  "vehicle graphics": "car graphics auto graphics truck graphics vehicle lettering",
  "vehicle wraps": "car wrap truck wrap van wrap vinyl wrap",
  "embroidery": "embroidered stitching thread logo embroidery",
  "teamwear": "team clothing sports uniforms jerseys"
};

// Category synonyms
const categorySearchSynonyms = {
  apparel: "clothing clothes garments uniforms shirts wear",
  signs: "sign signage signboards boards banners displays",
  printing: "print prints printed paper stationery marketing",
  promotional: "promo merchandise giveaways gifts branded items",
  stickers: "sticker labels decals adhesive vinyl",
  events: "event exhibition trade show expo display",
  vehicle: "car auto truck van vehicle automotive",
  embroidery: "embroidered stitching thread sewn"
};

// Normalize search text
function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Calculate spelling difference between two words
function getEditDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from(
    { length: b.length + 1 },
    (_, i) => i
  );

  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const current = row[j];

      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1)
      );

      previous = current;
    }
  }

  return row[b.length];
}

// Check whether two words are close in spelling
function isFuzzyWordMatch(searchWord, productWord) {
  if (searchWord === productWord) return true;

  if (
    searchWord.length >= 3 &&
    productWord.startsWith(searchWord)
  ) {
    return true;
  }

  if (Math.abs(searchWord.length - productWord.length) > 2) {
    return false;
  }

  const distance = getEditDistance(searchWord, productWord);

  const allowedErrors =
    searchWord.length >= 8 ? 2 :
    searchWord.length >= 5 ? 1 : 0;

  return distance <= allowedErrors;
}




/* =========================================
   SMART PRODUCT FILTERING
========================================= */

function filterProducts() {

  let visibleCount = 0;

  const query = normalizeSearchText(searchQuery);
  const searchWords = query.split(" ").filter(Boolean);

  productCards.forEach((card, index) => {

    const category = card.dataset.category || "";
    const name = card.dataset.productName || "";
    const description = card.dataset.description || "";

    const normalizedName = normalizeSearchText(name);
    const normalizedDescription = normalizeSearchText(description);
    const normalizedCategory = normalizeSearchText(
      categoryNames[category] || category
    );

    // Product-specific synonyms
    const synonymKey = Object.keys(productSearchSynonyms)
      .find(key => normalizeSearchText(key) === normalizedName);

    const synonyms = synonymKey
      ? normalizeSearchText(productSearchSynonyms[synonymKey])
      : "";

    // Category synonyms
    const categoryKeywords = normalizeSearchText(
      categorySearchSynonyms[category] || ""
    );

    // Complete searchable content
    const searchableText = normalizeSearchText([
      name,
      description,
      category,
      categoryNames[category] || "",
      card.textContent,
      synonyms,
      categoryKeywords
    ].join(" "));

    const searchableWords = [...new Set(searchableText.split(" "))];

    const matchesCategory =
      activeCategory === "all" ||
      category === activeCategory;

    let relevanceScore = 0;

    if (query) {

      // Exact phrase matches
      if (normalizedName === query) {
        relevanceScore += 100;
      } else if (normalizedName.includes(query)) {
        relevanceScore += 70;
      }

      if (normalizedDescription.includes(query)) {
        relevanceScore += 20;
      }

      if (synonyms.includes(query)) {
        relevanceScore += 45;
      }

      // Individual word matching
      let matchedWords = 0;

      searchWords.forEach(searchWord => {

        let bestMatch = 0;

        searchableWords.forEach(productWord => {

          if (searchWord === productWord) {
            bestMatch = Math.max(bestMatch, 15);
          } else if (
            productWord.startsWith(searchWord) &&
            searchWord.length >= 3
          ) {
            bestMatch = Math.max(bestMatch, 10);
          } else if (
            isFuzzyWordMatch(searchWord, productWord)
          ) {
            bestMatch = Math.max(bestMatch, 7);
          }

        });

        if (bestMatch > 0) {
          matchedWords++;
          relevanceScore += bestMatch;
        }

      });

      // Require every search word to match
      if (matchedWords !== searchWords.length) {
        relevanceScore = 0;
      }

    } else {
      relevanceScore = 1;
    }

    const matchesSearch =
      !query || relevanceScore > 0;

    const visible = matchesCategory && matchesSearch;

    card.hidden = !visible;

    // Higher relevance appears first
    card.style.order = query
      ? String(-relevanceScore)
      : String(index);

    if (visible) {
      visibleCount++;
    }

  });

  // Update product count
  if (productCount) {
    productCount.textContent =
      `${visibleCount} ${visibleCount === 1 ? "PRODUCT" : "PRODUCTS"}`;
  }

  // Keep category counts unchanged
  categoryButtons.forEach(button => {

    const category = button.dataset.category;
    const countElement = button.querySelector(".ig-category-count");

    if (!countElement) return;

    const count = category === "all"
      ? productCards.length
      : productCards.filter(card =>
          card.dataset.category === category
        ).length;

    countElement.textContent = count;

  });

  // Empty state
  if (emptyMessage) {
    emptyMessage.hidden = visibleCount !== 0;
  }

  if (productGrid) {
    productGrid.hidden = visibleCount === 0;
  }

}



  /* =========================================
     CATEGORY NAVIGATION
  ========================================= */

  categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

      activeCategory = button.dataset.category || "all";

      categoryButtons.forEach(item => {

        const active = item === button;

        item.classList.toggle("is-active", active);

        item.setAttribute(
          "aria-pressed",
          String(active)
        );

      });

      filterProducts();

    });

  });


/* =========================================
   SMART LIVE SEARCH INPUT
========================================= */

if (searchInput) {

  searchInput.addEventListener("input", () => {

    searchQuery = searchInput.value.trim();

    filterProducts();

  });

}


  /* =========================================
     PRODUCT DETAIL MODAL
  ========================================= */

  function openProduct(card) {

    const productName = card.dataset.productName || "Product";

    const description =
      card.dataset.description || "Contact our team for more information about this product.";

    const category = card.dataset.category || "";

    const image = card.querySelector(".ig-product-card__image img");

    if (!image) return;

    lastFocusedElement = document.activeElement;

    modalImage.src = image.src;
    modalImage.alt = image.alt || productName;

    modalCategory.textContent =
      categoryNames[category] || "IG CUSTOM PRINTING";

    modalTitle.textContent = productName;

    modalDescription.textContent = description;

    // Reserved for future product-specific specifications.
    modalDetails.replaceChildren();

    // Dynamic quote email

    modalQuote.href =
      `mailto:sales@igteam.com?subject=${encodeURIComponent(
        "Quote Request - " + productName
      )}`;

    // Move modal outside the main content to avoid
    // clipping from the catalogue's overflow settings.

    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const closeButton = modal.querySelector(
      ".ig-product-modal__close"
    );

    closeButton?.focus();

  }


  /* =========================================
     OPEN PRODUCT ON CLICK
  ========================================= */

  productCards.forEach(card => {

    const button = card.querySelector(
      ".ig-product-card__button"
    );

    button?.addEventListener("click", () => {
      openProduct(card);
    });

  });


  /* =========================================
     CLOSE MODAL
  ========================================= */

  function closeProduct() {

    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");

    modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    modalImage.removeAttribute("src");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }

  }


  modal.querySelectorAll("[data-close-modal]").forEach(element => {

    element.addEventListener("click", closeProduct);

  });


  // Escape key

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
      closeProduct();
    }

  });


  // Keep modal focus inside while open

  modal.addEventListener("keydown", event => {

    if (event.key !== "Tab") return;

    const focusable = [
      ...modal.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled])'
      )
    ].filter(element => element.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }

  });


  /* =========================================
     SEARCH SHORTCUT — CTRL / CMD + K
  ========================================= */

  document.addEventListener("keydown", event => {

    const shortcut =
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k";

    if (!shortcut || !searchInput) return;

    if (modal.classList.contains("is-open")) return;

    event.preventDefault();
    searchInput.focus();



  });



  // Apply category selected through the URL
categoryButtons.forEach(button => {
  const active = button.dataset.category === activeCategory;

  button.classList.toggle("is-active", active);
  button.setAttribute("aria-pressed", String(active));
});


  /* =========================================
     INITIALIZE
  ========================================= */

  // Initialize category counts and product filtering.
updateCategoryCounts();
filterProducts();

})();
