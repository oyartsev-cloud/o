import"./assets/style-C0EIwy4F.js";const y="https://your-energy.b.goit.study/api",i={favorites:JSON.parse(localStorage.getItem("favorites")||"[]"),quote:null,modalData:null,isLoading:!1},t={quoteContent:null,favoritesGrid:null,exerciseModal:null,ratingModal:null,subscriptionForm:null,mobileMenuToggle:null,mobileMenu:null,overlay:null};document.addEventListener("DOMContentLoaded",()=>{x(),M(),S(),console.log("Favorites Page Initialized")});function x(){t.quoteContent=document.querySelector(".quote__content"),t.favoritesGrid=document.querySelector(".favorites__grid"),t.exerciseModal=document.getElementById("exercise-modal"),t.ratingModal=document.getElementById("rating-modal"),t.subscriptionForm=document.querySelector(".footer__subscription"),t.mobileMenuToggle=document.querySelector(".header__mobile-toggle"),t.mobileMenu=document.querySelector(".header__mobile-menu"),t.overlay=document.querySelector(".overlay")}function M(){t.mobileMenuToggle&&t.mobileMenuToggle.addEventListener("click",D),t.overlay&&t.overlay.addEventListener("click",m),t.subscriptionForm&&t.subscriptionForm.addEventListener("submit",C),document.addEventListener("click",E),document.addEventListener("keydown",$)}async function S(){try{await Promise.all([v(),f()])}catch(e){console.error("Error loading initial data:",e),c("Failed to load initial data")}}async function u(e,o={}){const a=`${y}${e}`,r=await fetch(a,{...o,headers:{"Content-Type":"application/json",...o.headers}});if(!r.ok){const n=new Error(`API error: ${r.status}`);throw n.status=r.status,n}return r.json()}async function v(){try{const e=new Date().toDateString(),o=localStorage.getItem("dailyQuote"),a=localStorage.getItem("quoteDate");if(o&&a===e){i.quote=JSON.parse(o),g();return}const r=await u("/quote");i.quote=r,localStorage.setItem("dailyQuote",JSON.stringify(r)),localStorage.setItem("quoteDate",e),g()}catch(e){console.error("Error loading quote:",e),q()}}function g(){if(!t.quoteContent||!i.quote)return;const e=`
    <p class="quote__text">"${i.quote.quote}"</p>
    <cite class="quote__author">${i.quote.author}</cite>
  `;t.quoteContent.innerHTML=e}function q(){t.quoteContent&&(t.quoteContent.innerHTML=`
    <p class="quote__text">Не вдалося завантажити цитату дня</p>
  `)}function f(){if(!t.favoritesGrid)return;if(i.favorites.length===0){t.favoritesGrid.innerHTML=`
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
    `;return}const e=i.favorites.map(o=>`
    <article class="exercise-card" data-id="${o._id}">
      <img src="${o.gifUrl||"./images/placeholder.jpg"}" alt="${o.name}" class="exercise-card__image">
      <div class="exercise-card__content">
        <h3 class="exercise-card__title">${o.name}</h3>
        <div class="exercise-card__meta">
          <span class="exercise-card__badge">${o.bodyPart}</span>
          <span class="exercise-card__badge">${o.target}</span>
        </div>
        <div class="exercise-card__stats">
          <span>${o.burnedCalories||0} калорій</span>
          <span>3 хв</span>
        </div>
        <div class="exercise-card__rating">
          ${A(o.rating||0)}
        </div>
        <div class="exercise-card__actions">
          <button class="exercise-card__start-btn" data-id="${o._id}">
            Start
          </button>
          <button class="exercise-card__remove-btn" data-id="${o._id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `).join("");t.favoritesGrid.innerHTML=e,t.favoritesGrid.querySelectorAll(".exercise-card__start-btn").forEach(o=>{o.addEventListener("click",w)}),t.favoritesGrid.querySelectorAll(".exercise-card__remove-btn").forEach(o=>{o.addEventListener("click",L)})}function L(e){const o=e.currentTarget.dataset.id,a=i.favorites.findIndex(r=>r._id===o);a>-1&&(i.favorites.splice(a,1),localStorage.setItem("favorites",JSON.stringify(i.favorites)),f(),d("Вправу видалено з улюблених"))}async function w(e){const o=e.target.dataset.id;try{const a=await u(`/exercises/${o}`);i.modalData=a,p(),_("exercise")}catch(a){console.error("Error loading exercise details:",a),c("Failed to load exercise details")}}function p(){if(!i.modalData)return;const e=i.modalData,o=i.favorites.some(b=>b._id===e._id),a=t.exerciseModal.querySelector(".modal__title"),r=t.exerciseModal.querySelector(".modal__media"),n=t.exerciseModal.querySelector(".modal__description"),s=t.exerciseModal.querySelector(".modal__favorite");a&&(a.textContent=e.name),r&&(e.gifUrl?r.innerHTML=`
        <video autoplay loop muted playsinline class="modal__video">
          <source src="${e.gifUrl}" type="video/mp4">
        </video>
      `:r.innerHTML=`
        <img src="${e.image||"./images/placeholder.jpg"}" alt="${e.name}" class="modal__image">
      `),n&&(n.innerHTML=`
      <div class="modal__details">
        <p><strong>Ціль:</strong> ${e.target}</p>
        <p><strong>Частина тіла:</strong> ${e.bodyPart}</p>
        <p><strong>Популярність:</strong> ${e.popularity||0}%</p>
        <p><strong>Калорії:</strong> ${e.burnedCalories||0} за 3 хв</p>
      </div>
      <p>${e.description||""}</p>
    `),s&&(s.textContent=o?"Видалити з улюблених":"Додати до улюблених",s.onclick=()=>T(e._id))}function _(e){const o=e==="exercise"?t.exerciseModal:t.ratingModal;o&&(o.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden")}function l(e){const o=e==="exercise"?t.exerciseModal:t.ratingModal;o&&(o.setAttribute("aria-hidden","true"),document.body.style.overflow="")}function E(e){const o=e.target.closest(".modal__close"),a=e.target.closest(".modal__overlay");(o||a)&&(t.exerciseModal&&t.exerciseModal.getAttribute("aria-hidden")==="false"&&l("exercise"),t.ratingModal&&t.ratingModal.getAttribute("aria-hidden")==="false"&&l("rating"))}function $(e){e.key==="Escape"&&(t.exerciseModal&&t.exerciseModal.getAttribute("aria-hidden")==="false"&&l("exercise"),t.ratingModal&&t.ratingModal.getAttribute("aria-hidden")==="false"&&l("rating"),t.mobileMenu&&t.mobileMenu.classList.contains("active")&&m())}function T(e){if(!i.favorites.find(a=>a._id===e))i.modalData&&(i.favorites.push(i.modalData),localStorage.setItem("favorites",JSON.stringify(i.favorites)),d("Вправу додано до улюблених"));else{const a=i.favorites.findIndex(r=>r._id===e);a>-1&&(i.favorites.splice(a,1),localStorage.setItem("favorites",JSON.stringify(i.favorites)),d("Вправу видалено з улюблених"))}p()}async function C(e){e.preventDefault();const a=new FormData(e.target).get("email");if(!a){c("Будь ласка, введіть email");return}try{await u("/subscription",{method:"POST",body:JSON.stringify({email:a})}),d("Підписка успішна!"),e.target.reset()}catch(r){console.error("Error subscribing:",r),c("Не вдалося підписатися")}}function D(){t.mobileMenu.classList.contains("active")?m():I()}function I(){t.mobileMenu.classList.add("active"),t.overlay.classList.add("active"),t.mobileMenuToggle.setAttribute("aria-expanded","true"),document.body.style.overflow="hidden"}function m(){t.mobileMenu.classList.remove("active"),t.overlay.classList.remove("active"),t.mobileMenuToggle.setAttribute("aria-expanded","false"),document.body.style.overflow=""}function A(e){const o=Math.floor(e),a=e%1!==0,r=5-Math.ceil(e);let n="";for(let s=0;s<o;s++)n+='<span class="star">★</span>';a&&(n+='<span class="star">☆</span>');for(let s=0;s<r;s++)n+='<span class="star empty">☆</span>';return n}function c(e){h(e,"error")}function d(e){h(e,"success")}function h(e,o="info"){const a=document.createElement("div");a.className=`notification notification--${o}`,a.textContent=e,a.style.cssText=`
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${o==="error"?"#f56565":o==="success"?"#48bb78":"#3182ce"};
    color: white;
    border-radius: 8px;
    font-weight: 500;
    z-index: 9999;
    transform: translateY(100px);
    transition: transform 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,document.body.appendChild(a),requestAnimationFrame(()=>{a.style.transform="translateY(0)"}),setTimeout(()=>{a.style.transform="translateY(100px)",setTimeout(()=>{a.parentNode&&a.parentNode.removeChild(a)},300)},3e3)}window.FavoritesApp={state:i,loadQuote:v,renderFavorites:f,openModal:_,closeModal:l};
//# sourceMappingURL=favorites.js.map
