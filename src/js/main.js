/* ===================================
   YOUR ENERGY - Main JavaScript
   Complete functionality according to requirements
   =================================== */

// API Base URL
const API_BASE_URL = 'https://your-energy.b.goit.study/api';

// Application State
const state = {
  currentFilter: 'Muscles',
  selectedCategory: null,
  currentPage: 1,
  exercisesPerPage: 12,
  searchKeyword: '',
  exercises: [],
  filters: [],
  quote: null,
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  isLoading: false
};

// DOM Elements
const elements = {
  quoteContent: null,
  filtersContainer: null,
  exercisesContainer: null,
  searchForm: null,
  paginationContainer: null,
  exerciseModal: null,
  ratingModal: null,
  subscriptionForm: null,
  mobileMenuToggle: null,
  mobileMenu: null,
  overlay: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  initializeEventListeners();
  loadInitialData();
  console.log('Your Energy App Initialized');
});

// Elements Initialization
function initializeElements() {
  elements.quoteContent = document.querySelector('.quote__content');
  elements.filtersContainer = document.querySelector('.filters__categories');
  elements.exercisesContainer = document.querySelector('.exercises__grid');
  elements.searchForm = document.querySelector('.search__form');
  elements.paginationContainer = document.querySelector('.pagination');
  elements.exerciseModal = document.getElementById('exercise-modal');
  elements.ratingModal = document.getElementById('rating-modal');
  elements.subscriptionForm = document.querySelector('.footer__subscription');
  elements.mobileMenuToggle = document.querySelector('.header__mobile-toggle');
  elements.mobileMenu = document.querySelector('.header__mobile-menu');
  elements.overlay = document.querySelector('.overlay');
}

// Event Listeners
function initializeEventListeners() {
  // Filter tabs
  document.querySelectorAll('.filters__tab').forEach(tab => {
    tab.addEventListener('click', handleFilterTabClick);
  });

  // Search form
  if (elements.searchForm) {
    elements.searchForm.addEventListener('submit', handleSearchSubmit);
  }

  // Mobile menu
  if (elements.mobileMenuToggle) {
    elements.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Overlay
  if (elements.overlay) {
    elements.overlay.addEventListener('click', closeMobileMenu);
  }

  // Subscription form
  if (elements.subscriptionForm) {
    elements.subscriptionForm.addEventListener('submit', handleSubscriptionSubmit);
  }

  // Modal close events
  document.addEventListener('click', handleModalClose);
  document.addEventListener('keydown', handleEscapeKey);
}

// Load Initial Data
async function loadInitialData() {
  try {
    await Promise.all([
      loadQuote(),
      loadFilters('Muscles')
    ]);
    
    // Set Muscles as active filter
    const musclesTab = document.getElementById('muscles-tab');
    if (musclesTab) {
      musclesTab.setAttribute('aria-selected', 'true');
    }
    
    state.currentFilter = 'Muscles';
  } catch (error) {
    console.error('Error loading initial data:', error);
    showError('Failed to load initial data');
  }
}

// API Functions
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  
  return response.json();
}

// Quote Management
async function loadQuote() {
  try {
    const today = new Date().toDateString();
    const storedQuote = localStorage.getItem('dailyQuote');
    const storedDate = localStorage.getItem('quoteDate');
    
    if (storedQuote && storedDate === today) {
      state.quote = JSON.parse(storedQuote);
      renderQuote();
      return;
    }
    
    const quote = await fetchApi('/quote');
    state.quote = quote;
    localStorage.setItem('dailyQuote', JSON.stringify(quote));
    localStorage.setItem('quoteDate', today);
    renderQuote();
  } catch (error) {
    console.error('Error loading quote:', error);
    renderQuoteError();
  }
}

function renderQuote() {
  if (!elements.quoteContent || !state.quote) return;
  
  const quoteHTML = `
    <p class="quote__text">"${state.quote.quote}"</p>
    <cite class="quote__author">${state.quote.author}</cite>
  `;
  
  elements.quoteContent.innerHTML = quoteHTML;
}

