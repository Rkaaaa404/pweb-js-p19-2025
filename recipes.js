// recipes.js - vanilla JS implementation for Recipes Collection page
(function(){
  'use strict';

  // ====== Auth Gate: redirect if not logged in ======
  const firstName = localStorage.getItem('firstName');
  if (!firstName) {
    window.location.href = 'login.html';
    return;
  }

  // ====== DOM Refs ======
  const navUserSlot = document.getElementById('nav-user-slot');
  const logoutBtn = document.getElementById('btn-logout');
  const searchInput = document.getElementById('search-input');
  const cuisineSelect = document.getElementById('cuisine-select');
  const grid = document.getElementById('recipes-grid');
  const showMoreBtn = document.getElementById('btn-show-more');
  const counter = document.getElementById('result-counter');
      if (counter) counter.style.display = 'none';

  // Inject user name into navbar
  if (navUserSlot) {
    navUserSlot.textContent = `Hi, ${firstName}!`;
  }

  // Logout handler
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('firstName');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // ====== State ======
  const PAGE_SIZE = 12;
  let allRecipes = [];
  let filtered = [];
  let visibleCount = 0;

  // ====== Helpers ======
  function debounce(fn, delay=300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), delay);
    }
  }

  function starHTML(rating) {
    const max = 5;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = max - full - half;
    let html = '';
    for (let i=0;i<full;i++) html += '<span class="star full">★</span>';
    if (half) html += '<span class="star half">★</span>';
    for (let i=0;i<empty;i++) html += '<span class="star empty">★</span>';
    return `<div class="stars" title="${rating.toFixed(1)} / 5">${html}<span class="rating-number">${rating.toFixed(1)}</span></div>`;
  }

  function normalize(str) {
    return (str || '').toString().toLowerCase();
  }

  function matchesQuery(recipe, q) {
    if (!q) return true;
    const n = normalize(q);
    const haystacks = [
      recipe.name,
      recipe.cuisine,
      (recipe.tags || []).join(' '),
      (recipe.ingredients || []).join(' ')
    ].map(normalize).join(' | ');
    return haystacks.includes(n);
  }

  function buildCard(r) {
    const time = `${r.prepTimeMinutes + r.cookTimeMinutes} min`;
    const difficulty = r.difficulty || '-';
    const cuisine = r.cuisine || '-';
    const ingredients = (r.ingredients || []).slice(0,6).join(', ');
    const img = r.image || (r.images && r.images[0]) || 'https://placehold.co/600x400?text=Recipe';

    return (
      `<article class="recipe-card">
        <div class="thumb-wrap">
          <img src="${img}" alt="${r.name}">
          <div class="badge cuisine">${cuisine}</div>
          <div class="badge difficulty">${difficulty}</div>
        </div>
        <div class="card-body">
          <h3 class="title" title="${r.name}">${r.name}</h3>
          ${starHTML(r.rating || 0)}
          <div class="meta">
            <span>⏱ ${time}</span>
            <span>👨‍🍳 Serves: ${r.servings || '-'}</span>
          </div>
          <div class="ingredients"><strong>Ingredients:</strong> ${ingredients || '-'}</div>
          <div class="actions">
            <button class="btn btn-outline" data-id="${r.id}" disabled title="Handled by another team later">View Full Recipe</button>
          </div>
        </div>
      </article>`
    );
  }

  function render(reset=false) {
    if (reset) {
      visibleCount = 0;
      grid.innerHTML = '';
    }
    const next = filtered.slice(visibleCount, visibleCount + PAGE_SIZE);
    const html = next.map(buildCard).join('');
    grid.insertAdjacentHTML('beforeend', html);
    visibleCount += next.length;

    // Counter & ShowMore state
    counter.textContent = `${filtered.length} recipe${filtered.length!==1?'s':''} found`;
    showMoreBtn.style.display = visibleCount < filtered.length ? 'inline-flex' : 'none';
  }

  function applyFilters() {
    const q = searchInput.value.trim();
    const csel = cuisineSelect.value;
    filtered = allRecipes.filter(r => {
      const okCuisine = !csel || csel === 'ALL' || r.cuisine === csel;
      const okQuery = matchesQuery(r, q);
      return okCuisine && okQuery;
    });
    render(true);
  }

  const debouncedApply = debounce(applyFilters, 300);

  // Events
  searchInput.addEventListener('input', debouncedApply);
  cuisineSelect.addEventListener('change', applyFilters);
  showMoreBtn.addEventListener('click', () => render(false));

  // ====== Fetch Recipes ======
  async function fetchRecipes() {
    const res = await fetch('https://dummyjson.com/recipes?limit=0');
    if (!res.ok) throw new Error('Failed to load recipes');
    const data = await res.json();
    return data.recipes || [];
  }

  function hydrateCuisineDropdown(list) {
    const set = new Set(list.map(r => r.cuisine).filter(Boolean));
    const options = ['<option value="ALL">All cuisines</option>']
      .concat(Array.from(set).sort().map(c => `<option value="${c}">${c}</option>`))
      .join('');
    cuisineSelect.innerHTML = options;
  }

  (async () => {
    try {
      const recipes = await fetchRecipes();
      allRecipes = recipes;
      hydrateCuisineDropdown(allRecipes);
      filtered = allRecipes.slice();
      render(true);
    } catch (e) {
      console.error(e);
      grid.innerHTML = '<p class="error">Gagal memuat data resep. Coba refresh halaman.</p>';
    }
  })();

})();
