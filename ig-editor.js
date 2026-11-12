
/* =====================================================
   IG CUSTOM PRINTING — PRODUCT CATALOG JAVASCRIPT
   Search, category filters, product count and navigation
===================================================== */

(() => {
  "use strict";

  const catalog = document.querySelector(".ig-catalog-page");

  // Do nothing on pages that don't contain the catalog.
  if (!catalog) return;

  const searchInput = catalog.querySelector("#ig-product-search");
  const categoryButtons = [
    ...catalog.querySelectorAll(".ig-category-button")
  ];
  const productCards = [
    ...catalog.querySelectorAll(".ig-product-card")
  ];
  const productCount = catalog.querySelector("#ig-product-count");
  const emptyMessage = catalog.querySelector("#ig-product-empty");
  const productGrid = catalog.querySelector("#ig-product-grid");

  let activeCategory = "all";
  let searchQuery = "";

  /* ================================================
     PRODUCT SEARCH AND CATEGORY FILTERING
  ================================================ */

  function filterProducts() {
    let visibleCount = 0;

    productCards.forEach((card) => {
      const category = card.dataset.category || "";
      const productName = card.dataset.productName || "";

      const heading = card.querySelector("h3")?.textContent || "";
      const description =
        card.querySelector(".ig-product-card__description")?.textContent || "";

      const searchableText = [
        productName,
        heading,
        description,
        category
      ].join(" ").toLowerCase();

      const matchesCategory =
        activeCategory === "all" ||
        category === activeCategory;

      const matchesSearch =
        searchQuery === "" ||
        searchableText.includes(searchQuery);

      const shouldShow = matchesCategory && matchesSearch;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount++;
      }
    });

    // Update the product count.
    if (productCount) {
      productCount.textContent =
        `${visibleCount} ${visibleCount === 1 ? "PRODUCT" : "PRODUCTS"}`;
    }

    // Show or hide the empty-state message.
    if (emptyMessage) {
      emptyMessage.hidden = visibleCount !== 0;
    }

    // Hide the grid when no products match.
    if (productGrid) {
      productGrid.hidden = visibleCount === 0;
    }
  }

  /* ================================================
     CATEGORY BUTTONS
  ================================================ */

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "all";

      categoryButtons.forEach((otherButton) => {
        const isActive = otherButton === button;

        otherButton.classList.toggle("is-active", isActive);
        otherButton.setAttribute(
          "aria-pressed",
          String(isActive)
        );
      });

      filterProducts();
    });
  });

  /* ================================================
     SEARCH INPUT
  ================================================ */

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      filterProducts();
    });
  }

  /* ================================================
     KEYBOARD SHORTCUT: CTRL/CMD + K
  ================================================ */

  document.addEventListener("keydown", (event) => {
    const isSearchShortcut =
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k";

    if (!isSearchShortcut) return;

    // Don't interfere with shortcuts on unrelated pages.
    if (!catalog.contains(document.activeElement)) return;

    event.preventDefault();
    searchInput?.focus();
  });

  /* ================================================
     INITIALIZE
  ================================================ */

  // Set the initial product count from the actual cards.
  filterProducts();

})();








/* =========================================
   IG CUSTOM STUDIO — ARTWORK UPLOAD
   Keeps uploaded artwork as reusable image data.
========================================= */
(() => {
  const studio = document.querySelector(".ig-studio");
  if (!studio) return;

  const fileInput = studio.querySelector("#studio-file-input");
  const artwork = studio.querySelector("#studio-artwork");
  const saveButton = studio.querySelector("#studio-save-side");
const message = studio.querySelector("#studio-message");
  
  const uploadTitle = studio.querySelector("#studio-upload-title");
  const uploadHelp = studio.querySelector("#studio-upload-help");

  if (!fileInput || !artwork) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      fileInput.value = "";
      if (message) {
        message.textContent =
          "Please upload a PNG, JPG, or WebP image.";
      }
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      fileInput.value = "";
      if (message) {
        message.textContent =
          "Your file is too large. Please choose an image under 10 MB.";
      }
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        if (message) {
          message.textContent = "Could not read that image.";
        }
        return;
      }

      const testImage = new Image();

      testImage.onload = () => {
        artwork.src = reader.result;
        artwork.hidden = false;

        if (uploadTitle) {
          uploadTitle.textContent = file.name;
        }

        if (uploadHelp) {
          uploadHelp.textContent =
            `${Math.round(file.size / 1024)} KB · Artwork uploaded`;
        }

        studio.dispatchEvent(
          new Event("studio:artwork-loaded")
        );

        if (message) {
          message.textContent = "Artwork uploaded successfully!";
        }
      };

      testImage.onerror = () => {
        if (message) {
          message.textContent =
            "This image could not be opened. Please try another file.";
        }
      };

      testImage.src = reader.result;
    };

    reader.onerror = () => {
      if (message) {
        message.textContent = "Could not read that image. Please try again.";
      }
    };

    reader.readAsDataURL(file);
  });
})();













