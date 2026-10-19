/* ============================================================
   BAÑOS BEBIDAS — Protótipo A — "POP GELADO"
   Motion: GSAP + ScrollTrigger — reveals rápidos e enérgicos
   ============================================================ */
(function () {
  'use strict';

  var hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- NAV ---------- */
  var navbar = document.querySelector('.navbar');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  function onScrollNav() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---------- HERO ENTRANCE ---------- */
  function heroEntrance() {
    if (!hasGsap) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero .eyebrow', { y: 20, opacity: 0, duration: 0.5 })
      .from('.hero-title span', { y: 60, opacity: 0, duration: 0.55, stagger: 0.12 }, '-=0.25')
      .from('.hero-lead', { y: 24, opacity: 0, duration: 0.45 }, '-=0.2')
      .from('.hero-actions > *', { y: 20, opacity: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(1.4)' }, '-=0.15')
      .from('.hero-blob', { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.5')
      .from('.hero-caricatura', { scale: 0.7, opacity: 0, y: 30, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.45')
      .from('.hero-halftone', { opacity: 0, duration: 0.6 }, '-=0.3');
  }
  heroEntrance();

  /* ---------- GENERIC REVEAL ON SCROLL ---------- */
  function initReveals() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    items.forEach(function (el, i) {
      if (hasGsap && window.ScrollTrigger) {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            delay: (i % 4) * 0.06,
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        );
      } else {
        el.classList.add('in');
      }
    });
  }
  initReveals();

  /* ---------- NOSSA HISTÓRIA ----------
     Desktop (> 768px): pin do GSAP/ScrollTrigger + crossfade scrub-driven,
     exatamente como antes — intocado.
     Mobile (<= 768px): pin de scroll é instável em navegadores mobile (barra
     de endereço colapsando muda a viewport no meio do gesto), então aqui a
     imagem fica fixa via position:sticky (CSS puro, ver style.css) e a troca
     de imagem é feita por um IntersectionObserver simples, sem depender do
     pin do ScrollTrigger. */
  function initHistoria() {
    var row = document.querySelector('.historia-row');
    var media = document.querySelector('.historia-media');
    // escopo em .img-stack (não .historia-media), senão pega também o <img>
    // do selo .badge-stamp e desalinha os índices do crossfade (4 imgs em
    // vez de 3, fazendo a 2ª/3ª foto nunca ativarem de verdade)
    var images = document.querySelectorAll('.historia-frame .img-stack img');
    var blocks = document.querySelectorAll('.historia-block');
    if (!row || !media || !images.length || !blocks.length) return;

    var MOBILE_QUERY = '(max-width: 768px)';

    function activateImage(index) {
      images.forEach(function (img, i) {
        img.classList.toggle('is-active', i === index);
      });
    }

    function initMobileHistoria() {
      // garante que nenhuma opacity inline deixada pelo GSAP (timeline do
      // desktop) atrapalhe o crossfade por classe no mobile
      images.forEach(function (img) { img.style.opacity = ''; });

      // BUG relatado: só a 1ª foto aparecia, as outras 2 nunca trocavam.
      // Causa: a troca dependia de um IntersectionObserver com um único
      // threshold (0.5) + rootMargin que encolhia a "janela" de observação.
      // Como a imagem é sticky e ocupa uma faixa fixa no topo, o espaço
      // realmente visível pra cada bloco de texto é bem menor que a altura
      // do próprio bloco (min-height:58vh) — então a razão de interseção
      // de um bloco nunca alcançava 0.5 (o cálculo dependia da altura real
      // do bloco vs. o tamanho do viewport, que varia com texto/fonte/
      // tamanho de tela), e o callback nunca disparava de novo pros blocos
      // 2 e 3. Resultado: ficava preso na 1ª imagem pra sempre.
      //
      // Troca por uma lógica mais simples e robusta: a cada scroll (com
      // throttle via rAF), comparamos a posição de TODOS os blocos e
      // ativamos sempre o que estiver mais perto de uma linha de
      // referência logo abaixo da imagem fixa. Não depende de altura de
      // bloco, de threshold, nem de rootMargin — funciona em qualquer
      // tamanho de tela/fonte.
      var current = -1;
      var ticking = false;

      function pickClosestBlock() {
        ticking = false;
        var referenceY = window.innerHeight * 0.55;
        var bestIdx = 0;
        var bestDist = Infinity;
        blocks.forEach(function (b, i) {
          var r = b.getBoundingClientRect();
          var center = r.top + r.height / 2;
          var dist = Math.abs(center - referenceY);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        if (bestIdx !== current) {
          current = bestIdx;
          activateImage(bestIdx);
        }
      }

      function onScrollOrResize() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(pickClosestBlock);
      }

      pickClosestBlock();
      window.addEventListener('scroll', onScrollOrResize, { passive: true });
      window.addEventListener('resize', onScrollOrResize, { passive: true });

      // cleanup: usado pelo gsap.matchMedia quando a viewport deixa de
      // bater com a media query mobile (ex: usuário gira o aparelho ou
      // redimensiona a janela pra acima de 768px)
      return function () {
        window.removeEventListener('scroll', onScrollOrResize);
        window.removeEventListener('resize', onScrollOrResize);
      };
    }

    function initDesktopHistoria() {
      var n = images.length;

      // Timeline normalizada (0 a n) e amarrada ao scroll via scrub — assim cada
      // imagem recebe exatamente 1/n do scroll total da seção, sem depender de
      // durações fixas que podem "travar" ou cortar a última imagem.
      gsap.set(images[0], { opacity: 1 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top top',
          end: 'bottom bottom',
          pin: media,
          pinSpacing: false,
          scrub: 1.2
        }
      });

      for (var i = 1; i < n; i++) {
        var crossAt = i; // ponto normalizado em que a troca i-1 -> i acontece
        tl.to(images[i - 1], { opacity: 0, duration: 0.4, ease: 'none' }, crossAt - 0.2)
          .to(images[i], { opacity: 1, duration: 0.4, ease: 'none' }, crossAt - 0.2);
      }
      // garante que a última imagem termine totalmente visível e permaneça assim
      // até o fim da janela de scroll (sem corte abrupto no fim do pin)
      tl.to(images[n - 1], { opacity: 1, duration: 0.1, ease: 'none' }, n - 0.1);

      return tl;
    }

    if (hasGsap && window.ScrollTrigger) {
      var mm = gsap.matchMedia();

      mm.add(MOBILE_QUERY, function () {
        return initMobileHistoria();
      });

      mm.add('(min-width: 769px)', function () {
        var tl = initDesktopHistoria();
        return function () {
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
          tl.kill();
        };
      });
    } else if (window.matchMedia(MOBILE_QUERY).matches) {
      initMobileHistoria();
    } else {
      images[0].classList.add('is-active');
    }
  }
  initHistoria();

  /* ---------- NÚMEROS — contadores ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('.glass-card .num[data-count]');
    if (!nums.length) return;

    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var start = 0;
      var duration = 1200;
      var startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = Math.floor(start + (target - start) * eased);
        el.textContent = val + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    }

    if (hasGsap && window.ScrollTrigger) {
      nums.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: function () { animateCount(el); }
        });
      });
    } else {
      nums.forEach(animateCount);
    }
  }
  initCounters();

  /* ---------- DIFERENCIAIS — stepper/tabs ---------- */
  function initStepper() {
    var buttons = document.querySelectorAll('.step-btn');
    var panels = document.querySelectorAll('.step-content');
    if (!buttons.length || !panels.length) return;

    function activate(key) {
      buttons.forEach(function (b) {
        b.classList.toggle('active', b.dataset.step === key);
      });
      panels.forEach(function (p) {
        if (p.dataset.step === key) {
          p.classList.add('active');
          if (hasGsap) {
            gsap.fromTo(p, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
          }
        } else {
          p.classList.remove('active');
        }
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { activate(b.dataset.step); });
      // hover troca no desktop
      b.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          activate(b.dataset.step);
        }
      });
    });

    activate(buttons[0].dataset.step);
  }
  initStepper();

  /* ---------- ÁGUA — vídeo de fundo em loop ---------- */
  function initAgua() {
    var video = document.querySelector('.agua-video');
    if (!video) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      // respeita preferência do usuário: mostra o poster parado em vez do loop
      video.pause();
      video.removeAttribute('autoplay');
      return;
    }

    // alguns navegadores exigem o play() programático mesmo com autoplay+muted
    var tryPlay = function () { video.play().catch(function () {}); };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('loadeddata', tryPlay, { once: true });

    // pausa o vídeo quando a seção sai da viewport, pra economizar recursos
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) tryPlay();
          else video.pause();
        });
      }, { threshold: 0.1 });
      io.observe(video.closest('.agua'));
    }
  }
  initAgua();

  /* ---------- NÚMEROS — spotlight que segue o mouse nos cards ---------- */
  function initGlassSpotlight() {
    var cards = document.querySelectorAll('.glass-card');
    if (!cards.length) return;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var mx = ((e.clientX - rect.left) / rect.width) * 100;
        var my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
      });
    });
  }
  initGlassSpotlight();

  /* ---------- PEÇA JÁ — overshoot entrance ---------- */
  function initCtaFinal() {
    if (!hasGsap || !window.ScrollTrigger) return;
    gsap.from('.cta-final h2', {
      scale: 0.85,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.2)',
      scrollTrigger: { trigger: '.cta-final', start: 'top 80%' }
    });
    gsap.from('.cta-final .btn-whats', {
      scale: 0.7,
      opacity: 0,
      duration: 0.5,
      delay: 0.15,
      ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.cta-final', start: 'top 80%' }
    });
  }
  initCtaFinal();

})();
