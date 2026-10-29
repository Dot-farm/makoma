import './styles.css';
import { BEADS, SYMBOLS, findSymbol } from './data.js';
import { BeadScene } from './bead-scene.js';

const canvas = document.querySelector('#bead-canvas');
const beadTabs = document.querySelector('#bead-tabs');
const symbolGrid = document.querySelector('#symbol-grid');
const activeName = document.querySelector('#active-name');
const activeMeaning = document.querySelector('#active-meaning');
const activeNumber = document.querySelector('#active-number');
const activeDescription = document.querySelector('#active-description');
const featureName = document.querySelector('#symbol-feature-name');
const featureMeaning = document.querySelector('#symbol-feature-meaning');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeIndex = 0;
let selectedSymbols = BEADS.map((bead) => bead.symbolId);
let scene;

function renderBeadTabs() {
  beadTabs.innerHTML = BEADS.map((bead, index) => {
    const symbol = findSymbol(selectedSymbols[index]);
    return `<button class="bead-tab${index === activeIndex ? ' is-active' : ''}" type="button" data-bead-index="${index}" aria-pressed="${index === activeIndex}" aria-label="Select bead ${bead.number}, ${symbol.name}">
      <span class="bead-tab__number">${bead.number}</span><span class="bead-tab__dot" aria-hidden="true"></span>
    </button>`;
  }).join('');

  beadTabs.querySelectorAll('[data-bead-index]').forEach((button) => {
    button.addEventListener('click', () => selectBead(Number(button.dataset.beadIndex)));
  });
}

function selectBead(index, symbolOverride) {
  activeIndex = ((index % BEADS.length) + BEADS.length) % BEADS.length;
  if (symbolOverride) selectedSymbols[activeIndex] = symbolOverride;
  const symbol = findSymbol(selectedSymbols[activeIndex]);
  activeName.textContent = symbol.name;
  activeMeaning.textContent = symbol.meaning;
  activeNumber.textContent = BEADS[activeIndex].number;
  activeDescription.textContent = symbol.description;
  featureName.textContent = symbol.name;
  featureMeaning.textContent = symbol.meaning;
  scene?.setActive(activeIndex);
  renderBeadTabs();
  updateSymbolSelection(symbol.id);
}

function updateSymbolSelection(symbolId) {
  symbolGrid.querySelectorAll('[data-symbol-id]').forEach((button) => {
    const selected = button.dataset.symbolId === symbolId;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function renderSymbols() {
  symbolGrid.innerHTML = SYMBOLS.map((symbol, index) => `<button class="symbol-card${symbol.id === selectedSymbols[0] ? ' is-selected' : ''}" type="button" data-symbol-id="${symbol.id}" data-symbol-index="${index}" aria-pressed="${symbol.id === selectedSymbols[0]}" aria-label="${symbol.name}: ${symbol.meaning}. ${symbol.description}">
    <span class="symbol-card__top"><span class="symbol-card__index">0${index + 1}</span><span class="symbol-card__mark" aria-hidden="true"></span></span>
    <strong>${symbol.name}</strong>
    <span class="symbol-card__meaning">${symbol.meaning}</span>
    <span class="symbol-card__description">${symbol.description}</span>
    <span class="symbol-card__action">Explore this meaning <span aria-hidden="true">↗</span></span>
  </button>`).join('');

  symbolGrid.querySelectorAll('[data-symbol-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const symbolIndex = Number(button.dataset.symbolIndex);
      selectBead(symbolIndex % BEADS.length, button.dataset.symbolId);
    });
  });
}

renderBeadTabs();
renderSymbols();
selectBead(0);

try {
  scene = new BeadScene(canvas, selectBead);
  scene.setActive(0);
} catch (error) {
  document.querySelector('.viewer-stage')?.classList.add('viewer-stage--fallback');
  console.warn('The 3D bead viewer is unavailable in this browser; showing the product photo instead.', error);
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  siteNav.classList.toggle('is-open', !isOpen);
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  });
});

if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

const hero = document.querySelector('.hero');
if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    hero.style.setProperty('--pointer-x', `${Math.round(x * 100)}%`);
    hero.style.setProperty('--pointer-y', `${Math.round(y * 100)}%`);
  }, { passive: true });
}
