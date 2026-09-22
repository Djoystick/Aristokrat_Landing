/**
 * Главный скрипт интерактивности сайта театра «Артистократ»
 */
document.addEventListener('DOMContentLoaded', () => {
  const data = window.THEATER_DATA;
  if (!data) {
    console.error('THEATER_DATA not found!');
    return;
  }

  // 1. Инициализация сценического софита
  if (window.StageSpotlight) {
    new window.StageSpotlight('spotlight-canvas');
  }

  // 2. Рендеринг спектаклей репертуара
  renderPlays(data.plays);

  // 3. Рендеринг направлений студии (курсов)
  renderCourses(data.courses);

  // 4. Рендеринг фотогалереи
  renderGallery(data.gallery, 'all');

  // 5. Рендеринг FAQ
  renderFAQ(data.faq);

  // 6. Инициализация модального окна «Театральный Билет»
  setupTicketModal();

  // 7. Инициализация Lightbox галереи
  setupLightbox(data.gallery);

  // 8. Навигация и плавающий док
  setupNavigation();

  // 9. Телефонная маска
  setupPhoneMask();
});

/**
 * Рендеринг карточек спектаклей в стиле кинотеатральных постеров
 */
function renderPlays(plays) {
  const container = document.getElementById('plays-grid');
  if (!container) return;

  container.innerHTML = plays.map(play => `
    <div class="glass-panel rounded-2xl overflow-hidden group flex flex-col justify-between transition-all duration-300 w-[84vw] max-w-[340px] md:w-auto shrink-0 snap-center">
      <div class="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden">
        <img 
          src="${play.image}" 
          alt="${play.title}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/30"></div>
        <div class="absolute top-4 left-4 flex flex-wrap gap-2">
          <span class="badge-stage text-xs">${play.badge}</span>
        </div>
        <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-amber-200/80 font-medium">
          <span>${play.duration}</span>
          <span>${play.cast}</span>
        </div>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-xs text-amber-400/90 font-semibold mb-1">
            <span class="uppercase tracking-wider">${play.genre}</span>
            <span class="text-zinc-400 font-normal">${play.author}</span>
          </div>
          <h3 class="font-serif text-2xl sm:text-3xl text-white font-bold mb-1.5 group-hover:text-amber-300 transition-colors">
            ${play.title}
          </h3>
          <div class="text-xs text-amber-300/90 font-medium mb-3 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
            <span>Режиссер: ${play.director}</span>
          </div>
          <p class="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
            ${play.description}
          </p>
        </div>

        <div class="pt-4 border-t border-white/5 flex items-center justify-between">
          <span class="text-xs text-zinc-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ${play.status}
          </span>
          <button 
            onclick="openTicketModal('Спектакль: ${play.title.replace(/[«»]/g, '')}')" 
            class="px-4 py-2 text-xs font-semibold rounded-full bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black border border-amber-400/30 transition-all duration-200"
          >
            Забронировать место
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Рендеринг направлений студии (гармоничная матрица 3x2 из 6 карточек)
 */
function renderCourses(courses, activeCategory = 'all') {
  const container = document.getElementById('courses-grid');
  if (!container) return;

  const filtered = activeCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  container.innerHTML = filtered.map(c => {
    const isIndividual = c.id === 'individual' || c.featured;

    if (isIndividual) {
      return `
        <div class="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 border-amber-500/40 bg-gradient-to-br from-amber-500/[0.12] via-amber-950/[0.08] to-transparent relative overflow-hidden shadow-lg shadow-amber-500/5 hover:border-amber-400 w-[84vw] max-w-[320px] sm:w-auto shrink-0 snap-center">
          <div class="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                ★ Персонально
              </span>
              <span class="text-xs text-amber-200/90 font-medium">${c.schedule}</span>
            </div>

            <h3 class="font-serif text-2xl sm:text-3xl text-white font-bold mb-3 group-hover:text-amber-300 transition-colors">
              ${c.title}
            </h3>
            <p class="text-sm text-zinc-300 mb-6 leading-relaxed">
              ${c.description}
            </p>

            <ul class="space-y-2.5 mb-8">
              ${c.focus.map(item => `
                <li class="text-xs sm:text-sm text-zinc-200 flex items-start gap-2.5">
                  <svg class="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>${item}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="pt-5 border-t border-amber-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto">
            <span class="text-xs text-amber-300 font-medium flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Наставники студии
            </span>
            <button 
              onclick="openTicketModal('Индивидуальные занятия с наставником')" 
              class="btn-spotlight text-xs py-2.5 px-5 text-center"
            >
              Консультация
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 hover:border-amber-500/30 w-[84vw] max-w-[320px] sm:w-auto shrink-0 snap-center">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20">
              ${c.age}
            </span>
            <span class="text-xs text-zinc-400 font-medium">${c.schedule}</span>
          </div>

          <h3 class="font-serif text-2xl sm:text-3xl text-white font-bold mb-3">
            ${c.title}
          </h3>
          <p class="text-sm text-zinc-400 mb-6 leading-relaxed">
            ${c.description}
          </p>

          <ul class="space-y-2.5 mb-8">
            ${c.focus.map(item => `
              <li class="text-xs sm:text-sm text-zinc-300 flex items-start gap-2.5">
                <svg class="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto">
          <span class="text-xs text-amber-300/90 font-medium flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            1-е занятие — Бесплатно
          </span>
          <button 
            onclick="openTicketModal('Направление: ${c.title.split(':')[0]} (${c.age})')" 
            class="px-4 py-2 text-xs font-semibold rounded-full bg-white/10 hover:bg-amber-400 hover:text-black transition-all duration-200 text-center"
          >
            Записаться
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Фильтрация курсов по категориям
 */
window.filterCourses = function(category, buttonEl) {
  document.querySelectorAll('.course-filter-btn').forEach(b => {
    b.classList.remove('bg-amber-400', 'text-black', 'font-semibold');
    b.classList.add('bg-white/5', 'text-zinc-400');
  });

  if (buttonEl) {
    buttonEl.classList.remove('bg-white/5', 'text-zinc-400');
    buttonEl.classList.add('bg-amber-400', 'text-black', 'font-semibold');
  }

  renderCourses(window.THEATER_DATA.courses, category);
};

/**
 * Рендеринг интерактивной фотогалереи в CSS Masonry
 */
function renderGallery(gallery, activeCategory) {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  const filtered = activeCategory === 'all' 
    ? gallery 
    : gallery.filter(item => item.category === activeCategory);

  container.innerHTML = filtered.map(item => `
    <div 
      class="gallery-card group" 
      onclick="openLightbox('${item.id}')"
    >
      <img 
        src="${item.src}" 
        alt="${item.title}" 
        loading="lazy" 
      />
      <div class="gallery-card-overlay">
        <span class="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1">${item.categoryLabel}</span>
        <h4 class="text-base font-serif font-bold text-white mb-1">${item.title}</h4>
        <p class="text-xs text-zinc-400">${item.desc}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Фильтрация галереи
 */
window.filterGallery = function(category, buttonEl) {
  document.querySelectorAll('.gallery-filter-btn').forEach(b => {
    b.classList.remove('bg-amber-400', 'text-black', 'font-semibold');
    b.classList.add('bg-white/5', 'text-zinc-400');
  });

  if (buttonEl) {
    buttonEl.classList.remove('bg-white/5', 'text-zinc-400');
    buttonEl.classList.add('bg-amber-400', 'text-black', 'font-semibold');
  }

  renderGallery(window.THEATER_DATA.gallery, category);
};

/**
 * Рендеринг FAQ
 */
function renderFAQ(faqList) {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.innerHTML = faqList.map((item, idx) => `
    <div class="faq-item glass-panel rounded-xl overflow-hidden transition-all duration-200 mb-3">
      <button 
        type="button" 
        onclick="toggleFAQ(this)" 
        class="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
      >
        <span class="font-serif text-lg sm:text-xl font-bold text-zinc-100">${item.q}</span>
        <svg class="faq-icon w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div class="faq-content px-6 pb-5 text-sm sm:text-base text-zinc-400 leading-relaxed">
        ${item.a}
      </div>
    </div>
  `).join('');
}

window.toggleFAQ = function(btn) {
  const item = btn.closest('.faq-item');
  const wasActive = item.classList.contains('active');

  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

  if (!wasActive) {
    item.classList.add('active');
  }
};

/**
 * Полноэкранный просмотрщик Lightbox
 */
let currentLightboxIndex = 0;
let currentLightboxList = [];

function setupLightbox(gallery) {
  currentLightboxList = gallery;

  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });
}

window.openLightbox = function(id) {
  const gallery = window.THEATER_DATA.gallery;
  const idx = gallery.findIndex(g => g.id === id);
  if (idx === -1) return;

  currentLightboxIndex = idx;
  updateLightboxContent();

  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.nextLightbox = function() {
  const gallery = window.THEATER_DATA.gallery;
  currentLightboxIndex = (currentLightboxIndex + 1) % gallery.length;
  updateLightboxContent();
};

window.prevLightbox = function() {
  const gallery = window.THEATER_DATA.gallery;
  currentLightboxIndex = (currentLightboxIndex - 1 + gallery.length) % gallery.length;
  updateLightboxContent();
};

function updateLightboxContent() {
  const item = window.THEATER_DATA.gallery[currentLightboxIndex];
  if (!item) return;

  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');
  const counter = document.getElementById('lightbox-counter');

  if (img) img.src = item.src;
  if (title) title.textContent = item.title;
  if (desc) desc.textContent = item.desc;
  if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${window.THEATER_DATA.gallery.length}`;
}

/**
 * Интерактивный «Театральный Билет» (Модальное окно заявки)
 */
function setupTicketModal() {
  const modal = document.getElementById('ticket-modal');
  const form = document.getElementById('ticket-form');
  if (!modal || !form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('ticket-name').value.trim();
    const phone = document.getElementById('ticket-phone').value.trim();
    const target = document.getElementById('ticket-target').value;
    const ticketNo = document.getElementById('ticket-number').textContent;

    if (!phone || phone.length < 16) {
      alert('Пожалуйста, введите корректный номер телефона!');
      return;
    }

    // Сохранение заявки в localStorage
    const lead = {
      id: Date.now(),
      ticketNo,
      name,
      phone,
      target,
      createdAt: new Date().toLocaleString('ru-RU')
    };

    const savedLeads = JSON.parse(localStorage.getItem('artistokrat_leads') || '[]');
    savedLeads.push(lead);
    localStorage.setItem('artistokrat_leads', JSON.stringify(savedLeads));

    // Успешный экран в билете
    const body = document.getElementById('ticket-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="font-serif text-3xl text-white font-bold mb-2">Ваш билет забронирован!</h3>
          <p class="text-zinc-400 text-sm mb-4 max-w-sm mx-auto">
            Номер пригласительного: <span class="text-amber-300 font-mono font-bold">${ticketNo}</span>
          </p>
          <p class="text-xs text-zinc-500 leading-relaxed mb-6">
            Администратор студии свяжется с вами по номеру <span class="text-zinc-300 font-medium">${phone}</span> в течение дня для подтверждения удобного времени.
          </p>
          <div class="flex items-center justify-center gap-3">
            <a 
              href="https://vk.com/club224226452" 
              target="_blank" 
              class="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              Перейти в группу VK
            </a>
            <button 
              onclick="closeTicketModal()" 
              class="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      `;
    }
  });
}

window.openTicketModal = function(presetTarget) {
  const modal = document.getElementById('ticket-modal');
  if (!modal) return;

  // Генерация номера билета: ART-2026-XXXX
  const randomNo = Math.floor(1000 + Math.random() * 9000);
  const ticketNoEl = document.getElementById('ticket-number');
  if (ticketNoEl) ticketNoEl.textContent = `ART-2026-${randomNo}`;

  if (presetTarget) {
    const targetSelect = document.getElementById('ticket-target');
    if (targetSelect) {
      let found = false;
      for (let opt of targetSelect.options) {
        if (opt.value.toLowerCase().includes(presetTarget.toLowerCase()) || presetTarget.toLowerCase().includes(opt.value.toLowerCase())) {
          targetSelect.value = opt.value;
          found = true;
          break;
        }
      }
      if (!found) {
        const customOpt = document.createElement('option');
        customOpt.value = presetTarget;
        customOpt.textContent = presetTarget;
        customOpt.selected = true;
        targetSelect.prepend(customOpt);
      }
    }
  }

  modal.classList.add('open');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeTicketModal = function() {
  const modal = document.getElementById('ticket-modal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.style.display = 'none';
  document.body.style.overflow = '';
};

/**
 * Телефонная маска для РФ
 */
function setupPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let val = input.value.replace(/\D/g, '');
      if (val.startsWith('7') || val.startsWith('8')) val = val.substring(1);
      
      let formatted = '+7 ';
      if (val.length > 0) formatted += '(' + val.substring(0, 3);
      if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
      if (val.length >= 7) formatted += '-' + val.substring(6, 8);
      if (val.length >= 9) formatted += '-' + val.substring(8, 10);

      input.value = formatted;
    });

    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7 (';
    });
  });
}

