/* ===================================
   MAIN JAVASCRIPT - Full Refactor
   Pixel-perfect interactions and functionality
   =================================== */

// DOM Elements
const elements = {
  searchInput: null,
  searchForm: null,
  filterTabs: null,
  filterCategories: null,
  exerciseCards: null,
  heroTags: null
};

// State Management
const state = {
  currentFilter: 'all',
  searchQuery: '',
  exercises: [],
  filteredExercises: [],
  isLoading: false
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  initializeEventListeners();
  initializeAnimations();
  console.log('Your Energy Application Initialized');
});

// Elements Initialization
function initializeElements() {
  elements.searchInput = document.getElementById('search-input');
  elements.searchForm = document.querySelector('.search-form');
  elements.filterTabs = document.querySelectorAll('[role="tab"]');
  elements.filterCategories = document.querySelectorAll('.filter-category');
  elements.exerciseCards = document.querySelectorAll('.exercise-card');
  elements.heroTags = document.querySelectorAll('.hero-section__tags a');
}

// Event Listeners
function initializeEventListeners() {
  // Search functionality
  if (elements.searchForm) {
    elements.searchForm.addEventListener('submit', handleSearchSubmit);
  }
  
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.searchInput.addEventListener('focus', handleSearchFocus);
    elements.searchInput.addEventListener('blur', handleSearchBlur);
  }

  // Filter tabs
  elements.filterTabs.forEach(tab => {
    tab.addEventListener('click', handleTabClick);
    tab.addEventListener('keydown', handleTabKeydown);
  });

  // Filter categories
  elements.filterCategories.forEach(category => {
    category.addEventListener('click', handleFilterCategoryClick);
    category.addEventListener('mouseenter', handleFilterHover);
    category.addEventListener('mouseleave', handleFilterLeave);
  });

  // Exercise cards
  elements.exerciseCards.forEach(card => {
    card.addEventListener('click', handleExerciseCardClick);
    card.addEventListener('mouseenter', handleExerciseCardHover);
    card.addEventListener('mouseleave', handleExerciseCardLeave);
  });

  // Hero tags
  elements.heroTags.forEach(tag => {
    tag.addEventListener('click', handleHeroTagClick);
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);

  // Scroll effects
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
}

// Search Handlers
function handleSearchSubmit(event) {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  
  if (query) {
    state.searchQuery = query;
    performSearch(query);
  }
}

function handleSearchInput(event) {
  const query = event.target.value.trim();
  
  // Debounced search
  clearTimeout(state.searchTimeout);
  state.searchTimeout = setTimeout(() => {
    if (query.length >= 2 || query.length === 0) {
      state.searchQuery = query;
      performSearch(query);
    }
  }, 300);
}

function handleSearchFocus() {
  elements.searchInput.parentElement.classList.add('search--focused');
}

function handleSearchBlur() {
  elements.searchInput.parentElement.classList.remove('search--focused');
}

// Tab Handlers
function handleTabClick(event) {
  const tab = event.target;
  const tabId = tab.id;
  const filterType = tabId.replace('tab-', '');
  
  // Update active state
  elements.filterTabs.forEach(t => {
    t.setAttribute('aria-selected', 'false');
    t.classList.remove('active');
  });
  
  tab.setAttribute('aria-selected', 'true');
  tab.classList.add('active');
  
  // Update state
  state.currentFilter = filterType;
  updateFilterDisplay(filterType);
}

function handleTabKeydown(event) {
  const tab = event.target;
  const tabs = Array.from(elements.filterTabs);
  const currentIndex = tabs.indexOf(tab);
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      const prevTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
      prevTab.focus();
      prevTab.click();
      break;
      
    case 'ArrowRight':
      event.preventDefault();
      const nextTab = tabs[currentIndex + 1] || tabs[0];
      nextTab.focus();
      nextTab.click();
      break;
      
    case 'Enter':
    case ' ':
      event.preventDefault();
      tab.click();
      break;
  }
}

// Filter Category Handlers
function handleFilterCategoryClick(event) {
  const category = event.currentTarget;
  const categoryName = category.querySelector('.filter-category__name').textContent;
  
  // Add ripple effect
  createRippleEffect(category, event);
  
  // Simulate filter application
  applyFilter(categoryName);
  
  // Visual feedback
  category.style.transform = 'scale(0.95)';
  setTimeout(() => {
    category.style.transform = '';
  }, 150);
}

function handleFilterHover(event) {
  const category = event.currentTarget;
  const icon = category.querySelector('.filter-category__icon');
  
  // Enhanced hover effect
  icon.style.transform = 'scale(1.1) rotate(5deg)';
}

function handleFilterLeave(event) {
  const category = event.currentTarget;
  const icon = category.querySelector('.filter-category__icon');
  
  icon.style.transform = '';
}

// Exercise Card Handlers
function handleExerciseCardClick(event) {
  const card = event.currentTarget;
  const exerciseName = card.querySelector('.exercise-card__title').textContent;
  
  // Add click animation
  card.style.transform = 'translateY(-8px) scale(0.98)';
  setTimeout(() => {
    card.style.transform = '';
  }, 200);
  
  // Navigate to exercise details (mock)
  console.log(`Navigating to exercise: ${exerciseName}`);
  // window.location.href = `/exercise/${encodeURIComponent(exerciseName)}`;
}

