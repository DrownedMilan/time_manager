````markdown
## Yarn Setup & Project Installation

### Requirements
- **Node.js 20.19.0**
  ```bash
  node -v
````

> Make sure your Node version is exactly 20.19.0 (Vite requires it)

* **Corepack** (comes with Node 16+)

  ```bash
  corepack enable
  ```

---

### Install Yarn 4

1. Enable Corepack (if not already):

   ```bash
   corepack enable
   ```

2. Prepare and activate Yarn 4:

   ```bash
   corepack prepare yarn@stable --activate
   ```

3. Verify the Yarn version:

   ```bash
   yarn -v
   ```

   > ✅ You should see something like `4.x.x`.

4. (Optional) Lock Yarn to this project:

   ```bash
   yarn set version stable
   ```

This will create a `.yarnrc.yml` file containing:

```yaml
yarnPath: .yarn/releases/yarn-4.x.x.cjs
nodeLinker: node-modules
```

---

### Install Dependencies

At the root of the project, run:

```bash
yarn install
```

This will:

* Install all dependencies listed in `package.json`
* Generate or update `yarn.lock`
* Create the `.yarn/` directory structure

---

### Run the App (Example)

If your app uses **Vite.js**, start the development server with:

```bash
yarn dev
```

Then open:
👉 [http://localhost:5173](http://localhost:5173)

---

### Useful Commands

| Action                    | Command                               |
| ------------------------- | ------------------------------------- |
| Install dependencies      | `yarn install`                        |
| Add a dependency          | `yarn add <package>`                  |
| Add a dev dependency      | `yarn add -D <package>`               |
| Remove a dependency       | `yarn remove <package>`               |
| Run the dev server (Vite) | `yarn dev`                            |
| Lint code                 | `yarn lint`                           |
| Clean & reinstall         | `rm -rf node_modules && yarn install` |

---

### Notes

* Always use **Yarn** (never mix with npm).
* Commit the `yarn.lock` file.
* Ignore `node_modules/` and Yarn cache folders in your `.gitignore`.
