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

## Upload the bundle and sourcemaps to the CDN

Building `.map` files is only half the job — the collector can only fetch them if both the JavaScript **and** its `.map` file are served from the CDN. Publish your build output with the [CDN upload action](../../../services/cdn/how-to/upload-assets.md). Add a step to the GitHub workflow that builds your frontend:

```yaml
- uses: nais/deploy/actions/cdn-upload/v2@master
  with:
{%- if tenant() != "nav" %}
    tenant: <<tenant()>>
{%- endif %}
    team: <team>
    source: dist
    destination: /<app>/dist
```

`source` is your build output directory (`dist` for Vite, `build` for Create React App, `.next/static` for Next.js), and `destination` is the path under your team's CDN prefix. See [Upload assets to the CDN](../../../services/cdn/how-to/upload-assets.md) for the full workflow (repository authorization, permissions, and every input the action accepts).

!!! note "Upload the whole build output"
    Point `source` at the directory that holds both the `.js` files and their sibling `.map` files, so they land on the CDN together. Don't strip the `.map` files out of the artifact before uploading.

### Where the files land

With the step above, your build output is served from:

{% if tenant() == "nav" %}
```
https://cdn.nav.no/<team>/<app>/dist/main.[hash].js
https://cdn.nav.no/<team>/<app>/dist/main.[hash].js.map
```
{% else %}
```
https://cdn.<<tenant()>>.cloud.nais.io/<team>/<app>/dist/main.[hash].js
https://cdn.<<tenant()>>.cloud.nais.io/<team>/<app>/dist/main.[hash].js.map
```
{% endif %}

The `.js` file carries a relative `//# sourceMappingURL=main.[hash].js.map` comment, and the `.map` file sits right next to it — so the collector resolves it from the same directory.

!!! warning "The browser must load the JS from the CDN URL"
    {% if tenant() == "nav" -%}
    Resolution only triggers when the browser actually downloads the JavaScript from its `cdn.nav.no` URL. The collector looks at the origin of each stack frame's file and only resolves frames whose file is served from `cdn.nav.no`.
    {%- else -%}
    Resolution only triggers when the browser actually downloads the JavaScript from its `cdn.<<tenant()>>.cloud.nais.io` URL. The collector looks at the origin of each stack frame's file and only resolves frames whose file is served from the CDN.
    {%- endif %} Uploading the map to the CDN does nothing on its own — your HTML must reference the bundle by its CDN URL, not a copy served from your pod.

## Put it all together

The end-to-end flow:

1. **Build** emits `.js` bundles, sibling `.map` files, and a relative `//# sourceMappingURL=` comment in each bundle (see [Build configuration](#build-configuration)).
2. **CI uploads** the whole build output — JavaScript **and** `.map` files — to the CDN with the [`cdn-upload`](#upload-the-bundle-and-sourcemaps-to-the-cdn) step.
{% if tenant() == "nav" -%}
3. **Your app references the JavaScript by its `cdn.nav.no` URL** — the `<script src>` (or bundler `base` / `publicPath`) points at `https://cdn.nav.no/<team>/<app>/dist/...`, so the browser loads it from the CDN.
{%- else -%}
3. **Your app references the JavaScript by its CDN URL** — the `<script src>` (or bundler `base` / `publicPath`) points at `https://cdn.<<tenant()>>.cloud.nais.io/<team>/<app>/dist/...`, so the browser loads it from the CDN.
{%- endif %}
4. **An error fires**, and because the frame's file is served from the CDN the collector follows its `sourceMappingURL`, fetches the sibling `.map`, and stores the resolved stack trace.
5. **Verify** the resolved trace shows up in Grafana (see [Verify it works](#verify-it-works)).

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

{% if tenant() == "nav" %}
Resolved stack traces also appear on each error in the Nais APM [Issues tab](../../apm/tutorials/get-started.md#3-check-the-issues-tab), with your own code highlighted. Deobfuscation is server-side, so it works the same whether you instrument with raw Faro or [`@nais/apm`](../../apm/tutorials/track-frontend-errors.md#5-ship-readable-stack-traces).
{% endif %}

## My app runs in a container

If your frontend is served from a pod — a server-rendered app (Next.js, Remix, SvelteKit) or any container that ships its own `.js` assets — then uploading `.map` files to the CDN does **nothing** on its own.

{% if tenant() == "nav" -%}
The reason is the origin match: the collector only resolves a stack frame when that frame's JavaScript file is served from `cdn.nav.no`. Frames whose files are served from your pod never trigger resolution, no matter where the `.map` file lives.
{%- else -%}
The reason is the origin match: the collector only resolves a stack frame when that frame's JavaScript file is served from `cdn.<<tenant()>>.cloud.nais.io`. Frames whose files are served from your pod never trigger resolution, no matter where the `.map` file lives.
{%- endif %}

**The supported recipe:** serve the static JavaScript (and its `.map` files) from the CDN even when the SSR shell runs in the pod. Most frameworks let you host client bundles on a separate asset host:

- **Next.js** — set [`assetPrefix`](https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix) to your CDN URL, and upload `.next/static` to the CDN.
- **Vite / SvelteKit** — set the [`base`](https://vitejs.dev/config/shared-options.html#base) (or adapter `paths.assets`) to your CDN URL, and upload the build output.

The pod still renders the HTML shell, but the `<script>` tags point at the CDN, so the browser loads the bundles from there and the collector can resolve them.

!!! note "Advanced: per-app origin override"
    If you genuinely cannot serve your bundles from the CDN, an opt-in per-app `location` override in the collector's Faro sourcemap configuration can point resolution at a different origin. This is an advanced platform change rather than a self-service option — reach out to the Nais team before relying on it.
