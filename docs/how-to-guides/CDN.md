# CDN

## 0. Prerequisites

 - You need to have a repository that has deploy enabled, this is done
   through [teams](https://console.<<tenant()>>.cloud.nais.io)

## 1. Use the frontend-cdn action

1. In your current github actions you can use the cdn-publish workflow
like this:

```yaml
- name: Upload static files to NAV CDN
  uses: navikt/frontend/actions/cdn-upload/v2
  with:
    cdn-team-name: <Your team name>
    source: <The path to your build folder or assets>
    destination: <A destination you pick, like /my-app/dist>
``

## 2. Use the uploaded assets

The assets from the cdn will be available at `cdn.nav.no/<your team
name>/<your destination>` with CORS headers set to accept GET from any
origin (*).
