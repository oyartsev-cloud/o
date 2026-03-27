/* ===================================
   YOUR ENERGY APP - Full Implementation
   Complete functionality according to requirements
   =================================== */

import { 
  getQuote, 
  getFilters, 
  getExercises, 
  getExerciseById, 
  patchExerciseRating, 
  postSubscription 
} from './api.js';

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
  favorites: [],
  isLoading: false,
  modalData: null
};

// DOM Elements
const elements = {
  quoteContainer: null,
  filtersContainer: null,
  exercisesContainer: null,
  searchForm: null,
  paginationContainer: null,
  modal: null,
  ratingModal: null,
  subscriptionForm: null,
  filterTabs: null,
  mobileMenu: null,
  mobileMenuToggle: null,
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
  elements.quoteContainer = document.querySelector('.quote-section');
  elements.filtersContainer = document.querySelector('.filters-section__scroll-wrapper');
  elements.exercisesContainer = document.querySelector('.exercises-section__grid');
  elements.searchForm = document.querySelector('.search-form');
  elements.paginationContainer = document.querySelector('.pagination-container');
  elements.modal = document.querySelector('.exercise-modal');
  elements.ratingModal = document.querySelector('.rating-modal');
  elements.subscriptionForm = document.querySelector('.subscription-form');
  elements.filterTabs = document.querySelectorAll('.filter-tab');
  elements.mobileMenu = document.querySelector('.header__mobile-menu');
  elements.mobileMenuToggle = document.querySelector('.header__mobile-toggle');
  elements.overlay = document.querySelector('.header__overlay');
}

