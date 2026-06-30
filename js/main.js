/* ==========================================================================
   IVY JOURNAL / DIGITAL LIBRARY
   Main Script
   --------------------------------------------------------------------------
   Features:
   1. Bilingual Language System
   2. Video Audio Control
   3. Hero Section Visibility
   4. Dynamic Header Animation
   5. Digital Library Search
   6. Reading Mode
   7. Share Article
   8. Scroll Reveal Animation
   9. Active Navigation Link
   10. Deep Linking (#article-id)
   ========================================================================== */

/* ==========================================================================
   GLOBAL FUNCTIONS
   ========================================================================== */

/**
 * LANGUAGE SWITCHER
 * Mengubah seluruh elemen dengan class .translatable
 * berdasarkan data-en atau data-id
 */
window.switchLanguage = function (lang) {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(`btn-${lang}`)?.classList.add("active");

  document.documentElement.lang = lang;

  document.querySelectorAll(".translatable").forEach((el) => {
    const text = el.dataset[lang];

    if (text) {
      el.innerHTML = text;
    }
  });
};

/**
 * DIGITAL LIBRARY SEARCH
 * Filter pustaka berdasarkan judul, kategori, atau penulis
 */
window.executeLibrarySearch = function () {
  const input = document.getElementById("librarySearch");
  const filter = input.value.toLowerCase();

  const cards = document.querySelectorAll(".book-card");

  let visibleCount = 0;

  cards.forEach((card) => {
    const contentText = card
      .querySelector(".book-info")
      .textContent.toLowerCase();

    if (contentText.includes(filter)) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  const fallback = document.getElementById("noResultsElement");

  if (fallback) {
    fallback.style.display = visibleCount === 0 ? "block" : "none";
  }
};

/**
 * OPEN ARTICLE
 * Mengaktifkan Reading Mode
 */
window.openArticle = function (articleId) {
  const article = document.getElementById(articleId);

  if (!article) return;

  document.body.classList.add("reading-mode-active");

  document.getElementById("reading-overlay")?.classList.add("active");

  article.classList.add("is-reading");

  article.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/**
 * CLOSE ARTICLE
 * Menutup Reading Mode
 */
window.closeArticle = function () {
  document.body.classList.remove("reading-mode-active");

  document.getElementById("reading-overlay")?.classList.remove("active");

  document.querySelector(".is-reading")?.classList.remove("is-reading");
};

/**
 * SHARE ARTICLE LINK
 */
window.shareArticle = function (articleId) {
  const url = window.location.href.split("#")[0] + "#" + articleId;

  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert("Link copied to clipboard.");
    })
    .catch((err) => {
      console.error("Copy failed:", err);
    });
};

/* ==========================================================================
   DOM READY
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------------
     1. INITIAL LANGUAGE
     ------------------------------------------------------------------------ */

  switchLanguage("en");

  /* ------------------------------------------------------------------------
     2. VIDEO AUDIO CONTROL
     ------------------------------------------------------------------------ */

  const video = document.getElementById("cardVideo");
  const soundBtn = document.getElementById("soundToggleCard");
  const iconMuted = document.getElementById("icon-muted");
  const iconUnmuted = document.getElementById("icon-unmuted");

  if (video && soundBtn) {
    soundBtn.addEventListener("click", async () => {
      video.muted = !video.muted;

      try {
        await video.play();
      } catch (err) {
        console.error(err);
      }

      if (iconMuted && iconUnmuted) {
        iconMuted.style.display = video.muted ? "block" : "none";

        iconUnmuted.style.display = video.muted ? "none" : "block";
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. HERO VISIBILITY
     ------------------------------------------------------------------------ */

  const hero = document.querySelector(".hero-section");

  if (hero) {
    const updateHero = () => {
      if (window.scrollY < 50) {
        hero.classList.add("is-visible");
      } else if (window.scrollY > window.innerHeight * 0.4) {
        hero.classList.remove("is-visible");
      }
    };

    updateHero();

    window.addEventListener("scroll", updateHero, { passive: true });
  }

  /* ------------------------------------------------------------------------
     4. DYNAMIC HEADER PARALLAX
     ------------------------------------------------------------------------ */

  const header = document.getElementById("dynamic-header");

  if (header) {
    const container = header.querySelector(".ivy-container");

    setTimeout(() => {
      header.classList.add("is-loaded");
    }, 150);

    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;

        if (scrollY > header.offsetHeight) return;

        const translateY = scrollY * 0.3;

        const opacity = 1 - scrollY / (header.offsetHeight * 0.8);

        container.style.transform = `translateY(${translateY}px)`;

        container.style.opacity = Math.max(0, opacity).toString();
      },
      { passive: true },
    );
  }

  /* ------------------------------------------------------------------------
     5. SHAPE MORPH ANIMATION
     ------------------------------------------------------------------------ */

  setTimeout(() => {
    document.querySelectorAll(".shape-morph").forEach((el) => {
      el.classList.add("morphed");
    });
  }, 1500);

  /* ------------------------------------------------------------------------
     6. CURTAIN REVEAL ANIMATION
     ------------------------------------------------------------------------ */

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  document.querySelectorAll(".curtain-reveal").forEach((el) => {
    revealObserver.observe(el);
  });

  /* ------------------------------------------------------------------------
     7. ACTIVE NAVIGATION LINK
     ------------------------------------------------------------------------ */

  const currentLocation = window.location.pathname;

  document.querySelectorAll(".nav-links > li > a").forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) return;

    if (
      currentLocation === href ||
      (currentLocation.endsWith(href) && href !== "/")
    ) {
      link.classList.add("active");
    }
  });

  /* ------------------------------------------------------------------------
     8. CLOSE READING MODE
        Klik di luar artikel
     ------------------------------------------------------------------------ */

  document.addEventListener("click", (event) => {
    const activeArticle = document.querySelector(".is-reading");

    if (!activeArticle) return;

    if (!activeArticle.contains(event.target)) {
      closeArticle();
    }
  });

  /* ------------------------------------------------------------------------
     9. DEEP LINKING
        example:
        notes.html#article-1
     ------------------------------------------------------------------------ */

  if (window.location.hash) {
    const articleId = decodeURIComponent(window.location.hash.substring(1));

    if (document.getElementById(articleId)) {
      requestAnimationFrame(() => {
        openArticle(articleId);
      });
    }
  }
});

