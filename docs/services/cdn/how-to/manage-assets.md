---
tags: [cdn, how-to]
---

# Manage CDN assets

This how-to guide shows you how to list and manage assets on the [CDN](../README.md). 

In most cases you only need to upload new assets through the GitHub Action.
In the rare case you need to manage the assets directly, you can do so through the Google Cloud Console.

## Prerequisites

- You have previously [uploaded assets to the CDN](upload-assets.md).

## Find reference to bucket

Assets are stored in a Google Cloud Bucket.
To find the bucket name:

1. Open the [NAIS console](https://console.<<tenant()>>.cloud.nais.io) in your browser.
2. Select your team.
3. Select the **Settings** tab.
4. Under the **Managed resources** section, look for the heading named **Team CDN bucket**.
5. Click the link (`nais-cdn-<<tenant()>>-<team>-<hash>`) to view the bucket in Google Cloud Console.

## List and manage assets through Google Cloud Console

The bucket view in Google Cloud Console lists your team's uploaded assets.
This might be useful to verify that your uploaded assets are present, or to delete unused or erroneously uploaded assets.

Some other common tasks you can perform in the Google Cloud Console:

- [View and edit object metadata](https://cloud.google.com/storage/docs/viewing-editing-metadata)
    - [Set Cache-Control headers](https://cloud.google.com/storage/docs/caching) (though this will be overwritten by the GitHub Action on the next upload)
- [Delete objects](https://cloud.google.com/storage/docs/deleting-objects)
