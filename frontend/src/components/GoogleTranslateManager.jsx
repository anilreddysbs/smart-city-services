import React, { useEffect } from 'react';

const GOOGLE_SRC = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

function getGoogleCombo() {
  return document.querySelector('.goog-te-combo');
}

function applyGoogleLanguage(langCode) {
  const combo = getGoogleCombo();
  if (!combo) return false;
  combo.value = langCode;
  combo.dispatchEvent(new Event('change'));
  return true;
}

function GoogleTranslateManager() {
  useEffect(() => {
    const host = document.getElementById('google_translate_element');
    if (!host) return;

    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-undef
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,te',
          autoDisplay: false
        },
        'google_translate_element'
      );
      const saved = localStorage.getItem('ui_language') || 'en';
      if (saved !== 'en') {
        setTimeout(() => applyGoogleLanguage(saved), 400);
      }
    };

    // Expose a reusable app-wide language setter.
    window.applySiteLanguage = (langCode) => {
      const lang = langCode || 'en';
      localStorage.setItem('ui_language', lang);
      if (lang === 'en') {
        // Reset by clearing google translate cookie and reloading.
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname + '; path=/';
        window.location.reload();
        return;
      }
      const applied = applyGoogleLanguage(lang);
      if (!applied) {
        setTimeout(() => applyGoogleLanguage(lang), 500);
      }
    };

    const alreadyLoaded = document.querySelector(`script[src="${GOOGLE_SRC}"]`);
    if (!alreadyLoaded) {
      const script = document.createElement('script');
      script.src = GOOGLE_SRC;
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit?.();
    }

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  // Hidden host; translation widget UI is replaced by our navbar selector.
  return <div id="google_translate_element" style={{ display: 'none' }} />;
}

export default GoogleTranslateManager;
