import * as api from './js/api.js';

const QUOTE_STORAGE_KEY = 'your-energy-quote';
const FAVORITES_STORAGE_KEY = 'your-energy-favorites';

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function removeFavorite(id) {
  const list = getFavorites().filter((e) => e._id !== id);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
}

function escapeAttr(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderStars(rating) {
  const value = Math.round(Number(rating)) || 0;
  let html = '';
  for (let i = 1; i <= 5; i++) html += `<span class="exercise-card-rating-star ${i <= value ? 'filled' : ''}">★</span>`;
  return html;
}

function loadQuoteFromStorage() {
  const quoteText = document.querySelector('[data-quote-text]');
  const quoteAuthor = document.querySelector('[data-quote-author]');
  const today = getDateKey();
  const stored = localStorage.getItem(QUOTE_STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date === today && data.quote) {
        if (quoteText) quoteText.textContent = data.quote;
        if (quoteAuthor) quoteAuthor.textContent = data.author || '';
        return;
      }
    } catch (_) {}
  }
  if (quoteText) quoteText.textContent = 'Завантажте цитату на головній сторінці.';
  if (quoteAuthor) quoteAuthor.textContent = '';
}

function renderFavoritesList() {
  const listEl = document.querySelector('[data-favorites-list]');
  const emptyEl = document.querySelector('[data-favorites-empty]');
  const list = getFavorites();
  if (!listEl) return;
  if (!list.length) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  listEl.innerHTML = list
    .map(
      (ex) => `
    <li class="exercise-card">
      <img class="exercise-card-image" src="${escapeAttr(ex.gifUrl)}" alt="${escapeAttr(ex.name)}" loading="lazy" />
      <div class="exercise-card-body">
        <h3 class="exercise-card-name">${escapeHtml(ex.name)}</h3>
        <div class="exercise-card-rating">${renderStars(ex.rating)}</div>
        <p class="exercise-card-meta"><span>${escapeHtml(ex.bodyPart)}</span> <span>${escapeHtml(ex.target)}</span></p>
        <div class="exercise-card-footer">
          <span class="exercise-card-calories">${ex.burnedCalories} cal</span>
          <span class="exercise-card-time">${ex.time} min</span>
          <button type="button" class="exercise-card-start" data-exercise-id="${escapeAttr(ex._id)}">Start</button>
          <button type="button" class="exercise-card-remove" data-remove-id="${escapeAttr(ex._id)}" aria-label="Remove from favorites">&#10006;</button>
        </div>
      </div>
    </li>
  `
    )
    .join('');
  listEl.querySelectorAll('.exercise-card-start').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-exercise-id')));
  });
  listEl.querySelectorAll('.exercise-card-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFavorite(btn.getAttribute('data-remove-id'));
      renderFavoritesList();
    });
  });
}

const modalBackdrop = document.querySelector('[data-modal-backdrop]');
const modalContent = document.querySelector('[data-modal-content]');
const modalClose = document.querySelector('[data-modal-close]');

function closeModal() {
  if (modalBackdrop) modalBackdrop.hidden = true;
  document.body.style.overflow = '';
}

function openModal(exerciseId) {
  if (!modalBackdrop || !modalContent) return;
  modalContent.innerHTML = '<div class="modal-loading">Loading...</div>';
  modalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  const onClose = () => {
    modalClose?.removeEventListener('click', onClose);
    modalBackdrop?.removeEventListener('click', onBackdrop);
    document.removeEventListener('keydown', onEscape);
    closeModal();
  };
  const onBackdrop = (e) => { if (e.target === modalBackdrop) onClose(); };
  const onEscape = (e) => { if (e.key === 'Escape') onClose(); };
  modalClose?.addEventListener('click', onClose);
  modalBackdrop?.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onEscape);

  api.getExerciseById(exerciseId).then(
    (exercise) => {
      const fav = getFavorites().some((e) => e._id === exercise._id);
      modalContent.innerHTML = `
        <img class="modal-exercise-image" src="${escapeAttr(exercise.gifUrl)}" alt="${escapeAttr(exercise.name)}" />
        <h2 class="modal-exercise-name" id="modal-title">${escapeHtml(exercise.name)}</h2>
        <p class="modal-exercise-meta">${escapeHtml(exercise.bodyPart)} • ${escapeHtml(exercise.target)} • ${exercise.burnedCalories} cal • ${exercise.time} min</p>
        <p class="modal-exercise-description">${escapeHtml(exercise.description || '')}</p>
        <button type="button" class="modal-exercise-fav" data-remove-from-fav data-exercise-id="${escapeAttr(exercise._id)}">Remove from Favorites</button>
      `;
      const favBtn = modalContent.querySelector('[data-remove-from-fav]');
      if (favBtn && fav) {
        favBtn.addEventListener('click', () => {
          removeFavorite(exercise._id);
          closeModal();
          renderFavoritesList();
        });
      } else if (favBtn) favBtn.remove();
    },
    () => {
      modalContent.innerHTML = '<div class="modal-loading">Failed to load exercise.</div>';
    }
  );
}

loadQuoteFromStorage();
renderFavoritesList();

const burger = document.querySelector('[data-burger]');
const menu = document.querySelector('[data-header-menu]');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('.header__nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}
const path = window.location.pathname;
document.querySelectorAll('.header__nav-link').forEach((a) => {
  const href = a.getAttribute('href');
  const isCurrent = (href === './index.html' && !path.includes('favorites')) || (href === './favorites.html' && path.includes('favorites'));
  a.classList.toggle('header__nav-link--current', isCurrent);
});
