
/* ========================================
   MOBILE NAVIGATION
======================================== */

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-navigation");
const siteHeader = document.querySelector(".site-header");



/* HEADER — HIDE ON SCROLL DOWN, SHOW ON SCROLL UP */
if (siteHeader) {
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function updateHeaderVisibility() {
    const currentScrollY = window.scrollY;
    const scrollDifference = currentScrollY - lastScrollY;

    // Always show the header at the top
    if (currentScrollY <= 30) {
      siteHeader.classList.remove("is-hidden");
      siteHeader.classList.remove("is-scrolled");
    } else {
      siteHeader.classList.add("is-scrolled");

      // Ignore tiny movements to prevent flickering
      if (scrollDifference > 6) {
        siteHeader.classList.add("is-hidden");
      } else if (scrollDifference < -6) {
        siteHeader.classList.remove("is-hidden");
      }
    }

    lastScrollY = currentScrollY;
    scrollTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateHeaderVisibility);
      scrollTicking = true;
    }
  }, { passive: true });

  updateHeaderVisibility();
}



if (menuToggle && primaryNavigation && siteHeader) {
  function closeMenu() {
    primaryNavigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  function openMenu() {
    primaryNavigation.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close after choosing a navigation link
  primaryNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close when clicking or tapping outside the header
  document.addEventListener("click", (event) => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    if (isOpen && !siteHeader.contains(event.target)) {
      closeMenu();
    }
  });

  // Close with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // Close the mobile menu when returning to desktop width
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
}






// HERO CAROUSEL
const heroCarousel = document.querySelector(".hero-carousel");

if (heroCarousel) {
  const slides = heroCarousel.querySelectorAll(".hero-slide");
  const dots = heroCarousel.querySelectorAll(".hero-dot");
  const prevButton = heroCarousel.querySelector(".hero-arrow-prev");
  const nextButton = heroCarousel.querySelector(".hero-arrow-next");

  let currentSlide = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    const depth = (i - currentSlide + slides.length) % slides.length;

    slide.classList.toggle("is-active", depth === 0);
    slide.setAttribute("aria-hidden", "false");

    // Give every garment its new position in the collection
    // Increase spacing between garments
    slide.style.setProperty("--depth-x", `${depth * 9}%`);
    slide.style.setProperty("--depth-scale", `${1.12 - depth * 0.08}`);
    slide.style.setProperty("--depth-layer", `${10 - depth}`);
    // Gradually fade garments further back
    slide.style.setProperty(
  "--depth-opacity",
  `${Math.max(0.16, 1 - depth * 0.18)}`
);
    slide.style.setProperty("--depth-blur", `${depth * 0.28}px`);
  });

  dots.forEach((dot, i) => {
    const isActive = i === currentSlide;

    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-pressed", String(isActive));
  });

  updateHeroVideos();
}



  prevButton?.addEventListener("click", () => {
    showSlide(currentSlide - 1);
  });

  nextButton?.addEventListener("click", () => {
    showSlide(currentSlide + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  // Swipe left or right on touchscreens
  heroCarousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  heroCarousel.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    showSlide(currentSlide + (deltaX < 0 ? 1 : -1));
  }, { passive: true });

  
  // Start the first slide
  showSlide(0);

  // Automatically change slides every 5 seconds
  setInterval(() => {
    showSlide(currentSlide + 1);
  }, 3000);

}




/* ========================================
   RESPONSIVE HERO VIDEO PLAYBACK
======================================== */

function updateHeroVideos() {
  document.querySelectorAll(".hero-slide").forEach((slide) => {
    const videos = slide.querySelectorAll(".hero-video");
    const isActive = slide.classList.contains("is-active");

    videos.forEach((video) => {
      if (isActive) {
        video.muted = true;
        video.playsInline = true;
        video.playbackRate =
  video.classList.contains("hero-video-mobile") &&
  slide.querySelector(".hero-video-mobile") &&
  slide.querySelector(".hero-video-mobile").closest(".hero-slide") === slide &&
  slide.querySelector("h1")?.textContent.includes("Signs & Banners")
    ? 0.7
    : 0.4;

        video.play().catch(() => {
          // Playback may be blocked by the browser.
        });
      } else {
        video.pause();
      }
    });
  });
}

