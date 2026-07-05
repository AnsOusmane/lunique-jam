import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';
import { createIcons, ArrowUpRight } from 'lucide';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = document.getElementById('nav');
const preloader = document.getElementById('preloader');
const preCount = document.getElementById('preCount');

createIcons({ icons: { ArrowUpRight } });

/* ------------------------------------------------------------
   Smooth scroll — Lenis piloté par le ticker GSAP
   ------------------------------------------------------------ */
let lenis = null;

if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Ancres internes : smooth avec Lenis, natif sinon
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: 'auto' });
  });
});

/* ------------------------------------------------------------
   Navigation — se retire en descendant, revient en remontant
   ------------------------------------------------------------ */
ScrollTrigger.create({
  start: 'top top',
  onUpdate(self) {
    const goingDown = self.direction === 1;
    nav.classList.toggle('is-hidden', goingDown && self.scroll() > 260);
  },
});

/* ------------------------------------------------------------
   Curseur signature
   ------------------------------------------------------------ */
const cursor = document.getElementById('cursor');
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

  window.addEventListener('pointermove', (e) => {
    cursor.classList.remove('is-hidden');
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

  document.querySelectorAll('a, button, .value, input').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

/* ------------------------------------------------------------
   Découpage typographique
   ------------------------------------------------------------ */
function splitAll() {
  new SplitType('[data-split]', { types: 'words,chars', tagName: 'span' });
  new SplitType('[data-split-words]', { types: 'words', tagName: 'span' });
}

/* ------------------------------------------------------------
   Préloader → intro hero
   ------------------------------------------------------------ */
function heroIntro() {
  if (reduced) return;

  const heroChars = document.querySelectorAll('.hero__title .char');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  tl.from(heroChars, {
    yPercent: 115,
    duration: 1.15,
    stagger: 0.035,
  })
    .from('.hero__emblem', {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.1,
      ease: 'expo.inOut',
    }, '-=0.9')
    .from('.hero__meta span', {
      yPercent: 120,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
    }, '-=0.7')
    .from(['.hero__slogan', '.hero__intro', '.hero .btn', '.hero__scrollhint'], {
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.09,
    }, '-=0.6')
    .from('.nav', { yPercent: -120, duration: 0.8 }, '-=0.8');
}

function hidePreloader() {
  if (reduced) {
    preloader.remove();
    return;
  }
  const tl = gsap.timeline({ onComplete: () => preloader.remove() });
  tl.to('.preloader__inner', { opacity: 0, y: -30, duration: 0.45, ease: 'power2.in' })
    .to(preloader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.05')
    .add(heroIntro, '-=0.55');
}

function runPreloader() {
  if (reduced) {
    hidePreloader();
    return;
  }
  const counter = { v: 0 };
  gsap.to(counter, {
    v: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate() {
      preCount.textContent = String(Math.round(counter.v)).padStart(2, '0');
    },
    onComplete: hidePreloader,
  });
}

/* ------------------------------------------------------------
   Animations au scroll
   ------------------------------------------------------------ */
function scrollAnimations() {
  if (reduced) return;

  // Manifesto — le texte s'allume mot par mot
  gsap.to('.manifesto__text .word', {
    opacity: 1,
    stagger: 0.06,
    ease: 'none',
    scrollTrigger: {
      trigger: '.manifesto__text',
      start: 'top 78%',
      end: 'bottom 45%',
      scrub: 0.6,
    },
  });

  // Flèche filigrane — dérive latérale
  gsap.fromTo('.manifesto__watermark',
    { xPercent: 14 },
    {
      xPercent: -10,
      ease: 'none',
      scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true },
    });

  // Tags manifesto
  gsap.from('.manifesto__tags .tag', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.manifesto__tags', start: 'top 88%' },
  });

  // Titres monumentaux (GENESIS, newsletter, citations)
  document.querySelectorAll('.collection__title [data-split], .newsletter__title [data-split]')
    .forEach((el) => {
      gsap.from(el.querySelectorAll('.char'), {
        yPercent: 115,
        opacity: 0,
        duration: 1,
        stagger: 0.03,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

  // Produits — apparition en fondu levé
  gsap.utils.toArray('.product').forEach((card, i) => {
    gsap.from(card, {
      y: 70,
      opacity: 0,
      duration: 1.1,
      delay: (i % 2) * 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: card, start: 'top 90%' },
    });
  });

  // Lookbook — parallaxe interne des visuels
  gsap.utils.toArray('[data-parallax]').forEach((art) => {
    gsap.set(art, { scale: 1.16 });
    gsap.fromTo(art,
      { yPercent: -7 },
      {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: art.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
  });

  // LOOKBOOK vertical — remontée lente
  gsap.fromTo('.lookbook__vertical',
    { y: 120 },
    {
      y: -160,
      ease: 'none',
      scrollTrigger: { trigger: '.lookbook', start: 'top bottom', end: 'bottom top', scrub: true },
    });

  // Légendes lookbook
  gsap.utils.toArray('.look figcaption').forEach((cap) => {
    gsap.from(cap, {
      y: 34,
      opacity: 0,
      duration: 0.9,
      ease: 'expo.out',
      scrollTrigger: { trigger: cap, start: 'top 92%' },
    });
  });

  // Valeurs — les lignes se déplient
  gsap.utils.toArray('.value').forEach((row, i) => {
    gsap.from(row, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      delay: i * 0.05,
      ease: 'expo.out',
      scrollTrigger: { trigger: row, start: 'top 92%' },
    });
  });

  // Citations — révélation caractère par caractère au scrub
  gsap.utils.toArray('.quote p').forEach((q) => {
    gsap.fromTo(q.querySelectorAll('.char'),
      { opacity: 0.08 },
      {
        opacity: 1,
        stagger: 0.03,
        ease: 'none',
        scrollTrigger: { trigger: q, start: 'top 80%', end: 'bottom 55%', scrub: 0.5 },
      });
  });

  // Footer — le mega-wordmark glisse
  gsap.fromTo('.footer__mega span',
    { xPercent: 6 },
    {
      xPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: '.footer__mega', start: 'top bottom', end: 'bottom top', scrub: true },
    });
}

/* ------------------------------------------------------------
   Newsletter — état de succès
   ------------------------------------------------------------ */
const form = document.getElementById('njForm');
const okMsg = document.getElementById('njOk');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!valid) {
    okMsg.textContent = 'Entre un e-mail valide pour rejoindre le Cercle.';
    return;
  }
  okMsg.textContent = 'Bienvenue dans le Cercle. Reste à l’affût — Drop 001 arrive.';
  form.email.value = '';
  if (!reduced) {
    gsap.fromTo(okMsg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  }
});

/* ------------------------------------------------------------
   Boot — on attend les fontes (max 2,5 s) pour découper le texte
   ------------------------------------------------------------ */
const fontsReady = Promise.race([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => setTimeout(r, 2500)),
]);

fontsReady.then(() => {
  splitAll();
  scrollAnimations();
  runPreloader();
  ScrollTrigger.refresh();
});

window.addEventListener('load', () => ScrollTrigger.refresh());
