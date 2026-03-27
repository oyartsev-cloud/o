import{g as x,c as b,p as M,d as L}from"./api-CjOTZ_Po.js";const o={favorites:[],quote:null,modalData:null,isLoading:!1},t={quoteContainer:null,favoritesGrid:null,favoritesCount:null,modal:null,ratingModal:null,subscriptionForm:null,mobileMenu:null,mobileMenuToggle:null,overlay:null};document.addEventListener("DOMContentLoaded",()=>{S(),w(),q(),console.log("Favorites Page Initialized")});function S(){t.quoteContainer=document.querySelector(".quote-content"),t.favoritesGrid=document.querySelector(".favorites-section__grid"),t.favoritesCount=document.querySelector(".favorites-count"),t.modal=document.querySelector(".exercise-modal"),t.ratingModal=document.querySelector(".rating-modal"),t.subscriptionForm=document.querySelector(".subscription-form"),t.mobileMenu=document.querySelector(".header__mobile-menu"),t.mobileMenuToggle=document.querySelector(".header__mobile-toggle"),t.overlay=document.querySelector(".header__overlay")}function w(){t.mobileMenuToggle&&t.mobileMenuToggle.addEventListener("click",B),t.overlay&&t.overlay.addEventListener("click",u),t.subscriptionForm&&t.subscriptionForm.addEventListener("submit",H),document.addEventListener("click",z),document.addEventListener("keydown",O),window.addEventListener("scroll",A)}async function q(){try{await Promise.all([g(),_()])}catch(e){console.error("Error loading initial data:",e),c("Failed to load initial data")}}async function g(){try{const e=new Date().toDateString(),a=localStorage.getItem("dailyQuote"),i=localStorage.getItem("quoteDate");if(a&&i===e){o.quote=JSON.parse(a),f();return}const r=await x();o.quote=r,localStorage.setItem("dailyQuote",JSON.stringify(r)),localStorage.setItem("quoteDate",e),f()}catch(e){console.error("Error loading quote:",e)}}function f(){if(!t.quoteContainer||!o.quote)return;const e=`
    <p class="quote-text">"${o.quote.quote}"</p>
    <cite class="quote-author">${o.quote.author}</cite>
  `;t.quoteContainer.innerHTML=e}function _(){const e=localStorage.getItem("favorites");e&&(o.favorites=JSON.parse(e)),p()}function p(){if(!t.favoritesGrid)return;if(o.favorites.length===0){t.favoritesGrid.innerHTML=`
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h3 class="empty-state__title">Перелік улюблених порожній</h3>
        <p class="empty-state__description">
          Додайте вправи до улюблених, щоб вони відображалися тут
        </p>
        <a href="/" class="btn btn--primary">Перейти до вправ</a>
      </div>
    `,t.favoritesCount&&(t.favoritesCount.textContent="0 вправ");return}const e=o.favorites.map(a=>`
    <article class="favorite-exercise-card card card--interactive" data-id="${a._id}">
      <div class="favorite-exercise-card__image-wrapper">
        <img src="${a.gifUrl||"./images/placeholder.jpg"}" alt="${a.name}" class="favorite-exercise-card__image">
      </div>
      <div class="favorite-exercise-card__body">
        <h3 class="favorite-exercise-card__title">${a.name}</h3>
        <div class="favorite-exercise-card__meta">
          <span class="favorite-exercise-card__badge">${a.bodyPart}</span>
          <span class="favorite-exercise-card__badge">${a.target}</span>
        </div>
        <div class="favorite-exercise-card__stats">
          <span class="favorite-exercise-card__calories">${a.burnedCalories||0} калорій</span>
          <span class="favorite-exercise-card__time">3 хв</span>
        </div>
        <div class="favorite-exercise-card__actions">
          <button class="favorite-exercise-card__start-btn btn btn--primary" data-id="${a._id}">
            Start
          </button>
          <button class="favorite-exercise-card__remove-btn btn btn--outline" data-id="${a._id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `).join("");if(t.favoritesGrid.innerHTML=e,t.favoritesGrid.querySelectorAll(".favorite-exercise-card__start-btn").forEach(a=>{a.addEventListener("click",$)}),t.favoritesGrid.querySelectorAll(".favorite-exercise-card__remove-btn").forEach(a=>{a.addEventListener("click",E)}),t.favoritesCount){const a=o.favorites.length,i=a===1?"вправа":a>=2&&a<=4?"вправи":"вправ";t.favoritesCount.textContent=`${a} ${i}`}}function E(e){const a=e.currentTarget.dataset.id,i=o.favorites.findIndex(r=>r._id===a);i>-1&&(o.favorites.splice(i,1),localStorage.setItem("favorites",JSON.stringify(o.favorites)),p(),d("Вправу видалено з улюблених"))}async function $(e){const a=e.target.dataset.id;try{const i=await b(a);o.modalData=i,C(),v("exercise")}catch(i){console.error("Error loading exercise details:",i),c("Failed to load exercise details")}}function C(){if(!o.modalData)return;const e=o.modalData,a=o.favorites.some(m=>m._id===e._id),i=`
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
            ${T(e.rating||0)}
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
            <button class="exercise-modal__favorite-btn ${a?"favorited":""}" data-id="${e._id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${a?"currentColor":"none"}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              ${a?"Видалити":"Додати"}
            </button>
            
            <button class="exercise-modal__rating-btn btn btn--primary">
              Give a rating
            </button>
          </div>
        </div>
      </div>
    </div>
  `;if(t.modal)t.modal.innerHTML=i;else{const m=document.createElement("div");m.innerHTML=i,document.body.appendChild(m.firstElementChild),t.modal=document.querySelector(".exercise-modal")}const r=t.modal.querySelector(".exercise-modal__close"),s=t.modal.querySelector(".exercise-modal__favorite-btn"),l=t.modal.querySelector(".exercise-modal__rating-btn"),h=t.modal.querySelector(".exercise-modal__overlay");r.addEventListener("click",()=>n("exercise")),h.addEventListener("click",()=>n("exercise")),s.addEventListener("click",F),l.addEventListener("click",k)}function T(e){const a=Math.floor(e),i=e%1!==0,r=5-Math.ceil(e);let s="";for(let l=0;l<a;l++)s+='<div class="exercise-modal__star">★</div>';i&&(s+='<div class="exercise-modal__star">☆</div>');for(let l=0;l<r;l++)s+='<div class="exercise-modal__star empty">☆</div>';return s}function k(){D(),v("rating")}function D(){const e=`
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
  `;if(t.ratingModal)t.ratingModal.innerHTML=e;else{const s=document.createElement("div");s.innerHTML=e,document.body.appendChild(s.firstElementChild),t.ratingModal=document.querySelector(".rating-modal")}const a=t.ratingModal.querySelector(".rating-modal__close"),i=t.ratingModal.querySelector(".rating-modal__overlay"),r=t.ratingModal.querySelector(".rating-modal__form");a.addEventListener("click",()=>n("rating")),i.addEventListener("click",()=>n("rating")),r.addEventListener("submit",I)}async function I(e){e.preventDefault();const a=new FormData(e.target),i=parseInt(a.get("rating")),r=a.get("email")||document.getElementById("rating-email").value;if(!i||!r){c("Будь ласка, оберіть рейтинг та введіть email");return}try{await M(o.modalData._id,i),d("Рейтинг успішно надіслано!"),n("rating"),n("exercise")}catch(s){console.error("Error submitting rating:",s),c("Не вдалося надіслати рейтинг")}}function F(e){const a=e.currentTarget.dataset.id;if(!o.favorites.find(r=>r._id===a))o.modalData&&(o.favorites.push(o.modalData),localStorage.setItem("favorites",JSON.stringify(o.favorites)),e.currentTarget.classList.add("favorited"),e.currentTarget.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        Видалити
      `,d("Вправу додано до улюблених"));else{const r=o.favorites.findIndex(s=>s._id===a);r>-1&&(o.favorites.splice(r,1),localStorage.setItem("favorites",JSON.stringify(o.favorites)),e.currentTarget.classList.remove("favorited"),e.currentTarget.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        Додати
      `,d("Вправу видалено з улюблених"))}}async function H(e){e.preventDefault();const i=new FormData(e.target).get("email");if(!i){c("Будь ласка, введіть email");return}try{await L(i),d("Підписка успішна!"),e.target.reset()}catch(r){console.error("Error subscribing:",r),c("Не вдалося підписатися")}}function B(){t.mobileMenu.classList.contains("active")?u():N()}function N(){t.mobileMenu.classList.add("active"),t.overlay.classList.add("active"),t.mobileMenuToggle.setAttribute("aria-expanded","true"),document.body.style.overflow="hidden"}function u(){t.mobileMenu.classList.remove("active"),t.overlay.classList.remove("active"),t.mobileMenuToggle.setAttribute("aria-expanded","false"),document.body.style.overflow=""}function v(e){const a=e==="exercise"?t.modal:t.ratingModal;a&&(a.classList.add("active"),document.body.style.overflow="hidden")}function n(e){const a=e==="exercise"?t.modal:t.ratingModal;a&&(a.classList.remove("active"),document.body.style.overflow="")}function z(e){const a=e.target.closest(".exercise-modal__close, .rating-modal__close"),i=e.target.closest(".exercise-modal__overlay, .rating-modal__overlay");(a||i)&&(t.modal&&t.modal.classList.contains("active")&&n("exercise"),t.ratingModal&&t.ratingModal.classList.contains("active")&&n("rating"))}function O(e){e.key==="Escape"&&(t.modal&&t.modal.classList.contains("active")&&n("exercise"),t.ratingModal&&t.ratingModal.classList.contains("active")&&n("rating"),t.mobileMenu&&t.mobileMenu.classList.contains("active")&&u())}function A(){const e=document.querySelector(".header"),a=window.scrollY>50;e&&e.classList.toggle("scrolled",a)}function c(e){y(e,"error")}function d(e){y(e,"success")}function y(e,a="info"){const i=document.createElement("div");i.className=`notification notification--${a}`,i.textContent=e,document.body.appendChild(i),requestAnimationFrame(()=>{i.style.transform="translateY(0)"}),setTimeout(()=>{i.style.transform="translateY(100%)",setTimeout(()=>{i.parentNode&&i.parentNode.removeChild(i)},300)},3e3)}window.FavoritesApp={state:o,loadQuote:g,loadFavorites:_,openModal:v,closeModal:n};
//# sourceMappingURL=favorites-BsQdKJZt.js.map
