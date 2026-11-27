(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobilni meni */
  var burger = document.getElementById('burger');
  var links = document.getElementById('nav-links');
  if (burger && links) {
    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
      links.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* Senka na navigaciji kad se stranica pomeri (bez scroll listenera) */
  var nav = document.getElementById('nav');
  if (nav && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (en) {
      nav.classList.toggle('is-stuck', !en[0].isIntersecting);
    }).observe(sentinel);
  }

  /* Fiksna donja traka na mobilnom: vidljiva posle hero dugmadi, sakrivena na kontaktu i footeru */
  var dock = document.getElementById('dock');
  var heroBtns = document.querySelector('.hero__btns');
  var endZone = [document.getElementById('kontakt'), document.querySelector('.foot')];
  if (dock && heroBtns && 'IntersectionObserver' in window) {
    var state = { hero: true, end: false };
    var upd = function () { dock.classList.toggle('is-on', !state.hero && !state.end); };
    new IntersectionObserver(function (en) { state.hero = en[0].isIntersecting || en[0].boundingClientRect.top > 0; upd(); }).observe(heroBtns);
    var endIo = new IntersectionObserver(function (en) {
      en.forEach(function (e) { e.target._in = e.isIntersecting; });
      state.end = endZone.some(function (z) { return z && z._in; }); upd();
    }, { threshold: 0.25 });
    endZone.forEach(function (z) { if (z) endIo.observe(z); });
  }

  /* Fade/slide na skrol */
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
    items.forEach(function (el) {
      var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', (siblings % 4) * 80 + 'ms');
      io.observe(el);
    });
  }

  /* "Otvoreno sada" po beogradskom vremenu */
  var status = document.getElementById('status');
  if (status) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Belgrade', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      var mins = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
      var opens = get('weekday') === 'Sun' ? 450 : 390; /* 07:30 / 06:30 */
      if (mins >= opens) {
        status.textContent = 'Petra je sada otvorena, do ponoći.';
      } else {
        status.textContent = 'Petra sada spava. Otvaramo u ' + (opens === 450 ? '07:30' : '06:30') + '.';
      }
      status.hidden = false;
    } catch (e) { /* bez statusa */ }
  }

  /* Nijedna rec ne ostaje sama u poslednjem redu: poslednja dva reda se vezu nerazdvojnim razmakom */
  var seen = new WeakSet();
  document.querySelectorAll('h1,h2,h3,p,blockquote,li,dd,figcaption').forEach(function (el) {
    if (el.classList.contains('label')) return;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var last = null, n;
    while ((n = w.nextNode())) { if (n.nodeValue.trim()) last = n; }
    if (!last || seen.has(last)) return;
    seen.add(last);
    var t = last.nodeValue.replace(/\s+$/, '');
    var i = t.lastIndexOf(' ');
    if (i > 0 && t.slice(0, i).trim()) last.nodeValue = t.slice(0, i) + ' ' + t.slice(i + 1) + last.nodeValue.slice(t.length);
  });
})();
