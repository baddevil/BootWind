/* =========================================================
  Supercar Template Interactions
  CSS Version: 1.0 The Enter
========================================================= */

(() => {
  const formatTHB = (priceTHB) => {
    const value = Math.round(priceTHB || 0);
    return `฿${value.toLocaleString('th-TH')}`;
  };

  const absUrl = (raw) => {
    try {
      return new URL(String(raw || ''), location.href).toString();
    } catch (_) {
      return String(raw || '');
    }
  };

  const seo = (() => {
    const setMeta = (selector, value) => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.setAttribute('content', String(value || ''));
    };

    const setLink = (selector, value) => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.setAttribute('href', String(value || ''));
    };

    const setJsonLd = (payload) => {
      const el = document.querySelector('[data-seo-jsonld]');
      if (!el) return;
      try {
        el.textContent = JSON.stringify(payload || {}, null, 0);
      } catch (_) {
        el.textContent = '{}';
      }
    };

    const canonical = () => absUrl(`${location.origin}${location.pathname}`);

    const init = () => {
      const url = canonical();
      setLink('[data-seo-canonical]', url);
      setLink('[data-seo-hreflang="th"]', url);
      setLink('[data-seo-hreflang="x-default"]', url);
      setMeta('[data-seo-og-url]', url);

      const gaIdEl = document.querySelector('[data-seo-ga]');
      const gaId = gaIdEl ? (gaIdEl.getAttribute('content') || '').trim() : '';
      if (gaId) {
        const s = document.createElement('script');
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', gaId, { anonymize_ip: true });
      }
    };

    const initWebVitals = () => {
      const vitals = {};
      window.bwSeoVitals = () => ({ ...vitals });

      const observe = (type, callback) => {
        try {
          const po = new PerformanceObserver((list) => callback(list.getEntries()));
          po.observe({ type, buffered: true });
          return po;
        } catch (_) {
          return null;
        }
      };

      observe('largest-contentful-paint', (entries) => {
        const last = entries[entries.length - 1];
        if (!last) return;
        vitals.lcp = Math.round(last.startTime);
      });

      observe('layout-shift', (entries) => {
        let cls = vitals.cls || 0;
        for (const e of entries) {
          if (e.hadRecentInput) continue;
          cls += e.value || 0;
        }
        vitals.cls = Math.round(cls * 1000) / 1000;
      });

      observe('event', (entries) => {
        let maxInp = vitals.inp || 0;
        for (const e of entries) {
          if (e.name !== 'click' && e.name !== 'keydown' && e.name !== 'pointerdown') continue;
          if (typeof e.duration !== 'number') continue;
          maxInp = Math.max(maxInp, Math.round(e.duration));
        }
        vitals.inp = maxInp;
      });

      try {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) vitals.ttfb = Math.round(nav.responseStart);
      } catch (_) {}
    };

    const setInventorySchema = (allCars, selectedId) => {
      const url = canonical();
      const selected = (allCars || []).find(c => c.id === selectedId) || (allCars || [])[0];

      const itemListElement = (allCars || []).map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: `${c.brand} ${c.model}`,
          url: absUrl(`${location.origin}${location.pathname}#details`),
          brand: { '@type': 'Brand', name: c.brand },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'THB',
            price: c.priceTHB,
            availability: 'https://schema.org/InStock',
            url: absUrl(`${location.origin}${location.pathname}#details`)
          }
        }
      }));

      const product = selected ? {
        '@type': 'Product',
        '@id': `${url}#product`,
        name: `${selected.brand} ${selected.model}`,
        brand: { '@type': 'Brand', name: selected.brand },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'THB',
          price: selected.priceTHB,
          availability: 'https://schema.org/InStock',
          url: absUrl(`${location.origin}${location.pathname}#details`)
        }
      } : null;

      setJsonLd({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', '@id': `${url}#organization`, name: 'BootWind' },
          { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: document.title, inLanguage: document.documentElement.getAttribute('lang') || 'th' },
          { '@type': 'ItemList', '@id': `${url}#inventory`, itemListElement },
          ...(product ? [product] : [])
        ]
      });
    };

    return { init, initWebVitals, setInventorySchema };
  })();

  const formatMillions = (priceTHB) => {
    const million = (priceTHB || 0) / 1_000_000;
    return `${million.toFixed(million < 10 ? 1 : 0)}`;
  };

  /* =========================================================
    Data Model: Replace with API later
  ========================================================== */
  const cars = [
    {
      id: 'sv-aventador-svj',
      brand: 'Lamborghini',
      model: 'Aventador SVJ',
      year: 2021,
      priceTHB: 49_900_000,
      hp: 770,
      topSpeedKmh: 350,
      zeroTo100: 2.8,
      drivetrain: 'AWD',
      transmission: 'ISR 7-speed',
      tags: ['V12', 'Track Pack', 'Limited'],
      highlights: ['Carbon aero kit', 'Factory telemetry', 'Carbon ceramic brakes', 'Full PPF installed']
    },
    {
      id: 'sv-sf90-stradale',
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2022,
      priceTHB: 57_000_000,
      hp: 986,
      topSpeedKmh: 340,
      zeroTo100: 2.5,
      drivetrain: 'AWD',
      transmission: 'DCT 8-speed',
      tags: ['Hybrid', '986 HP', 'Superfast'],
      highlights: ['Hybrid performance mode', 'Carbon fiber interior', 'Lift system', 'Warranty eligible']
    },
    {
      id: 'sv-gt2rs',
      brand: 'Porsche',
      model: '911 GT2 RS',
      year: 2020,
      priceTHB: 42_500_000,
      hp: 700,
      topSpeedKmh: 340,
      zeroTo100: 2.8,
      drivetrain: 'RWD',
      transmission: 'PDK 7-speed',
      tags: ['Track', 'RS', 'Turbo'],
      highlights: ['Weissach package', 'Roll cage prep', 'Track alignment', 'Full service history']
    },
    {
      id: 'sv-720s',
      brand: 'McLaren',
      model: '720S',
      year: 2021,
      priceTHB: 26_900_000,
      hp: 710,
      topSpeedKmh: 341,
      zeroTo100: 2.9,
      drivetrain: 'RWD',
      transmission: 'SSG 7-speed',
      tags: ['Carbon Tub', 'Aero', 'Lightweight'],
      highlights: ['Sports exhaust', 'Carbon exterior pack', 'Premium audio', 'Fresh tires']
    },
    {
      id: 'sv-huracan-evo',
      brand: 'Lamborghini',
      model: 'Huracán EVO',
      year: 2022,
      priceTHB: 29_800_000,
      hp: 640,
      topSpeedKmh: 325,
      zeroTo100: 2.9,
      drivetrain: 'AWD',
      transmission: 'DCT 7-speed',
      tags: ['V10', 'Daily', 'Tech'],
      highlights: ['LDVI dynamics', 'Front lift', 'Apple CarPlay', 'Premium leather package']
    },
    {
      id: 'sv-artura',
      brand: 'McLaren',
      model: 'Artura',
      year: 2023,
      priceTHB: 25_500_000,
      hp: 671,
      topSpeedKmh: 330,
      zeroTo100: 3.0,
      drivetrain: 'RWD',
      transmission: 'DCT 8-speed',
      tags: ['Hybrid', 'New', 'Light'],
      highlights: ['Factory order spec', 'Extended warranty', 'Carbon interior', 'Low mileage']
    }
  ];

  const createSvgDataUri = (title, accent = '#38BDF8') => {
    const safeTitle = String(title).slice(0, 36);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#020617"/>
            <stop offset="1" stop-color="${accent}"/>
          </linearGradient>
          <filter id="b" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18"/>
          </filter>
        </defs>
        <rect width="1200" height="750" fill="url(#g)"/>
        <circle cx="340" cy="260" r="210" fill="rgba(255,255,255,0.12)" filter="url(#b)"/>
        <circle cx="840" cy="420" r="260" fill="rgba(255,255,255,0.10)" filter="url(#b)"/>
        <path d="M210 470 C 320 350, 520 310, 690 310 C 830 310, 955 360, 1030 470"
              fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="12" stroke-linecap="round"/>
        <path d="M300 470 C 410 390, 560 370, 690 370 C 790 370, 905 400, 960 470"
              fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="10" stroke-linecap="round"/>
        <text x="80" y="120" fill="rgba(255,255,255,0.92)" font-size="42" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="800">
          ${safeTitle}
        </text>
        <text x="80" y="170" fill="rgba(255,255,255,0.70)" font-size="22" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
          SUPER CAR TEMPLATE
        </text>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  /* =========================================================
    DOM References
  ========================================================== */
  const dom = {
    statCount: document.getElementById('statCount'),
    featuredImage: document.getElementById('featuredImage'),
    featuredBadgeBrand: document.getElementById('featuredBadgeBrand'),
    featuredBadgeYear: document.getElementById('featuredBadgeYear'),
    featuredBadgeTopSpeed: document.getElementById('featuredBadgeTopSpeed'),
    featuredTitle: document.getElementById('featuredTitle'),
    featuredMeta: document.getElementById('featuredMeta'),
    featuredPrice: document.getElementById('featuredPrice'),
    resultsCount: document.getElementById('resultsCount'),
    inventoryGrid: document.getElementById('inventoryGrid'),
    emptyState: document.getElementById('emptyState'),
    brandSelect: document.getElementById('brand'),
    filterForm: document.getElementById('filterForm'),
    detailsKicker: document.getElementById('detailsKicker'),
    detailsTitle: document.getElementById('detailsTitle'),
    detailsSubtitle: document.getElementById('detailsSubtitle'),
    detailsPrice: document.getElementById('detailsPrice'),
    detailsImage: document.getElementById('detailsImage'),
    detailsSpecs: document.getElementById('detailsSpecs'),
    detailsFeatures: document.getElementById('detailsFeatures'),
    quoteCarName: document.getElementById('quoteCarName'),
    quotePhone: document.getElementById('quotePhone'),
    quoteNote: document.getElementById('quoteNote'),
    quoteStatus: document.getElementById('quoteStatus'),
    contactForm: document.getElementById('contactForm'),
    contactStatus: document.getElementById('contactStatus'),
    contactInterest: document.getElementById('interest')
  };

  const state = {
    selectedId: cars[0]?.id || '',
    featuredId: cars[1]?.id || cars[0]?.id || ''
  };

  /* =========================================================
    Initialization
  ========================================================== */
  const initBootWind = () => {
    if (window.BootWind && typeof window.BootWind.init === 'function') {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      BootWind.init({ theme });
    }
  };

  const initBrandOptions = () => {
    if (!dom.brandSelect) return;
    const uniqueBrands = [...new Set(cars.map(c => c.brand))].sort((a, b) => a.localeCompare(b));
    for (const brand of uniqueBrands) {
      const opt = document.createElement('option');
      opt.value = brand;
      opt.textContent = brand;
      dom.brandSelect.appendChild(opt);
    }
  };

  const setStats = () => {
    if (dom.statCount) dom.statCount.textContent = `${cars.length}`;
  };

  /* =========================================================
    Filtering / Sorting
  ========================================================== */
  const readFilters = () => {
    const form = dom.filterForm;
    const q = String(form?.q?.value || '').trim().toLowerCase();
    const brand = String(form?.brand?.value || '').trim();
    const priceMaxMillions = Number(form?.priceMax?.value || 0) || 0;
    const yearMin = Number(form?.yearMin?.value || 0) || 0;
    const sort = String(form?.sort?.value || 'featured');
    return { q, brand, priceMaxMillions, yearMin, sort };
  };

  const applyFilters = () => {
    const { q, brand, priceMaxMillions, yearMin, sort } = readFilters();
    const priceMaxTHB = priceMaxMillions > 0 ? priceMaxMillions * 1_000_000 : 0;

    let list = cars.filter((car) => {
      const matchesBrand = !brand || car.brand === brand;
      const matchesPrice = !priceMaxTHB || car.priceTHB <= priceMaxTHB;
      const matchesYear = !yearMin || car.year >= yearMin;
      const blob = `${car.brand} ${car.model} ${car.year} ${car.tags.join(' ')}`.toLowerCase();
      const matchesQ = !q || blob.includes(q);
      return matchesBrand && matchesPrice && matchesYear && matchesQ;
    });

    switch (sort) {
      case 'priceAsc':
        list = list.slice().sort((a, b) => a.priceTHB - b.priceTHB);
        break;
      case 'priceDesc':
        list = list.slice().sort((a, b) => b.priceTHB - a.priceTHB);
        break;
      case 'yearDesc':
        list = list.slice().sort((a, b) => b.year - a.year);
        break;
      case 'hpDesc':
        list = list.slice().sort((a, b) => b.hp - a.hp);
        break;
      default:
        list = list.slice().sort((a, b) => {
          const aFeatured = a.id === state.featuredId ? 1 : 0;
          const bFeatured = b.id === state.featuredId ? 1 : 0;
          return bFeatured - aFeatured || b.year - a.year;
        });
        break;
    }

    renderInventory(list);
  };

  /* =========================================================
    Rendering: Inventory Cards
  ========================================================== */
  const renderInventory = (list) => {
    if (!dom.inventoryGrid) return;

    dom.inventoryGrid.innerHTML = '';
    for (const car of list) dom.inventoryGrid.appendChild(renderCarCard(car));

    if (dom.resultsCount) dom.resultsCount.textContent = `${list.length} results`;
    if (dom.emptyState) dom.emptyState.classList.toggle('bw-hidden', list.length > 0);
  };

  const renderCarCard = (car) => {
    const card = document.createElement('article');
    card.className = 'sc-car';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details: ${car.brand} ${car.model}`);
    card.dataset.carId = car.id;

    const media = document.createElement('div');
    media.className = 'sc-car-media';
    const img = document.createElement('img');
    img.alt = `${car.brand} ${car.model}`;
    img.loading = 'lazy';
    img.src = createSvgDataUri(`${car.brand} ${car.model}`, brandAccent(car.brand));
    media.appendChild(img);

    const badges = document.createElement('div');
    badges.className = 'sc-car-badges';
    badges.appendChild(makeBadge('accent', car.brand));
    badges.appendChild(makeBadge('success', String(car.year)));
    badges.appendChild(makeBadge('warning', `${car.topSpeedKmh} km/h`));
    media.appendChild(badges);

    const body = document.createElement('div');
    body.className = 'sc-car-body';

    const h = document.createElement('h3');
    h.className = 'sc-car-title';
    h.textContent = car.model;

    const meta = document.createElement('div');
    meta.className = 'sc-car-meta';
    const metaLeft = document.createElement('div');
    metaLeft.className = 'bw-text-sm bw-text-secondary';
    metaLeft.textContent = `${car.year} • ${car.hp} hp • ${car.drivetrain}`;
    const metaPrice = document.createElement('div');
    metaPrice.className = 'sc-price';
    metaPrice.textContent = formatTHB(car.priceTHB);
    meta.appendChild(metaLeft);
    meta.appendChild(metaPrice);

    const specs = document.createElement('div');
    specs.className = 'sc-car-specs';
    specs.appendChild(miniSpec('0-100', `${car.zeroTo100}s`));
    specs.appendChild(miniSpec('Top', `${car.topSpeedKmh}`));
    specs.appendChild(miniSpec('Price', `${formatMillions(car.priceTHB)}M`));

    body.appendChild(h);
    body.appendChild(meta);
    body.appendChild(specs);

    card.appendChild(media);
    card.appendChild(body);

    return card;
  };

  const miniSpec = (k, v) => {
    const el = document.createElement('div');
    el.className = 'sc-mini';
    el.innerHTML = `<div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div>`;
    return el;
  };

  const makeBadge = (variant, text) => {
    const s = document.createElement('span');
    s.className = `bw-badge bw-badge-${variant}`;
    s.textContent = text;
    return s;
  };

  const escapeHtml = (str) => String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const brandAccent = (brand) => {
    const map = {
      Ferrari: '#E11D48',
      Lamborghini: '#F59E0B',
      Porsche: '#38BDF8',
      McLaren: '#10B981'
    };
    return map[brand] || '#38BDF8';
  };

  /* =========================================================
    Rendering: Featured + Details
  ========================================================== */
  const setFeatured = (carId) => {
    const car = cars.find(c => c.id === carId) || cars[0];
    if (!car) return;
    state.featuredId = car.id;

    if (dom.featuredImage) {
      dom.featuredImage.src = createSvgDataUri(`${car.brand} ${car.model}`, brandAccent(car.brand));
      dom.featuredImage.alt = `ภาพซูเปอร์คาร์ ${car.brand} ${car.model}`;
    }
    if (dom.featuredBadgeBrand) dom.featuredBadgeBrand.textContent = car.brand;
    if (dom.featuredBadgeYear) dom.featuredBadgeYear.textContent = String(car.year);
    if (dom.featuredBadgeTopSpeed) dom.featuredBadgeTopSpeed.textContent = `${car.topSpeedKmh} km/h`;
    if (dom.featuredTitle) dom.featuredTitle.textContent = car.model;
    if (dom.featuredMeta) dom.featuredMeta.textContent = `${car.hp} hp • 0-100 ${car.zeroTo100}s • ${car.drivetrain}`;
    if (dom.featuredPrice) dom.featuredPrice.textContent = formatTHB(car.priceTHB);
  };

  const setSelected = (carId, { scroll = false } = {}) => {
    const car = cars.find(c => c.id === carId) || cars[0];
    if (!car) return;
    state.selectedId = car.id;

    if (dom.detailsKicker) dom.detailsKicker.textContent = car.brand;
    if (dom.detailsTitle) dom.detailsTitle.textContent = car.model;
    if (dom.detailsSubtitle) dom.detailsSubtitle.textContent = `${car.year} • ${car.hp} hp • ${car.drivetrain} • ${car.transmission}`;
    if (dom.detailsPrice) dom.detailsPrice.textContent = formatTHB(car.priceTHB);
    if (dom.detailsImage) {
      dom.detailsImage.src = createSvgDataUri(`${car.brand} ${car.model}`, brandAccent(car.brand));
      dom.detailsImage.alt = `ภาพรายละเอียด ${car.brand} ${car.model}`;
    }

    if (dom.detailsSpecs) {
      dom.detailsSpecs.innerHTML = '';
      dom.detailsSpecs.appendChild(detailSpec('Year', car.year));
      dom.detailsSpecs.appendChild(detailSpec('Power', `${car.hp} hp`));
      dom.detailsSpecs.appendChild(detailSpec('0-100', `${car.zeroTo100}s`));
      dom.detailsSpecs.appendChild(detailSpec('Top Speed', `${car.topSpeedKmh} km/h`));
      dom.detailsSpecs.appendChild(detailSpec('Drivetrain', car.drivetrain));
      dom.detailsSpecs.appendChild(detailSpec('Transmission', car.transmission));
    }

    if (dom.detailsFeatures) {
      dom.detailsFeatures.innerHTML = '';
      for (const line of car.highlights) {
        const li = document.createElement('li');
        li.textContent = line;
        dom.detailsFeatures.appendChild(li);
      }
    }

    if (dom.quoteCarName) dom.quoteCarName.textContent = `${car.brand} ${car.model} (${car.year})`;
    if (dom.contactInterest && (!dom.contactInterest.value || dom.contactInterest.value.trim() === '')) {
      dom.contactInterest.value = `${car.brand} ${car.model}`;
    }

    if (scroll) {
      const el = document.getElementById('details');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    seo.setInventorySchema(cars, state.selectedId);
  };

  const detailSpec = (k, v) => {
    const el = document.createElement('div');
    el.className = 'sc-spec';
    el.innerHTML = `<div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div>`;
    return el;
  };

  const selectNext = (dir) => {
    const idx = cars.findIndex(c => c.id === state.selectedId);
    const next = idx < 0 ? cars[0] : cars[(idx + dir + cars.length) % cars.length];
    setSelected(next.id, { scroll: false });
  };

  /* =========================================================
    UX Actions: Toast / Theme / Share / Forms
  ========================================================== */
  const showToast = (type, message) => {
    if (window.BootWind && BootWind.ui && BootWind.ui.toast) {
      BootWind.ui.toast({
        title: 'Supercar Vault',
        message,
        type,
        duration: 3200
      });
    }
  };

  const toggleTheme = () => {
    if (window.BootWind && BootWind.theme && typeof BootWind.theme.toggle === 'function') {
      BootWind.theme.toggle();
      return;
    }
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
  };

  const copyShareLink = async () => {
    const car = cars.find(c => c.id === state.selectedId);
    const url = new URL(window.location.href);
    if (car) url.hash = `#details?car=${encodeURIComponent(car.id)}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      showToast('success', 'คัดลอกลิงก์แล้ว');
    } catch {
      showToast('warning', 'ไม่สามารถคัดลอกได้ในเบราว์เซอร์นี้');
    }
  };

  const submitQuote = () => {
    const phone = String(dom.quotePhone?.value || '').trim();
    const note = String(dom.quoteNote?.value || '').trim();
    const car = cars.find(c => c.id === state.selectedId);

    if (!phone) {
      if (dom.quoteStatus) dom.quoteStatus.textContent = 'โปรดระบุเบอร์โทร';
      showToast('warning', 'โปรดระบุเบอร์โทร');
      return;
    }

    if (dom.quoteStatus) dom.quoteStatus.textContent = 'ส่งคำขอเรียบร้อย (ตัวอย่างเท่านั้น)';
    showToast('success', `รับคำขอสำหรับ ${car ? car.model : 'car'} แล้ว`);
  };

  const submitContactForm = (e) => {
    e.preventDefault();
    const form = dom.contactForm;
    const fullName = String(form?.fullName?.value || '').trim();
    const phone = String(form?.phone?.value || '').trim();
    const interest = String(form?.interest?.value || '').trim();

    if (!fullName || !phone) {
      if (dom.contactStatus) dom.contactStatus.textContent = 'กรุณากรอกชื่อและเบอร์โทร';
      showToast('warning', 'กรุณากรอกชื่อและเบอร์โทร');
      return;
    }

    if (dom.contactStatus) dom.contactStatus.textContent = 'ส่งข้อมูลสำเร็จ (ตัวอย่างเท่านั้น)';
    showToast('success', interest ? `ขอบคุณ! เราจะติดต่อกลับเรื่อง ${interest}` : 'ขอบคุณ! เราจะติดต่อกลับ');
    form.reset();
  };

  /* =========================================================
    Routing (Optional): preselect from hash
  ========================================================== */
  const preselectFromHash = () => {
    const hash = String(window.location.hash || '');
    const match = hash.match(/car=([^&]+)/);
    if (!match) return;
    const id = decodeURIComponent(match[1]);
    if (cars.some(c => c.id === id)) setSelected(id, { scroll: false });
  };

  /* =========================================================
    Events
  ========================================================== */
  const bindEvents = () => {
    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-sc-action]') : null;
      if (!btn) return;
      const action = btn.getAttribute('data-sc-action');

      if (action === 'themeToggle') toggleTheme();
      if (action === 'showToast') showToast('info', 'Concierge พร้อมช่วยคุณเลือกคันที่ใช่');
      if (action === 'viewFeatured') setSelected(state.featuredId, { scroll: true });
      if (action === 'prevCar') selectNext(-1);
      if (action === 'nextCar') selectNext(1);
      if (action === 'copyLink') copyShareLink();
      if (action === 'submitQuote') submitQuote();
      if (action === 'applyFilters') applyFilters();
    });

    if (dom.filterForm) {
      dom.filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
      });

      dom.filterForm.addEventListener('input', (e) => {
        const el = e.target;
        if (!el || el.name === 'sort') return;
        applyFilters();
      });

      dom.filterForm.addEventListener('change', (e) => {
        const el = e.target;
        if (!el) return;
        if (el.name === 'sort' || el.name === 'brand') applyFilters();
      });

      dom.filterForm.addEventListener('reset', () => {
        window.setTimeout(() => applyFilters(), 0);
      });
    }

    if (dom.inventoryGrid) {
      dom.inventoryGrid.addEventListener('click', (e) => {
        const card = e.target && e.target.closest ? e.target.closest('[data-car-id]') : null;
        if (!card) return;
        const id = card.getAttribute('data-car-id');
        if (id) setSelected(id, { scroll: true });
      });

      dom.inventoryGrid.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target && e.target.closest ? e.target.closest('[data-car-id]') : null;
        if (!card) return;
        e.preventDefault();
        const id = card.getAttribute('data-car-id');
        if (id) setSelected(id, { scroll: true });
      });
    }

    if (dom.contactForm) dom.contactForm.addEventListener('submit', submitContactForm);
  };

  /* =========================================================
    Startup
  ========================================================== */
  const start = () => {
    initBootWind();
    seo.init();
    seo.initWebVitals();
    initBrandOptions();
    setStats();

    setFeatured(state.featuredId);
    preselectFromHash();
    setSelected(state.selectedId, { scroll: false });

    applyFilters();
    bindEvents();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
