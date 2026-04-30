export const prerender = true;

// Emit prerendered pages as `<route>/index.html` rather than `<route>.html`.
// GCS bucket hosting resolves directory URLs via `MainPageSuffix=index.html`,
// so trailing slashes ensure pages load without relying on client-side JS.
export const trailingSlash = "always";
