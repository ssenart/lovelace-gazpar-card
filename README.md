# Home Assistant Lovelace Gazpar Card

GrDF Gazpar meter lovelace card for Home Assistant.

This card has been inspired from the great [Linky Card](https://github.com/saniho/content-card-linky).

I reuse the same layout.

![Gazpar Card](images/gazpar-card.jpg)

It requires the HA integration [Gazpar](https://github.com/ssenart/home-assistant-gazpar).

## Installation

### Method 1 : HACS (recommended)

Follow the steps described below to add GrDF Gazpar integration with [HACS](https://hacs.xyz/):

1. From [HACS](https://hacs.xyz/) (Home Assistant Community Store), open the upper left menu and select `Custom repositories` option to add the new repo.

2. Add the address <https://github.com/ssenart/lovelace-gazpar-card> with the category `Lovelace Plugins`, and click `ADD`. The new corresponding repo appears in the repo list.

3. Select this repo (this integration description is displayed in a window) and click on `INSTALL THIS REPOSITORY` button on the lower right of this window.

4. Keep the last version and click the button `INSTALL` on the lower right.

5. Do click on `RELOAD` button for completion! The integration is now ready. It remains the configuration.

### Method 2 : Manual

1. Copy the content of the dist directory in HA config/www/gazpar-card directory.

2. Add the file path /local/gazpar-card/gazpar-card.js as a new Dashboard ressource (Module JavaScript).

## Configuration

![Gazpar Card Configuration](images/gazpar-card-editor.jpg)
