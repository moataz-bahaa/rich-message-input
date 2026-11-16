# Publishing and deploying

## Publish to npm

1. **Fill in the metadata.** In `package.json` replace `author`, `repository`, `homepage` and `bugs` (`YOUR-USER`) with your real values, and put your name in `LICENSE`.
   The name `rich-message-input` was free on the registry when this was written. Check again with `npm view rich-message-input name` (an `E404` means it is free), or use a scope like `@your-name/rich-message-input`.
2. **Log in.** Create an account at npmjs.com, enable two-factor authentication, then:
   ```bash
   npm login
   npm whoami
   ```
3. **Check the package.**
   ```bash
   npm run typecheck
   npm test
   npm run build
   npm pack --dry-run      # should list only dist/, README.md, LICENSE, package.json
   ```
4. **Try the tarball in a real app** before publishing:
   ```bash
   npm pack
   # in another React project:
   npm install ../path/to/rich-message-input-0.1.0.tgz
   ```
5. **Publish** (`prepublishOnly` runs typecheck and build; `publishConfig.access` is already `public`):
   ```bash
   npm publish            # add --otp=123456 if two-factor asks
   ```
6. **Release later versions** with semver (patch = fixes, minor = features, major = breaking):
   ```bash
   npm version patch      # or minor / major; bumps package.json and tags
   git push --follow-tags
   npm publish
   ```

### Automatic publishing (GitHub Actions)

`.github/workflows/publish.yml` publishes when you create a GitHub Release.

1. On npmjs.com create an **Automation** access token.
2. In the GitHub repo: Settings, Secrets and variables, Actions, new repository secret `NPM_TOKEN`.
3. Bump the version (`npm version minor`), push with tags, then create a Release for that tag.
   The workflow runs typecheck, tests, build, then `npm publish --provenance`.

## Deploy the docs and playground to GitHub Pages

The site lives in `docs/` and is built by `.github/workflows/docs.yml` on every push to `main`.

1. Create a GitHub repository and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/moataz-bahaa/rich-message-input.git
   git push -u origin main
   ```
2. In the repo go to **Settings, Pages**, and set **Source** to **GitHub Actions**.
3. The first workflow run publishes the site at `https://moataz-bahaa.github.io/rich-message-input/`.
   The build uses relative asset paths (`base: './'`), so it works under any repository name.

Local preview:

```bash
npm run dev             # live dev server
npm run docs:build      # production build into docs-dist/
npm run docs:preview    # serve the production build
```
