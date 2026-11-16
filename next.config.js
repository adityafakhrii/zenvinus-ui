/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    // WHY: Bootstrap 5.3's own SCSS still uses @import and global functions that Dart Sass deprecates; those
    // warnings come from node_modules and cannot be fixed here. Warnings from our own SCSS still show.
    quietDeps: true,
    // src/styles/index.scss keeps @import on purpose (see the comment there); every other deprecation still warns
    silenceDeprecations: ['import'],
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
