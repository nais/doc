---
tags: [cdn, explanation, services]
---

# Content Delivery Network (CDN)

A content delivery network (CDN) serves static content and single-page applications (SPA) in a fast and reliable manner.

Nais offers CDN as a service through Google Cloud CDN. The CDN is used for serving static content such as HTML files, JavaScript libraries and files, stylesheets, and images.

```mermaid
  graph LR
{%- if tenant() == "nav" %}
    Browser-->|cdn.nav.no|CDN
{%- else %}
    Browser-->|cdn.<<tenant()>>.cloud.nais.io|CDN
{%- endif %}
    CDN[Cloud CDN]-->LB
    LB-->|/team1/*|BucketA
    LB-->|/team2/*|BucketB
    LB-->|/team3/*|BucketC
```

Assets are deployed by uploading them to a bucket using a GitHub action:

```mermaid
  graph LR
    Repo-->|push|Workflow
    Workflow-->|upload|Bucket
    Bucket-->|serve|CDN
```

## What are the benefits of CDN?

CDN primarily helps reduce the time it takes for users to download content from an application.
This improves the user experience of the application.
This is possible because the CDN has many servers around the world that can deliver content to users.
This allows users to download content from a server closest to them, thus reducing the time it takes to download the content.

A CDN makes it easier for developers to build applications.
This is because the CDN can be used to deliver static content that does not change frequently.
This allows developers to focus on developing their applications without needing to set up their own systems to deliver static content (e.g., nginx).

A CDN can be used to deliver static content that does not change frequently.
This means that application servers do not need to deliver this content, thereby reducing the load on application servers.
This will also reduce costs, as traffic to applications is somewhat more expensive than to a CDN.

## What kind of content can be delivered via CDN?

Static content that does not change frequently. This usually includes images, icons, CSS, JavaScript, and HTML.

A CDN cannot be used to deliver dynamic content that changes frequently. This can include data from a database, data from an API, etc.

We provide mechanisms to turn off caching for certain files, or invalidate cache, but we do not recommend using these frequently as it will reduce the effectiveness of the CDN.
Use with caution!

{% if tenant() == "nav" %}

### Who uses CDN today?

Among many others:

- Aksel ([example](https://github.com/navikt/aksel/blob/main/.github/workflows/push-to-cdn.yaml))
- Mikrofrontend ([example](https://github.com/navikt/tms-deploy/blob/main/.github/workflows/mikrofrontend-deploy-v2.yaml))

{% endif %}

## Learn how to

:dart: [upload assets to the CDN](how-to/upload-assets.md)

:dart: [manage CDN assets](how-to/manage-assets.md)
