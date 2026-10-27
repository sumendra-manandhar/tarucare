import { useEffect, useState } from 'react'

/*
 * Product photos live in IndexedDB (localStorage is far too small for images).
 * Products only keep `photos: [{ id, caption }]`; the image data is stored here by id.
 */

const DB_NAME = 'taru-photos'
const STORE = 'photos'
const cache = new Map()
let dbPromise

function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

function tx(mode, fn) {
  return db().then(
    (d) =>
      new Promise((resolve, reject) => {
        const t = d.transaction(STORE, mode)
        const req = fn(t.objectStore(STORE))
        t.oncomplete = () => resolve(req?.result)
        t.onerror = () => reject(t.error)
      }),
  )
}

export async function savePhoto(dataUrl) {
  const id = `ph_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
  cache.set(id, dataUrl)
  try {
    await tx('readwrite', (s) => s.put(dataUrl, id))
  } catch {
    /* storage unavailable: keep the photo for this session only */
  }
  return id
}

export async function loadPhoto(id) {
  if (cache.has(id)) return cache.get(id)
  try {
    const src = await tx('readonly', (s) => s.get(id))
    if (src) cache.set(id, src)
    return src || null
  } catch {
    return null
  }
}

export async function deletePhotos(ids) {
  ids.forEach((id) => cache.delete(id))
  try {
    await tx('readwrite', (s) => ids.forEach((id) => s.delete(id)))
  } catch {
    /* ignore */
  }
}

export function usePhoto(id) {
  const [src, setSrc] = useState(() => (id ? cache.get(id) || null : null))
  useEffect(() => {
    let alive = true
    if (!id) return setSrc(null)
    loadPhoto(id).then((s) => alive && setSrc(s))
    return () => {
      alive = false
    }
  }, [id])
  return src
}

/** Downscale an uploaded image so a gallery of photos stays light. */
export function resizeImage(file, max = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Not a readable image'))
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
