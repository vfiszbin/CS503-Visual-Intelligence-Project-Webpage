(function() {
  function onReady() {
    if (document.readyState === 'loading') {
      return new Promise(function(resolve) {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    return Promise.resolve();
  }

  function loadSection(element) {
    var source = element.getAttribute('data-include');

    return fetch(source)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Could not load section: ' + source);
        }

        return response.text();
      })
      .then(function(html) {
        element.outerHTML = html;
      });
  }

  window.sectionsReady = onReady()
    .then(function() {
      var sections = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
      return Promise.all(sections.map(loadSection));
    })
    .then(function() {
      if (window.FontAwesome && window.FontAwesome.dom && window.FontAwesome.dom.i2svg) {
        window.FontAwesome.dom.i2svg();
      }

      if (window.MathJax && window.MathJax.typesetPromise) {
        return window.MathJax.typesetPromise();
      }

      return undefined;
    })
    .then(function() {
      document.dispatchEvent(new CustomEvent('sections:loaded'));
    })
    .catch(function(error) {
      console.error(error);
      document.dispatchEvent(new CustomEvent('sections:error', { detail: error }));
      throw error;
    });
})();
