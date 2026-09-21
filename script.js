const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const featuredImage = document.getElementById('verdantly-featured');
const caption = document.getElementById('verdantly-caption');

document.querySelectorAll('.screen-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.screen-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    featuredImage.style.opacity = '0';
    setTimeout(() => {
      featuredImage.src = tab.dataset.image;
      featuredImage.alt = `Verdantly ${tab.dataset.title} screen`;
      caption.innerHTML = `<strong>${tab.dataset.title}</strong><span>${tab.dataset.copy}</span>`;
      featuredImage.onload = () => featuredImage.style.opacity = '1';
    }, 140);
  });
});

featuredImage.style.transition = 'opacity .25s ease';

const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxStage = lightbox?.querySelector('.lightbox-stage');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxZoom = lightbox?.querySelector('.lightbox-zoom');

function setLightboxZoom(zoomed) {
  if (!lightbox || !lightboxImage || !lightboxStage) return;
  lightbox.classList.toggle('zoomed', zoomed);
  lightboxZoom && (lightboxZoom.textContent = zoomed ? 'Fit screen' : 'Zoom +');
  if (zoomed) {
    const targetWidth = Math.min(Math.max(lightboxImage.naturalWidth * 1.45, 1400), 2400);
    lightboxImage.style.width = `${targetWidth}px`;
    lightboxStage.scrollTop = 0;
    lightboxStage.scrollLeft = 0;
  } else {
    lightboxImage.style.width = '';
    lightboxStage.scrollTop = 0;
    lightboxStage.scrollLeft = 0;
  }
}

function openLightbox(src, alt = '') {
  if (!lightbox || !lightboxImage) return;
  setLightboxZoom(false);
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  setLightboxZoom(false);
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function toggleLightboxZoom() {
  if (!lightbox) return;
  setLightboxZoom(!lightbox.classList.contains('zoomed'));
}

lightboxClose?.addEventListener('click', closeLightbox);
lightboxZoom?.addEventListener('click', toggleLightboxZoom);
lightboxImage?.addEventListener('click', event => {
  event.stopPropagation();
  toggleLightboxZoom();
});
lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
  if ((e.key === '+' || e.key === '=') && lightbox?.classList.contains('open')) setLightboxZoom(true);
  if ((e.key === '-' || e.key === '_') && lightbox?.classList.contains('open')) setLightboxZoom(false);
});

featuredImage?.addEventListener('click', () => openLightbox(featuredImage.src, featuredImage.alt));
featuredImage?.style && (featuredImage.style.cursor = 'zoom-in');

document.querySelectorAll('.screen-tab img').forEach(img => {
  img.addEventListener('dblclick', () => openLightbox(img.src, img.alt || 'Verdantly screen'));
});

// CRM screenshot auto-replacement.
// Add screenshots with these exact filenames to /assets and the placeholders will replace themselves:
// crm-01-dashboard.png, crm-02-scheduling.png, crm-03-technician.png

document.querySelectorAll('[data-crm-src]').forEach(slot => {
  const src = slot.dataset.crmSrc;
  const title = slot.dataset.title || 'CRM screen';
  const probe = new Image();
  probe.onload = () => {
    slot.classList.add('has-image');
    slot.innerHTML = `\n      <img src="${src}" alt="${title} screenshot from custom CRM" />\n      <div class="placeholder-copy"><strong>${title}</strong><small>Custom CRM & Operations Platform</small></div>`;
    slot.addEventListener('click', () => openLightbox(src, `${title} screenshot from custom CRM`));
  };
  probe.src = src;
});


// Always return to the true top of the page when the brand/name is clicked.
document.querySelectorAll('[data-home-link]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', window.location.pathname + window.location.search);
  });
});

// Open any CRM screenshot in the existing lightbox.
document.querySelectorAll('[data-lightbox-src]').forEach(button => {
  button.addEventListener('click', () => {
    const img = button.querySelector('img');
    openLightbox(button.dataset.lightboxSrc, img?.alt || 'Project screenshot');
  });
});


// Reliable back-to-top behavior for the footer link.
document.querySelectorAll('[data-back-to-top]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', window.location.pathname + window.location.search);
  });
});

// Copy-email fallback for visitors without a configured desktop mail client.
document.querySelectorAll('.copy-email').forEach(button => {
  button.addEventListener('click', async () => {
    const email = button.dataset.email || '';
    if (!email) return;
    const original = button.textContent;
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
        copied = true;
      }
    } catch (_) {}

    if (!copied) {
      const temp = document.createElement('textarea');
      temp.value = email;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      temp.remove();
    }

    button.textContent = copied ? 'Copied ✓' : email;
    setTimeout(() => { button.textContent = original; }, 2200);
  });
});

// Precision section navigation.
// Native anchors land on the section container, but several sections intentionally
// have generous top padding. Scroll to the beginning of the section's visible
// content instead, while accounting for the sticky navigation height.
const precisionSectionIds = new Set(['work', 'experience', 'about', 'contact']);

function getDocumentTop(element) {
  let top = 0;
  let current = element;
  while (current) {
    top += current.offsetTop || 0;
    current = current.offsetParent;
  }
  return top;
}

function scrollToPortfolioSection(sectionId, behavior = 'smooth') {
  if (!precisionSectionIds.has(sectionId)) return false;

  const section = document.getElementById(sectionId);
  if (!section) return false;

  const navBar = document.querySelector('.nav-wrap');
  const navHeight = navBar ? navBar.getBoundingClientRect().height : 0;
  const sectionStyles = window.getComputedStyle(section);
  const sectionPaddingTop = Number.parseFloat(sectionStyles.paddingTop) || 0;
  const breathingRoom = window.matchMedia('(max-width: 760px)').matches ? 12 : 18;

  // offsetTop is intentionally used here instead of getBoundingClientRect() for the
  // destination because reveal animations use transforms that can otherwise shift
  // the measured target by a few pixels.
  const destination = Math.max(
    0,
    getDocumentTop(section) + sectionPaddingTop - navHeight - breathingRoom
  );

  window.scrollTo({ top: destination, left: 0, behavior });
  return true;
}

// Apply the same precise landing behavior to desktop nav, mobile nav, Contact,
// and other in-page links that point to the primary portfolio sections.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href === '#' || href === '#top') return;

  const sectionId = href.slice(1);
  if (!precisionSectionIds.has(sectionId)) return;

  link.addEventListener('click', event => {
    event.preventDefault();

    // Close the mobile menu before calculating the final viewport position.
    if (mobileMenu?.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    }

    // Let the mobile menu collapse before measuring and scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToPortfolioSection(sectionId, 'smooth');
        if (history.replaceState) {
          history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${sectionId}`);
        }
      });
    });
  });
});

// Keep deep links aligned correctly when the page is opened directly at a section.
window.addEventListener('load', () => {
  const sectionId = window.location.hash.replace('#', '');
  if (!precisionSectionIds.has(sectionId)) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToPortfolioSection(sectionId, 'auto'));
  });
});
