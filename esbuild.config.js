require('dotenv').config()

const { build } = require('esbuild')
const path = require('path')
const fs = require('fs')

const isProduction = process.env.NODE_ENV === 'production'
const entryPoints = isProduction
  ? ['src/index.ts']
  : ['src/index.ts', 'run-local.ts']

const certFile = `${process.env.AWS_REGION}-bundle.pem`
const certPath = path.resolve(__dirname, certFile)
const outDir = 'dist'
const outCertPath = path.resolve(__dirname, outDir, certFile)

build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node22',
  outdir: 'dist',
  external: ['pg-native'], // Exclude native dependencies if any, 'pg' sometimes has one
  sourcemap: !isProduction, // TODO: 'external'
})
  .then(() => {
    // esbuild doesn't handle non-JS files, so we copy the cert manually after bundling
    if (fs.existsSync(certPath)) {
      fs.copyFileSync(certPath, outCertPath)
      console.log('Certificate file copied to dist.')
    }
    console.log(
      `Build finished for ${isProduction ? 'production' : 'development'}.`
    )
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