function renderQuoteError() {
  if (!elements.quoteContent) return;
  
  elements.quoteContent.innerHTML = `
    <p class="quote__text">Не вдалося завантажити цитату дня</p>
  `;
}

// Filters Management
async function loadFilters(filterType) {
  try {
    state.isLoading = true;
    showLoading(elements.filtersContainer);
    
    const filters = await fetchApi(`/filters?filter=${filterType}`);
    state.filters = filters;
    renderFilters();
  } catch (error) {
    console.error('Error loading filters:', error);
    showError('Failed to load filters');
    renderFiltersError();
  } finally {
    state.isLoading = false;
  }
}

function renderFilters() {
  if (!elements.filtersContainer) return;
  
  if (state.filters.length === 0) {
    elements.filtersContainer.innerHTML = `
      <div class="no-filters">
        <p>Категорії не знайдено</p>
      </div>
    `;
    return;
  }
  
  const filtersHTML = state.filters.map(filter => `
    <div class="filter-category">
      <button class="filter-category__button" data-filter="${filter.filter}" data-name="${filter.name}">
        <img src="${filter.image}" alt="${filter.name}" class="filter-category__image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="filter-category__icon" style="display:none;">💪</div>
        <span class="filter-category__name">${filter.name}</span>
      </button>
    </div>
  `).join('');
  
  elements.filtersContainer.innerHTML = filtersHTML;
  
  // Add click listeners to filter categories
  elements.filtersContainer.querySelectorAll('.filter-category__button').forEach(button => {
    button.addEventListener('click', handleCategoryClick);
  });
}

function renderFiltersError() {
  if (!elements.filtersContainer) return;
  
  elements.filtersContainer.innerHTML = `
    <div class="no-filters">
      <p>Не вдалося завантажити фільтри</p>
    </div>
  `;
}

function handleFilterTabClick(event) {
  const tab = event.target;
  const filterType = tab.textContent.trim();
  
  // Update active state
  document.querySelectorAll('.filters__tab').forEach(t => {
    t.setAttribute('aria-selected', 'false');
  });
  
  tab.setAttribute('aria-selected', 'true');
  
  state.currentFilter = filterType;
  state.selectedCategory = null;
  loadFilters(filterType);
}

function handleCategoryClick(event) {
  const button = event.currentTarget;
  const filterType = button.dataset.filter;
  const categoryName = button.dataset.name;
  
  state.selectedCategory = filterType;
  loadExercises();
}

// Exercises Management
async function loadExercises() {
  try {
    state.isLoading = true;
    showLoading(elements.exercisesContainer);
    
    const params = new URLSearchParams();
    params.set('page', state.currentPage);
    params.set('limit', state.exercisesPerPage);
    
    if (state.selectedCategory) {
      if (state.currentFilter === 'Muscles') {
        params.set('muscles', state.selectedCategory);
      } else if (state.currentFilter === 'Body parts') {
        params.set('bodypart', state.selectedCategory);
      } else if (state.currentFilter === 'Equipment') {
        params.set('equipment', state.selectedCategory);
      }
    }
    
    if (state.searchKeyword) {
      params.set('keyword', state.searchKeyword);
    }
    
    const response = await fetchApi(`/exercises?${params.toString()}`);
    state.exercises = response.results || [];
    renderExercises();
    renderPagination(response.totalPages || 1);
  } catch (error) {
    console.error('Error loading exercises:', error);
    showError('Failed to load exercises');
    renderExercisesError();
  } finally {
    state.isLoading = false;
  }
}

