(function (e, t) {
   var r = e.amplitude || { _q: [], _iq: {} }; var n = t.createElement("script")
      ; n.type = "text/javascript"
      ; n.integrity = "sha384-6T8z7Vvm13muXGhlR32onvIziA0TswSKafDQHgmkf6zD2ALZZeFokLI4rPVlAFyK"
      ; n.crossOrigin = "anonymous"; n.async = true
      ; n.src = "/amplitude_javascript/amplitude.min.js"
      ; n.onload = function () {
         if (!e.amplitude.runQueuedFunctions) {
            console.log("[Amplitude] Error: could not load SDK")
         }
      }
      ; var s = t.getElementsByTagName("script")[0]; s.parentNode.insertBefore(n, s)
      ; function i(e, t) {
         e.prototype[t] = function () {
            this._q.push([t].concat(Array.prototype.slice.call(arguments, 0))); return this
         }
      }
   var o = function () { this._q = []; return this }
      ; var a = ["add", "append", "clearAll", "prepend", "set", "setOnce", "unset", "preInsert", "postInsert", "remove"]
      ; for (var c = 0; c < a.length; c++) { i(o, a[c]) } r.Identify = o; var u = function () {
         this._q = []
         ; return this
      }
      ; var p = ["setProductId", "setQuantity", "setPrice", "setRevenueType", "setEventProperties"]
      ; for (var l = 0; l < p.length; l++) { i(u, p[l]) } r.Revenue = u
      ; var d = ["init", "logEvent", "logRevenue", "setUserId", "setUserProperties", "setOptOut", "setVersionName", "setDomain", "setDeviceId", "enableTracking", "setGlobalUserProperties", "identify", "clearUserProperties", "setGroup", "logRevenueV2", "regenerateDeviceId", "groupIdentify", "onInit", "logEventWithTimestamp", "logEventWithGroups", "setSessionId", "resetSessionId", "setLibrary", "setTransport"]
      ; function v(e) {
         function t(t) {
            e[t] = function () {
               e._q.push([t].concat(Array.prototype.slice.call(arguments, 0)))
            }
         }
         for (var r = 0; r < d.length; r++) { t(d[r]) }
      } v(r); r.getInstance = function (e) {
         e = (!e || e.length === 0 ? "$default_instance" : e).toLowerCase()
            ; if (!Object.prototype.hasOwnProperty.call(r._iq, e)) {
               r._iq[e] = { _q: [] }; v(r._iq[e])
            } return r._iq[e]
      }; e.amplitude = r
})(window, document)

const config = {
   apiEndpoint: "api.eu.amplitude.com",
   saveEvents: false,
   includeUtm: true,
   includeReferrer: true,
   trackingOptions: {
     city: false,
     ip_address: false,
   },
 }

amplitude.getInstance().init("16d1ee2fd894ca2562eeebb5095dbcf0", undefined, config);

amplitude.getInstance().logEvent("sidevisning", {
   sidetittel: window.location.pathname,
   domene: window.location.host,
   tjeneste: 'nais-docs',
})

// logic taken from
// https://github.com/squidfunk/mkdocs-material/blob/2b6359c5feab1c17772033536efa3274d52db5c2/src/partials/integrations/analytics.html#L38-L49
document.addEventListener('DOMContentLoaded', function() {
  if (document.forms.search) {
    var query = document.forms.search.query
    query.addEventListener('blur', function() {
      if (this.value) {
        var path = document.location.pathname;
        amplitude.getInstance().logEvent('søk', {
          søkeord: this.value,
          sidetittel: path,
          domene: window.location.host,
          tjeneste: 'nais-docs',
        })
      }
    })
  }
})
