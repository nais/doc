# Install

=== "macOS"

    1. Install [Homebrew](https://brew.sh/) (unless you already have it)
    2. Add the nais tap
    ```bash
    brew tap nais/tap
    ```
    3. Install the nais-cli
     ```bash
     brew install nais
     ```

=== "Ubuntu"

    1. Add the nais PPA repo:
     ```
     NAIS_GPG_KEY="/etc/apt/keyrings/nav_nais_gar.asc"
     curl -sfSL "https://europe-north1-apt.pkg.dev/doc/repo-signing-key.gpg" | sudo dd of="$NAIS_GPG_KEY"
     echo "deb [arch=amd64 signed-by=$NAIS_GPG_KEY] https://europe-north1-apt.pkg.dev/projects/nais-io nais-ppa main" | sudo tee /etc/apt/sources.list.d/nav_nais_gar.list
     sudo apt update
     ```
    2. Install the nais package:
     ```
     sudo apt install nais
     ```

=== "Windows"

    ### Install using Scoop

    1. Install [Scoop](https://scoop.sh) unless you already have it.
    2. Add the nais bucket
     ```powershell
    scoop bucket add nais https://github.com/nais/scoop-bucket
     ```
    3. Install nais-cli
     ```powershell
     scoop install nais-cli
     ```

=== "Manual"

    Download the archive for windows from [nais/cli](https://github.com/nais/cli/releases/latest) and unpack the tool to a directory on your `$PATH`.
    If you are unable to run nais after installing, check out our [troubleshooting guide](troubleshooting.md).
