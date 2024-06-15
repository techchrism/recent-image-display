import 'dotenv/config'
import chokidar from 'chokidar'
import {promises as fs} from 'node:fs'
import {WebSocketServer} from 'ws'
import path from 'node:path'

async function main() {
    const pdfDir = process.env['IMAGE_DIR']
    if(pdfDir === undefined) throw new Error('Environment variable IMAGE_DIR not set')
    const serverPort = 3010

    const wss = new WebSocketServer({port: serverPort})

    console.log(`Watching ${pdfDir} and listening on port ${serverPort}`)

    const sendFile = async (filePath: string) => {
        try {
            const buffer = await fs.readFile(filePath)
            if(buffer.length === 0) return

            wss.clients.forEach(client => {
                if(client.readyState === 1) {
                    client.send(JSON.stringify({
                        path: filePath,
                        name: path.basename(filePath),
                        bufferSize: buffer.length
                    }))
                    client.send(buffer)
                }
            })
        } catch(error) {
            setTimeout(() => sendFile(filePath), 500)
        }
    }

    chokidar.watch(pdfDir, {
        ignoreInitial: true
    }).on('change', async filePath => {
        console.log(`File ${filePath} has been changed`)
        sendFile(filePath)
    })
}

main()