# Part 3 - Ship it

Previously we've made our application and created the required files for deployment.
In this part of the tutorial we will deploy our application to NAIS.

## 1. Authorize the repository for deployment

This is required for the GitHub Actions workflow to be able to deploy your application.

Visit [Console](https://console.@@TENANT@@.cloud.nais.io). Select your team, and visit the `Repositories` tab.
Find your repository and click `Authorize`.

??? note "Repository not visible?"
    Normally these permissions are automatically synchronized every 15 minutes, but if you don't see the repository here, force synchronization by clicking the `Refresh` button.

## 2. Commit and push your changes

Now that we have added the required files, it's time to commit and push them to GitHub.


```bash
git add .
git commit -m "FEAT: Add nais app manifest and github workflow"
git push origin main
```

## 3. Observe the GitHub Actions workflow

When pushed, the GitHub Actions workflow will automatically start. You can observe the workflow by running the following command:
=== "CLI"
    ```bash
    gh run watch
    ```
=== "Github Web"
    ```bash
    gh repo view --web # click the "actions" tab when redirected to github.com
    ```

## 4. Visit your application
On successful completion, we can view our application at `https://<MY-APP>.<MY-ENV>.<<tenant()>>.cloud.nais.io`

Congratulations! You have now successfully deployed your first application to NAIS!
The next and most important step is to clean up after ourselves.
