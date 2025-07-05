document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileSidebar = document.getElementById("mobileSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  // Toggle sidebar
  function toggleSidebar() {
    mobileSidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    document.body.style.overflow = mobileSidebar.classList.contains("active")
      ? "hidden"
      : "auto";
  }

  // Close sidebar
  function closeSidebar() {
    mobileSidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  // Event listeners
  mobileMenuToggle.addEventListener("click", toggleSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  // Handle dropdown toggles
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();

      const dropdownId = this.getAttribute("data-dropdown");
      const submenu = document.getElementById(dropdownId + "-submenu");
      const arrow = this.querySelector(".dropdown-arrow");

      // Close other dropdowns
      dropdownToggles.forEach((otherToggle) => {
        if (otherToggle !== this) {
          const otherDropdownId = otherToggle.getAttribute("data-dropdown");
          const otherSubmenu = document.getElementById(
            otherDropdownId + "-submenu"
          );
          const otherArrow = otherToggle.querySelector(".dropdown-arrow");

          otherSubmenu.classList.remove("active");
          otherArrow.classList.remove("rotated");
        }
      });

      // Toggle current dropdown
      submenu.classList.toggle("active");
      arrow.classList.toggle("rotated");
    });
  });

  // Close sidebar when clicking on a regular link (not dropdown)
  const regularLinks = document.querySelectorAll(
    ".sidebar-menu-link:not(.dropdown-toggle)"
  );
  regularLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeSidebar();
    });
  });

  // Close sidebar when clicking on submenu items
  const submenuItems = document.querySelectorAll(".sidebar-submenu-item");
  submenuItems.forEach((item) => {
    item.addEventListener("click", function () {
      closeSidebar();
    });
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1200) {
      closeSidebar();
    }
  });

  // Prevent scroll on body when sidebar is open
  mobileSidebar.addEventListener("touchmove", function (e) {
    if (mobileSidebar.classList.contains("active")) {
      e.stopPropagation();
    }
  });
});

// stacking cards animation

function updateCardStacking() {
  // Only run stacking animation on large screens
  if (window.innerWidth <= 1024) {
    return;
  }

  const stackingContainer = document.querySelector("#stacking-container");
  const cards = document.querySelectorAll("#card");

  const containerTop = stackingContainer.offsetTop;
  const containerHeight = stackingContainer.offsetHeight;
  const scrollY = window.scrollY;

  // Calculate progress through the stacking section (0 to 1)
  const progress = Math.max(
    0,
    Math.min(
      1,
      (scrollY - containerTop) / (containerHeight - window.innerHeight)
    )
  );

  cards.forEach((card, index) => {
    // Each card appears at different progress points
    const cardStartProgress = index / cards.length;
    const cardEndProgress = (index + 1) / cards.length;

    // Calculate individual card progress
    const cardProgress = Math.max(
      0,
      Math.min(
        1,
        (progress - cardStartProgress) / (cardEndProgress - cardStartProgress)
      )
    );

    if (progress >= cardStartProgress) {
      // Card should be visible and animating
      card.style.opacity = "1";

      // Responsive slide up distance based on screen size
      const isMobile = window.innerWidth <= 768;
      const slideUpDistance = isMobile ? 80 : 100;
      const stackOffset = isMobile ? index * 6 : index * 8;

      // Calculate Y position: slide up from bottom, then settle into stack position
      const finalY = -stackOffset;
      const startY = slideUpDistance;
      const currentY = startY + (finalY - startY) * cardProgress;

      // Scale effect: cards start slightly smaller and grow to full size, then shrink slightly when stacked
      const finalScale = Math.max(0.95, 1 - index * 0.02);
      const startScale = 0.9;
      const currentScale =
        startScale + (finalScale - startScale) * cardProgress;

      // Apply transform
      card.style.transform = `translateY(${currentY}px) scale(${currentScale})`;

      // Z-index increases with each new card
      card.style.zIndex = index + 1;
    } else {
      // Card hasn't appeared yet
      card.style.opacity = "0";
      const slideDistance = window.innerWidth <= 768 ? 80 : 100;
      card.style.transform = `translateY(${slideDistance}px) scale(0.9)`;
      card.style.zIndex = index + 1;
    }
  });
}

// Optimized scroll handler with debouncing for mobile
let ticking = false;
let lastScrollY = 0;

function handleScroll() {
  // Only handle scroll for large screens
  if (window.innerWidth <= 1024) {
    return;
  }

  const currentScrollY = window.scrollY;

  // Reduce frequency on mobile for better performance
  const isMobile = window.innerWidth <= 768;
  const scrollThreshold = isMobile ? 5 : 1;

  if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateCardStacking();
        ticking = false;
        lastScrollY = currentScrollY;
      });
      ticking = true;
    }
  }
}

// Throttled resize handler
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateCardStacking();
  }, 150);
}

// Initialize and add event listeners
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", handleResize);

// Initial call
updateCardStacking();

// Touch event handling for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartY = e.changedTouches[0].screenY;
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleScroll(); // Ensure animation updates after touch scroll
  },
  { passive: true }
);

// Prevent zoom on double tap for better UX
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  },
  { passive: false }
);

// Orientation change handler
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    updateCardStacking();
  }, 100);
});

// sliding

class ARKSlider {
  constructor() {
    this.sliderTrack = document.getElementById("sliderTrack");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.progressFill = document.getElementById("progressFill");

    this.currentIndex = 0;
    this.cardWidth = 350;
    this.gap = 30;
    this.cards = document.querySelectorAll(".moment-card");
    this.totalCards = this.cards.length;

    this.init();
    this.setupEventListeners();
    this.setupTouchEvents();
    this.updateSlider();
  }

