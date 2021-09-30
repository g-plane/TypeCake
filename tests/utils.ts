import * as fs from 'node:fs/promises'

export async function isExist(path: string): Promise<boolean> {
  try {
    await fs.stat(path)
    return true
  } catch {
    return false
  }
}
