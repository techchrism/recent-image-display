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

    const sendFile = async (path: string) => {
        try {
            const buffer = await fs.readFile(path)
            if(buffer.length === 0) return

            wss.clients.forEach(client => {
                if(client.readyState === 1) {
                    client.send(JSON.stringify({
                        path,
                        bufferSize: buffer.length
                    }))
                    client.send(buffer)
                }
            })
        } catch(error) {
            setTimeout(() => sendFile(path), 500)
        }
    }

    chokidar.watch(pdfDir, {
        ignoreInitial: true
    }).on('change', async path => {
        console.log(`File ${path} has been changed`)
        sendFile(path)
    })
}

main()