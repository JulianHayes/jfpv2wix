// script.js
$w.onReady(function () {
  const menuToggle    = $w('#menuToggle');
  const menuPanel     = $w('#menuPanel');
  const contentOverlay= $w('#contentOverlay');
  const closeContent  = $w('#closeContent');
  const menuLinks     = $w('#menuPanel').getChildren().filter(el => el.type === 'Link');
  const pages         = ['#about-page','#work-page','#contact-page'];

  // ARIA & focus tracking
  menuToggle.attr('aria-expanded','false');
  menuPanel.attr('aria-hidden','true');

  let lastFocused = null;
  const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function trapFocus(container) {
    const els = container.$w().find(focusable);
    if (!els.length) return () => {};
    const first = els[0], last = els[els.length-1];
    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if ($w('#'+e.context.id).id === first.id) {
          e.preventDefault(); last.focus();
        }
      } else {
        if ($w('#'+e.context.id).id === last.id) {
          e.preventDefault(); first.focus();
        }
      }
    }
    container.onKeyPress(handler);
    return () => container.removeKeyPressHandler(handler);
  }

  let cleanupMenuTrap = () => {};
  let cleanupOverlayTrap = () => {};

  function openMenu() {
    lastFocused = $w('#'+wixWindow.rendering.env());
    $w('Document').body.addClass('menu-open');
    menuToggle.attr('aria-expanded','true');
    menuPanel.attr('aria-hidden','false');
    cleanupMenuTrap = trapFocus(menuPanel);
  }
  function closeMenu() {
    $w('Document').body.removeClass('menu-open');
    menuToggle.attr('aria-expanded','false');
    menuPanel.attr('aria-hidden','true');
    cleanupMenuTrap();
    lastFocused?.focus();
  }

  menuToggle.onClick(() => {
    menuToggle.attr('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  function openOverlay(targetSel) {
    lastFocused = $w('#'+wixWindow.rendering.env());
    $w('Document').body.addClass('overlay-is-open');
    contentOverlay.attr('aria-hidden','false');
    $w(targetSel).addClass('active');
    cleanupOverlayTrap = trapFocus(contentOverlay);
    closeContent.focus();
  }
  function closeOverlay() {
    $w('Document').body.removeClass('overlay-is-open');
    contentOverlay.attr('aria-hidden','true');
    pages.forEach(sel => $w(sel).removeClass('active'));
    cleanupOverlayTrap();
    lastFocused?.focus();
  }

  menuLinks.forEach(link => {
    link.onClick(e => {
      e.preventDefault();
      closeMenu();
      openOverlay(link.link);
    });
  });

  closeContent.onClick(closeOverlay);

  $w('Document').onKeyPress(e => {
    if (e.key === 'Escape') {
      if ($w('Document').body.class.includes('overlay-is-open')) closeOverlay();
      else if ($w('Document').body.class.includes('menu-open')) closeMenu();
    }
  });
});
