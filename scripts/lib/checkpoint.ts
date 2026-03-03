import fs from 'fs'
import path from 'path'

const CHECKPOINT_DIR = path.join(process.cwd(), 'scripts', '.checkpoints')

export interface CheckpointData<T = unknown> {
  scraperName: string
  startedAt: string
  lastSavedAt: string
  totalExpected: number
  processedCount: number
  lastProcessedId: string | number | null
  data: T[]
  errors: Array<{ id: string | number; error: string }>
}

function ensureDir() {
  if (!fs.existsSync(CHECKPOINT_DIR)) {
    fs.mkdirSync(CHECKPOINT_DIR, { recursive: true })
  }
}

function getCheckpointPath(scraperName: string): string {
  return path.join(CHECKPOINT_DIR, `${scraperName}.json`)
}

export function saveCheckpoint<T>(scraperName: string, data: CheckpointData<T>): void {
  ensureDir()
  const updated = { ...data, lastSavedAt: new Date().toISOString() }
  fs.writeFileSync(getCheckpointPath(scraperName), JSON.stringify(updated, null, 2), 'utf-8')
}

export function loadCheckpoint<T>(scraperName: string): CheckpointData<T> | null {
  const filePath = getCheckpointPath(scraperName)
  if (!fs.existsSync(filePath)) return null
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as CheckpointData<T>
  } catch {
    console.warn(`[checkpoint] Failed to load ${scraperName} checkpoint, starting fresh`)
    return null
  }
}

export function clearCheckpoint(scraperName: string): void {
  const filePath = getCheckpointPath(scraperName)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

export function printProgress(checkpoint: CheckpointData<unknown>): void {
  const pct = checkpoint.totalExpected > 0
    ? Math.round((checkpoint.processedCount / checkpoint.totalExpected) * 100)
    : 0
  console.log(
    `[${checkpoint.scraperName}] ${checkpoint.processedCount}/${checkpoint.totalExpected} (${pct}%) — last: ${checkpoint.lastProcessedId} — errors: ${checkpoint.errors.length}`
  )
}

/**
 * Higher-level helper: run a scraper with automatic checkpointing every `saveEvery` records.
 * The processFn is called for each item in the items array.
 *
 * Usage:
 * await runWithCheckpoint({
 *   scraperName: 'quran-arabic',
 *   items: allAyahs,
 *   totalExpected: 6236,
 *   saveEvery: 100,
 *   processFn: async (ayah) => { ... return processedAyah },
 *   getItemId: (ayah) => `${ayah.surah}:${ayah.ayah}`,
 * })
 */
export async function runWithCheckpoint<TInput, TOutput>(options: {
  scraperName: string
  items: TInput[]
  totalExpected: number
  saveEvery?: number
  processFn: (item: TInput, index: number) => Promise<TOutput>
  getItemId: (item: TInput) => string | number
  delayMs?: number
}): Promise<TOutput[]> {
  const { scraperName, items, totalExpected, saveEvery = 100, processFn, getItemId, delayMs = 0 } = options

  const existing = loadCheckpoint<TOutput>(scraperName)
  const results: TOutput[] = existing?.data ?? []
  const errors: CheckpointData<TOutput>['errors'] = existing?.errors ?? []

  console.log(`[${scraperName}] Starting. ${existing ? `Resuming from ${existing.processedCount} records.` : 'Fresh start.'}`)

  const checkpoint: CheckpointData<TOutput> = {
    scraperName,
    startedAt: existing?.startedAt ?? new Date().toISOString(),
    lastSavedAt: existing?.lastSavedAt ?? new Date().toISOString(),
    totalExpected,
    processedCount: existing?.processedCount ?? 0,
    lastProcessedId: existing?.lastProcessedId ?? null,
    data: results,
    errors,
  }

  let newCount = 0

  for (let i = checkpoint.processedCount; i < items.length; i++) {
    const item = items[i]
    const itemId = getItemId(item)

    try {
      const result = await processFn(item, i)
      results.push(result)
      checkpoint.processedCount++
      checkpoint.lastProcessedId = itemId
      newCount++

      if (newCount % saveEvery === 0) {
        checkpoint.data = results
        saveCheckpoint(scraperName, checkpoint)
        printProgress(checkpoint)
      }

      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs))
      }
    } catch (err) {
      errors.push({ id: itemId, error: String(err) })
      checkpoint.errors = errors
      console.warn(`[${scraperName}] Error on item ${itemId}: ${err}`)
    }
  }

  // Final save
  checkpoint.data = results
  saveCheckpoint(scraperName, checkpoint)
  printProgress(checkpoint)
  console.log(`[${scraperName}] Done. ${results.length} records processed. ${errors.length} errors.`)

  return results
}