// Event Listeners
function initializeEventListeners() {
  // Filter tabs
  elements.filterTabs.forEach(tab => {
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

  // Scroll events
  window.addEventListener('scroll', handleScroll);
}

// Load Initial Data
async function loadInitialData() {
  try {
    await Promise.all([
      loadQuote(),
      loadFilters('Muscles')
    ]);
    
    // Set Muscles as active filter
    const musclesTab = document.getElementById('tab-muscles');
    if (musclesTab) {
      musclesTab.classList.add('active');
      musclesTab.setAttribute('aria-selected', 'true');
    }
    
    state.currentFilter = 'Muscles';
  } catch (error) {
    console.error('Error loading initial data:', error);
    showError('Failed to load initial data');
  }
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
    
    const quote = await getQuote();
    state.quote = quote;
    localStorage.setItem('dailyQuote', JSON.stringify(quote));
    localStorage.setItem('quoteDate', today);
    renderQuote();
  } catch (error) {
    console.error('Error loading quote:', error);
  }
}

function renderQuote() {
  if (!elements.quoteContainer || !state.quote) return;
  
  const quoteHTML = `
    <div class="quote-card card">
      <div class="quote-content">
        <p class="quote-text">"${state.quote.quote}"</p>
        <cite class="quote-author">${state.quote.author}</cite>
      </div>
      <div class="quote-info">
        <p class="quote-description">
          Важливість щоденного фізичного навантаження тривалістю щонайменше 110 хвилин для підтримки здоров'я та добробуту.
        </p>
      </div>
    </div>
  `;
  
  elements.quoteContainer.innerHTML = quoteHTML;
}

// Filters Management
async function loadFilters(filterType) {
  try {
    state.isLoading = true;
    showLoading(elements.filtersContainer);
    
    const filters = await getFilters(filterType);
    state.filters = filters;
    renderFilters();
  } catch (error) {
    console.error('Error loading filters:', error);
    showError('Failed to load filters');
  } finally {
    state.isLoading = false;
  }
}

function renderFilters() {
  if (!elements.filtersContainer) return;
  
  const filtersHTML = state.filters.map(filter => `
    <div class="filter-category card card--interactive">
      <button class="filter-category__button" data-filter="${filter.filter}" data-name="${filter.name}">
        <img src="${filter.image}" alt="" class="filter-category__icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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

function handleFilterTabClick(event) {
  const tab = event.target;
  const filterType = tab.textContent.trim();
  
  // Update active state
  elements.filterTabs.forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  
  tab.classList.add('active');
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
    
    const params = {
      page: state.currentPage,
      limit: state.exercisesPerPage
    };
    
    if (state.selectedCategory) {
      if (state.currentFilter === 'Muscles') {
        params.muscles = state.selectedCategory;
      } else if (state.currentFilter === 'Body parts') {
        params.bodypart = state.selectedCategory;
      } else if (state.currentFilter === 'Equipment') {
        params.equipment = state.selectedCategory;
      }
    }
    
    if (state.searchKeyword) {
      params.keyword = state.searchKeyword;
    }
    
    const response = await getExercises(params);
    state.exercises = response.results || [];
    renderExercises();
    renderPagination(response.totalPages || 1);
  } catch (error) {
    console.error('Error loading exercises:', error);
    showError('Failed to load exercises');
  } finally {
    state.isLoading = false;
  }
}

function renderExercises() {
  if (!elements.exercisesContainer) return;
  
  if (state.exercises.length === 0) {
    elements.exercisesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        <h3 class="empty-state__title">Вправи не знайдено</h3>
        <p class="empty-state__description">
          Спробуйте змінити фільтри або пошуковий запит
        </p>
      </div>
    `;
    return;
  }
  
  const exercisesHTML = state.exercises.map(exercise => `
    <article class="exercise-card card card--interactive" data-id="${exercise._id}">
      <div class="exercise-card__image-wrapper">
        <img src="${exercise.gifUrl || './images/placeholder.jpg'}" alt="${exercise.name}" class="exercise-card__image">
      </div>
      <div class="exercise-card__body">
        <h3 class="exercise-card__title">${exercise.name}</h3>
        <div class="exercise-card__meta">
          <span class="exercise-card__badge">${exercise.bodyPart}</span>
          <span class="exercise-card__badge">${exercise.target}</span>
        </div>
        <div class="exercise-card__stats">
          <span class="exercise-card__calories">${exercise.burnedCalories || 0} калорій</span>
          <span class="exercise-card__time">3 хв</span>
        </div>
        <div class="exercise-card__rating">
          ${renderStars(exercise.rating || 0)}
        </div>
        <button class="exercise-card__start-btn btn btn--primary" data-id="${exercise._id}">
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

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '<div class="exercise-card__star">★</div>';
  }
  if (hasHalfStar) {
    stars += '<div class="exercise-card__star">☆</div>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<div class="exercise-card__star empty">☆</div>';
  }
  
  return stars;
}

function renderPagination(totalPages) {
  if (!elements.paginationContainer || totalPages <= 1) return;
  
  let paginationHTML = '<div class="pagination">';
  
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === state.currentPage;
    paginationHTML += `
      <button class="pagination__btn ${isActive ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  paginationHTML += '</div>';
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
    const exercise = await getExerciseById(exerciseId);
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
  
  const modalHTML = `
    <div class="exercise-modal">
      <div class="exercise-modal__overlay"></div>
      <div class="exercise-modal__content">
        <button class="exercise-modal__close" aria-label="Закрити">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div class="exercise-modal__media">
          ${exercise.gifUrl ? `
            <video autoplay loop muted playsinline class="exercise-modal__video">
              <source src="${exercise.gifUrl}" type="video/mp4">
            </video>
          ` : `
            <img src="${exercise.image || './images/placeholder.jpg'}" alt="${exercise.name}" class="exercise-modal__image">
          `}
        </div>
        
        <div class="exercise-modal__info">
          <h2 class="exercise-modal__title">${exercise.name}</h2>
          
          <div class="exercise-modal__rating">
            ${renderStars(exercise.rating || 0)}
            <span class="exercise-modal__rating-value">(${exercise.rating || 0})</span>
          </div>
          
          <div class="exercise-modal__details">
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Ціль:</span>
              <span class="exercise-modal__value">${exercise.target}</span>
            </div>
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Частина тіла:</span>
              <span class="exercise-modal__value">${exercise.bodyPart}</span>
            </div>
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Популярність:</span>
              <span class="exercise-modal__value">${exercise.popularity || 0}%</span>
            </div>
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Калорії:</span>
              <span class="exercise-modal__value">${exercise.burnedCalories || 0} калорій за 3 хв</span>
            </div>
          </div>
          
          <p class="exercise-modal__description">${exercise.description || ''}</p>
          
          <div class="exercise-modal__actions">
            <button class="exercise-modal__favorite-btn ${isFavorite ? 'favorited' : ''}" data-id="${exercise._id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              ${isFavorite ? 'Видалити' : 'Додати'}
            </button>
            
            <button class="exercise-modal__rating-btn btn btn--primary">
              Give a rating
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Create modal if it doesn't exist
  if (!elements.modal) {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    elements.modal = document.querySelector('.exercise-modal');
  } else {
    elements.modal.innerHTML = modalHTML;
  }
  
  // Add event listeners
  const closeBtn = elements.modal.querySelector('.exercise-modal__close');
  const favoriteBtn = elements.modal.querySelector('.exercise-modal__favorite-btn');
  const ratingBtn = elements.modal.querySelector('.exercise-modal__rating-btn');
  const overlay = elements.modal.querySelector('.exercise-modal__overlay');
  
  closeBtn.addEventListener('click', () => closeModal('exercise'));
  overlay.addEventListener('click', () => closeModal('exercise'));
  favoriteBtn.addEventListener('click', handleFavoriteToggle);
  ratingBtn.addEventListener('click', openRatingModal);
}

function openRatingModal() {
  renderRatingModal();
  openModal('rating');
}

function renderRatingModal() {
  const ratingModalHTML = `
    <div class="rating-modal">
      <div class="rating-modal__overlay"></div>
      <div class="rating-modal__content">
        <button class="rating-modal__close" aria-label="Закрити">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 class="rating-modal__title">Оцініть вправу</h2>
        
        <div class="rating-modal__stars">
          ${[1, 2, 3, 4, 5].map(rating => `
            <input type="radio" id="rating-${rating}" name="rating" value="${rating}" class="rating-modal__radio">
            <label for="rating-${rating}" class="rating-modal__star">
              ★
            </label>
          `).join('')}
        </div>
        
        <form class="rating-modal__form">
          <div class="rating-modal__form-group">
            <label for="rating-email" class="rating-modal__label">Email:</label>
            <input 
              type="email" 
              id="rating-email" 
              class="rating-modal__input" 
              placeholder="your.email@example.com"
              required
              pattern="^\\w+(\\.\\w+)?@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$"
            >
          </div>
          
          <button type="submit" class="rating-modal__submit btn btn--primary">
            Send
          </button>
        </form>
      </div>
    </div>
  `;
  
  // Create rating modal if it doesn't exist
  if (!elements.ratingModal) {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = ratingModalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    elements.ratingModal = document.querySelector('.rating-modal');
  } else {
    elements.ratingModal.innerHTML = ratingModalHTML;
  }
  
  // Add event listeners
  const closeBtn = elements.ratingModal.querySelector('.rating-modal__close');
  const overlay = elements.ratingModal.querySelector('.rating-modal__overlay');
  const form = elements.ratingModal.querySelector('.rating-modal__form');
  
  closeBtn.addEventListener('click', () => closeModal('rating'));
  overlay.addEventListener('click', () => closeModal('rating'));
  form.addEventListener('submit', handleRatingSubmit);
}

async function handleRatingSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const rating = parseInt(formData.get('rating'));
  const email = formData.get('email') || document.getElementById('rating-email').value;
  
  if (!rating || !email) {
    showError('Будь ласка, оберіть рейтинг та введіть email');
    return;
  }
  
  try {
    await patchExerciseRating(state.modalData._id, rating);
    showSuccess('Рейтинг успішно надіслано!');
    closeModal('rating');
    closeModal('exercise');
    
    // Reload exercises to show updated rating
    loadExercises();
  } catch (error) {
    console.error('Error submitting rating:', error);
    showError('Не вдалося надіслати рейтинг');
  }
}

function handleFavoriteToggle(event) {
  const exerciseId = event.currentTarget.dataset.id;
  const exercise = state.exercises.find(ex => ex._id === exerciseId);
  
  if (!exercise) return;
  
  const index = state.favorites.findIndex(fav => fav._id === exerciseId);
  
  if (index > -1) {
    state.favorites.splice(index, 1);
    event.currentTarget.classList.remove('favorited');
    event.currentTarget.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      Додати
    `;
  } else {
    state.favorites.push(exercise);
    event.currentTarget.classList.add('favorited');
    event.currentTarget.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      Видалити
    `;
  }
  
  // Save to localStorage
  localStorage.setItem('favorites', JSON.stringify(state.favorites));
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
    await postSubscription(email);
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

// Modal Management
function openModal(type) {
  const modal = type === 'exercise' ? elements.modal : elements.ratingModal;
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(type) {
  const modal = type === 'exercise' ? elements.modal : elements.ratingModal;
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleModalClose(event) {
  const closeBtn = event.target.closest('.exercise-modal__close, .rating-modal__close');
  const overlay = event.target.closest('.exercise-modal__overlay, .rating-modal__overlay');
  
  if (closeBtn || overlay) {
    if (elements.modal && elements.modal.classList.contains('active')) {
      closeModal('exercise');
    }
    if (elements.ratingModal && elements.ratingModal.classList.contains('active')) {
      closeModal('rating');
    }
  }
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    if (elements.modal && elements.modal.classList.contains('active')) {
      closeModal('exercise');
    }
    if (elements.ratingModal && elements.ratingModal.classList.contains('active')) {
      closeModal('rating');
    }
    if (elements.mobileMenu && elements.mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  }
}

// Scroll Management
function handleScroll() {
  const header = document.querySelector('.header');
  const scrolled = window.scrollY > 50;
  
  if (header) {
    header.classList.toggle('scrolled', scrolled);
  }
}

// Utility Functions
function showLoading(container) {
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
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
  
  document.body.appendChild(notification);
  
  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateY(0)';
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateY(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Load favorites from localStorage
function loadFavorites() {
  const stored = localStorage.getItem('favorites');
  if (stored) {
    state.favorites = JSON.parse(stored);
  }
}

// Initialize favorites
loadFavorites();

// Export for testing
window.YourEnergyApp = {
  state,
  loadQuote,
  loadFilters,
  loadExercises,
  openModal,
  closeModal
};
