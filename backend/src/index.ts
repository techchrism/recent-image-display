import 'dotenv/config'
import chokidar from 'chokidar'
import {promises as fs} from 'node:fs'
import {WebSocketServer} from 'ws'

async function main() {
    const pdfDir = process.env['PDF_DIR']
    if(pdfDir === undefined) throw new Error('Environment variable PDF_DIR not set')
    const serverPort = 3010

    const wss = new WebSocketServer({port: serverPort})

    console.log(`Watching ${pdfDir} and listening on port ${serverPort}`)

    chokidar.watch(pdfDir, {
        ignoreInitial: true
    }).on('change', async path => {
        console.log(`File ${path} has been changed`)
        const buffer = await fs.readFile(path)
        wss.clients.forEach(client => {
            if(client.readyState === 1) {
                client.send(JSON.stringify({
                    path,
                    bufferSize: buffer.length
                }))
                client.send(buffer)
            }
        })
    })
}

main()