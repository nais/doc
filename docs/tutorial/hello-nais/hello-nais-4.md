---
tags: [tutorial]
---
# Part 4 - Clean up

During this tutorial we have

- created a github repository
- added the required files for deployment
- deployed our application to NAIS

Now it's time to clean up after ourselves.

## 1. Delete your repository

When you are finished with this guide you can delete your repository:

=== "GitHub UI"
    Visit your repository on GitHub, click `Settings` -> `Delete this repository` -> `I understand the consequences, delete this repository`

=== "GitHub CLI"
    ```bash
    gh repo delete <GITHUB-ORG>/<MY-APP>
    ```