function renderExercises() {
  if (!elements.exercisesContainer) return;
  
  if (state.exercises.length === 0) {
    elements.exercisesContainer.innerHTML = `
      <div class="no-exercises">
        <h3>Вправи не знайдено</h3>
        <p>Спробуйте змінити фільтри або пошуковий запит</p>
      </div>
    `;
    return;
  }
  
  const exercisesHTML = state.exercises.map(exercise => `
    <article class="exercise-card" data-id="${exercise._id}">
      <img src="${exercise.gifUrl || './images/placeholder.jpg'}" alt="${exercise.name}" class="exercise-card__image">
      <div class="exercise-card__content">
        <h3 class="exercise-card__title">${exercise.name}</h3>
        <div class="exercise-card__meta">
          <span class="exercise-card__badge">${exercise.bodyPart}</span>
          <span class="exercise-card__badge">${exercise.target}</span>
        </div>
        <div class="exercise-card__stats">
          <span>${exercise.burnedCalories || 0} калорій</span>
          <span>3 хв</span>
        </div>
        <div class="exercise-card__rating">
          ${renderStars(exercise.rating || 0)}
        </div>
        <button class="exercise-card__start-btn" data-id="${exercise._id}">
          Start
        </button>
      </div>
    </article>
  `).join('');
  
  elements.exercisesContainer.innerHTML = exercisesHTML;
  
  // Add click listeners to start buttons
  elements.exercisesContainer.querySelectorAll('.exercise-card__start-btn').forEach(button => {
    button.addEventListener('click', handleExerciseStart);
  });
}

function renderExercisesError() {
  if (!elements.exercisesContainer) return;
  
  elements.exercisesContainer.innerHTML = `
    <div class="no-exercises">
      <h3>Не вдалося завантажити вправи</h3>
      <p>Спробуйте оновити сторінку</p>
    </div>
  `;
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star">★</span>';
  }
  if (hasHalfStar) {
    stars += '<span class="star">☆</span>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="star empty">☆</span>';
  }
  
  return stars;
}

function renderPagination(totalPages) {
  if (!elements.paginationContainer || totalPages <= 1) return;
  
  let paginationHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === state.currentPage;
    paginationHTML += `
      <button class="pagination__btn ${isActive ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  elements.paginationContainer.innerHTML = paginationHTML;
  
  // Add click listeners
  elements.paginationContainer.querySelectorAll('.pagination__btn').forEach(button => {
    button.addEventListener('click', handlePaginationClick);
  });
}

function handlePaginationClick(event) {
  const page = parseInt(event.target.dataset.page);
  if (page !== state.currentPage) {
    state.currentPage = page;
    loadExercises();
  }
}

// Search Management
function handleSearchSubmit(event) {
  event.preventDefault();
  const searchInput = document.getElementById('search-input');
  const keyword = searchInput.value.trim();
  
  state.searchKeyword = keyword;
  state.currentPage = 1;
  loadExercises();
}

// Modal Management
async function handleExerciseStart(event) {
  const exerciseId = event.target.dataset.id;
  
  try {
    const exercise = await fetchApi(`/exercises/${exerciseId}`);
    state.modalData = exercise;
    renderExerciseModal();
    openModal('exercise');
  } catch (error) {
    console.error('Error loading exercise details:', error);
    showError('Failed to load exercise details');
  }
}

function renderExerciseModal() {
  if (!state.modalData) return;
  
  const exercise = state.modalData;
  const isFavorite = state.favorites.some(fav => fav._id === exercise._id);
  
  // Update modal content
  const modalTitle = elements.exerciseModal.querySelector('.modal__title');
  const modalMedia = elements.exerciseModal.querySelector('.modal__media');
  const modalDescription = elements.exerciseModal.querySelector('.modal__description');
  const modalFavorite = elements.exerciseModal.querySelector('.modal__favorite');
  
  if (modalTitle) modalTitle.textContent = exercise.name;
  
  if (modalMedia) {
    if (exercise.gifUrl) {
      modalMedia.innerHTML = `
        <video autoplay loop muted playsinline class="modal__video">
          <source src="${exercise.gifUrl}" type="video/mp4">
        </video>
      `;
    } else {
      modalMedia.innerHTML = `
        <img src="${exercise.image || './images/placeholder.jpg'}" alt="${exercise.name}" class="modal__image">
      `;
    }
  }
  
  if (modalDescription) {
    modalDescription.innerHTML = `
      <div class="modal__details">
        <p><strong>Ціль:</strong> ${exercise.target}</p>
        <p><strong>Частина тіла:</strong> ${exercise.bodyPart}</p>
        <p><strong>Популярність:</strong> ${exercise.popularity || 0}%</p>
        <p><strong>Калорії:</strong> ${exercise.burnedCalories || 0} за 3 хв</p>
      </div>
      <p>${exercise.description || ''}</p>
    `;
  }
  
  if (modalFavorite) {
    modalFavorite.textContent = isFavorite ? 'Видалити з улюблених' : 'Додати до улюблених';
    modalFavorite.onclick = () => handleFavoriteToggle(exercise._id);
  }
}

function openModal(type) {
  const modal = type === 'exercise' ? elements.exerciseModal : elements.ratingModal;
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(type) {
  const modal = type === 'exercise' ? elements.exerciseModal : elements.ratingModal;
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function handleModalClose(event) {
  const closeBtn = event.target.closest('.modal__close');
  const overlay = event.target.closest('.modal__overlay');
  
  if (closeBtn || overlay) {
    if (elements.exerciseModal && elements.exerciseModal.getAttribute('aria-hidden') === 'false') {
      closeModal('exercise');
    }
    if (elements.ratingModal && elements.ratingModal.getAttribute('aria-hidden') === 'false') {
      closeModal('rating');
    }
  }
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    if (elements.exerciseModal && elements.exerciseModal.getAttribute('aria-hidden') === 'false') {
      closeModal('exercise');
    }
    if (elements.ratingModal && elements.ratingModal.getAttribute('aria-hidden') === 'false') {
      closeModal('rating');
    }
    if (elements.mobileMenu && elements.mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  }
}

// Rating Modal
function openRatingModal() {
  closeModal('exercise');
  openModal('rating');
}

async function handleRatingSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const rating = parseInt(formData.get('rating'));
  const email = formData.get('email');
  
  if (!rating || !email) {
    showError('Будь ласка, оберіть рейтинг та введіть email');
    return;
  }
  
  try {
    await fetchApi(`/exercises/${state.modalData._id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating }),
    });
    
    showSuccess('Рейтинг успішно надіслано!');
    closeModal('rating');
    
    // Reload exercises to show updated rating
    loadExercises();
  } catch (error) {
    console.error('Error submitting rating:', error);
    showError('Не вдалося надіслати рейтинг');
  }
}