/* IG STUDIO — SINGLE ARTWORK MOVE & RESIZE CONTROLLER */
(() => {
  const studio = document.querySelector(".ig-studio");
  if (!studio) return;

  const area = studio.querySelector("#studio-artwork-area");
  const editor = studio.querySelector("#studio-artwork-editor");
  const artwork = studio.querySelector("#studio-artwork");

  const saveButton = studio.querySelector("#studio-save-side");
const message = studio.querySelector("#studio-message");

  if (!area || !editor || !artwork) return;

  // Geometry is stored in pixels, not percentages.
  let width = 0;
  let x = 0;
  let y = 0;

  let selectedSide = "front";

const designs = {
  front: { src: "", width: 0, x: 0, y: 0, saved: false },
  back:  { src: "", width: 0, x: 0, y: 0, saved: false }
};

studio.__designs = designs;

  let action = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startLeft = 0;
  let startTop = 0;
  let aspect = 1;
  let activeHandle = "";

  const MIN_WIDTH = 35;

  
function storeCurrentDesign() {
  const design = designs[selectedSide];

  if (!design) return;

  design.src = artwork.getAttribute("src") || "";
  design.width = width;
  design.x = x;
  design.y = y;
}



function restoreDesign(side) {
  selectedSide = side;

  const design = designs[side];

  if (!design || !design.src) {
    artwork.removeAttribute("src");
    artwork.hidden = true;
    editor.hidden = true;

    width = 0;
    x = 0;
    y = 0;
  } else {
    artwork.src = design.src;
    artwork.hidden = false;
    editor.hidden = false;

    width = design.width;
    x = design.x;
    y = design.y;

    render();
  }

  editor.classList.remove("is-selected");
  updateSaveButton();
}



studio.addEventListener("studio:side-change", (event) => {
  storeCurrentDesign();
  restoreDesign(event.detail.side);
});


  function updateSaveButton() {
  if (!saveButton) return;

  const sideName = selectedSide === "front" ? "FRONT" : "BACK";
  const design = designs[selectedSide];

  saveButton.textContent = design.saved
    ? `✓ ${sideName} DESIGN SAVED`
    : `✓ SAVE ${sideName} DESIGN`;

  saveButton.classList.toggle("is-saved", design.saved);
}

if (saveButton) {
  saveButton.addEventListener("click", () => {
    const design = designs[selectedSide];

    if (!design.src || editor.hidden) {
      if (message) {
        message.textContent = `Please upload artwork for the ${selectedSide} first.`;
      }
      return;
    }

    design.src = artwork.getAttribute("src") || "";
    design.width = width;
    design.x = x;
    design.y = y;
    design.saved = true;

    updateSaveButton();

    if (message) {
      message.textContent = `${selectedSide === "front" ? "Front" : "Back"} design saved successfully!`;
    }
  });
}

  function render() {
  editor.style.width = `${width}px`;
  editor.style.height = "auto";
  editor.style.transform = `translate(${x}px, ${y}px)`;

  designs[selectedSide].src = artwork.getAttribute("src") || "";
  designs[selectedSide].width = width;
  designs[selectedSide].x = x;
  designs[selectedSide].y = y;
}

  function startInteraction(event) {
    if (editor.hidden || event.button !== 0) return;

    const handle = event.target.closest(".ig-resize-handle");

    action = handle ? "resize" : "move";
    activeHandle = handle?.dataset.handle || "";

    const rect = editor.getBoundingClientRect();

    startX = event.clientX;
    startY = event.clientY;
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = x;
    startTop = y;
    aspect = rect.width / Math.max(rect.height, 1);

    event.target.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveInteraction(event) {
    if (!action) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (action === "move") {
      x = startLeft + dx;
      y = startTop + dy;
      render();
      return;
    }

    // Corner signs determine the direction of resizing.
    const signX = activeHandle.endsWith("e") ? 1 : -1;
    const signY = activeHandle.startsWith("s") ? 1 : -1;

    // Project pointer movement onto the corner's diagonal.
    const projectedChange = dx * signX;

let nextWidth = startWidth + projectedChange;

    
const maxWidth = Math.max(
  MIN_WIDTH,
  area.getBoundingClientRect().width * 3
);

nextWidth = Math.max(
  MIN_WIDTH,
  Math.min(maxWidth, nextWidth)
);


    const nextHeight = nextWidth / aspect;

    // Keep the opposite corner anchored.
    x = startLeft + (signX < 0 ? startWidth - nextWidth : 0);
    y = startTop + (signY < 0 ? startHeight - nextHeight : 0);

    width = nextWidth;
    render();
  }

  function endInteraction() {
    action = null;
    activeHandle = "";
  }

  editor.addEventListener("pointerdown", startInteraction);
  editor.addEventListener("pointermove", moveInteraction);
  editor.addEventListener("pointerup", endInteraction);
  editor.addEventListener("pointercancel", endInteraction);
  editor.addEventListener("lostpointercapture", endInteraction);



    // Select artwork when clicked; deselect when clicking outside.
  function selectArtwork() {
    editor.classList.add("is-selected");
  }

  function deselectArtwork() {
    editor.classList.remove("is-selected");
  }

  editor.addEventListener("click", selectArtwork);

  document.addEventListener("pointerdown", (event) => {
    if (!editor.hidden && !editor.contains(event.target)) {
      deselectArtwork();
    }
  });


 studio.addEventListener("studio:artwork-loaded", () => {
  requestAnimationFrame(() => {
    width = area.getBoundingClientRect().width;
    x = 0;
    y = 0;
    editor.hidden = false;

    designs[selectedSide].saved = false;
    render();
    updateSaveButton();
  });
});


})();






/* =========================================
   IG STUDIO — T-SHIRT COLOR & SIDE PREVIEW
========================================= */
(() => {
  const studio = document.querySelector(".ig-studio");
  if (!studio) return;

  const productImage = studio.querySelector("#studio-product-image");
  const colorButtons = studio.querySelectorAll("[data-color]");
  const positionButtons = studio.querySelectorAll("[data-position]");

  if (!productImage) return;

  const imageFolder = "images/mock-up/t-shirt/";

  const colors = {
    "#171717": "black",
    "#f4f4f4": "white",
    "#777777": "grey",
    "#202b49": "blue",
    "#bd1727": "red",
    "#245b38": "green"
  };

  let selectedColor = "#171717";
  let selectedSide = "front";

  function updatePreview() {
    const colorName = colors[selectedColor] || "black";
    const imagePath = `${imageFolder}${colorName}-${selectedSide}.png`;

    productImage.onerror = () => {
      productImage.onerror = null;

      const message = studio.querySelector("#studio-message");
      if (message) {
        message.textContent = `Could not load ${imagePath}. Check the image filename and folder path.`;
      }
    };

    productImage.onload = () => {
      productImage.onerror = null;

      const message = studio.querySelector("#studio-message");
      if (message) message.textContent = "";
    };

    productImage.src = imagePath;
    console.log("Mockup path:", imagePath);
console.log("Loaded image:", productImage.currentSrc);
    productImage.alt = `${colorName} T-shirt, ${selectedSide} view`;
  }

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedColor = button.dataset.color || "#171717";

      colorButtons.forEach((otherButton) => {
        const isSelected = otherButton === button;
        otherButton.classList.toggle("is-selected", isSelected);
        otherButton.setAttribute("aria-pressed", String(isSelected));
      });

      updatePreview();


      



    });
  });

  positionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const side = button.dataset.position;

      // Sleeve mockups are not available yet.
      if (side === "sleeve") {
        const message = studio.querySelector("#studio-message");
        if (message) {
          message.textContent =
            "Sleeve preview will be available when sleeve mockups are added.";
        }
        return;
      }

      if (side !== "front" && side !== "back") return;

      selectedSide = side;

      studio.dispatchEvent(
  new CustomEvent("studio:side-change", {
    detail: { side }
  })
);

      positionButtons.forEach((otherButton) => {
        const isSelected = otherButton === button;
        otherButton.classList.toggle("is-selected", isSelected);
        otherButton.setAttribute("aria-pressed", String(isSelected));
      });

      updatePreview();
    });
  });

  updatePreview();

  const previewButton = studio.querySelector("#studio-preview");
