/* ===================================
   FAVORITES PAGE - JavaScript
   Complete functionality for favorites page
   =================================== */

// API Base URL
const API_BASE_URL = 'https://your-energy.b.goit.study/api';

// Application State
const state = {
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  quote: null,
  modalData: null,
  isLoading: false
};

// DOM Elements
const elements = {
  quoteContent: null,
  favoritesGrid: null,
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
  console.log('Favorites Page Initialized');
});

// Elements Initialization
function initializeElements() {
  elements.quoteContent = document.querySelector('.quote__content');
  elements.favoritesGrid = document.querySelector('.favorites__grid');
  elements.exerciseModal = document.getElementById('exercise-modal');
  elements.ratingModal = document.getElementById('rating-modal');
  elements.subscriptionForm = document.querySelector('.footer__subscription');
  elements.mobileMenuToggle = document.querySelector('.header__mobile-toggle');
  elements.mobileMenu = document.querySelector('.header__mobile-menu');
  elements.overlay = document.querySelector('.overlay');
}

// Event Listeners
function initializeEventListeners() {
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
      renderFavorites()
    ]);
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

// Favorites Management
function renderFavorites() {
  if (!elements.favoritesGrid) return;
  
  if (state.favorites.length === 0) {
    elements.favoritesGrid.innerHTML = `
      <div class="no-favorites">
        <div class="no-favorites__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h3 class="no-favorites__title">Перелік улюблених порожній</h3>
        <p class="no-favorites__description">
          Додайте вправи до улюблених, щоб вони відображалися тут
        </p>
        <a href="/" class="btn btn--primary">Перейти до вправ</a>
      </div>
    `;
    return;
  }
  
  const favoritesHTML = state.favorites.map(exercise => `
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
        <div class="exercise-card__actions">
          <button class="exercise-card__start-btn" data-id="${exercise._id}">
            Start
          </button>
          <button class="exercise-card__remove-btn" data-id="${exercise._id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');
  
  elements.favoritesGrid.innerHTML = favoritesHTML;
  
  // Add event listeners
  elements.favoritesGrid.querySelectorAll('.exercise-card__start-btn').forEach(button => {
    button.addEventListener('click', handleExerciseStart);
  });
  
  elements.favoritesGrid.querySelectorAll('.exercise-card__remove-btn').forEach(button => {
    button.addEventListener('click', handleFavoriteRemove);
  });
}

function handleFavoriteRemove(event) {
  const exerciseId = event.currentTarget.dataset.id;
  const index = state.favorites.findIndex(fav => fav._id === exerciseId);
  
  if (index > -1) {
    state.favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    renderFavorites();
    showSuccess('Вправу видалено з улюблених');
  }
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
  } catch (error) {
    console.error('Error submitting rating:', error);
    showError('Не вдалося надіслати рейтинг');
  }
}

// Favorites Toggle
function handleFavoriteToggle(exerciseId) {
  const exercise = state.favorites.find(ex => ex._id === exerciseId);
  
  if (!exercise) {
    // Add to favorites
    if (state.modalData) {
      state.favorites.push(state.modalData);
      localStorage.setItem('favorites', JSON.stringify(state.favorites));
      showSuccess('Вправу додано до улюблених');
    }
  } else {
    // Remove from favorites
    const index = state.favorites.findIndex(fav => fav._id === exerciseId);
    if (index > -1) {
      state.favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(state.favorites));
      showSuccess('Вправу видалено з улюблених');
    }
  }
  
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
window.FavoritesApp = {
  state,
  loadQuote,
  renderFavorites,
  openModal,
  closeModal
};