/**
 * Навигация и активный элемент плавающего бара
 */
function setupNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const dockItems = document.querySelectorAll('.dock-item[data-section]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        currentId = sec.getAttribute('id');
      }
    });

    dockItems.forEach(item => {
      if (item.getAttribute('data-section') === currentId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }, { passive: true });
}

/**
 * Обработка онлайн-активации билета прямо на странице
 */
window.handleInlineTicketSubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('inline-name').value.trim();
  const phone = document.getElementById('inline-phone').value.trim();
  const target = document.getElementById('inline-target').value;
  const ticketNo = document.getElementById('static-ticket-no').textContent || `ART-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!phone || phone.length < 16) {
    alert('Пожалуйста, введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX');
    return;
  }

  // Сохранение заявки
  const lead = {
    id: Date.now(),
    ticketNo,
    name,
    phone,
    target,
    createdAt: new Date().toLocaleString('ru-RU')
  };

  const savedLeads = JSON.parse(localStorage.getItem('artistokrat_leads') || '[]');
  savedLeads.push(lead);
  localStorage.setItem('artistokrat_leads', JSON.stringify(savedLeads));

  // Замена содержимого билета прямо на странице на статус подтверждения
  const container = document.getElementById('inline-ticket-card-content');
  if (container) {
    container.innerHTML = `
      <div class="py-10 px-4 text-center animate-in fade-in zoom-in duration-300">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div class="ticket-activated-seal mb-4">
          ✓ Пригласительный активирован
        </div>
        <h3 class="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
          Ждем вас на сцене, ${name}!
        </h3>
        <div class="text-amber-300 font-mono text-sm sm:text-base font-bold mb-3">
          ${ticketNo} • ${target}
        </div>
        <p class="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Ваш именной пригласительный забронирован на номер <span class="text-white font-medium">${phone}</span>. Администратор студии свяжется с вами для подтверждения удобного времени.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a 
            href="https://vk.com/club224226452" 
            target="_blank" 
            class="btn-spotlight text-xs py-3 px-6 inline-flex items-center gap-2"
          >
            Мы ВКонтакте
          </a>
          <button 
            onclick="location.reload()" 
            class="btn-ghost-stage text-xs py-3 px-6"
          >
            Забронировать еще один билет
          </button>
        </div>
      </div>
    `;
  }
};
