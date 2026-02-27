import * as api from './js/api.js';

const EXERCISES_PER_PAGE = 10;
const QUOTE_STORAGE_KEY = 'your-energy-quote';
const FAVORITES_STORAGE_KEY = 'your-energy-favorites';
const EMAIL_REGEX = /^\w+(\.\w+)?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
const FILTER_PARAM_MAP = {
  Muscles: 'muscles',
  'Body parts': 'bodypart',
  Equipment: 'equipment',
};

const elements = {
  quoteText: document.querySelector('[data-quote-text]'),
  quoteAuthor: document.querySelector('[data-quote-author]'),
  filterTabs: document.querySelectorAll('[data-filter-tab]'),
  filterCategories: document.querySelector('[data-filter-categories]'),
  categoriesBlock: document.querySelector('[data-categories-block]'),
  exercisesSection: document.querySelector('.exercises-section'),
  exercisesTitle: document.querySelector('[data-exercises-title]'),
  searchForm: document.querySelector('[data-search-form]'),
  searchInput: document.querySelector('[data-search-input]'),
  exercisesList: document.querySelector('[data-exercises-list]'),
  pagination: document.querySelector('[data-pagination]'),
  modalBackdrop: document.querySelector('[data-modal-backdrop]'),
  modalContent: document.querySelector('[data-modal-content]'),
  modalClose: document.querySelector('[data-modal-close]'),
  subscriptionForm: document.querySelector('[data-subscription-form]'),
  subscriptionSuccess: document.querySelector('[data-subscription-success]'),
  subscriptionError: document.querySelector('[data-subscription-error]'),
  ratingModalBackdrop: document.querySelector('[data-rating-modal-backdrop]'),
  ratingForm: document.querySelector('[data-rating-form]'),
  ratingError: document.querySelector('[data-rating-error]'),
};

let state = {
  activeFilterType: 'Muscles',
  activeCategory: null,
  keyword: '',
  currentPage: 1,
  totalPages: 1,
  filtersData: [],
  exercisesData: { results: [], page: 1, totalPages: 1 },
  modalExerciseId: null,
  ratingExerciseId: null,
};

function renderQuote(quote) {
  if (!elements.quoteText || !elements.quoteAuthor) return;
  elements.quoteText.textContent = quote.quote;
  elements.quoteAuthor.textContent = quote.author;
}

function getExercisesParams() {
  const params = { page: state.currentPage, limit: EXERCISES_PER_PAGE };
  if (state.keyword) params.keyword = state.keyword;
  const paramKey = FILTER_PARAM_MAP[state.activeFilterType];
  if (paramKey && state.activeCategory) params[paramKey] = state.activeCategory;
  return params;
}

function updateCategoriesVsExercisesView() {
  if (elements.categoriesBlock) elements.categoriesBlock.hidden = !!state.activeCategory;
  if (elements.exercisesSection) elements.exercisesSection.hidden = !state.activeCategory;
  if (elements.exercisesTitle) elements.exercisesTitle.textContent = state.activeCategory ? `Exercises: ${state.activeCategory}` : '';
}

function renderFilterCategories() {
  if (!elements.filterCategories) return;
  elements.filterCategories.innerHTML = !state.filtersData.length
    ? '<li class="filter-categories-empty">No categories for this filter.</li>'
    : state.filtersData
    .map(
      item => `
    <li class="filter-category-item ${state.activeCategory === item.name ? 'active' : ''}">
      <button type="button" class="filter-category-btn" data-category-name="${escapeAttr(item.name)}">
        <img src="${escapeAttr(item.imgURL)}" alt="${escapeAttr(item.name)}" loading="lazy" />
        <span class="filter-category-name">${escapeHtml(item.name)}</span>
      </button>
    </li>
  `
    )
    .join('');

  elements.filterCategories.querySelectorAll('.filter-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-category-name');
      state.activeCategory = name;
      state.currentPage = 1;
      loadFilters(state.activeFilterType);
      loadExercises();
      updateCategoriesVsExercisesView();
    });
  });
  updateCategoriesVsExercisesView();
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

