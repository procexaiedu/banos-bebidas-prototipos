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
      .from('.hero-title > span:not(.eyebrow)', { y: 60, opacity: 0, duration: 0.55, stagger: 0.12 }, '-=0.25')
      .from('.hero-lead', { y: 24, opacity: 0, duration: 0.45 }, '-=0.2')
      .from('.hero-actions > *', { y: 20, opacity: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(1.4)' }, '-=0.15')
      .from('.hero-blob', { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.5')
      // sem opacity:0 aqui de propósito: a caricatura é o maior elemento da
      // primeira tela (LCP). Escondê-la e fazer fade atrasava o LCP em ~3 s no
      // celular; o "pop" de escala continua igual.
      .from('.hero-caricatura', { scale: 0.7, y: 30, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.45')
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
    // MOBILE (até 900px): não há mais NENHUM efeito aqui — o dono pediu
    // explicitamente uma sequência linear simples, sem a imagem flutuar ou
    // grudar durante o scroll. O HTML já tem uma <img> estática
    // (.historia-block-img) dentro de cada .historia-block, e o CSS (ver
    // style.css ~linha 279) esconde o .historia-media (container sticky)
    // inteiro nesse breakpoint. Então não precisa de nenhum JS no mobile:
    // é só imagem+texto empilhados no fluxo normal da página, como o resto
    // do site. Esta função agora só cuida do efeito de pin+crossfade do
    // DESKTOP (acima de 900px).
    var row = document.querySelector('.historia-row');
    var media = document.querySelector('.historia-media');
    // escopo em .img-stack (não .historia-media), senão pega também o <img>
    // do selo .badge-stamp e desalinha os índices do crossfade
    var images = document.querySelectorAll('.historia-frame .img-stack img');
    if (!row || !media || !images.length) return;

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

    // MESMO breakpoint do CSS que esconde .historia-media (ver style.css):
    // abaixo disso não existe mais pin nenhum, a imagem do desktop fica
    // display:none e quem aparece é a <img> estática de cada bloco.
    if (hasGsap && window.ScrollTrigger) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', function () {
        var tl = initDesktopHistoria();
        return function () {
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
          tl.kill();
        };
      });
    } else if (window.matchMedia('(min-width: 901px)').matches) {
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
        el.textContent = val.toLocaleString('pt-BR') + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('pt-BR') + suffix;
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

  /* ---------- ÁGUA — vídeo só no clique ----------
     Antes o <video> vinha com autoplay + preload="auto" e baixava 6 MB logo
     na abertura da página (era o que mais pesava no carregamento). Agora a
     seção mostra só o poster (.agua-poster) e o <video> é CRIADO aqui, no
     primeiro clique do botão de play — sem clique, nenhum byte de vídeo. */
  function initAgua() {
    var btn = document.querySelector('.agua-play');
    var media = document.querySelector('.agua-media');
    if (!btn || !media) return;
    var video = null;
    var label = btn.querySelector('.agua-play-label');

    function setPlaying(on) {
      btn.classList.toggle('is-playing', on);
      btn.setAttribute('aria-label', on ? 'Pausar o vídeo da Acqua Nova' : 'Ver o vídeo da Acqua Nova');
      if (label) label.textContent = on ? 'Pausar' : 'Ver o vídeo';
    }

    function createVideo() {
      video = document.createElement('video');
      video.className = 'agua-video';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'none');
      video.setAttribute('aria-hidden', 'true');
      video.src = btn.getAttribute('data-video');
      media.querySelector('.agua-poster').insertAdjacentElement('afterend', video);
      video.addEventListener('playing', function () { video.classList.add('is-playing'); });

      // pausa quando a seção sai da tela, pra economizar bateria/dados
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting && !video.paused) {
              video.pause();
              setPlaying(false);
            }
          });
        }, { threshold: 0.1 }).observe(media.closest('.agua'));
      }
    }

    btn.addEventListener('click', function () {
      if (!video) createVideo();
      if (video.paused) {
        video.play().then(function () { setPlaying(true); }).catch(function () {});
      } else {
        video.pause();
        setPlaying(false);
      }
    });
  }
  initAgua();

  /* ---------- NÚMEROS — embed do Instagram sob demanda ----------
     O embed.js do Instagram (~250 KB + cookies de terceiros) só é carregado
     quando a fileira de reels chega perto da tela. Os cards já têm altura
     fixa no CSS, então o carregamento tardio não empurra o layout. */
  function initInstagram() {
    var row = document.querySelector('.reels-row');
    if (!row) return;
    var loaded = false;

    // o iframe criado pelo Instagram vem sem title (exigência de acessibilidade)
    function titleIframes() {
      row.querySelectorAll('iframe').forEach(function (f) {
        if (!f.title) f.title = 'Reel da Baños Bebidas no Instagram';
      });
    }

    function load() {
      if (loaded) return;
      loaded = true;
      if ('MutationObserver' in window) {
        new MutationObserver(titleIframes).observe(row, { childList: true, subtree: true });
      }
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(s);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          io.disconnect();
          load();
        }
      }, { rootMargin: '600px 0px' });
      io.observe(row);
    } else {
      load();
    }
  }
  initInstagram();

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
