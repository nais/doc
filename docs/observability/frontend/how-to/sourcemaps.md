---
description: How sourcemap deobfuscation works for frontend error stack traces.
tags: [how-to, observability, frontend]
---

# Sourcemap deobfuscation

When your frontend throws an error, the stack trace points to minified JavaScript — line numbers and variable names that don't match your source code. The Nais telemetry collector maps these back to your original source using sourcemaps.

## How it works

The telemetry collector fetches sourcemap (`.map`) files from the same origin where your JavaScript is served. When an error arrives with a minified stack trace, the collector:

1. Reads the `//# sourceMappingURL=` comment at the bottom of the JavaScript file
2. Fetches the `.map` file from that URL
3. Maps the minified positions back to original file names, line numbers, and column numbers
4. Stores the resolved stack trace in Loki

This happens server-side in the collector — no extra configuration is needed in your application.

## Requirements

For deobfuscation to work:

{% if tenant() == "nav" %}
- Your application must be deployed to the CDN (`cdn.nav.no`)
{% else %}
- Your application must be deployed to the CDN (`cdn.<<tenant()>>.cloud.nais.io`)
{% endif %}
- Your JavaScript bundle must include a `sourceMappingURL` comment (most bundlers add this by default)
- The `.map` file must be deployed alongside the JS bundle on the CDN

{% if tenant() == "nav" %}
!!! warning "CDN only"
    Sourcemap resolution only works for bundles served from `cdn.nav.no`. The collector cannot fetch `.map` files from application pods (they are not publicly accessible). If your frontend is server-rendered (Next.js, Remix), sourcemap deobfuscation is not available unless you also serve your static assets from the CDN.
{% else %}
!!! warning "CDN only"
    Sourcemap resolution only works for bundles served from `cdn.<<tenant()>>.cloud.nais.io`. The collector cannot fetch `.map` files from application pods (they are not publicly accessible). If your frontend is server-rendered (Next.js, Remix), sourcemap deobfuscation is not available unless you also serve your static assets from the CDN.
{% endif %}

## Build configuration

Production sourcemaps often need explicit configuration. Verify your bundler generates `.map` files:

=== "Vite"

    ```js
    // vite.config.js
    export default {
      build: {
        sourcemap: true, // generates .map files
      },
    };
    ```

=== "Webpack"

    ```js
    // webpack.config.js
    module.exports = {
      devtool: 'source-map', // generates separate .map files
    };
    ```

=== "Next.js"

    ```js
    // next.config.js
    module.exports = {
      productionBrowserSourceMaps: true,
    };
    ```

!!! warning "Sourcemaps must be accessible to the collector"
    The collector fetches `.map` files using the `sourceMappingURL` comment in your JavaScript bundle. If you use `hidden-source-map` (which omits that comment), the collector can't find the map files and stack traces won't be deobfuscated. Use the default `source-map` setting, or `productionBrowserSourceMaps: true` for Next.js.

## What happens when resolution fails

If the collector can't fetch or parse a sourcemap, it falls back to minified output:

- The error is still recorded in Loki
- The stack trace shows the minified positions
- No data is lost — you just see the raw bundle locations instead of source locations

Common reasons for failure:

- The application is not deployed to the CDN (server-rendered apps, pods serving their own assets)
- The `.map` file isn't deployed alongside the JS bundle
- The `sourceMappingURL` points to a wrong or relative path that doesn't resolve

## Verify it works

1. Deploy your application with sourcemaps enabled
2. Trigger an error (or push one manually with `faro.api.pushError(new Error('test'))`)
3. In [Grafana Explore](https://grafana.<<tenant()>>.cloud.nais.io/explore), query:

    ```logql
    {app_name="my-app", kind="exception"} | logfmt
    ```

4. The stack trace should show your original file names and line numbers

If you see minified output instead, check [Troubleshooting](../reference/troubleshooting.md#sourcemaps-not-resolving).