/* Start the active slide's video */
if (heroCarousel) {
  updateHeroVideos();
}






  // Animate every hero title whenever its slide becomes active
  const heroTitles = heroCarousel.querySelectorAll(
    ".hero-content h1, .hero-content h2"
  );

  function animateHeroTitle(slide) {
    const title = slide.querySelector(".hero-content h1, .hero-content h2");

    if (!title) return;

    const originalText = title.getAttribute("aria-label")
      || title.textContent.trim();

    // Rebuild the title so its letters can animate again
    title.replaceChildren();

    let letterIndex = 0;

    originalText.split(" ").forEach((word, wordIndex) => {
      if (wordIndex > 0) {
        const space = document.createElement("span");
        space.className = "hero-word-space";
        space.setAttribute("aria-hidden", "true");
        title.appendChild(space);
      }

      [...word].forEach((character) => {
        const letter = document.createElement("span");
        letter.className = "hero-letter";
        letter.textContent = character;
        letter.setAttribute("aria-hidden", "true");
        letter.style.setProperty(
          "--letter-delay",
          `${letterIndex * 55}ms`
        );

        title.appendChild(letter);
        letterIndex++;
      });
    });

    title.setAttribute("aria-label", originalText);
  }

  function animateActiveHeroTitle() {
    const activeSlide = heroCarousel.querySelector(".hero-slide.is-active");

    if (activeSlide) {
      animateHeroTitle(activeSlide);
    }
  }







  
  

/* ========================================
   IG CUSTOM PRINTING — UPLOAD REQUEST DEMO
======================================== */

