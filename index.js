import"./assets/style-C0EIwy4F.js";const M="https://your-energy.b.goit.study/api",n={currentFilter:"Muscles",selectedCategory:null,currentPage:1,exercisesPerPage:12,searchKeyword:"",exercises:[],filters:[],quote:null,favorites:JSON.parse(localStorage.getItem("favorites")||"[]"),isLoading:!1},r={quoteContent:null,filtersContainer:null,exercisesContainer:null,searchForm:null,paginationContainer:null,exerciseModal:null,ratingModal:null,subscriptionForm:null,mobileMenuToggle:null,mobileMenu:null,overlay:null};document.addEventListener("DOMContentLoaded",()=>{C(),E(),S(),console.log("Your Energy App Initialized")});function C(){r.quoteContent=document.querySelector(".quote__content"),r.filtersContainer=document.querySelector(".filters__categories"),r.exercisesContainer=document.querySelector(".exercises__grid"),r.searchForm=document.querySelector(".search__form"),r.paginationContainer=document.querySelector(".pagination"),r.exerciseModal=document.getElementById("exercise-modal"),r.ratingModal=document.getElementById("rating-modal"),r.subscriptionForm=document.querySelector(".footer__subscription"),r.mobileMenuToggle=document.querySelector(".header__mobile-toggle"),r.mobileMenu=document.querySelector(".header__mobile-menu"),r.overlay=document.querySelector(".overlay")}function E(){document.querySelectorAll(".filters__tab").forEach(e=>{e.addEventListener("click",$)}),r.searchForm&&r.searchForm.addEventListener("submit",k),r.mobileMenuToggle&&r.mobileMenuToggle.addEventListener("click",Q),r.overlay&&r.overlay.addEventListener("click",m),r.subscriptionForm&&r.subscriptionForm.addEventListener("submit",j),document.addEventListener("click",N),document.addEventListener("keydown",O)}async function S(){try{await Promise.all([y(),g("Muscles")]);const e=document.getElementById("muscles-tab");e&&e.setAttribute("aria-selected","true"),n.currentFilter="Muscles"}catch(e){console.error("Error loading initial data:",e),l("Failed to load initial data")}}async function d(e,t={}){const i=`${M}${e}`,o=await fetch(i,{...t,headers:{"Content-Type":"application/json",...t.headers}});if(!o.ok){const a=new Error(`API error: ${o.status}`);throw a.status=o.status,a}return o.json()}async function y(){try{const e=new Date().toDateString(),t=localStorage.getItem("dailyQuote"),i=localStorage.getItem("quoteDate");if(t&&i===e){n.quote=JSON.parse(t),p();return}const o=await d("/quote");n.quote=o,localStorage.setItem("dailyQuote",JSON.stringify(o)),localStorage.setItem("quoteDate",e),p()}catch(e){console.error("Error loading quote:",e),q()}}function p(){if(!r.quoteContent||!n.quote)return;const e=`
    <p class="quote__text">"${n.quote.quote}"</p>
    <cite class="quote__author">${n.quote.author}</cite>
  `;r.quoteContent.innerHTML=e}function q(){r.quoteContent&&(r.quoteContent.innerHTML=`
    <p class="quote__text">Не вдалося завантажити цитату дня</p>
  `)}async function g(e){try{n.isLoading=!0,x(r.filtersContainer);const t=await d(`/filters?filter=${e}`);n.filters=t,L()}catch(t){console.error("Error loading filters:",t),l("Failed to load filters"),T()}finally{n.isLoading=!1}}function L(){if(!r.filtersContainer)return;if(n.filters.length===0){r.filtersContainer.innerHTML=`
      <div class="no-filters">
        <p>Категорії не знайдено</p>
      </div>
    `;return}const e=n.filters.map(t=>`
    <div class="filter-category">
      <button class="filter-category__button" data-filter="${t.filter}" data-name="${t.name}">
        <img src="${t.image}" alt="${t.name}" class="filter-category__image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="filter-category__icon" style="display:none;">💪</div>
        <span class="filter-category__name">${t.name}</span>
      </button>
    </div>
  `).join("");r.filtersContainer.innerHTML=e,r.filtersContainer.querySelectorAll(".filter-category__button").forEach(t=>{t.addEventListener("click",w)})}function T(){r.filtersContainer&&(r.filtersContainer.innerHTML=`
    <div class="no-filters">
      <p>Не вдалося завантажити фільтри</p>
    </div>
  `)}function $(e){const t=e.target,i=t.textContent.trim();document.querySelectorAll(".filters__tab").forEach(o=>{o.setAttribute("aria-selected","false")}),t.setAttribute("aria-selected","true"),n.currentFilter=i,n.selectedCategory=null,g(i)}function w(e){const t=e.currentTarget,i=t.dataset.filter;t.dataset.name,n.selectedCategory=i,u()}async function u(){try{n.isLoading=!0,x(r.exercisesContainer);const e=new URLSearchParams;e.set("page",n.currentPage),e.set("limit",n.exercisesPerPage),n.selectedCategory&&(n.currentFilter==="Muscles"?e.set("muscles",n.selectedCategory):n.currentFilter==="Body parts"?e.set("bodypart",n.selectedCategory):n.currentFilter==="Equipment"&&e.set("equipment",n.selectedCategory)),n.searchKeyword&&e.set("keyword",n.searchKeyword);const t=await d(`/exercises?${e.toString()}`);n.exercises=t.results||[],F(),H(t.totalPages||1)}catch(e){console.error("Error loading exercises:",e),l("Failed to load exercises"),A()}finally{n.isLoading=!1}}function F(){if(!r.exercisesContainer)return;if(n.exercises.length===0){r.exercisesContainer.innerHTML=`
      <div class="no-exercises">
        <h3>Вправи не знайдено</h3>
        <p>Спробуйте змінити фільтри або пошуковий запит</p>
      </div>
    `;return}const e=n.exercises.map(t=>`
    <article class="exercise-card" data-id="${t._id}">
      <img src="${t.gifUrl||"./images/placeholder.jpg"}" alt="${t.name}" class="exercise-card__image">
      <div class="exercise-card__content">
        <h3 class="exercise-card__title">${t.name}</h3>
        <div class="exercise-card__meta">
          <span class="exercise-card__badge">${t.bodyPart}</span>
          <span class="exercise-card__badge">${t.target}</span>
        </div>
        <div class="exercise-card__stats">
          <span>${t.burnedCalories||0} калорій</span>
          <span>3 хв</span>
        </div>
        <div class="exercise-card__rating">
          ${P(t.rating||0)}
        </div>
        <button class="exercise-card__start-btn" data-id="${t._id}">
          Start
        </button>
      </div>
    </article>
  `).join("");r.exercisesContainer.innerHTML=e,r.exercisesContainer.querySelectorAll(".exercise-card__start-btn").forEach(t=>{t.addEventListener("click",D)})}function A(){r.exercisesContainer&&(r.exercisesContainer.innerHTML=`
    <div class="no-exercises">
      <h3>Не вдалося завантажити вправи</h3>
      <p>Спробуйте оновити сторінку</p>
    </div>
  `)}function P(e){const t=Math.floor(e),i=e%1!==0,o=5-Math.ceil(e);let a="";for(let s=0;s<t;s++)a+='<span class="star">★</span>';i&&(a+='<span class="star">☆</span>');for(let s=0;s<o;s++)a+='<span class="star empty">☆</span>';return a}function H(e){if(!r.paginationContainer||e<=1)return;let t="";for(let i=1;i<=e;i++){const o=i===n.currentPage;t+=`
      <button class="pagination__btn ${o?"active":""}" data-page="${i}">
        ${i}
      </button>
    `}r.paginationContainer.innerHTML=t,r.paginationContainer.querySelectorAll(".pagination__btn").forEach(i=>{i.addEventListener("click",I)})}function I(e){const t=parseInt(e.target.dataset.page);t!==n.currentPage&&(n.currentPage=t,u())}function k(e){e.preventDefault();const i=document.getElementById("search-input").value.trim();n.searchKeyword=i,n.currentPage=1,u()}async function D(e){const t=e.target.dataset.id;try{const i=await d(`/exercises/${t}`);n.modalData=i,_(),b("exercise")}catch(i){console.error("Error loading exercise details:",i),l("Failed to load exercise details")}}function _(){if(!n.modalData)return;const e=n.modalData,t=n.favorites.some(v=>v._id===e._id),i=r.exerciseModal.querySelector(".modal__title"),o=r.exerciseModal.querySelector(".modal__media"),a=r.exerciseModal.querySelector(".modal__description"),s=r.exerciseModal.querySelector(".modal__favorite");i&&(i.textContent=e.name),o&&(e.gifUrl?o.innerHTML=`
        <video autoplay loop muted playsinline class="modal__video">
          <source src="${e.gifUrl}" type="video/mp4">
        </video>
      `:o.innerHTML=`
        <img src="${e.image||"./images/placeholder.jpg"}" alt="${e.name}" class="modal__image">
      `),a&&(a.innerHTML=`
      <div class="modal__details">
        <p><strong>Ціль:</strong> ${e.target}</p>
        <p><strong>Частина тіла:</strong> ${e.bodyPart}</p>
        <p><strong>Популярність:</strong> ${e.popularity||0}%</p>
        <p><strong>Калорії:</strong> ${e.burnedCalories||0} за 3 хв</p>
      </div>
      <p>${e.description||""}</p>
    `),s&&(s.textContent=t?"Видалити з улюблених":"Додати до улюблених",s.onclick=()=>B(e._id))}function b(e){const t=e==="exercise"?r.exerciseModal:r.ratingModal;t&&(t.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden")}function c(e){const t=e==="exercise"?r.exerciseModal:r.ratingModal;t&&(t.setAttribute("aria-hidden","true"),document.body.style.overflow="")}function N(e){const t=e.target.closest(".modal__close"),i=e.target.closest(".modal__overlay");(t||i)&&(r.exerciseModal&&r.exerciseModal.getAttribute("aria-hidden")==="false"&&c("exercise"),r.ratingModal&&r.ratingModal.getAttribute("aria-hidden")==="false"&&c("rating"))}function O(e){e.key==="Escape"&&(r.exerciseModal&&r.exerciseModal.getAttribute("aria-hidden")==="false"&&c("exercise"),r.ratingModal&&r.ratingModal.getAttribute("aria-hidden")==="false"&&c("rating"),r.mobileMenu&&r.mobileMenu.classList.contains("active")&&m())}function B(e){const t=n.exercises.find(o=>o._id===e);if(!t)return;const i=n.favorites.findIndex(o=>o._id===e);i>-1?(n.favorites.splice(i,1),f("Вправу видалено з улюблених")):(n.favorites.push(t),f("Вправу додано до улюблених")),localStorage.setItem("favorites",JSON.stringify(n.favorites)),_()}async function j(e){e.preventDefault();const i=new FormData(e.target).get("email");if(!i){l("Будь ласка, введіть email");return}try{await d("/subscription",{method:"POST",body:JSON.stringify({email:i})}),f("Підписка успішна!"),e.target.reset()}catch(o){console.error("Error subscribing:",o),l("Не вдалося підписатися")}}function Q(){r.mobileMenu.classList.contains("active")?m():J()}function J(){r.mobileMenu.classList.add("active"),r.overlay.classList.add("active"),r.mobileMenuToggle.setAttribute("aria-expanded","true"),document.body.style.overflow="hidden"}function m(){r.mobileMenu.classList.remove("active"),r.overlay.classList.remove("active"),r.mobileMenuToggle.setAttribute("aria-expanded","false"),document.body.style.overflow=""}function x(e){e&&(e.innerHTML=`
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `)}function l(e){h(e,"error")}function f(e){h(e,"success")}function h(e,t="info"){const i=document.createElement("div");i.className=`notification notification--${t}`,i.textContent=e,i.style.cssText=`
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${t==="error"?"#f56565":t==="success"?"#48bb78":"#3182ce"};
    color: white;
    border-radius: 8px;
    font-weight: 500;
    z-index: 9999;
    transform: translateY(100px);
    transition: transform 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,document.body.appendChild(i),requestAnimationFrame(()=>{i.style.transform="translateY(0)"}),setTimeout(()=>{i.style.transform="translateY(100px)",setTimeout(()=>{i.parentNode&&i.parentNode.removeChild(i)},300)},3e3)}window.YourEnergyApp={state:n,loadQuote:y,loadFilters:g,loadExercises:u,openModal:b,closeModal:c};
//# sourceMappingURL=index.js.map