// 1. Inisialisasi Supabase
const SUPABASE_URL = "https://fnwbxizcfoltempaiwqj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud2J4aXpjZm9sdGVtcGFpd3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjUzMzEsImV4cCI6MjA5ODQwMTMzMX0.HHRuJ0h4a6ufoYM1SeHBqXlO1fJjfGOmv8gTEbMkZ2M";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Handle Submit Form
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Mencegah reload halaman

  // Ubah status tombol
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  statusMessage.style.display = "none";

  // Ambil data dari form
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const ratingValue = document.getElementById("rating").value;
  const message = document.getElementById("message").value.trim();

  // Gabungkan nama depan & belakang jika ada
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "Anonymous";

  // Konversi rating menjadi angka (Integer) untuk dicocokkan dengan tipe bigint di Supabase
  // Jika kosong (belum dipilih), set menjadi null
  const parsedRating = ratingValue ? parseInt(ratingValue, 10) : null;

  try {
    // Insert data ke tabel 'messages'
    const { data, error } = await supabaseClient.from("messages").insert([
      {
        name: fullName,
        email: email || null,
        rating: parsedRating, // Sekarang mengirimkan angka murni, bukan string
        message: message,
      },
    ]);

    if (error) throw error;

    // Berhasil
    statusMessage.textContent =
      "Thank you! Your message has been sent successfully.";
    statusMessage.className = "success";
    statusMessage.style.display = "block";

    // Reset form
    form.reset();
  } catch (error) {
    // Gagal
    console.error("Error submitting form:", error.message);
    statusMessage.textContent = "Oops! Something went wrong. Please try again.";
    statusMessage.className = "error";
    statusMessage.style.display = "block";
  } finally {
    // Kembalikan status tombol
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});
