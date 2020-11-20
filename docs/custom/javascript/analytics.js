app.location$.subscribe(function(url) {
  amplitude.getInstance().logEvent('sidevisning', {'pathname': url.pathname})
})