function renderStars(rating, interactive = false, exerciseId = null) {
  const value = Math.round(Number(rating)) || 0;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= value;
    if (interactive && exerciseId) {
      html += `<button type="button" class="modal-exercise-star-btn ${filled ? 'filled' : ''}" data-rating="${i}" data-exercise-id="${escapeAttr(exerciseId)}">★</button>`;
    } else {
      html += `<span class="exercise-card-rating-star ${filled ? 'filled' : ''}">★</span>`;
    }
  }
  return html;
}

function renderExerciseCard(exercise) {
  const ratingHtml = renderStars(exercise.rating, false);
  return `
    <li class="exercise-card">
      <img class="exercise-card-image" src="${escapeAttr(exercise.gifUrl)}" alt="${escapeAttr(exercise.name)}" loading="lazy" />
      <div class="exercise-card-body">
        <h3 class="exercise-card-name">${escapeHtml(exercise.name)}</h3>
        <div class="exercise-card-rating">${ratingHtml}</div>
        <p class="exercise-card-meta">
          <span>${escapeHtml(exercise.bodyPart)}</span>
          <span>${escapeHtml(exercise.target)}</span>
        </p>
        <div class="exercise-card-footer">
          <span class="exercise-card-calories">${exercise.burnedCalories} cal</span>
          <span class="exercise-card-time">${exercise.time} min</span>
          <button type="button" class="exercise-card-start" data-exercise-id="${escapeAttr(exercise._id)}">Start</button>
        </div>
      </div>
    </li>
  `;
}

function renderExercisesList() {
  if (!elements.exercisesList) return;
  const { results } = state.exercisesData;
  if (!results.length) {
    elements.exercisesList.innerHTML = '<li class="exercises-empty">No exercises found. Try another filter or search.</li>';
    return;
  }
  elements.exercisesList.innerHTML = results.map(renderExerciseCard).join('');
  elements.exercisesList.querySelectorAll('.exercise-card-start').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-exercise-id')));
  });
}

function renderPagination() {
  if (!elements.pagination) return;
  const { page, totalPages } = state.exercisesData;
  if (totalPages <= 1) {
    elements.pagination.innerHTML = '';
    return;
  }
  const parts = [];
  const addPage = (p) => {
    parts.push(
      `<button type="button" class="pagination-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`
    );
  };
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) addPage(i);
  } else {
    addPage(1);
    if (page > 3) parts.push('<span class="pagination-ellipsis">...</span>');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) addPage(i);
    if (page < totalPages - 2) parts.push('<span class="pagination-ellipsis">...</span>');
    if (totalPages > 1) addPage(totalPages);
  }
  elements.pagination.innerHTML = parts.join('');
  elements.pagination.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentPage = Number(btn.getAttribute('data-page'));
      loadExercises();
    });
  });
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function addFavorite(exercise) {
  const list = getFavorites();
  if (list.some((e) => e._id === exercise._id)) return;
  list.push(exercise);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
}

function removeFavorite(id) {
  const list = getFavorites().filter((e) => e._id !== id);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
}

function isFavorite(id) {
  return getFavorites().some((e) => e._id === id);
}

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function loadQuote() {
  const today = getDateKey();
  try {
    const stored = localStorage.getItem(QUOTE_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today && data.quote) {
        renderQuote({ quote: data.quote, author: data.author || '' });
        return;
      }
    }
    const quote = await api.getQuote();
    renderQuote(quote);
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify({ date: today, quote: quote.quote, author: quote.author }));
  } catch {
    if (elements.quoteText) elements.quoteText.textContent = 'Failed to load quote.';
    if (elements.quoteAuthor) elements.quoteAuthor.textContent = '';
  }
}

async function loadFilters(filterType) {
  state.activeFilterType = filterType;
  try {
    const data = await api.getFilters(filterType);
    state.filtersData = data.results || [];
    renderFilterCategories();
  } catch {
    state.filtersData = [];
    renderFilterCategories();
  }
}

async function loadExercises() {
  const params = getExercisesParams();
  try {
    const data = await api.getExercises(params);
    state.exercisesData = { results: data.results || [], page: data.page || 1, totalPages: data.totalPages || 1 };
  } catch {
    state.exercisesData = { results: [], page: 1, totalPages: 1 };
  }
  renderExercisesList();
  renderPagination();
  updateCategoriesVsExercisesView();
}

let modalCloseHandlers = null;

