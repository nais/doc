app.location$.subscribe(function(url) {
  amplitude.getInstance().logEvent('sidevisning', {'pathname': url.pathname})
})

// logic taken from
// https://github.com/squidfunk/mkdocs-material/blob/2b6359c5feab1c17772033536efa3274d52db5c2/src/partials/integrations/analytics.html#L38-L49
document.addEventListener('DOMContentLoaded', function() {
  if (document.forms.search) {
    var query = document.forms.search.query
    query.addEventListener('blur', function() {
      if (this.value) {
        var path = document.location.pathname;
        amplitude.getInstance().logEvent(
            'søk', {'søkeord': this.value, 'pathname': path})
      }
    })
  }
})