// Favorites Management
function handleFavoriteToggle(exerciseId) {
  const exercise = state.exercises.find(ex => ex._id === exerciseId);
  
  if (!exercise) return;
  
  const index = state.favorites.findIndex(fav => fav._id === exerciseId);
  
  if (index > -1) {
    state.favorites.splice(index, 1);
    showSuccess('Вправу видалено з улюблених');
  } else {
    state.favorites.push(exercise);
    showSuccess('Вправу додано до улюблених');
  }
  
  localStorage.setItem('favorites', JSON.stringify(state.favorites));
  renderExerciseModal(); // Update modal button
}

// Subscription Management
async function handleSubscriptionSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const email = formData.get('email');
  
  if (!email) {
    showError('Будь ласка, введіть email');
    return;
  }
  
  try {
    await fetchApi('/subscription', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    showSuccess('Підписка успішна!');
    event.target.reset();
  } catch (error) {
    console.error('Error subscribing:', error);
    showError('Не вдалося підписатися');
  }
}

// Mobile Menu Management
function toggleMobileMenu() {
  const isOpen = elements.mobileMenu.classList.contains('active');
  
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  elements.mobileMenu.classList.add('active');
  elements.overlay.classList.add('active');
  elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  elements.mobileMenu.classList.remove('active');
  elements.overlay.classList.remove('active');
  elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Utility Functions
function showLoading(container) {
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  }
}

function showError(message) {
  showNotification(message, 'error');
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${type === 'error' ? '#f56565' : type === 'success' ? '#48bb78' : '#3182ce'};
    color: white;
    border-radius: 8px;
    font-weight: 500;
    z-index: 9999;
    transform: translateY(100px);
    transition: transform 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateY(0)';
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateY(100px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Export for testing
window.YourEnergyApp = {
  state,
  loadQuote,
  loadFilters,
  loadExercises,
  openModal,
  closeModal
};
