import { chromium } from 'playwright'
import { PDFDocument } from 'pdf-lib'
import { execSync, spawn } from 'child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`
const OUT_DIR = path.resolve('out/slides')
const SLIDE_W = 1280
const SLIDE_H = 720

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
  const scale = Number(process.env.SCALE) || 2
  const page = await browser.newPage({
    viewport: { width: SLIDE_W, height: SLIDE_H },
    deviceScaleFactor: scale,
  })

  // Get slide count
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')
  const slideCountText = await page.textContent('span')
  const totalSlides = slideCountText ? Number(slideCountText.split('/')[1]?.trim()) : 0

  if (totalSlides === 0) {
    console.error('Could not determine slide count')
    await browser.close()
    server.kill()
    process.exit(1)
  }

  console.log(`Exporting ${totalSlides} slides...`)

  const pngPaths: string[] = []

  for (let i = 0; i < totalSlides; i++) {
    await page.goto(`${BASE_URL}?export=${i}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const filename = `slide-${String(i + 1).padStart(2, '0')}.png`
    const filePath = path.join(OUT_DIR, filename)
    await page.screenshot({
      path: filePath,
      clip: { x: 0, y: 0, width: SLIDE_W, height: SLIDE_H },
    })
    pngPaths.push(filePath)
    console.log(`  ✓ ${filename}`)
  }

  await browser.close()
  server.kill()

  // Build PDF
  console.log('Building PDF...')
  const pdf = await PDFDocument.create()

  for (const pngPath of pngPaths) {
    const pngBytes = readFileSync(pngPath)
    const pngImage = await pdf.embedPng(pngBytes)
    const page = pdf.addPage([SLIDE_W, SLIDE_H])
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: SLIDE_W,
      height: SLIDE_H,
    })
  }

  const pdfPath = path.join(OUT_DIR, 'slides.pdf')
  writeFileSync(pdfPath, await pdf.save())

  console.log(`\nDone! ${totalSlides} slides exported:`)
  console.log(`  PNG: ${OUT_DIR}/slide-*.png`)
  console.log(`  PDF: ${pdfPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
