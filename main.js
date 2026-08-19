/* ==========================================================================
   IVY JOURNAL / DIGITAL LIBRARY
   Main Script

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
   10. Deep Linking
   11. Supabase Contact Form
   ========================================================================== */


/* ==========================================================================
   GLOBAL FUNCTIONS
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. LANGUAGE SWITCHER
   -------------------------------------------------------------------------- */

function switchLanguage(lang) {
  // Hanya menerima bahasa yang tersedia
  if (lang !== "en" && lang !== "id") return;

  // Ganti semua elemen translatable
  document.querySelectorAll(".translatable").forEach((element) => {
    const translatedText = element.getAttribute(`data-${lang}`);

    if (translatedText !== null) {
      element.textContent = translatedText;
    }
  });

  // Update tombol bahasa aktif
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.remove("active");
  });

  const activeButton = document.getElementById(`btn-${lang}`);

  if (activeButton) {
    activeButton.classList.add("active");
  }

  // Simpan pilihan bahasa
  localStorage.setItem("language", lang);

  // Update atribut bahasa HTML
  document.documentElement.lang = lang;
}

// Supaya bisa dipanggil dari HTML
window.switchLanguage = switchLanguage;


/* --------------------------------------------------------------------------
   2. DIGITAL LIBRARY SEARCH
   -------------------------------------------------------------------------- */

window.executeLibrarySearch = function () {
  const input = document.getElementById("librarySearch");

  if (!input) return;

  const filter = input.value.toLowerCase().trim();

  const cards = document.querySelectorAll(".book-card");

  let visibleCount = 0;

  cards.forEach((card) => {
    const bookInfo = card.querySelector(".book-info");

    if (!bookInfo) return;

    const contentText =
      bookInfo.textContent.toLowerCase();

    if (contentText.includes(filter)) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Tampilkan pesan jika tidak ada hasil
  const fallback =
    document.getElementById("noResultsElement");

  if (fallback) {
    fallback.style.display =
      visibleCount === 0 ? "block" : "none";
  }
};


/* --------------------------------------------------------------------------
   3. OPEN ARTICLE
   -------------------------------------------------------------------------- */

window.openArticle = function (articleId) {
  const article =
    document.getElementById(articleId);

  if (!article) return;

  // Tutup artikel lain jika ada
  document
    .querySelectorAll(".is-reading")
    .forEach((item) => {
      item.classList.remove("is-reading");
    });

  // Aktifkan reading mode
  document.body.classList.add(
    "reading-mode-active",
  );

  // Aktifkan overlay
  document
    .getElementById("reading-overlay")
    ?.classList.add("active");

  // Aktifkan artikel
  article.classList.add("is-reading");

  // Update URL hash
  history.replaceState(
    null,
    "",
    `#${encodeURIComponent(articleId)}`,
  );

  // Scroll artikel ke atas
  article.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};


/* --------------------------------------------------------------------------
   4. CLOSE ARTICLE
   -------------------------------------------------------------------------- */

window.closeArticle = function () {
  // Nonaktifkan reading mode
  document.body.classList.remove(
    "reading-mode-active",
  );

  // Hilangkan overlay
  document
    .getElementById("reading-overlay")
    ?.classList.remove("active");

  // Hapus status reading dari artikel
  document
    .querySelectorAll(".is-reading")
    .forEach((article) => {
      article.classList.remove("is-reading");
    });

  // Hapus hash dari URL
  history.replaceState(
    null,
    "",
    window.location.pathname +
      window.location.search,
  );
};


/* --------------------------------------------------------------------------
   5. SHARE ARTICLE
   -------------------------------------------------------------------------- */

window.shareArticle = async function (articleId) {
  const url =
    window.location.href.split("#")[0] +
    "#" +
    articleId;

  // Jika browser mendukung Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        url: url,
      });

      return;
    } catch (error) {
      // Jika user membatalkan share, jangan tampilkan error
      if (error.name === "AbortError") return;

      console.error("Share failed:", error);
    }
  }

  // Fallback: copy link
  try {
    await navigator.clipboard.writeText(url);

    alert("Link copied to clipboard.");
  } catch (error) {
    console.error("Copy failed:", error);

    alert("Unable to copy the link.");
  }
};


/* ==========================================================================
   SUPABASE CONFIGURATION
   ========================================================================== */

// Pastikan library Supabase sudah dimuat di HTML
const SUPABASE_URL =
  "https://fnwbxizcfoltempaiwqj.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud2J4aXpjZm9sdGVtcGFpd3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjUzMzEsImV4cCI6MjA5ODQwMTMzMX0.HHRuJ0h4a6ufoYM1SeHBqXlO1fJjfGOmv8gTEbMkZ2M";

let supabaseClient = null;

// Cek apakah Supabase tersedia
if (typeof supabase !== "undefined") {
  const { createClient } = supabase;

  supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );
} else {
  console.warn(
    "Supabase library is not loaded.",
  );
}


