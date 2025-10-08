# 🧶 Project Setup — Time Manager

## 📋 Requirements

Before starting, make sure you have the following installed:

- **Node.js 20.19.0**
  ```bash
  node -v
  ```
  > Ensure your Node version is exactly `20.19.0` (required for Vite.js)

- **Corepack** (included with Node 16+)
  ```bash
  corepack enable
  ```

---

## ⚙️ Install Yarn 4

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
   > ✅ You should see a version like `4.x.x`

4. (Optional) Lock Yarn to this project:
   ```bash
   yarn set version stable
   ```

This will create a `.yarnrc.yml` file that looks like:
```yaml
yarnPath: .yarn/releases/yarn-4.x.x.cjs
nodeLinker: node-modules
```

---

## 📦 Install Project Dependencies

At the root of the project, run:
```bash
yarn install
```

This will:
- Install all dependencies listed in `package.json`
- Generate or update the `yarn.lock` file
- Create the `.yarn/` structure for Yarn 4

---

## 🚀 Run the App (Vite.js)

To start the development server:
```bash
yarn dev
```

Then open your browser at:  
👉 [http://localhost:5173](http://localhost:5173)

---

## 🧰 Useful Commands

| Action | Command |
|--------|----------|
| Install dependencies | `yarn install` |
| Add a package | `yarn add <package>` |
| Add a dev dependency | `yarn add -D <package>` |
| Remove a package | `yarn remove <package>` |
| Run the Vite dev server | `yarn dev` |
| Lint the code | `yarn lint` |
| Clean install | `rm -rf node_modules && yarn install` |

---

## 🧠 Notes

- Always use **Yarn** — do **not** mix with `npm`.
- Commit the `yarn.lock` file for consistent environments.
- Ignore unnecessary folders in `.gitignore`:

```gitignore
# Yarn
.yarn/*
!.yarn/releases
!.yarn/plugins
!.yarn/sdks
!.yarn/versions
node_modules/
.pnp.*
.yarn/install-state.gz

# Environment files
.env
```

---

✅ You’re now ready to run the project with Yarn 4 and Vite.js!
