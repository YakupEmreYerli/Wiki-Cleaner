// Paketin dışında kalması gereken geliştirme dosyaları. Hem `web-ext lint`
// hem `web-ext build` bu listeyi kullanır.
export default {
  ignoreFiles: [
    'node_modules/**',
    'test/**',
    'tools/**',
    'web-ext-artifacts/**',
    'icons/*.svg',
    'package.json',
    'package-lock.json',
    'web-ext-config.mjs',
    'CONTRIBUTING.md',
    'SECURITY.md'
  ],
  lint: {
    warningsAsErrors: true
  },
  build: {
    overwriteDest: true
  }
};
