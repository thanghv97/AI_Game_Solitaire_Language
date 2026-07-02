import { spawn } from 'child_process'
import { setTimeout as sleep } from 'timers/promises'

const NGROK_BIN = 'D:\\Setup\\ngrok\\ngrok.exe'

const proc = spawn(NGROK_BIN, ['http', '3000'], { stdio: 'ignore' })
proc.on('error', (err) => console.error('[ngrok] failed to start:', err.message))
proc.on('exit', (code) => { if (code !== 0 && code !== null) console.error(`[ngrok] exited with code ${code}`) })

// Poll ngrok local API until tunnel is ready
async function getTunnelUrl(retries = 15) {
  for (let i = 0; i < retries; i++) {
    await sleep(1000)
    try {
      const res = await fetch('http://localhost:4040/api/tunnels')
      const { tunnels } = await res.json()
      const tunnel = tunnels?.find((t) => t.proto === 'https')
      if (tunnel?.public_url) return tunnel.public_url
    } catch { /* not ready yet */ }
  }
  return null
}

const url = await getTunnelUrl()
if (url) {
  console.log(`\n  > ngrok:   ${url}\n`)
} else {
  console.error('[ngrok] could not get public URL after 15s')
}