function openModal(exerciseId) {
  state.modalExerciseId = exerciseId;
  if (!elements.modalBackdrop || !elements.modalContent) return;
  elements.modalContent.innerHTML = '<div class="modal-loading">Loading...</div>';
  elements.modalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  const onClose = () => {
    if (modalCloseHandlers) {
      elements.modalClose?.removeEventListener('click', modalCloseHandlers.onCloseClick);
      elements.modalBackdrop?.removeEventListener('click', modalCloseHandlers.onBackdropClick);
      document.removeEventListener('keydown', modalCloseHandlers.onEscape);
      modalCloseHandlers = null;
    }
    elements.modalBackdrop.hidden = true;
    document.body.style.overflow = '';
    state.modalExerciseId = null;
  };

  modalCloseHandlers = {
    onCloseClick: onClose,
    onBackdropClick: (e) => { if (e.target === elements.modalBackdrop) onClose(); },
    onEscape: (e) => { if (e.key === 'Escape') onClose(); },
  };
  elements.modalClose?.addEventListener('click', modalCloseHandlers.onCloseClick);
  elements.modalBackdrop?.addEventListener('click', modalCloseHandlers.onBackdropClick);
  document.addEventListener('keydown', modalCloseHandlers.onEscape);

  api.getExerciseById(exerciseId).then(
    (exercise) => {
      const fav = isFavorite(exercise._id);
      const videoBlock = exercise.videoUrl
        ? `<video class="modal-exercise-video" src="${escapeAttr(exercise.videoUrl)}" controls></video>`
        : '';
      const popularityVal = exercise.popularity != null ? exercise.popularity : '';
      elements.modalContent.innerHTML = `
        ${videoBlock}
        <img class="modal-exercise-image" src="${escapeAttr(exercise.gifUrl)}" alt="${escapeAttr(exercise.name)}" />
        <h2 class="modal-exercise-name" id="modal-title">${escapeHtml(exercise.name)}</h2>
        <div class="modal-exercise-rating-wrap">
          <span class="modal-exercise-rating-label">Rating</span>
          <div class="modal-exercise-stars" data-modal-stars>${renderStars(exercise.rating, false)}</div>
        </div>
        <p class="modal-exercise-meta">
          <span>${escapeHtml(exercise.bodyPart)}</span> • <span>${escapeHtml(exercise.target)}</span> • <span>${escapeHtml(exercise.equipment)}</span><br />
          ${popularityVal ? `Popularity: ${popularityVal}<br />` : ''}
          ${exercise.burnedCalories} cal • ${exercise.time} min
        </p>
        <p class="modal-exercise-description">${escapeHtml(exercise.description || '')}</p>
        <button type="button" class="modal-exercise-fav" data-modal-fav data-exercise-id="${escapeAttr(exercise._id)}">${fav ? 'Remove from Favorites' : 'Add to Favorites'}</button>
        <button type="button" class="modal-exercise-give-rating" data-modal-give-rating data-exercise-id="${escapeAttr(exercise._id)}">Give a rating</button>
      `;
      const favBtn = elements.modalContent.querySelector('[data-modal-fav]');
      if (favBtn) {
        favBtn.addEventListener('click', () => {
          if (isFavorite(exercise._id)) {
            removeFavorite(exercise._id);
            favBtn.textContent = 'Add to Favorites';
          } else {
            addFavorite(exercise);
            favBtn.textContent = 'Remove from Favorites';
          }
        });
      }
      const giveRatingBtn = elements.modalContent.querySelector('[data-modal-give-rating]');
      if (giveRatingBtn) {
        giveRatingBtn.addEventListener('click', () => {
          onClose();
          openRatingModal(exercise._id);
        });
      }
    },
    () => {
      elements.modalContent.innerHTML = '<div class="modal-loading">Failed to load exercise.</div>';
    }
  );
}

function closeModal() {
  if (modalCloseHandlers) {
    elements.modalClose?.removeEventListener('click', modalCloseHandlers.onCloseClick);
    elements.modalBackdrop?.removeEventListener('click', modalCloseHandlers.onBackdropClick);
    document.removeEventListener('keydown', modalCloseHandlers.onEscape);
    modalCloseHandlers = null;
  }
  if (!elements.modalBackdrop) return;
  elements.modalBackdrop.hidden = true;
  document.body.style.overflow = '';
  state.modalExerciseId = null;
}

