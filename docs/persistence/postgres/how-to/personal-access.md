---
title: Personal database access
tags: [postgres, password, credentials, cli, access, how-to]
---

Databases should always be accessed using a personal account, and the access should ideally be temporary.

## Prerequisites

!!! check "Step 1. Install local binaries"

    This guide assumes that you have the following installed on your local machine:

    - [nais-cli]
    - kubectl
    - (Optionally for cli access) [psql binary](https://blog.timescale.com/how-to-install-psql-on-mac-ubuntu-debian-windows/)

    We will use the `nais postgres` command from the CLI to set up the database access.

!!! check "Step 2. Allow your user to edit Cloud SQL resources for your project"
    Ensure that you have authenticated `gcloud` by running

    ```bash
    nais login
    ```

!!! check "Step 3. Select the context and namespace of your application"
    If you have installed [kubectx](https://github.com/ahmetb/kubectx) you can use the following command to select the context and namespace of your application:

    ```bash
    kubectx <CLUSTER>
    kubens <TEAM>
    ```

    If you do not have kubectx installed, you can use the following command to select the context and namespace of your application:

    ```bash
    kubectl config use-context <CLUSTER>
    kubectl config set-context --current --namespace=<TEAM>
    ```

!!! check "Step 3. One-time setup of privileges to SQL IAM users"

    This is only required once per database instance.

    Once the database instance is created, we need to grant the IAM users access to the `public` schema.

    ```bash
    nais postgres prepare <MYAPP>
    ```

    Prepare will prepare the postgres instance by connecting using the
    application credentials and modify the permissions on the public schema.
    All IAM users with correct permissions in your GCP project will be able to connect to the instance.

    The default is to allow only `SELECT` statements. If you need to allow all privileges, you can use the `--all-privs` flag.

    ```bash
    nais postgres prepare --all-privs <MYAPP>
    ```

## Granting temporary personal access

!!! check "Step 1. Create database IAM user"

    This is required once per user and requires that you have access to the team's GCP project.

    ```bash
    nais postgres grant <MYAPP>
    ```

    This will give you a limited time access to the database unless there's already an existing permission for your user.

!!! check "Step 3. Log in with personal user"

    Use `nais postgres proxy` to create a secure tunnel to the database.

    ```bash
    nais postgres proxy <MYAPP>
    ```

    This will start a proxy client in the background and print the connection string to the database.

    Authenticate using your personal Google account email as username and leave the password empty.

    If you'd like to use the psql binary, you can use the following command to connect to the database:

    ```bash
    nais postgres psql <MYAPP>
    ```

    This will create a proxy on a random port and execute the psql binary with the correct connection string.

[nais-cli]: ../../../operate/cli/how-to/install.md
