export type PublishStep = { title: string; body: string; code?: string };

/** Mirrored in PUBLISHING.md. */
export const publishSteps: PublishStep[] = [
  {
    title: '1. Fill in the package metadata',
    body: 'In package.json set "author", "repository", "homepage" and "bugs" to your real values, and put your name in LICENSE. The name "rich-message-input" was free on the registry when this was written; check again, or use a scope such as @your-name/rich-message-input.',
    code: 'npm view rich-message-input name   # E404 means the name is available',
  },
  {
    title: '2. Create an npm account and log in',
    body: 'Sign up at npmjs.com, enable two-factor authentication, then log in from the terminal.',
    code: 'npm login\nnpm whoami',
  },
  {
    title: '3. Check what will be published',
    body: 'prepublishOnly runs typecheck and the build. The tarball should contain only dist/, README.md, LICENSE and package.json.',
    code: 'npm run typecheck\nnpm test\nnpm run build\nnpm pack --dry-run',
  },
  {
    title: '4. Try the tarball in a real app',
    body: 'Install the packed file into a separate React project before publishing.',
    code: 'npm pack\n# in another project:\nnpm install ../path/to/rich-message-input-0.1.0.tgz',
  },
  {
    title: '5. Publish the first version',
    body: 'Scoped packages need --access public the first time (already set in publishConfig). Use --otp if two-factor asks for a code.',
    code: 'npm publish',
  },
  {
    title: '6. Release new versions',
    body: 'Follow semver: patch for fixes, minor for features, major for breaking changes. npm version bumps package.json and creates a git tag.',
    code: 'npm version patch   # or minor / major\ngit push --follow-tags\nnpm publish',
  },
  {
    title: '7. Automate it with GitHub Actions (optional)',
    body: 'The repo ships .github/workflows/publish.yml. Add an npm automation token as the NPM_TOKEN repository secret, then publish a GitHub Release and the workflow tests, builds and publishes with provenance.',
  },
];
