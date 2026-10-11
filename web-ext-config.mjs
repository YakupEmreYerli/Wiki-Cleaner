// Paketin dışında kalması gereken geliştirme dosyaları. Hem `web-ext lint`
// hem `web-ext build` bu listeyi kullanır.
export default {
  ignoreFiles: [
    'node_modules/**',
    'test/**',
    'tools/**',
    'web-ext-artifacts/**',
    'imzali/**',
    'CHANGELOG.md',
    'README.md',
    'README.tr.md',
    'icons/*.svg',
    'docs/**',
    'package.json',
    'package-lock.json',
    'web-ext-config.mjs',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'CLAUDE.md',
    'AGENTS.md',
    // Local code graph (git-ignored); without this it ends up in lint and in the package.
    'graphify-out/**'
  ],
  build: {
    overwriteDest: true
  }
};
