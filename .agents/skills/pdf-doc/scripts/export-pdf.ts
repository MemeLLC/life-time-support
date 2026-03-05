import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import { mkdirSync } from 'fs'
import path from 'path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`
const OUT_DIR = path.resolve('out')

async function main() {
  console.log('Building...')
  execSync('npm run build', { stdio: 'inherit' })

  mkdirSync(OUT_DIR, { recursive: true })

  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    stdio: 'pipe',
  })

  await new Promise<void>((resolve) => {
    server.stdout?.on('data', (data: Buffer) => {
      if (data.toString().includes('Local')) resolve()
    })
    setTimeout(resolve, 3000)
  })

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${BASE_URL}?pdf`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  const pdfPath = path.join(OUT_DIR, 'document.pdf')

  await page.pdf({
    path: pdfPath,
    width: '794px',
    height: '1123px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })

  console.log(`\nDone! PDF exported: ${pdfPath}`)

  await browser.close()
  server.kill()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
