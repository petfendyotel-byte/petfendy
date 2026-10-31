// Tek seferlik: her il/ilçe için koordinat (Nominatim) + Ankara'dan karayolu km (OSRM) üretir.
// Kullanım: node scripts/build-distance-table.mjs . lib/data/ilce-mesafe.json  (yaklaşık 20 dk; ilçe listesi lib/mock-data.ts'ten okunur)
import fs from 'node:fs'

const REPO = process.argv[2]
const OUT = process.argv[3]
const UA = 'petfendy-distance-setup/1.0 (one-off dataset build)'
const HUB = [32.8597, 39.9334] // Ankara merkez (Kızılay) [lon, lat]

const src = fs.readFileSync(`${REPO}/lib/mock-data.ts`, 'utf8').split('\r\n').join('\n')
const start = src.indexOf('export const mockCityDistricts')
const body = src.slice(src.indexOf('{', start), src.indexOf('\n}\n', start) + 2)
const districtsByProvince = new Function(`return (${body})`)()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const state = fs.existsSync(OUT + '.partial') ? JSON.parse(fs.readFileSync(OUT + '.partial', 'utf8')) : { coords: {} }

async function geocode(province, district) {
  const q = district === 'Merkez' ? `${province}, Türkiye` : `${district}, ${province}, Türkiye`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=tr`
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } })
      if (r.ok) {
        const j = await r.json()
        return j[0] ? [Number(j[0].lon), Number(j[0].lat)] : null
      }
    } catch {}
    await sleep(3000)
  }
  return null
}

const keys = []
for (const [p, ds] of Object.entries(districtsByProvince)) for (const d of ds) keys.push([p, d])
console.log('toplam ilçe:', keys.length)

let n = 0
for (const [p, d] of keys) {
  const k = `${p}|${d}`
  if (state.coords[k] !== undefined) continue
  state.coords[k] = await geocode(p, d)
  n++
  if (n % 25 === 0) {
    fs.writeFileSync(OUT + '.partial', JSON.stringify(state))
    console.log('geocode', Object.keys(state.coords).length, '/', keys.length)
  }
  await sleep(1100)
}
fs.writeFileSync(OUT + '.partial', JSON.stringify(state))

// Bulunamayanlar için ilin kendi koordinatı
const missing = keys.filter(([p, d]) => !state.coords[`${p}|${d}`])
console.log('koordinat bulunamayan:', missing.length, missing.slice(0, 20).map((x) => x.join('/')))
for (const [p] of missing) {
  const pk = `${p}|Merkez`
  if (state.coords[pk] && !state.coords[`${p}|__`]) {/* il merkezi var */}
}
const fixed = {}
for (const [p, d] of keys) {
  const k = `${p}|${d}`
  fixed[k] = state.coords[k] ?? state.coords[`${p}|Merkez`] ?? (await geocode(p, 'Merkez'))
}

// OSRM: Ankara merkezden karayolu km (kaynak 0, hedefler toplu)
async function osrmTable(sources, dests) {
  const coords = [...sources, ...dests].map((c) => c.join(',')).join(';')
  const s = sources.map((_, i) => i).join(';')
  const d = dests.map((_, i) => i + sources.length).join(';')
  const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=${s}&destinations=${d}&annotations=distance`
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } })
      if (r.ok) return (await r.json()).distances
    } catch {}
    await sleep(4000)
  }
  throw new Error('OSRM table başarısız')
}

const entries = keys.map(([p, d]) => ({ key: `${p}|${d}`, c: fixed[`${p}|${d}`] })).filter((e) => e.c)
const result = {}
for (let i = 0; i < entries.length; i += 90) {
  const batch = entries.slice(i, i + 90)
  const rows = await osrmTable([HUB], batch.map((e) => e.c))
  batch.forEach((e, j) => {
    const m = rows[0][j]
    result[e.key] = { lat: +e.c[1].toFixed(4), lon: +e.c[0].toFixed(4), km: m == null ? null : Math.round(m / 1000) }
  })
  console.log('osrm', Math.min(i + 90, entries.length), '/', entries.length)
  await sleep(1500)
}

// Ankara ilçeleri arası tam matris
const ank = Object.keys(result).filter((k) => k.startsWith('Ankara|'))
const ankC = ank.map((k) => [result[k].lon, result[k].lat])
const mat = await osrmTable(ankC, ankC)
const ankaraPairs = {}
ank.forEach((a, i) => ank.forEach((b, j) => {
  if (i !== j && mat[i][j] != null) ankaraPairs[`${a.split('|')[1]}|${b.split('|')[1]}`] = Math.round(mat[i][j] / 1000)
}))

const nulls = Object.entries(result).filter(([, v]) => v.km == null).map(([k]) => k)
console.log('km null:', nulls.length, nulls.slice(0, 20))
fs.writeFileSync(OUT, JSON.stringify({
  _info: 'Tek seferlik üretildi: koordinat OpenStreetMap/Nominatim, karayolu km OSRM (Ankara merkez Kızılay çıkışlı). Yeniden üretmek için scripts/build-distance-table.mjs',
  hub: { name: 'Ankara', lat: HUB[1], lon: HUB[0] },
  districts: result,
  ankaraPairs,
}))
console.log('bitti', Object.keys(result).length)
