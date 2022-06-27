# Installation

## macOS Installation

1. Install [Homebrew](https://brew.sh/) unless you already have it
2. Add the nais tap

```bash
brew tap nais/tap
```

3. Install the nais-cli

```bash
brew install nais
```

### Windows Installation

Download the archive for windows and unpack the tool to a directory on your `$PATH`.

[Install nais-cli](https://github.com/nais/nais-cli/releases/latest)

### Ubuntu Installation

1. Add the nais PPA repo:

``` 
NAIS_GPG_KEY="/usr/share/keyrings/nav_nais.gpg"
curl -sfSL "https://ppa.nais.io/KEY.gpg" | gpg --dearmor | sudo dd of="$NAIS_GPG_KEY"
echo "deb [signed-by=$NAIS_GPG_KEY] https://ppa.nais.io/ ./" | sudo tee /etc/apt/sources.list.d/nav_nais.list
sudo apt update # Now you can apt install nais
```

2. Install the nais package:

```
sudo apt install nais
```