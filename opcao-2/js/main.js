/* ============================================================
   BANOS BEBIDAS — Protótipo F · Fusão (base E "Caricatura Viva"
   + diferenciais e água do B "Editorial Refinado")
   JS: nav mobile, smooth scroll (Lenis opcional), ScrollTrigger
   pin+crossfade da história (3 fotos), reveal dos cards de
   diferenciais, contadores e carrosséis automáticos do catálogo.
   Tudo escrito de forma defensiva: se um CDN (gsap/lenis) não
   carregar (ex.: sem internet), o site continua funcional.
   ============================================================ */
(function () {
  "use strict";

  var hasGSAP = typeof window.gsap !== "undefined";
  var hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMobile.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Lenis (scroll suave) — opcional ---------- */
  if (typeof window.Lenis !== "undefined") {
    try {
      var lenis = new window.Lenis({ smoothWheel: true, duration: 1.1 });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      if (hasScrollTrigger) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      }
    } catch (e) { /* segue sem Lenis */ }
  }

  /* ---------- Nossa história: pin + crossfade (3 fotos / 3 blocos de texto) ---------- */
  var historiaSection = document.getElementById("historia");
  if (historiaSection && hasScrollTrigger) {
    var visualImgs = historiaSection.querySelectorAll(".historia-visual img");
    var textPs = historiaSection.querySelectorAll(".historia-text p");
    var progressBars = historiaSection.querySelectorAll(".historia-progress i");

    if (visualImgs.length === textPs.length && visualImgs.length >= 2) {
      var steps = visualImgs.length; // 3 no protótipo F
      // estado inicial: fotos 2+ levemente "zoomadas" (efeito Ken Burns) e texto
      // deslocado, pronto pra entrar com um movimento orgânico, não um corte seco.
      for (var i = 1; i < steps; i++) {
        gsap.set(visualImgs[i], { scale: 1.12 });
        gsap.set(textPs[i], { y: 18 });
      }

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: historiaSection,
          start: "top top",
          end: "+=" + (160 + (steps - 2) * 90) + "%",
          scrub: 1,          // scrub com suavização (não é um on/off binário) = rolagem fluida
          pin: true,
          anticipatePin: 1
        }
      });

      // foto 1: respira com um zoom lento enquanto é lida
      tl.to(visualImgs[0], { scale: 1.1, duration: 0.5, ease: "none" }, 0);
      tl.to(progressBars[0], { scaleX: 1, duration: 0.4, ease: "power1.inOut" }, 0);

      var segment = 1 / (steps - 1);
      for (var s = 0; s < steps - 1; s++) {
        var base = s * segment;
        // crossfade gradual (janela mais larga, easing orgânico) — não é troca abrupta
        tl.to(visualImgs[s], { opacity: 0, duration: segment * 0.42, ease: "power2.inOut" }, base + segment * 0.32);
        tl.to(visualImgs[s + 1], { opacity: 1, scale: 1, duration: segment * 0.6, ease: "power2.out" }, base + segment * 0.32);
        tl.to(textPs[s], { opacity: 0, y: -18, duration: segment * 0.4, ease: "power2.inOut" }, base + segment * 0.34);
        tl.to(textPs[s + 1], { opacity: 1, y: 0, duration: segment * 0.45, ease: "power2.out" }, base + segment * 0.42);
        tl.to(progressBars[s + 1], { scaleX: 1, duration: segment * 0.5, ease: "power1.inOut" }, base + segment * 0.62);
      }
    }
  }

  /* ---------- Reveal genérico (stat-cards etc) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (hasGSAP) {
              gsap.to(entry.target, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "back.out(1.1)"
              });
            } else {
              entry.target.style.opacity = 1;
              entry.target.style.transform = "none";
              entry.target.style.transition = "opacity .5s ease, transform .5s ease";
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contador dos números ---------- */
  var statNums = document.querySelectorAll(".stat-card .num");
  if (statNums.length) {
    var counted = new WeakSet();
    var countIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted.has(entry.target)) {
            counted.add(entry.target);
            animateCount(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach(function (el) { countIO.observe(el); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = 0;
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + "+";
      }
    }
    requestAnimationFrame(step);
  }

  /* ---------- Diferenciais: reveal suave dos cards ao entrar na viewport ---------- */
  var difItems = document.querySelectorAll(".dif-item");
  if (difItems.length && hasGSAP) {
    gsap.set(difItems, { opacity: 0, y: 24 });
    var difIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.1)" });
          difIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    difItems.forEach(function (el) { difIO.observe(el); });
  }

  /* ---------- Carrosséis do catálogo (loop automático) ---------- */
  function setupMarquee(trackId, reverse) {
    var track = document.getElementById(trackId);
    if (!track) return;

    // duplica o conteúdo uma vez para permitir loop contínuo
    track.innerHTML += track.innerHTML;

    if (!hasGSAP) {
      // sem GSAP: deixa rolagem manual funcionando
      var carousel = track.closest(".carousel");
      if (carousel) {
        carousel.style.overflowX = "auto";
        carousel.style.webkitOverflowScrolling = "touch";
      }
      return;
    }

    var speedPxPerSec = 34;
    var totalWidth = track.scrollWidth / 2;
    var duration = totalWidth / speedPxPerSec;

    var tween;
    if (reverse) {
      gsap.set(track, { xPercent: -50 });
      tween = gsap.to(track, {
        xPercent: 0,
        duration: duration,
        ease: "none",
        repeat: -1
      });
    } else {
      tween = gsap.to(track, {
        xPercent: -50,
        duration: duration,
        ease: "none",
        repeat: -1
      });
    }

    var carouselWrap = track.closest(".carousel");
    if (carouselWrap) {
      carouselWrap.addEventListener("mouseenter", function () { tween.pause(); });
      carouselWrap.addEventListener("mouseleave", function () { tween.play(); });
    }
  }

  setupMarquee("trackAlcoolicas", false);
  setupMarquee("trackSemAlcool", true);

  /* ---------- Vídeo de fundo da Acqua Nova: respeita "reduzir movimento" ---------- */
  var aguaVideo = document.querySelector(".agua-video");
  if (aguaVideo) {
    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      aguaVideo.removeAttribute("autoplay");
      aguaVideo.pause();
    }
  }

})();