/* ==========================================================================
   DOM READY
   ========================================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* ----------------------------------------------------------------------
       1. INITIAL LANGUAGE
       ---------------------------------------------------------------------- */

    const savedLanguage =
      localStorage.getItem("language") || "en";

    switchLanguage(savedLanguage);


    /* ----------------------------------------------------------------------
       2. VIDEO AUDIO CONTROL
       ---------------------------------------------------------------------- */

    const video =
      document.getElementById("cardVideo");

    const soundBtn =
      document.getElementById("soundToggleCard");

    const iconMuted =
      document.getElementById("icon-muted");

    const iconUnmuted =
      document.getElementById("icon-unmuted");


    if (video && soundBtn) {

      // Set icon awal
      if (iconMuted && iconUnmuted) {
        iconMuted.style.display =
          video.muted ? "block" : "none";

        iconUnmuted.style.display =
          video.muted ? "none" : "block";
      }


      soundBtn.addEventListener(
        "click",
        async () => {

          // Toggle mute
          video.muted = !video.muted;


          // Coba jalankan video
          try {
            await video.play();
          } catch (error) {
            console.error(
              "Video play error:",
              error,
            );
          }


          // Update icon
          if (iconMuted && iconUnmuted) {

            iconMuted.style.display =
              video.muted
                ? "block"
                : "none";

            iconUnmuted.style.display =
              video.muted
                ? "none"
                : "block";
          }
        },
      );
    }


    /* ----------------------------------------------------------------------
       3. HERO VISIBILITY
       ---------------------------------------------------------------------- */

    const hero =
      document.querySelector(".hero-section");


    if (hero) {

      const updateHero = () => {

        if (window.scrollY < 50) {

          hero.classList.add(
            "is-visible",
          );

        } else if (
          window.scrollY >
          window.innerHeight * 0.4
        ) {

          hero.classList.remove(
            "is-visible",
          );
        }
      };


      // Jalankan pertama kali
      updateHero();


      // Jalankan saat scroll
      window.addEventListener(
        "scroll",
        updateHero,
        {
          passive: true,
        },
      );
    }


    /* ----------------------------------------------------------------------
       4. DYNAMIC HEADER PARALLAX
       ---------------------------------------------------------------------- */

    const header =
      document.getElementById(
        "dynamic-header",
      );


    if (header) {

      const container =
        header.querySelector(
          ".ivy-container",
        );


      // Animasi awal
      setTimeout(() => {

        header.classList.add(
          "is-loaded",
        );

      }, 150);


      if (container) {

        window.addEventListener(
          "scroll",
          () => {

            const scrollY =
              window.scrollY;


            // Jika sudah melewati header
            if (
              scrollY >
              header.offsetHeight
            ) {
              return;
            }


            const translateY =
              scrollY * 0.3;


            const opacity =
              1 -
              scrollY /
                (
                  header.offsetHeight *
                  0.8
                );


            container.style.transform =
              `translateY(${translateY}px)`;


            container.style.opacity =
              Math.max(
                0,
                opacity,
              ).toString();

          },
          {
            passive: true,
          },
        );
      }
    }


    /* ----------------------------------------------------------------------
       5. SHAPE MORPH ANIMATION
       ---------------------------------------------------------------------- */

    setTimeout(() => {

      document
        .querySelectorAll(
          ".shape-morph",
        )
        .forEach((element) => {

          element.classList.add(
            "morphed",
          );

        });

    }, 1500);


    /* ----------------------------------------------------------------------
       6. CURTAIN REVEAL ANIMATION
       ---------------------------------------------------------------------- */

    if (
      "IntersectionObserver" in window
    ) {

      const revealObserver =
        new IntersectionObserver(
          (
            entries,
            observer,
          ) => {

            entries.forEach(
              (entry) => {

                if (
                  entry.isIntersecting
                ) {

                  entry.target.classList.add(
                    "is-visible",
                  );

                  observer.unobserve(
                    entry.target,
                  );
                }
              },
            );
          },
          {
            threshold: 0.1,
            rootMargin:
              "0px 0px -50px 0px",
          },
        );


      document
        .querySelectorAll(
          ".curtain-reveal",
        )
        .forEach((element) => {

          revealObserver.observe(
            element,
          );

        });
    }


    /* ----------------------------------------------------------------------
       7. ACTIVE NAVIGATION LINK
       ---------------------------------------------------------------------- */

    const currentPage =
      window.location.pathname
        .split("/")
        .pop() || "index.html";


    document
      .querySelectorAll(
        ".nav-links > li > a",
      )
      .forEach((link) => {

        const href =
          link.getAttribute("href");

        if (!href) return;


        // Bersihkan path
        const linkPage =
          href
            .split("/")
            .pop()
            .split("#")[0];


        if (
          linkPage === currentPage
        ) {

          link.classList.add(
            "active",
          );
        }
      });


    /* ----------------------------------------------------------------------
       8. CLOSE READING MODE
       ---------------------------------------------------------------------- */

    document.addEventListener(
      "click",
      (event) => {

        const activeArticle =
          document.querySelector(
            ".is-reading",
          );


        if (!activeArticle) return;


        // Jangan tutup jika klik di dalam artikel
        if (
          activeArticle.contains(
            event.target,
          )
        ) {
          return;
        }


        // Jangan tutup jika klik tombol pembuka artikel
        if (
          event.target.closest(
            "[data-article-id]",
          )
        ) {
          return;
        }


        closeArticle();
      },
    );


    /* ----------------------------------------------------------------------
       9. CLOSE READING MODE WITH ESC
       ---------------------------------------------------------------------- */

    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          document.body.classList.contains(
            "reading-mode-active",
          )
        ) {

          closeArticle();
        }
      },
    );


    /* ----------------------------------------------------------------------
       10. DEEP LINKING
       ---------------------------------------------------------------------- */

    if (window.location.hash) {

      const articleId =
        decodeURIComponent(
          window.location.hash.substring(
            1,
          ),
        );


      if (
        document.getElementById(
          articleId,
        )
      ) {

        requestAnimationFrame(
          () => {

            openArticle(
              articleId,
            );

          },
        );
      }
    }


    /* ----------------------------------------------------------------------
       11. SUPABASE CONTACT FORM
       ---------------------------------------------------------------------- */

    const form =
      document.getElementById(
        "contactForm",
      );

    const submitBtn =
      document.getElementById(
        "submitBtn",
      );

    const statusMessage =
      document.getElementById(
        "statusMessage",
      );


    // Hanya jalankan jika form ada
    if (
      form &&
      submitBtn &&
      statusMessage &&
      supabaseClient
    ) {

      form.addEventListener(
        "submit",
        async (event) => {

          event.preventDefault();


          /* --------------------------------------------------------------
             UPDATE BUTTON
             -------------------------------------------------------------- */

          submitBtn.disabled = true;

          submitBtn.textContent =
            "Sending...";

          statusMessage.style.display =
            "none";


          /* --------------------------------------------------------------
             GET FORM DATA
             -------------------------------------------------------------- */

          const firstName =
            document
              .getElementById(
                "firstName",
              )
              ?.value
              .trim() || "";


          const lastName =
            document
              .getElementById(
                "lastName",
              )
              ?.value
              .trim() || "";


          const email =
            document
              .getElementById(
                "email",
              )
              ?.value
              .trim() || "";


          const ratingValue =
            document
              .getElementById(
                "rating",
              )
              ?.value || "";


          const message =
            document
              .getElementById(
                "message",
              )
              ?.value
              .trim() || "";


          /* --------------------------------------------------------------
             FORMAT DATA
             -------------------------------------------------------------- */

          const fullName =
            [firstName, lastName]
              .filter(Boolean)
              .join(" ") ||
            "Anonymous";


          const parsedRating =
            ratingValue
              ? parseInt(
                  ratingValue,
                  10,
                )
              : null;


          /* --------------------------------------------------------------
             SEND TO SUPABASE
             -------------------------------------------------------------- */

          try {

            const {
              error,
            } =
              await supabaseClient
                .from(
                  "messages",
                )
                .insert([
                  {
                    name: fullName,

                    email:
                      email || null,

                    rating:
                      parsedRating,

                    message:
                      message,
                  },
                ]);


            if (error) {
              throw error;
            }


            /* ----------------------------------------------------------
               SUCCESS
               ---------------------------------------------------------- */

            statusMessage.textContent =
              "Thank you! Your message has been sent successfully.";

            statusMessage.className =
              "success";

            statusMessage.style.display =
              "block";


            // Reset form
            form.reset();


          } catch (error) {

            console.error(
              "Error submitting form:",
              error,
            );


            /* ----------------------------------------------------------
               ERROR
               ---------------------------------------------------------- */

            statusMessage.textContent =
              "Oops! Something went wrong. Please try again.";

            statusMessage.className =
              "error";

            statusMessage.style.display =
              "block";


          } finally {

            /* ----------------------------------------------------------
               RESET BUTTON
               ---------------------------------------------------------- */

            submitBtn.disabled =
              false;

            submitBtn.textContent =
              "Send Message";
          }
        },
      );
    }


    /* ----------------------------------------------------------------------
       12. LIBRARY SEARCH ON INPUT
       ---------------------------------------------------------------------- */

    const librarySearch =
      document.getElementById(
        "librarySearch",
      );


    if (librarySearch) {

      librarySearch.addEventListener(
        "input",
        () => {

          executeLibrarySearch();

        },
      );
    }

  },
);