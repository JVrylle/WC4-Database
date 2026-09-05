// Support modal: intercepts .donate-btn clicks to state clearly who receives
// donations (JVrylle, the project owner) before opening Ko-fi. No dependencies.
(function () {
  var KO_FI_URL = 'https://ko-fi.com/jvrylle';
  var overlay = null;
  var lastFocused = null;

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.removeEventListener('keydown', onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function open(e) {
    if (e) e.preventDefault();
    if (!overlay) build();
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.addEventListener('keydown', onKey);
    var primary = overlay.querySelector('.support-btn--primary');
    if (primary) primary.focus();
  }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'support-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="support-dialog" role="dialog" aria-modal="true" aria-labelledby="supportTitle">' +
        '<h2 id="supportTitle">Support WC4 Database</h2>' +
        '<p>Donations go directly to <b>JVrylle</b>, the owner and maintainer of this ' +
        'project, via Ko-fi. Donations are voluntary and help support continued ' +
        'development and maintenance.</p>' +
        '<div class="support-actions">' +
          '<button type="button" class="support-btn" data-close>Cancel</button>' +
          '<a class="support-btn support-btn--primary" href="' + KO_FI_URL + '" ' +
          'target="_blank" rel="noopener noreferrer">Continue to Ko-fi</a>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.querySelector('.support-btn--primary').addEventListener('click', function () {
      close();
    });
    document.body.appendChild(overlay);
  }

  document.querySelectorAll('a.donate-btn').forEach(function (btn) {
    btn.addEventListener('click', open);
  });
})();
