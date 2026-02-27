# Your Energy

A vanilla JavaScript web application for browsing exercises, filtering by muscles, body parts, and equipment, and subscribing to updates. Uses the [Your Energy API](https://your-energy.b.goit.study/api-docs/).

## Features

- **Quote of the day** — displayed in the left column (desktop) or at the top (mobile)
- **Filters** — three tabs: Muscles, Body parts, Equipment; one active filter at a time
- **Exercise catalog** — cards with name, rating, body part, target, calories, time, and Start button
- **Exercise details** — modal with full info and editable star rating (PATCH)
- **Search** — by keyword (e.g. "run") via Enter in the search field
- **Subscription** — email form; success message on successful POST
- **Pagination** — page buttons at the bottom; requests use `page` and `limit`

## Tech stack

- Vanilla JavaScript (ES modules)
- Vite (build tool)
- CSS (no frameworks)
- HTML partials (injected by Vite plugin)

## Run locally

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open [http://localhost:5173](http://localhost:5173)

## Build

- `npm run build` — production build to `dist/`
- Set `--base=/YOUR_REPO_NAME/` in `package.json` script `build` for GitHub Pages

## Deploy (GitHub Pages)

1. In repo **Settings** → **Actions** → **General**, set workflow permissions to "Read and write".
2. Push to `main`; the workflow builds and deploys to the `gh-pages` branch.
3. In **Settings** → **Pages**, set source to the `gh-pages` branch (root).
4. Live site: `https://<username>.github.io/<repo>/`

## Project structure

- `src/` — source (root for Vite)
  - `css/` — styles + `fonts.css` (@font-face), layout, quote, filters, exercises, modal, subscription
  - `images/` — static images (sprite, favicon); оптимізовані під ретіну
  - `js/` — `api.js` (API client)
  - `partials/` — HTML fragments (header, quote, filters, exercises, modal, subscription, footer)
  - `public/` — favicon.svg (копія також у `images/`)
  - `index.html`, `main.js`

Build and deploy use the template’s GitHub Action (`.github/workflows/deploy.yml`).

---

## TECH — Критерії прийняття (чеклист)

| # | Критерій | Статус |
|---|----------|--------|
| 1 | Семантична верстка, 3 переломи (mobile / tablet / desktop) | ✅ |
| 2 | Підключений modern-normalize | ✅ |
| 3 | Шрифти через @font-face (`css/fonts.css`, Inter) | ✅ |
| 4 | Статичні зображення у `src/images`, оптимізовані | ✅ |
| 5 | Оптимізовано завантаження зображень (lazy, dimensions) | ✅ |
| 6 | Фавікон сторінки | ✅ |
| 7 | [Validator W3C HTML](https://validator.w3.org/) — без помилок | ⬜ перевірити вручну |
| 8 | [Validator W3C CSS](https://jigsaw.w3.org/css-validator/) — без помилок | ⬜ перевірити вручну |
| 9 | [PageSpeed Insights](https://pagespeed.web.dev/) — кожен показник ≥ 90% | ⬜ перевірити вручну |
| 10 | Консоль без помилок і без console.log | ✅ |
| 11 | Назви файлів: лише латиниця, без пробілів і великих літер | ✅ |
| 12 | Змінні camelCase, класи PascalCase, константи UPPER_SNAKE_CASE | ✅ |
| 13 | Структура папок за бандлером (Vite) | ✅ |
| 14 | Робочі гілки видалені (лише main, gh-pages) | ⬜ перевірити вручну |
| 15 | Задеплоєно на GitHub Pages | ⬜ після push у main |
| 16 | Code review ментором | ⬜ |