(() => {
  const fileInput = document.querySelector("#idea-file-input");
  const uploadBox = document.querySelector("#idea-upload-box");
  const uploadStatus = document.querySelector("#idea-upload-status");
  const modal = document.querySelector("#idea-request-modal");
  const modalFileList = document.querySelector("#idea-modal-file-list");
  const modalFileCount = document.querySelector("#idea-modal-file-count");
  const requestForm = document.querySelector("#idea-request-form");

  if (
    !fileInput || !uploadBox || !uploadStatus ||
    !modal || !modalFileList || !modalFileCount || !requestForm
  ) return;

  const allowedExtensions = [
    "pdf", "png", "jpg", "jpeg", "ai",
    "eps", "svg", "psd", "tif", "tiff"
  ];

  let selectedFiles = [];
  let previousFocus = null;

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function openModal() {
    previousFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("idea-modal-open");

    requestAnimationFrame(() => {
      modal.querySelector(".idea-modal__close")?.focus();
    });
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("idea-modal-open");
    previousFocus?.focus();
  }

  function renderFiles() {
    modalFileList.replaceChildren();

    selectedFiles.forEach((file, index) => {
      const row = document.createElement("div");
      row.className = "idea-demo-file";

      const check = document.createElement("span");
      check.className = "idea-demo-file__check";
      check.textContent = "✓";
      check.setAttribute("aria-label", "Selected");

      const details = document.createElement("div");
      details.className = "idea-demo-file__details";

      const name = document.createElement("strong");
      name.textContent = file.name;

      const size = document.createElement("span");
      size.textContent = formatSize(file.size);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${file.name}`);

      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderFiles();
      });

      details.append(name, size);
      row.append(check, details, remove);
      modalFileList.appendChild(row);
    });

    modalFileCount.textContent =
      `${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`;

    uploadStatus.textContent = selectedFiles.length
      ? `${selectedFiles.length} file(s) selected.`
      : "Have an idea but no design? That's fine, too.";
  }

  function addFiles(fileCollection) {
    const incomingFiles = Array.from(fileCollection);
    const rejected = [];

    incomingFiles.forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        rejected.push(file.name);
        return;
      }

      const duplicate = selectedFiles.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (!duplicate) selectedFiles.push(file);
    });

    renderFiles();

    if (rejected.length) {
      uploadStatus.textContent =
        `Unsupported file(s): ${rejected.join(", ")}`;
    }

    if (selectedFiles.length) {
      openModal();
    }
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files?.length) {
      addFiles(fileInput.files);
    }

    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadBox.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadBox.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadBox.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadBox.classList.remove("is-dragging");
    });
  });

  uploadBox.addEventListener("drop", (event) => {
    if (event.dataTransfer?.files?.length) {
      addFiles(event.dataTransfer.files);
    }
  });

  modal.querySelectorAll("[data-close-idea-modal]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedFiles.length) {
      alert("Please select at least one file.");
      closeModal();
      return;
    }

    if (!requestForm.reportValidity()) return;

    const formData = new FormData(requestForm);

    const request = {
      requestNumber: `IG-DEMO-${Date.now().toString().slice(-8)}`,
      submittedAt: new Date().toISOString(),
      customer: {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone")
      },
      project: {
        type: formData.get("projectType"),
        details: formData.get("details")
      },
      files: selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      mode: "Local demo — not sent to a server"
    };

    // Demo only: allow the request details to be saved locally.
    const blob = new Blob(
      [JSON.stringify(request, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const download = document.createElement("a");
    download.href = url;
    download.download = `${request.requestNumber}.json`;
    download.click();
    URL.revokeObjectURL(url);

    modal.querySelector(".idea-modal__dialog").innerHTML = `
      <div class="idea-demo-success">
        <div class="idea-demo-success__icon">✓</div>
        <h2>Request Created!</h2>
        <p>Your demo request number is:</p>
        <strong class="idea-demo-success__number"></strong>
        <p class="idea-demo-success__note">
          This is a local demo. No email was sent and your files
          were not uploaded to a server. A JSON summary was prepared
          for download.
        </p>
        <button type="button" class="idea-modal__submit">
          Done
        </button>
      </div>
    `;

    modal.querySelector(".idea-demo-success__number").textContent =
      request.requestNumber;

    modal.querySelector(".idea-modal__submit").addEventListener("click", () => {
      closeModal();
      selectedFiles = [];
      requestForm.reset();
      modal.querySelector(".idea-modal__dialog").innerHTML = originalDialog;
      bindSuccessForm();
      renderFiles();
    });
  });

  // Keep a copy of the original popup so it can be reset after a demo.
  const originalDialog = modal.querySelector(".idea-modal__dialog").innerHTML;

  function bindSuccessForm() {
    const form = modal.querySelector("#idea-request-form");
    if (!form) return;

    form.addEventListener("submit", handleSubmit);
  }

  function handleSubmit(event) {
    // The primary submit handler above is attached to the original form.
  }

  window.igUploadDemo = {
    getFiles: () => [...selectedFiles],
    clear: () => {
      selectedFiles = [];
      renderFiles();
    }
  };

  renderFiles();
})();














(() => {
  const section = document.querySelector(".ig-google-reviews");
  if (!section || section.dataset.igrReady === "true") return;

  section.dataset.igrReady = "true";

  const track = section.querySelector(".igr-track");
  const cards = [...section.querySelectorAll(".igr-card")];
  const prev = section.querySelector(".igr-prev");
  const next = section.querySelector(".igr-next");
  const dotsContainer = section.querySelector(".igr-dots");

  if (!track || !cards.length || !dotsContainer) return;

  let activeIndex = 0;
  let scrollFrame = null;

  // One dot per review card.
  const dots = cards.map((card, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "igr-dot";
    dot.setAttribute("aria-label", `Go to review ${index + 1}`);

    dot.addEventListener("click", () => {
      goToCard(index);
    });

    dotsContainer.appendChild(dot);
    return dot;
  });

  
function goToCard(index) {
  activeIndex = Math.max(0, Math.min(index, cards.length - 1));

  const targetPosition =
    cards[activeIndex].offsetLeft - cards[0].offsetLeft;

  track.scrollTo({
    left: targetPosition,
    behavior: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches ? "auto" : "smooth"
  });

  updateControls();
}


  function updateControls() {
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (prev) {
      prev.disabled = track.scrollLeft <= 2;
    }

    if (next) {
      const atEnd =
        track.scrollLeft + track.clientWidth >=
        track.scrollWidth - 3;

      next.disabled = atEnd;
    }
  }

  function detectActiveCard() {
    let nearestIndex = 0;
    let smallestDistance = Infinity;

    const trackLeft = track.getBoundingClientRect().left;

    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.getBoundingClientRect().left - trackLeft
      );

      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestIndex = index;
      }
    });

    activeIndex = nearestIndex;
    updateControls();
  }

  prev?.addEventListener("click", () => {
    goToCard(activeIndex - 1);
  });

  next?.addEventListener("click", () => {
    goToCard(activeIndex + 1);
  });

  track.addEventListener("scroll", () => {
    if (scrollFrame !== null) {
      cancelAnimationFrame(scrollFrame);
    }

    scrollFrame = requestAnimationFrame(() => {
      detectActiveCard();
      scrollFrame = null;
    });
  }, { passive: true });

  window.addEventListener("resize", detectActiveCard, {
    passive: true
  });

  updateControls();



  // Auto-slide every 5 seconds
  let autoSlideTimer;

  function startAutoSlide() {
    stopAutoSlide();

    autoSlideTimer = setInterval(() => {
      const nextIndex =
        activeIndex >= cards.length - 1 ? 0 : activeIndex + 1;

      goToCard(nextIndex);
    }, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideTimer);
  }

  // Pause while the visitor interacts with the carousel
  section.addEventListener("mouseenter", stopAutoSlide);
  section.addEventListener("mouseleave", startAutoSlide);

  section.addEventListener("focusin", stopAutoSlide);
  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) {
      startAutoSlide();
    }
  });

  // Restart after manual navigation
  prev?.addEventListener("click", startAutoSlide);
  next?.addEventListener("click", startAutoSlide);
  dotsContainer.addEventListener("click", startAutoSlide);

  // Start automatic sliding
  startAutoSlide();



  
})();





const footerYear = document.getElementById("ig-footer-year");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}







/* =========================================
   IG CUSTOM PRINTING
   COMPACT PRODUCT STRIP — INFINITE CAROUSEL
   Isolated from existing product carousels
========================================= */

(() => {
  "use strict";

  function initIGProductStrip() {
    const strips = document.querySelectorAll(".ig-product-strip");

    strips.forEach((strip) => {
      if (strip.dataset.infiniteReady === "true") return;

      const track = strip.querySelector(".ig-product-strip__track");
      if (!track) return;

      const originalItems = Array.from(track.children).filter(
        (item) => item.classList.contains("ig-product-strip__item")
      );

      if (originalItems.length < 2) return;

      strip.dataset.infiniteReady = "true";

      // Keep a clean copy of the original product cards.
      const originalCount = originalItems.length;

      // Duplicate the cards to create the seamless loop.
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("img").forEach((img) => {
          img.setAttribute("draggable", "false");
        });
        track.appendChild(clone);
      });

      let position = 0;
      let loopWidth = 0;
      let lastTime = 0;
      let animationFrame = 0;
      let isDragging = false;
      let isHovering = false;
      let dragStartX = 0;
      let dragStartPosition = 0;
      let lastPointerX = 0;
      let velocity = 0;
      let isVisible = true;

      // Pixels per second. Adjust for a slower or faster carousel.
      const speed = 24;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

      function measure() {
        const firstClone = track.children[originalCount];

        if (!firstClone) return;

        // Distance from the first original card to its matching clone.
        loopWidth = firstClone.offsetLeft - track.children[0].offsetLeft;

        if (loopWidth > 0) {
          position = normalize(position);
          render();
        }
      }

      function normalize(value) {
        if (!loopWidth) return 0;
        return ((value % loopWidth) + loopWidth) % loopWidth;
      }

      function render() {
        track.style.transform =
          `translate3d(${-position}px, 0, 0)`;
      }

      function animate(time) {
        animationFrame = requestAnimationFrame(animate);

        if (!lastTime) lastTime = time;

        // Prevent a large jump after switching tabs.
        const delta = Math.min((time - lastTime) / 1000, 0.04);
        lastTime = time;

        if (!isDragging && isVisible && !isHovering && !reducedMotion.matches) {
          position = normalize(position + speed * delta);
          render();
        } else if (!isDragging && Math.abs(velocity) > 0.1) {
          position = normalize(position + velocity * delta);
          velocity *= Math.pow(0.94, delta * 60);
          render();
        } else {
          velocity = 0;
        }
      }

      strip.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        isDragging = true;
        dragStartX = event.clientX;
        lastPointerX = event.clientX;
        dragStartPosition = position;
        velocity = 0;
        lastTime = 0;

        strip.classList.add("is-dragging");

        try {
          strip.setPointerCapture(event.pointerId);
        } catch (_) {}
      });

      strip.addEventListener("pointermove", (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - dragStartX;
        const pointerDelta = event.clientX - lastPointerX;

        position = normalize(dragStartPosition - deltaX);
        velocity = -pointerDelta * 12;
        lastPointerX = event.clientX;

        render();
      });

      function stopDragging() {
        if (!isDragging) return;

        isDragging = false;
        strip.classList.remove("is-dragging");
        lastTime = 0;
      }

      strip.addEventListener("pointerup", stopDragging);
      strip.addEventListener("pointercancel", stopDragging);
      strip.addEventListener("lostpointercapture", stopDragging);

      // Pause autoplay while the pointer is over the carousel.
      strip.addEventListener("mouseenter", () => {
        isHovering = true;
      });

      strip.addEventListener("mouseleave", () => {
        isHovering = false;
      });

      // Pause work while the strip is off-screen.
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
        });

        observer.observe(strip);
      }

      // Keep looping correctly when the layout changes.
      if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(strip);
        resizeObserver.observe(track);
      } else {
        window.addEventListener("resize", measure);
      }

      // Re-measure after product images finish loading.
      track.querySelectorAll("img").forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", measure, { once: true });
          img.addEventListener("error", measure, { once: true });
        }
      });

      measure();
      animationFrame = requestAnimationFrame(animate);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIGProductStrip, {
      once: true
    });
  } else {
    initIGProductStrip();
  }
})();