function handleExerciseCardHover(event) {
  const card = event.currentTarget;
  const image = card.querySelector('.exercise-card__image');
  
  // Enhanced hover effect
  image.style.transform = 'scale(1.05)';
}

function handleExerciseCardLeave(event) {
  const card = event.currentTarget;
  const image = card.querySelector('.exercise-card__image');
  
  image.style.transform = '';
}

// Hero Tag Handlers
function handleHeroTagClick(event) {
  event.preventDefault();
  const tag = event.target.textContent;
  
  // Smooth scroll to filters
  const filtersSection = document.getElementById('filters');
  if (filtersSection) {
    filtersSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
  
  // Apply filter based on tag
  setTimeout(() => {
    applyFilterByTag(tag);
  }, 500);
}

// Search Functionality
function performSearch(query) {
  state.isLoading = true;
  showLoadingState();
  
  // Simulate API call
  setTimeout(() => {
    const results = searchExercises(query);
    updateExerciseGrid(results);
    state.isLoading = false;
    hideLoadingState();
  }, 500);
}

function searchExercises(query) {
  const allExercises = Array.from(elements.exerciseCards);
  
  return allExercises.filter(card => {
    const title = card.querySelector('.exercise-card__title').textContent.toLowerCase();
    const badges = Array.from(card.querySelectorAll('.exercise-card__badge'))
      .map(badge => badge.textContent.toLowerCase());
    
    const searchLower = query.toLowerCase();
    
    return title.includes(searchLower) || 
           badges.some(badge => badge.includes(searchLower));
  });
}

// Filter Functionality
function applyFilter(categoryName) {
  console.log(`Applying filter: ${categoryName}`);
  
  // Visual feedback
  showFilterNotification(categoryName);
  
  // Simulate filtering
  setTimeout(() => {
    const filteredCards = filterExercisesByCategory(categoryName);
    updateExerciseGrid(filteredCards);
  }, 300);
}

function applyFilterByTag(tag) {
  const tagMap = {
    'Muscles': 'muscles',
    'Body parts': 'body-parts',
    'Equipment': 'equipment'
  };
  
  const filterType = tagMap[tag] || 'all';
  const correspondingTab = document.getElementById(`tab-${filterType}`);
  
  if (correspondingTab) {
    correspondingTab.click();
  }
}

function updateFilterDisplay(filterType) {
  // Hide all filter panels
  document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Show selected panel
  const selectedPanel = document.getElementById(`${filterType}-filters`);
  if (selectedPanel) {
    selectedPanel.style.display = 'grid';
  }
}

// UI Updates
function updateExerciseGrid(exercises) {
  const grid = document.querySelector('.exercises-section__grid');
  
  if (!grid) return;
  
  // Clear current content
  grid.innerHTML = '';
  
  if (exercises.length === 0) {
    showEmptyState();
    return;
  }
  
  // Add exercises with animation
  exercises.forEach((exercise, index) => {
    setTimeout(() => {
      grid.appendChild(exercise);
      exercise.style.opacity = '0';
      exercise.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        exercise.style.transition = 'all 0.3s ease';
        exercise.style.opacity = '1';
        exercise.style.transform = 'translateY(0)';
      });
    }, index * 100);
  });
}

function showEmptyState() {
  const grid = document.querySelector('.exercises-section__grid');
  
  grid.innerHTML = `
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
}

function showLoadingState() {
  const grid = document.querySelector('.exercises-section__grid');
  
  grid.innerHTML = `
    <div class="loading">
      <div class="loading__spinner"></div>
    </div>
  `;
}

function hideLoadingState() {
  // Loading state will be replaced by updateExerciseGrid
}

function showFilterNotification(categoryName) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'filter-notification';
  notification.textContent = `Фільтр "${categoryName}" застосовано`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-brand-accent);
    color: var(--text-primary);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    font-weight: var(--font-semibold);
    z-index: var(--z-toast);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Animation Effects
function createRippleEffect(element, event) {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  `;
  
  element.appendChild(ripple);
  
  setTimeout(() => {
    element.removeChild(ripple);
  }, 600);
}

// Keyboard Navigation
function handleKeyboardNavigation(event) {
  // Escape to clear search
  if (event.key === 'Escape' && document.activeElement === elements.searchInput) {
    elements.searchInput.value = '';
    elements.searchInput.blur();
    handleSearchInput({ target: { value: '' } });
  }
}

// Scroll Effects
function handleScroll() {
  const header = document.querySelector('.header');
  const scrolled = window.scrollY > 50;
  
  if (header) {
    header.classList.toggle('header--scrolled', scrolled);
  }
}

// Resize Handler
function handleResize() {
  // Debounced resize handling
  clearTimeout(state.resizeTimeout);
  state.resizeTimeout = setTimeout(() => {
    // Recalculate layouts if needed
    console.log('Window resized');
  }, 250);
}

// Initialize Animations
function initializeAnimations() {
  // Add CSS animation for ripple effect
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .filter-notification {
      box-shadow: var(--shadow-lg);
    }
    
    .header--scrolled {
      backdrop-filter: var(--blur-lg);
      box-shadow: var(--shadow-xl);
    }
    
    .search--focused .search-input {
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
    }
  `;
  
  document.head.appendChild(style);
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for testing
window.YourEnergyApp = {
  state,
  performSearch,
  applyFilter,
  updateExerciseGrid
};
