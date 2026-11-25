import { cp, mkdtemp, mkdir, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const temporary = await mkdtemp(join(root, '.tmp-pages-'))
const basePath = '/Gas-Go-web'

try {
  await mkdir(join(temporary, 'src'))
  for (const entry of ['public', 'postcss.config.mjs', 'tsconfig.json', 'package.json', '.figma/make/site.json']) {
    await cp(join(root, entry), join(temporary, entry), { recursive: true })
  }
  for (const file of ['make-site-settings.ts', 'make-custom-code.tsx', 'public-site.ts']) {
    await cp(join(root, 'src/lib', file), join(temporary, 'src/lib', file))
  }
  const frontend = join(root, 'src/app/(frontend)')
  const excluded = ['api', 'portal', '.figma'].map((part) => join(frontend, part))
  await cp(frontend, join(temporary, 'src/app'), {
    recursive: true,
    filter: (path) => !excluded.includes(path),
  })
  await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'junction')
  await writeFile(join(temporary, 'next.config.mjs'), `export default {
    output: 'export',
    basePath: ${JSON.stringify(basePath)},
    turbopack: { root: ${JSON.stringify(root)} },
    images: { unoptimized: true },
    agentRules: false,
    experimental: { cpus: 2 },
  }\n`)

  const result = spawnSync(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'build'], {
    cwd: temporary,
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_CORPORATE_ONLY: 'true',
      NEXT_PUBLIC_SITE_URL: 'https://guillemgalveb.github.io/Gas-Go-web/',
    },
  })
  if (result.status !== 0) throw result.error ?? new Error('Falló la compilación para GitHub Pages.')

  const output = join(temporary, 'out')
  await writeFile(join(output, '.nojekyll'), '')
  const destination = join(root, 'docs')
  // Replace the previous export only after the new one compiles successfully.
  await rm(destination, { recursive: true, force: true })
  await rename(output, destination)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
