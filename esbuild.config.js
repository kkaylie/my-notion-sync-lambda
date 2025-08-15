require('dotenv').config()

const { build } = require('esbuild')
const path = require('path')
const fs = require('fs')

const certFile = `${process.env.AWS_REGION}-bundle.pem`
const certPath = path.resolve(__dirname, certFile)
const outDir = 'dist'
const outCertPath = path.resolve(__dirname, outDir, certFile)

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/index.js',
  external: ['pg-native'], // Exclude native dependencies if any, 'pg' sometimes has one
  sourcemap: true,
})
  .then(() => {
    // esbuild doesn't handle non-JS files, so we copy the cert manually after bundling
    if (fs.existsSync(certPath)) {
      fs.copyFileSync(certPath, outCertPath)
      console.log('Certificate file copied to dist.')
    }
    console.log('Build finished successfully.')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
