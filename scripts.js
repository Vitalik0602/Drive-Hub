document.addEventListener("DOMContentLoaded", () => {
  // === Burger menu ===
  const burger = document.getElementById("burger");
  const nav = document.querySelector(".nav");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      nav.classList.toggle("nav--open");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        burger.classList.remove("active");
        nav.classList.remove("nav--open");
      });
    });
  }

  // === Stats counter ===
  const statNumbers = document.querySelectorAll(".hero__stat-number");
  const animateStats = () => {
    statNumbers.forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      let current = 0;
      const duration = 900;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        current = Math.floor(target * progress);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  };

  let statsAnimated = false;
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            animateStats();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(heroSection);
  }

  // === Fade-in cards and blocks ===
  const fadeElements = document.querySelectorAll(".fade-in");
  if (fadeElements.length) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    fadeElements.forEach((el) => fadeObserver.observe(el));
  }

  // === Hero car parallax (чуть живости) ===
  const heroCar = document.getElementById("heroCar");
  if (heroCar) {
    heroCar.style.willChange = "transform";
    let lastX = 0;
    window.addEventListener("mousemove", (e) => {
      const ratio = (e.clientX / window.innerWidth - 0.5) * 2;
      const tilt = ratio * 2; // -2..2 deg
      lastX = tilt;
      heroCar.style.transform += ` rotate(${tilt}deg)`;
    });
  }

  // === Toast ===
  const toast = document.getElementById("toast");
  const showToast = (message) => {
    if (!toast) return;
    if (message) toast.textContent = message;
    toast.classList.add("toast--visible");
    setTimeout(() => {
      toast.classList.remove("toast--visible");
    }, 2600);
  };

  // === Lightbox ===
// === Lightbox ===
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

// Собираем миниатюры
const lightboxThumbs = Array.from(document.querySelectorAll(".car-thumb"));
let currentIndex = 0;

// Массив изображений
const galleryImages = lightboxThumbs.map(t => t.dataset.src);

// Открыть
function openLightbox(index) {
  currentIndex = index;
  lightboxImage.src = galleryImages[currentIndex];
  lightbox.classList.add("active");
}

// Закрыть
function closeLightbox() {
  lightbox.classList.remove("active");
}

// Следующее
function showNext() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  lightboxImage.src = galleryImages[currentIndex];
}

// Предыдущее
function showPrev() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImage.src = galleryImages[currentIndex];
}

// Клик по миниатюре
lightboxThumbs.forEach((thumb, i) => {
  thumb.addEventListener("click", () => openLightbox(i));
});

// Кнопки
lightboxClose.addEventListener("click", closeLightbox);
lightboxNext.addEventListener("click", showNext);
lightboxPrev.addEventListener("click", showPrev);

// Клик по overlay
document.querySelector(".lightbox__overlay").addEventListener("click", closeLightbox);

// ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
});


// === Галерея (смена главного фото) ===
const mainCarImageEl = document.getElementById("mainCarImage");
const galleryThumbs = document.querySelectorAll(".car-thumb");

if (mainCarImageEl && galleryThumbs.length) {
  galleryThumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const src = thumb.getAttribute("data-src");
      if (!src) return;

      mainCarImageEl.style.opacity = "0";
      setTimeout(() => {
        mainCarImageEl.src = src;
        mainCarImageEl.style.opacity = "1";
      }, 150);

      galleryThumbs.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });
}





  // === Telegram bot config ===
  // ВСТАВЬ СВОИ ДАННЫЕ:
  const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
  const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE"; // id группы/чата
  const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const sendToTelegram = async (payload) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
      console.warn("Заполни TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в scripts.js");
      return;
    }

    const text =
      `🚗 Новая заявка Drive Hub\n\n` +
      (payload.car ? `Авто: ${payload.car}\n` : "") +
      `Имя: ${payload.name}\n` +
      `Контакт: ${payload.contact}\n` +
      (payload.comment ? `Комментарий: ${payload.comment}\n` : "") +
      `Источник: ${payload.source || "сайт"}`;

    try {
      await fetch(TELEGRAM_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      });
    } catch (err) {
      console.error("Ошибка отправки в Telegram:", err);
    }
  };

  // === Forms (главная и страница авто) ===
  const leadForm = document.getElementById("leadForm");
  const carLeadForm = document.getElementById("carLeadForm");

  const handleFormSubmit = (form, source) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.source = source;

      await sendToTelegram(payload);
      form.reset();
      showToast("Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
    });
  };

  if (leadForm) handleFormSubmit(leadForm, "Главная");
  if (carLeadForm) handleFormSubmit(carLeadForm, "Страница авто");

  // === Галерея на странице авто ===
  const mainCarImage = document.getElementById("mainCarImage");
  const thumbs = document.querySelectorAll(".car-thumb");

  if (mainCarImage && thumbs.length) {
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const src = thumb.getAttribute("data-src");
        if (!src) return;
        mainCarImage.style.opacity = "0";
        setTimeout(() => {
          mainCarImage.src = src;
          mainCarImage.style.opacity = "1";
        }, 150);
        thumbs.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
      });
    });
  }
});
