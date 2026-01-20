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
  if (heroSection && statNumbers.length) {
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

  // === Hero car parallax ===
  const heroCar = document.getElementById("heroCar");
  if (heroCar) {
    heroCar.style.willChange = "transform";
    window.addEventListener("mousemove", (e) => {
      const ratio = (e.clientX / window.innerWidth - 0.5) * 2;
      const tilt = ratio * 2;
      heroCar.style.transform = `rotate(${tilt}deg)`;
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
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const lightboxOverlay = document.querySelector(".lightbox__overlay");

  const galleryThumbs = Array.from(document.querySelectorAll(".car-thumb"));
  const galleryImages = galleryThumbs.map((t) => t.dataset.src).filter(Boolean);
  let currentIndex = 0;

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage || !galleryImages.length) return;
    currentIndex = index;
    lightboxImage.src = galleryImages[currentIndex];
    lightbox.classList.add("active");
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("active");
  };

  const showNext = () => {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    lightboxImage.src = galleryImages[currentIndex];
  };

  const showPrev = () => {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImage.src = galleryImages[currentIndex];
  };

  if (lightbox && lightboxImage && galleryThumbs.length) {
    galleryThumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => openLightbox(i));
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener("click", showNext);
    if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
    if (lightboxOverlay) lightboxOverlay.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    });
  }

  // === Галерея (смена главного фото) ===
  const mainCarImageEl = document.getElementById("mainCarImage");
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

    mainCarImageEl.addEventListener("click", () => {
      const activeIndex = galleryThumbs.findIndex((t) =>
        t.classList.contains("active")
      );
      openLightbox(activeIndex >= 0 ? activeIndex : 0);
    });
  }

  // === Telegram bot config ===
  const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
  const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE";

  const sendToTelegram = async (payload) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    const text =
      `🚗 Новая заявка Drive Hub\n\n` +
      (payload.service ? `Услуга: ${payload.service}\n` : "") +
      (payload.car ? `Авто: ${payload.car}\n` : "") +
      `Имя: ${payload.name}\n` +
      `Контакт: ${payload.contact}\n` +
      (payload.car_params ? `Параметры авто: ${payload.car_params}\n` : "") +
      (payload.comment ? `Комментарий: ${payload.comment}\n` : "") +
      `Источник: ${payload.source || "сайт"}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });
  };

  // === Premium hero parallax ===
  const platform = document.getElementById("heroPlatform");
  const heroCarImg = document.getElementById("heroCar");

  if (platform && heroCarImg) {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;

      platform.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
      heroCarImg.style.transform = `translateY(${y * 1.2}px)`;
    });
  }

  // === Forms (premium UX) ===
  const leadForm = document.getElementById("leadForm");
  const carLeadForm = document.getElementById("carLeadForm");

  const handleFormSubmit = (form, source) => {
    if (!form) return;

    const submitBtn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.classList.add("btn-loading");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Отправка...";

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.source = source;

      try {
        await sendToTelegram(payload);

        submitBtn.classList.remove("btn-loading");
        submitBtn.classList.add("btn-success");
        submitBtn.textContent = "✓ Отправлено";

        form.reset();
        showToast("Заявка отправлена. Мы свяжемся с вами в ближайшее время.");

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove("btn-success");
          submitBtn.textContent = originalText;
        }, 1800);
      } catch (err) {
        submitBtn.classList.remove("btn-loading");
        submitBtn.classList.add("btn-error");
        submitBtn.textContent = "Ошибка";

        form.classList.add("form-error");
        setTimeout(() => form.classList.remove("form-error"), 600);

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove("btn-error");
          submitBtn.textContent = originalText;
        }, 1800);
      }
    });
  };

  if (leadForm) handleFormSubmit(leadForm, "Главная");
  if (carLeadForm) handleFormSubmit(carLeadForm, "Страница авто");

  // === SMART FORM (dynamic fields + photo upload) ===
  const smartForm = document.getElementById("smartLeadForm");
  const serviceSelect = document.getElementById("serviceSelect");
  const photoField = document.getElementById("photoField");
  const carParamsField = document.getElementById("carParamsField");

  if (serviceSelect) {
    serviceSelect.addEventListener("change", () => {
      const value = serviceSelect.value;

      photoField?.classList.add("hidden");
      carParamsField?.classList.add("hidden");

      if (value === "Комиссионная продажа" || value === "Автовыкуп") {
        photoField.classList.remove("hidden");
      }

      if (value === "Автоподбор") {
        carParamsField.classList.remove("hidden");
      }
    });
  }

  if (smartForm) {
    smartForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = smartForm.querySelector("button[type='submit']");
      const originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.classList.add("btn-loading");
      submitBtn.textContent = "Отправка...";

      const formData = new FormData(smartForm);

      const payload = {
        service: formData.get("service"),
        name: formData.get("name"),
        contact: formData.get("contact"),
        car_params: formData.get("car_params"),
        comment: formData.get("comment"),
        source: "Умная форма",
      };

      try {
        await sendToTelegram(payload);

        const photo = formData.get("photo");
        if (photo && photo.size > 0) {
          const photoData = new FormData();
          photoData.append("chat_id", TELEGRAM_CHAT_ID);
          photoData.append("photo", photo);

          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: photoData,
          });
        }

        submitBtn.classList.remove("btn-loading");
        submitBtn.classList.add("btn-success");
        submitBtn.textContent = "✓ Отправлено";

        smartForm.reset();
        showToast("Заявка отправлена!");

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove("btn-success");
          submitBtn.textContent = originalText;
        }, 1800);
      } catch (err) {
        submitBtn.classList.remove("btn-loading");
        submitBtn.classList.add("btn-error");
        submitBtn.textContent = "Ошибка";

        smartForm.classList.add("form-error");
        setTimeout(() => smartForm.classList.remove("form-error"), 600);

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove("btn-error");
          submitBtn.textContent = originalText;
        }, 1800);
      }
    });
  }
});

// === Dynamic logic for car page form ===
const carTypeGroup = document.getElementById("carTypeGroup");
const carTimeField = document.getElementById("carTimeField");

if (carTypeGroup && carTimeField) {
  carTypeGroup.addEventListener("change", () => {
    const selected = document.querySelector('input[name="type"]:checked').value;

    if (selected === "Вопрос") {
      carTimeField.classList.add("hidden");
    } else {
      carTimeField.classList.remove("hidden");
    }
  });
}
