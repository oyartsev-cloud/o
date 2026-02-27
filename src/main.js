import * as api from './js/api.js';

const EXERCISES_PER_PAGE = 10;
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

function renderFilterCategories() {
  if (!elements.filterCategories) return;
  elements.filterCategories.innerHTML = state.filtersData
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
      state.activeCategory = state.activeCategory === name ? null : name;
      state.currentPage = 1;
      loadFilters(state.activeFilterType);
      loadExercises();
    });
  });
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

async function loadQuote() {
  try {
    const quote = await api.getQuote();
    renderQuote(quote);
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
}

function openModal(exerciseId) {
  state.modalExerciseId = exerciseId;
  if (!elements.modalBackdrop || !elements.modalContent) return;
  elements.modalContent.innerHTML = '<div class="modal-loading">Loading...</div>';
  elements.modalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  api.getExerciseById(exerciseId).then(
    (exercise) => {
      const starsHtml = renderStars(exercise.rating, true, exercise._id);
      elements.modalContent.innerHTML = `
        <img class="modal-exercise-image" src="${escapeAttr(exercise.gifUrl)}" alt="${escapeAttr(exercise.name)}" />
        <h2 class="modal-exercise-name" id="modal-title">${escapeHtml(exercise.name)}</h2>
        <div class="modal-exercise-rating-wrap">
          <span class="modal-exercise-rating-label">Rating</span>
          <div class="modal-exercise-stars" data-modal-stars>${starsHtml}</div>
        </div>
        <p class="modal-exercise-meta">
          <span>${escapeHtml(exercise.bodyPart)}</span> • <span>${escapeHtml(exercise.target)}</span> • <span>${escapeHtml(exercise.equipment)}</span><br />
          ${exercise.burnedCalories} cal • ${exercise.time} min
        </p>
        <p class="modal-exercise-description">${escapeHtml(exercise.description || '')}</p>
      `;
      elements.modalContent.querySelectorAll('.modal-exercise-star-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rating = Number(btn.getAttribute('data-rating'));
          api.patchExerciseRating(exercise._id, rating).then(
            () => {
              const starBtns = elements.modalContent.querySelectorAll('.modal-exercise-star-btn');
              starBtns.forEach((b, i) => b.classList.toggle('filled', i < rating));
            },
            () => {}
          );
        });
      });
    },
    () => {
      elements.modalContent.innerHTML = '<div class="modal-loading">Failed to load exercise.</div>';
    }
  );
}

function closeModal() {
  if (!elements.modalBackdrop) return;
  elements.modalBackdrop.hidden = true;
  document.body.style.overflow = '';
  state.modalExerciseId = null;
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
      loadExercises();
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
  elements.modalClose?.addEventListener('click', closeModal);
  elements.modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === elements.modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modalBackdrop && !elements.modalBackdrop.hidden) closeModal();
  });
}

function initSubscription() {
  if (!elements.subscriptionForm) return;
  elements.subscriptionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('input[name="email"]');
    const email = (emailInput?.value || '').trim();
    if (!email) return;
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

function init() {
  loadQuote();
  loadFilters('Muscles');
  loadExercises();
  initFilters();
  initSearch();
  initModal();
  initSubscription();
}

init();