const combinedPreview = studio.querySelector("#studio-combined-preview");



if (previewButton && combinedPreview) {
  const closeButton = studio.querySelector("#studio-close-preview");


async function renderShirtPreview(container, side, design) {
  container.replaceChildren();

  const colorName = colors[selectedColor] || "black";
  const imagePath = `${imageFolder}${colorName}-${side}.png`;

  const shirt = document.createElement("div");
  shirt.className = "studio-preview-shirt";

  const mockup = document.createElement("img");
  mockup.className = "studio-preview-shirt__mockup";
  mockup.src = imagePath;
  mockup.alt = `${colorName} T-shirt, ${side} view`;

  await new Promise((resolve, reject) => {
    mockup.onload = resolve;
    mockup.onerror = reject;
    if (mockup.complete && mockup.naturalWidth) resolve();
  });

  shirt.appendChild(mockup);
  container.appendChild(shirt);

  if (design && design.src) {
    console.log("Preview design:", side, design);
    const artwork = document.createElement("img");
    artwork.className = "studio-preview-shirt__artwork";
    artwork.src = design.src;
    artwork.alt = `${side} artwork`;

    await new Promise((resolve, reject) => {
      artwork.onload = resolve;
      artwork.onerror = reject;
      if (artwork.complete && artwork.naturalWidth) resolve();
    });



const area = studio.querySelector("#studio-artwork-area");
const product = studio.querySelector(".ig-studio__product");

if (area && product) {
  const areaRect = area.getBoundingClientRect();
  const productRect = product.getBoundingClientRect();
  const shirtRect = shirt.getBoundingClientRect();

  const scale = shirtRect.width / productRect.width;
  const artworkHeight =
    design.width * (artwork.naturalHeight / artwork.naturalWidth);

  artwork.style.position = "absolute";
  artwork.style.width = `${design.width * scale}px`;
  artwork.style.height = "auto";

  artwork.style.left =
    `${(
      areaRect.left - productRect.left +
      areaRect.width / 2 + design.x
    ) * scale}px`;

  artwork.style.top =
    `${(
      areaRect.top - productRect.top +
      (areaRect.height - artworkHeight) / 2 +
      design.y
    ) * scale}px`;

  artwork.style.transform = "translateX(-50%)";
}


shirt.appendChild(artwork);

    
  }
}



previewButton.addEventListener("click", async () => {
  const designs = studio.__designs;

  if (!designs) {
    console.error("Saved design data not found.");
    return;
  }

  const frontContainer = studio.querySelector("#studio-preview-front");
  const backContainer = studio.querySelector("#studio-preview-back");

  if (!frontContainer || !backContainer) return;

  // Show the preview first so its dimensions can be measured.
  combinedPreview.hidden = false;

  try {
    // Wait for the browser to lay out the visible preview.
    await new Promise(resolve => requestAnimationFrame(resolve));

    await Promise.all([
      renderShirtPreview(frontContainer, "front", designs.front),
      renderShirtPreview(backContainer, "back", designs.back)
    ]);
  } catch (error) {
    console.error("Could not render T-shirt preview:", error);
  }
});



  if (closeButton) {
    closeButton.addEventListener("click", () => {
      combinedPreview.hidden = true;
    });
  }


const downloadButton = studio.querySelector("#studio-download-preview");

if (downloadButton) {
  downloadButton.addEventListener("click", async () => {
    if (typeof html2canvas !== "function") {
      alert("Preview capture library is not loaded.");
      return;
    }

    const originalText = downloadButton.textContent;
    downloadButton.disabled = true;
    downloadButton.textContent = "Preparing PNG...";

    try {
      await document.fonts.ready;

      const canvas = await html2canvas(studio.querySelector("#studio-preview-capture"), {
        backgroundColor: "#111111",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false
      });

      const link = document.createElement("a");
      link.download = "ig-custom-printing-design-preview.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Preview capture failed:", error);
      alert("Could not create the PNG. Please try again.");
    } finally {
      downloadButton.disabled = false;
      downloadButton.textContent = originalText;
    }
  });
}

}


})();




