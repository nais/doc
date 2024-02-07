# Part 1 - Create application

This tutorial will take you through the process of getting a simple application up and running on NAIS.

## Prerequisites

- You have a GitHub account connected to your GitHub organization (e.g. `navikt`)
- [naisdevice installed](../../how-to-guides/naisdevice/install-naisdevice.md)
- [Member of a NAIS team](../../explanation/team.md)
- [GitHub CLI installed](https://cli.github.com/)

???+ note "Conventions"

    Throughout this guide, we will use the following conventions:

    - `<MY-APP>` - The name of your NAIS application (e.g. `joannas-first`)
    - `<MY-TEAM>` - The name of your NAIS team (e.g. `onboarding`)
    - `<GITHUB-ORG>` - Your GitHub organization (e.g. `navikt`)
    - `<MY-ENV>` - The name of the environment you want to deploy to (e.g. `dev`)

    **NB!** Choose names with *lowercase* letters, numbers and dashes only.

## 1. Create your own GitHub repository

Create your own repo using the [nais/hello-nais](https://github.com/nais/hello-nais/) as a template.

You create a new repository through either the [GitHub UI](https://github.com/new?template_name=hello-nais&template_owner=nais) or through the GitHub CLI:

```bash
gh repo create <GITHUB-ORG>/<MY-REPO> --template nais/hello-nais --private --clone
```

```bash
cd <MY-APP>
```

## 2. Grant your team access to your repository

Open your repository:

```bash
gh repo view --web
```

Click on `Settings` -> `Collaborators and teams` -> `Add teams`.

Select your team, and grant them the `Write` role.

You have now successfully created your own application repository and granted your team access to it.
In the next steps we will have a closer look at the files needed to make this application NAIS!
