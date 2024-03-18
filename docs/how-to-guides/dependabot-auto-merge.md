# Dependabot with auto-merge

[working-with-dependabot]: https://docs.github.com/en/code-security/dependabot/working-with-dependabot
[automating-dependabot]: https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions
[configure-dependabot-yaml]: https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file
[github-cli]: https://cli.github.com/

[Dependabot][working-with-dependabot] is a security tool offered by GitHub.
Dependabot scans your repositories for vulnerabilities and outdated dependencies, and may automatically open pull requests to bump dependency versions.
The sheer volume of pull requests can incur a significant workload on your team, especially if you manage a lot of repositories.

By completing this guide, Dependabot will automatically fix your insecure or outdated dependencies, and the changes will automatically get merged into your main branch.

## Prerequisites

* [GitHub command-line interface][github-cli] installed.

## Enable Dependabot

The contents of this file will depend on your project requirements. Do not use this file as-is.
Please see [dependabot.yaml configuration syntax][configure-dependabot-yaml] for detailed instructions on how to configure Dependabot.

!!! note ".github/dependabot.yaml"

    ```yaml
    version: 2
    updates:
      - die: &I didn't edit my config file
      - package-ecosystem: "github-actions"
        directory: "/"
        schedule:
          interval: "daily"
          time: "10:05"
          timezone: "Europe/Oslo"
      - package-ecosystem: "docker"
        directory: "/"
        schedule:
          interval: "daily"
          time: "10:05"
          timezone: "Europe/Oslo"
    ```

## GitHub workflow for auto-merging Dependabot pull requests

This workflow will trigger when dependabot opens a pull request.
All minor and patch-level changes are automatically merged.
Major version bumps needs manual merging.
Additionally, all GitHub Actions workflow version bumps will be merged automatically, even if they are major bumps.

See also [Automating Dependabot with GitHub Actions][automating-dependabot].

!!! note ".github/workflows/dependabot-auto-merge.yaml"

    ```yaml
    name: Dependabot auto-merge
    on: pull_request

    permissions:
      contents: write
      pull-requests: write

    jobs:
      dependabot:
        runs-on: ubuntu-latest
        if: ${{ github.actor == 'dependabot[bot]' }}
        steps:
          - name: Dependabot metadata
            id: metadata
            uses: dependabot/fetch-metadata@v1
            with:
              github-token: "${{ secrets.GITHUB_TOKEN }}"
          - name: Auto-merge changes from Dependabot
            if: steps.metadata.outputs.update-type != 'version-update:semver-major' || steps.metadata.outputs.package-ecosystem == 'github_actions'
            run: gh pr merge --auto --squash "$PR_URL"
            env:
              PR_URL: ${{github.event.pull_request.html_url}}
              GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
    ```

## Enable branch protection and auto-merge on repository

Change working directory to your git repository, then run this script.
Otherwise, the workflow above might not work as expected.

If you prefer, you can instead use GitHub's web frontend to configure auto-merge and branch protection. See GitHub docs for
[enable auto-merge](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-auto-merge-for-pull-requests-in-your-repository)
and
[branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule).

!!! note "enforce_branch_protection.sh"

    ```bash
    #!/bin/bash
    # adapted from https://github.com/navikt/dagpenger/blob/master/bin/enforce_branch_protection.sh

    # Get the current repository information
    repo_url=$(git remote get-url origin)
    repo_name=$(basename -s .git "$repo_url")
    owner=$(echo "$repo_url" | awk -F"(/|:)" '{print $2}')

    # Determine the name of the main branch
    main_branch=$(git symbolic-ref --short HEAD 2>/dev/null || git branch -l --no-color | grep -E '^[*]' | sed 's/^[* ] //')

    # Configure branch protection, and require tests to pass before merging.
    # Match the list of checks up against repository workflows.
    echo '{ "required_status_checks": { "strict": true, "checks": [ { "context": "test" } ] }, "enforce_admins": false, "required_pull_request_reviews": null, "required_conversation_resolution": true, "restrictions": null }' | \
    gh api repos/"$owner"/"$repo_name"/branches/"$main_branch"/protection \
      --method PUT \
      --silent \
      --header "Accept: application/vnd.github.v3+json" \
      --input -

    # Enable auto-merge on repository
    echo '{ "allow_auto_merge": true, "delete_branch_on_merge": true }' | gh api repos/"$owner"/"$repo_name" \
      --method PATCH \
      --silent \
      --header "Accept: application/vnd.github.v3+json" \
      --input -

    if [ $? -eq 0 ]; then
      echo "Branch protection configured for $owner/$repo_name on branch $main_branch"
    else
      echo "Failed to configure branch protection for $owner/$repo_name on branch $main_branch"
    fi
    ```