function openRatingModal(exerciseId) {
  state.ratingExerciseId = exerciseId;
  const backdrop = elements.ratingModalBackdrop;
  const form = elements.ratingForm;
  if (!backdrop || !form) return;
  form.reset();
  if (elements.ratingError) elements.ratingError.hidden = true;
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeRatingModal() {
  const backdrop = elements.ratingModalBackdrop;
  if (!backdrop) return;
  backdrop.hidden = true;
  document.body.style.overflow = '';
  if (state.ratingExerciseId && elements.modalBackdrop) {
    openModal(state.ratingExerciseId);
  }
  state.ratingExerciseId = null;
}

function initRatingModal() {
  state.ratingExerciseId = null;
  const backdrop = elements.ratingModalBackdrop;
  const closeBtn = document.querySelector('[data-rating-modal-close]');
  if (closeBtn) closeBtn.addEventListener('click', closeRatingModal);
  if (backdrop) backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeRatingModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && backdrop && !backdrop.hidden) closeRatingModal(); });
  if (elements.ratingForm) {
    elements.ratingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailEl = elements.ratingForm.querySelector('[data-rating-email]');
      const email = (emailEl?.value || '').trim();
      const ratingEl = elements.ratingForm.querySelector('input[name="rating"]:checked');
      const rating = ratingEl ? Number(ratingEl.value) : 0;
      if (!EMAIL_REGEX.test(email)) {
        if (elements.ratingError) {
          elements.ratingError.textContent = 'Enter a valid email (e.g. user@domain.com)';
          elements.ratingError.hidden = false;
        }
        return;
      }
      if (rating < 1 || rating > 5) {
        if (elements.ratingError) {
          elements.ratingError.textContent = 'Please select a rating.';
          elements.ratingError.hidden = false;
        }
        return;
      }
      if (elements.ratingError) elements.ratingError.hidden = true;
      try {
        await api.patchExerciseRating(state.ratingExerciseId, rating);
        closeRatingModal();
      } catch (err) {
        if (elements.ratingError) {
          elements.ratingError.textContent = err.message || 'Failed to submit rating.';
          elements.ratingError.hidden = false;
        }
      }
    });
  }
}

function initFilters() {
  elements.filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filterType = tab.getAttribute('data-filter-tab');
      elements.filterTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      state.activeCategory = null;
      state.currentPage = 1;
      loadFilters(filterType);
      updateCategoriesVsExercisesView();
    });
  });
}

function initSearch() {
  if (!elements.searchForm) return;
  elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.keyword = (elements.searchInput?.value || '').trim();
    state.currentPage = 1;
    loadExercises();
  });
}

function initModal() {
  /* Close listeners are added in openModal and removed in closeModal to prevent memory leaks */
}

function initSubscription() {
  if (!elements.subscriptionForm) return;
  elements.subscriptionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('input[name="email"]');
    const email = (emailInput?.value || '').trim();
    if (!email) return;
    if (!EMAIL_REGEX.test(email)) {
      if (elements.subscriptionError) {
        elements.subscriptionError.textContent = 'Enter a valid email (e.g. user@domain.com)';
        elements.subscriptionError.hidden = false;
      }
      return;
    }
    if (elements.subscriptionSuccess) elements.subscriptionSuccess.hidden = true;
    if (elements.subscriptionError) {
      elements.subscriptionError.hidden = true;
      elements.subscriptionError.textContent = '';
    }
    try {
      await api.postSubscription(email);
      if (elements.subscriptionSuccess) elements.subscriptionSuccess.hidden = false;
      form.reset();
    } catch (err) {
      if (elements.subscriptionError) {
        elements.subscriptionError.textContent = err.message || 'Subscription failed. Try again.';
        elements.subscriptionError.hidden = false;
      }
    }
  });
}

function initHeader() {
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
    const isCurrent = (a.getAttribute('href') === './index.html' && !path.includes('favorites')) ||
      (a.getAttribute('href') === './favorites.html' && path.includes('favorites'));
    a.classList.toggle('header__nav-link--current', isCurrent);
  });
}

function init() {
  loadQuote();
  loadFilters('Muscles');
  updateCategoriesVsExercisesView();
  initFilters();
  initSearch();
  initModal();
  initRatingModal();
  initSubscription();
  initHeader();
}

init();
