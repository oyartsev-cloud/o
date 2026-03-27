import{g as L,a as M,b as E,c as C,p as w,d as q}from"./api-CjOTZ_Po.js";const r={currentFilter:"Muscles",selectedCategory:null,currentPage:1,exercisesPerPage:12,searchKeyword:"",exercises:[],filters:[],quote:null,favorites:[],isLoading:!1,modalData:null},a={quoteContainer:null,filtersContainer:null,exercisesContainer:null,searchForm:null,paginationContainer:null,modal:null,ratingModal:null,subscriptionForm:null,filterTabs:null,mobileMenu:null,mobileMenuToggle:null,overlay:null};document.addEventListener("DOMContentLoaded",()=>{S(),T(),$(),console.log("Your Energy App Initialized")});function S(){a.quoteContainer=document.querySelector(".quote-section"),a.filtersContainer=document.querySelector(".filters-section__scroll-wrapper"),a.exercisesContainer=document.querySelector(".exercises-section__grid"),a.searchForm=document.querySelector(".search-form"),a.paginationContainer=document.querySelector(".pagination-container"),a.modal=document.querySelector(".exercise-modal"),a.ratingModal=document.querySelector(".rating-modal"),a.subscriptionForm=document.querySelector(".subscription-form"),a.filterTabs=document.querySelectorAll(".filter-tab"),a.mobileMenu=document.querySelector(".header__mobile-menu"),a.mobileMenuToggle=document.querySelector(".header__mobile-toggle"),a.overlay=document.querySelector(".header__overlay")}function T(){a.filterTabs.forEach(e=>{e.addEventListener("click",F)}),a.searchForm&&a.searchForm.addEventListener("submit",A),a.mobileMenuToggle&&a.mobileMenuToggle.addEventListener("click",Y),a.overlay&&a.overlay.addEventListener("click",g),a.subscriptionForm&&a.subscriptionForm.addEventListener("submit",K),document.addEventListener("click",R),document.addEventListener("keydown",U),window.addEventListener("scroll",Z)}async function $(){try{await Promise.all([_(),m("Muscles")]);const e=document.getElementById("tab-muscles");e&&(e.classList.add("active"),e.setAttribute("aria-selected","true")),r.currentFilter="Muscles"}catch(e){console.error("Error loading initial data:",e),l("Failed to load initial data")}}async function _(){try{const e=new Date().toDateString(),t=localStorage.getItem("dailyQuote"),i=localStorage.getItem("quoteDate");if(t&&i===e){r.quote=JSON.parse(t),f();return}const o=await L();r.quote=o,localStorage.setItem("dailyQuote",JSON.stringify(o)),localStorage.setItem("quoteDate",e),f()}catch(e){console.error("Error loading quote:",e)}}function f(){if(!a.quoteContainer||!r.quote)return;const e=`
    <div class="quote-card card">
      <div class="quote-content">
        <p class="quote-text">"${r.quote.quote}"</p>
        <cite class="quote-author">${r.quote.author}</cite>
      </div>
      <div class="quote-info">
        <p class="quote-description">
          Важливість щоденного фізичного навантаження тривалістю щонайменше 110 хвилин для підтримки здоров'я та добробуту.
        </p>
      </div>
    </div>
  `;a.quoteContainer.innerHTML=e}async function m(e){try{r.isLoading=!0,y(a.filtersContainer);const t=await M(e);r.filters=t,k()}catch(t){console.error("Error loading filters:",t),l("Failed to load filters")}finally{r.isLoading=!1}}function k(){if(!a.filtersContainer)return;const e=r.filters.map(t=>`
    <div class="filter-category card card--interactive">
      <button class="filter-category__button" data-filter="${t.filter}" data-name="${t.name}">
        <img src="${t.image}" alt="" class="filter-category__icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="filter-category__icon" style="display:none;">💪</div>
        <span class="filter-category__name">${t.name}</span>
      </button>
    </div>
  `).join("");a.filtersContainer.innerHTML=e,a.filtersContainer.querySelectorAll(".filter-category__button").forEach(t=>{t.addEventListener("click",D)})}function F(e){const t=e.target,i=t.textContent.trim();a.filterTabs.forEach(o=>{o.classList.remove("active"),o.setAttribute("aria-selected","false")}),t.classList.add("active"),t.setAttribute("aria-selected","true"),r.currentFilter=i,r.selectedCategory=null,m(i)}function D(e){const t=e.currentTarget,i=t.dataset.filter;t.dataset.name,r.selectedCategory=i,d()}async function d(){try{r.isLoading=!0,y(a.exercisesContainer);const e={page:r.currentPage,limit:r.exercisesPerPage};r.selectedCategory&&(r.currentFilter==="Muscles"?e.muscles=r.selectedCategory:r.currentFilter==="Body parts"?e.bodypart=r.selectedCategory:r.currentFilter==="Equipment"&&(e.equipment=r.selectedCategory)),r.searchKeyword&&(e.keyword=r.searchKeyword);const t=await E(e);r.exercises=t.results||[],H(),I(t.totalPages||1)}catch(e){console.error("Error loading exercises:",e),l("Failed to load exercises")}finally{r.isLoading=!1}}function H(){if(!a.exercisesContainer)return;if(r.exercises.length===0){a.exercisesContainer.innerHTML=`
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
    `;return}const e=r.exercises.map(t=>`
    <article class="exercise-card card card--interactive" data-id="${t._id}">
      <div class="exercise-card__image-wrapper">
        <img src="${t.gifUrl||"./images/placeholder.jpg"}" alt="${t.name}" class="exercise-card__image">
      </div>
      <div class="exercise-card__body">
        <h3 class="exercise-card__title">${t.name}</h3>
        <div class="exercise-card__meta">
          <span class="exercise-card__badge">${t.bodyPart}</span>
          <span class="exercise-card__badge">${t.target}</span>
        </div>
        <div class="exercise-card__stats">
          <span class="exercise-card__calories">${t.burnedCalories||0} калорій</span>
          <span class="exercise-card__time">3 хв</span>
        </div>
        <div class="exercise-card__rating">
          ${p(t.rating||0)}
        </div>
        <button class="exercise-card__start-btn btn btn--primary" data-id="${t._id}">
          Start
        </button>
      </div>
    </article>
  `).join("");a.exercisesContainer.innerHTML=e,a.exercisesContainer.querySelectorAll(".exercise-card__start-btn").forEach(t=>{t.addEventListener("click",P)})}function p(e){const t=Math.floor(e),i=e%1!==0,o=5-Math.ceil(e);let s="";for(let c=0;c<t;c++)s+='<div class="exercise-card__star">★</div>';i&&(s+='<div class="exercise-card__star">☆</div>');for(let c=0;c<o;c++)s+='<div class="exercise-card__star empty">☆</div>';return s}function I(e){if(!a.paginationContainer||e<=1)return;let t='<div class="pagination">';for(let i=1;i<=e;i++){const o=i===r.currentPage;t+=`
      <button class="pagination__btn ${o?"active":""}" data-page="${i}">
        ${i}
      </button>
    `}t+="</div>",a.paginationContainer.innerHTML=t,a.paginationContainer.querySelectorAll(".pagination__btn").forEach(i=>{i.addEventListener("click",B)})}function B(e){const t=parseInt(e.target.dataset.page);t!==r.currentPage&&(r.currentPage=t,d())}function A(e){e.preventDefault();const i=document.getElementById("search-input").value.trim();r.searchKeyword=i,r.currentPage=1,d()}async function P(e){const t=e.target.dataset.id;try{const i=await C(t);r.modalData=i,z(),v("exercise")}catch(i){console.error("Error loading exercise details:",i),l("Failed to load exercise details")}}function z(){if(!r.modalData)return;const e=r.modalData,t=r.favorites.some(u=>u._id===e._id),i=`
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
          ${e.gifUrl?`
            <video autoplay loop muted playsinline class="exercise-modal__video">
              <source src="${e.gifUrl}" type="video/mp4">
            </video>
          `:`
            <img src="${e.image||"./images/placeholder.jpg"}" alt="${e.name}" class="exercise-modal__image">
          `}
        </div>
        
        <div class="exercise-modal__info">
          <h2 class="exercise-modal__title">${e.name}</h2>
          
          <div class="exercise-modal__rating">
            ${p(e.rating||0)}
            <span class="exercise-modal__rating-value">(${e.rating||0})</span>
          </div>
          
          <div class="exercise-modal__details">
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Ціль:</span>
              <span class="exercise-modal__value">${e.target}</span>
            </div>
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Частина тіла:</span>
              <span class="exercise-modal__value">${e.bodyPart}</span>
            </div>
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Популярність:</span>
              <span class="exercise-modal__value">${e.popularity||0}%</span>
            </div>
            <div class="exercise-modal__detail">
              <span class="exercise-modal__label">Калорії:</span>
              <span class="exercise-modal__value">${e.burnedCalories||0} калорій за 3 хв</span>
            </div>
          </div>
          
          <p class="exercise-modal__description">${e.description||""}</p>
          
          <div class="exercise-modal__actions">
            <button class="exercise-modal__favorite-btn ${t?"favorited":""}" data-id="${e._id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${t?"currentColor":"none"}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              ${t?"Видалити":"Додати"}
            </button>
            
            <button class="exercise-modal__rating-btn btn btn--primary">
              Give a rating
            </button>
          </div>
        </div>
      </div>
    </div>
  `;if(a.modal)a.modal.innerHTML=i;else{const u=document.createElement("div");u.innerHTML=i,document.body.appendChild(u.firstElementChild),a.modal=document.querySelector(".exercise-modal")}const o=a.modal.querySelector(".exercise-modal__close"),s=a.modal.querySelector(".exercise-modal__favorite-btn"),c=a.modal.querySelector(".exercise-modal__rating-btn"),h=a.modal.querySelector(".exercise-modal__overlay");o.addEventListener("click",()=>n("exercise")),h.addEventListener("click",()=>n("exercise")),s.addEventListener("click",j),c.addEventListener("click",N)}function N(){O(),v("rating")}function O(){const e=`
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
          ${[1,2,3,4,5].map(s=>`
            <input type="radio" id="rating-${s}" name="rating" value="${s}" class="rating-modal__radio">
            <label for="rating-${s}" class="rating-modal__star">
              ★
            </label>
          `).join("")}
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
  `;if(a.ratingModal)a.ratingModal.innerHTML=e;else{const s=document.createElement("div");s.innerHTML=e,document.body.appendChild(s.firstElementChild),a.ratingModal=document.querySelector(".rating-modal")}const t=a.ratingModal.querySelector(".rating-modal__close"),i=a.ratingModal.querySelector(".rating-modal__overlay"),o=a.ratingModal.querySelector(".rating-modal__form");t.addEventListener("click",()=>n("rating")),i.addEventListener("click",()=>n("rating")),o.addEventListener("submit",Q)}async function Q(e){e.preventDefault();const t=new FormData(e.target),i=parseInt(t.get("rating")),o=t.get("email")||document.getElementById("rating-email").value;if(!i||!o){l("Будь ласка, оберіть рейтинг та введіть email");return}try{await w(r.modalData._id,i),b("Рейтинг успішно надіслано!"),n("rating"),n("exercise"),d()}catch(s){console.error("Error submitting rating:",s),l("Не вдалося надіслати рейтинг")}}function j(e){const t=e.currentTarget.dataset.id,i=r.exercises.find(s=>s._id===t);if(!i)return;const o=r.favorites.findIndex(s=>s._id===t);o>-1?(r.favorites.splice(o,1),e.currentTarget.classList.remove("favorited"),e.currentTarget.innerHTML=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      Додати
    `):(r.favorites.push(i),e.currentTarget.classList.add("favorited"),e.currentTarget.innerHTML=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      Видалити
    `),localStorage.setItem("favorites",JSON.stringify(r.favorites))}async function K(e){e.preventDefault();const i=new FormData(e.target).get("email");if(!i){l("Будь ласка, введіть email");return}try{await q(i),b("Підписка успішна!"),e.target.reset()}catch(o){console.error("Error subscribing:",o),l("Не вдалося підписатися")}}function Y(){a.mobileMenu.classList.contains("active")?g():J()}function J(){a.mobileMenu.classList.add("active"),a.overlay.classList.add("active"),a.mobileMenuToggle.setAttribute("aria-expanded","true"),document.body.style.overflow="hidden"}function g(){a.mobileMenu.classList.remove("active"),a.overlay.classList.remove("active"),a.mobileMenuToggle.setAttribute("aria-expanded","false"),document.body.style.overflow=""}function v(e){const t=e==="exercise"?a.modal:a.ratingModal;t&&(t.classList.add("active"),document.body.style.overflow="hidden")}function n(e){const t=e==="exercise"?a.modal:a.ratingModal;t&&(t.classList.remove("active"),document.body.style.overflow="")}function R(e){const t=e.target.closest(".exercise-modal__close, .rating-modal__close"),i=e.target.closest(".exercise-modal__overlay, .rating-modal__overlay");(t||i)&&(a.modal&&a.modal.classList.contains("active")&&n("exercise"),a.ratingModal&&a.ratingModal.classList.contains("active")&&n("rating"))}function U(e){e.key==="Escape"&&(a.modal&&a.modal.classList.contains("active")&&n("exercise"),a.ratingModal&&a.ratingModal.classList.contains("active")&&n("rating"),a.mobileMenu&&a.mobileMenu.classList.contains("active")&&g())}function Z(){const e=document.querySelector(".header"),t=window.scrollY>50;e&&e.classList.toggle("scrolled",t)}function y(e){e&&(e.innerHTML=`
      <div class="loading">
        <div class="loading__spinner"></div>
      </div>
    `)}function l(e){x(e,"error")}function b(e){x(e,"success")}function x(e,t="info"){const i=document.createElement("div");i.className=`notification notification--${t}`,i.textContent=e,document.body.appendChild(i),requestAnimationFrame(()=>{i.style.transform="translateY(0)"}),setTimeout(()=>{i.style.transform="translateY(100%)",setTimeout(()=>{i.parentNode&&i.parentNode.removeChild(i)},300)},3e3)}function G(){const e=localStorage.getItem("favorites");e&&(r.favorites=JSON.parse(e))}G();window.YourEnergyApp={state:r,loadQuote:_,loadFilters:m,loadExercises:d,openModal:v,closeModal:n};
//# sourceMappingURL=app-qY08udg7.js.map
