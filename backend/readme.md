# Recent Image Display Backend

The backend server for the recent image display utility. Watches a directory and publishes changes over a websocket.

## Usage

- Configure the environment variable `IMAGE_DIR` to the directory you want to watch (`.env` files are supported)
- Run `pnpm install` or `npm install` to install dependencies
- Run `node .` to start the server