/* Assignment 6 — jQuery | Askar Alibek. Previous JavaScript remains in main.js. */
$(document).ready(function () {
  console.log('jQuery is ready!');

  // Task 4: scroll progress bar on every page.
  function updateProgress() {
    const available = $(document).height() - $(window).height();
    const percent = available > 0 ? Math.min(100, Math.max(0, Math.round($(window).scrollTop() / available * 100))) : 100;
    $('#a6-progress').css('width', percent + '%').attr('aria-valuenow', percent);
  }
  $(window).on('scroll resize', updateProgress);
  updateProgress();

  // Task 7: animated notification/toast, re-used by copy and form actions.
  let toastTimer;
  function notify(message) {
    const $toast = $('#a6-toast');
    clearTimeout(toastTimer);
    $toast.stop(true, true).text(message).fadeIn(180);
    toastTimer = setTimeout(() => $toast.fadeOut(450), 2400);
  }

  // Tasks 1–3: live filtering, autocomplete suggestions, and safe highlighting.
  const $cards = $('.dinosaur-cards article.card');
  const $search = $('#a6-search');
  const $suggestions = $('#a6-suggestions');
  const catalogueSearch = document.getElementById('a5-search');
  const names = $cards.map(function () { return $(this).find('h3').first().text().trim(); }).get();
  const originals = $cards.find('h3, .tag, .card-body > p:not(.a5-extra)').map(function () {
    return {element: this, text: $(this).text()};
  }).get();
  function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function markMatches(query) {
    originals.forEach(function (entry) {
      const $el = $(entry.element);
      $el.empty();
      if (!query) { $el.text(entry.text); return; }
      const regex = new RegExp(escapeRegex(query), 'ig');
      let from = 0;
      for (const match of entry.text.matchAll(regex)) {
        $el.append(document.createTextNode(entry.text.slice(from, match.index)));
        $('<mark class="a6-mark"></mark>').text(match[0]).appendTo($el);
        from = match.index + match[0].length;
      }
      $el.append(document.createTextNode(entry.text.slice(from)));
    });
  }
  function updateQuickFinder() {
    const query = $.trim($search.val()).toLowerCase();
    const visibleCards = $cards.filter(function () { return !this.hidden; });
    markMatches(query);
    $('#a6-search-count').text(query ? visibleCards.length + ' matching dinosaur(s)' : 'Showing ' + visibleCards.length + ' dinosaurs');
    const matched = query ? names.filter(name => name.toLowerCase().includes(query)).slice(0, 6) : [];
    $suggestions.empty();
    matched.forEach(name => $('<li role="option"><button type="button"></button></li>').find('button').text(name).end().appendTo($suggestions));
    $suggestions.prop('hidden', matched.length === 0);
    $search.attr('aria-expanded', String(matched.length > 0));
  }
  function searchCatalogue() {
    catalogueSearch.value = $search.val();
    catalogueSearch.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if ($search.length && catalogueSearch) {
    $search.on('input', searchCatalogue);
    catalogueSearch.addEventListener('input', () => {
      $search.val(catalogueSearch.value);
      updateQuickFinder();
    });
    $('.a5-filter').on('click', updateQuickFinder);
    $suggestions.on('click', 'button', function () {
      $search.val($(this).text());
      searchCatalogue();
      $suggestions.prop('hidden', true);
      $search.attr('aria-expanded', 'false').trigger('focus');
    });
    updateQuickFinder();
  }
  $search.on('keydown', function (event) {
    if (event.key === 'Escape') { $suggestions.prop('hidden', true); $search.attr('aria-expanded', 'false'); }
    if (event.key === 'ArrowDown' && !$suggestions.prop('hidden')) { event.preventDefault(); $suggestions.find('button').first().trigger('focus'); }
  });
  $suggestions.on('keydown', 'button', function (event) {
    if (event.key === 'Escape') { $suggestions.prop('hidden', true); $search.trigger('focus'); }
  });

  // Task 5: count up once when stats enter the viewport.
  function countUp($element) {
    if ($element.data('a6-started')) return;
    $element.data('a6-started', true);
    const target = Number($element.attr('data-a6-count'));
    const suffix = $element.attr('data-a6-suffix') || '';
    $({value: 0}).animate({value: target}, {
      duration: 1400, easing: 'swing',
      step: function (value) { $element.text(Math.floor(value) + suffix); },
      complete: function () { $element.text(target + suffix); }
    });
  }
  const counters = document.querySelectorAll('[data-a6-count]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { countUp($(entry.target)); counterObserver.unobserve(entry.target); }
      });
    }, {threshold: 0.2});
    counters.forEach(el => counterObserver.observe(el));
  } else { counters.forEach(el => countUp($(el))); }

  // Task 6: loading spinner, disabled button, and simulated request delay.
  // Existing Assignment 4 form validation still runs; only valid submissions animate.
  $('#a4-contact-form').on('submit', function (event) {
    const $form = $(this);
    const $button = $form.find('.a6-submit');
    if ($button.prop('disabled')) { event.preventDefault(); return; }
    if (!$form.find('#a4-contact-status').hasClass('a4-success')) return;
    const original = $button.attr('data-original-text') || 'Submit';
    $button.prop('disabled', true).html('<span class="a6-spinner" aria-hidden="true"></span> Please wait…');
    setTimeout(function () {
      $button.prop('disabled', false).text(original);
      notify('Your message has been processed!');
    }, 1300);
  });

  // Task 8: clipboard copy + checkmark + tooltip.
  $('.a6-copy').on('click', async function () {
    const $button = $(this);
    const text = $($button.attr('data-copy-target')).text().trim();
    const original = $button.text();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const $temporary = $('<textarea readonly></textarea>').val(text).appendTo('body');
        $temporary[0].select();
        if (!document.execCommand('copy')) throw new Error('Copy not supported');
        $temporary.remove();
      }
      $button.text('✓ Copied!').attr('title', 'Copied to clipboard!');
      notify('Copied to clipboard!');
      setTimeout(() => $button.text(original).attr('title', 'Copy text'), 1700);
    } catch (error) { notify('Copy failed. Try using HTTPS or localhost.'); }
  });

  // Task 9: lazy-load images only when they approach the viewport.
  const lazyImages = document.querySelectorAll('img.a6-lazy[data-src]');
  function reveal(img) { img.src = img.dataset.src; img.removeAttribute('data-src'); img.classList.remove('a6-lazy'); }
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { reveal(entry.target); imageObserver.unobserve(entry.target); } });
    }, {rootMargin: '250px 0px'});
    lazyImages.forEach(img => imageObserver.observe(img));
  } else { lazyImages.forEach(reveal); }
});