  init() {
    // Calculate responsive card width
    this.updateCardWidth();
    window.addEventListener("resize", () => {
      this.updateCardWidth();
      this.updateSlider();
    });
  }

  updateCardWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 480) {
      this.cardWidth = 250;
      this.gap = 20;
    } else if (screenWidth <= 768) {
      this.cardWidth = 280;
      this.gap = 20;
    } else {
      this.cardWidth = 350;
      this.gap = 30;
    }
  }

  setupEventListeners() {
    this.prevBtn.addEventListener("click", () => this.previousSlide());
    this.nextBtn.addEventListener("click", () => this.nextSlide());

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.previousSlide();
      if (e.key === "ArrowRight") this.nextSlide();
    });
  }

  setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.sliderTrack.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.sliderTrack.style.transition = "none";
    });

    this.sliderTrack.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      const currentTransform = -(
        this.currentIndex *
        (this.cardWidth + this.gap)
      );
      this.sliderTrack.style.transform = `translateX(${
        currentTransform + diffX
      }px)`;
    });

    this.sliderTrack.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      isDragging = false;
      this.sliderTrack.style.transition =
        "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      const diffX = currentX - startX;
      const threshold = 50;

      if (diffX > threshold && this.currentIndex > 0) {
        this.previousSlide();
      } else if (diffX < -threshold && this.currentIndex < this.getMaxIndex()) {
        this.nextSlide();
      } else {
        this.updateSlider();
      }
    });

    // Mouse events for desktop
    let mouseStartX = 0;
    let mouseCurrentX = 0;
    let isMouseDragging = false;

    this.sliderTrack.addEventListener("mousedown", (e) => {
      mouseStartX = e.clientX;
      isMouseDragging = true;
      this.sliderTrack.style.transition = "none";
      this.sliderTrack.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isMouseDragging) return;
      mouseCurrentX = e.clientX;
      const diffX = mouseCurrentX - mouseStartX;
      const currentTransform = -(
        this.currentIndex *
        (this.cardWidth + this.gap)
      );
      this.sliderTrack.style.transform = `translateX(${
        currentTransform + diffX
      }px)`;
    });

    document.addEventListener("mouseup", (e) => {
      if (!isMouseDragging) return;
      isMouseDragging = false;
      this.sliderTrack.style.transition =
        "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      this.sliderTrack.style.cursor = "grab";

      const diffX = mouseCurrentX - mouseStartX;
      const threshold = 50;

      if (diffX > threshold && this.currentIndex > 0) {
        this.previousSlide();
      } else if (diffX < -threshold && this.currentIndex < this.getMaxIndex()) {
        this.nextSlide();
      } else {
        this.updateSlider();
      }
    });
  }

  getMaxIndex() {
    const containerWidth = this.sliderTrack.parentElement.offsetWidth;
    const cardsVisible = Math.floor(
      containerWidth / (this.cardWidth + this.gap)
    );
    return Math.max(0, this.totalCards - cardsVisible);
  }

  nextSlide() {
    if (this.currentIndex < this.getMaxIndex()) {
      this.currentIndex++;
      this.updateSlider();
    }
  }

  previousSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlider();
    }
  }

  updateSlider() {
    const translateX = -(this.currentIndex * (this.cardWidth + this.gap));
    this.sliderTrack.style.transform = `translateX(${translateX}px)`;

    // Update navigation buttons
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex >= this.getMaxIndex();

    // Update progress bar
    const progress = (this.currentIndex / this.getMaxIndex()) * 100;
    this.progressFill.style.width = `${progress}%`;

    // Add animation to cards
    this.cards.forEach((card, index) => {
      const delay = Math.abs(index - this.currentIndex) * 0.1;
      card.style.transitionDelay = `${delay}s`;
    });
  }
}

// Initialize slider when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ARKSlider();
});

// for faq

document.addEventListener("DOMContentLoaded", function () {
  const faqsQuestions = document.querySelectorAll(".faqs-question");

  faqsQuestions.forEach((question) => {
    const header = question.querySelector(".faqs-question-header");
    const content = question.querySelector(".faqs-question-content");
    const icon = question.querySelector(".faqs-question-icon");

    header.addEventListener("click", function () {
      const isActive = question.classList.contains("active");

      // Close all other questions
      faqsQuestions.forEach((q) => {
        if (q !== question) {
          const otherContent = q.querySelector(".faqs-question-content");
          const otherIcon = q.querySelector(".faqs-question-icon");

          // Set current height first, then animate to 0
          if (q.classList.contains("active")) {
            otherContent.style.maxHeight = otherContent.scrollHeight + "px";
            // Force reflow
            otherContent.offsetHeight;
            otherContent.style.maxHeight = "0";
          }

          q.classList.remove("active");
          otherIcon.textContent = "+";
        }
      });

      // Toggle current question
      if (isActive) {
        // Closing - set specific height first, then animate to 0
        content.style.maxHeight = content.scrollHeight + "px";

        // Force reflow
        content.offsetHeight;

        // Now animate to closed
        content.style.maxHeight = "0";
        question.classList.remove("active");
        icon.textContent = "+";
      } else {
        // Opening
        question.classList.add("active");
        icon.textContent = "×";

        // Set the height to the scroll height for smooth animation
        content.style.maxHeight = content.scrollHeight + "px";

        // Reset to auto after animation completes for responsive behavior
        setTimeout(() => {
          if (question.classList.contains("active")) {
            content.style.maxHeight = "none";
          }
        }, 400);
      }
    });
  });

  // Smooth scrolling for better UX
  const sections = document.querySelectorAll(".faqs-section");
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });
});
