import {Component, createSignal, For} from 'solid-js'
import {VsClearAll, VsClose} from 'solid-icons/vs'
import CopyButton from './CopyButton'
import {IoClose} from 'solid-icons/io'

interface MetaDataFormat {
    path: string
    name: string
    bufferSize: number
}

interface ImageEntry {
    meta: MetaDataFormat
    dataUrl: string
}

const App: Component = () => {
    const [imageEntries, setImageEntries] = createSignal<ImageEntry[]>([])
    let tempImageMeta: MetaDataFormat | undefined

    const onImageData = (data: Blob) => {
        if(tempImageMeta === undefined) return

        setImageEntries([{
            meta: tempImageMeta,
            dataUrl: URL.createObjectURL(data)
        }, ...imageEntries()])
    }
    const onMetaData = (meta: MetaDataFormat) => {
        tempImageMeta = meta
    }

    const removeImageEntry = (index: number) => {
        const newImageEntries = [...imageEntries()]
        newImageEntries.splice(index, 1).forEach(entry => URL.revokeObjectURL(entry.dataUrl))
        setImageEntries(newImageEntries)
    }
    const removeAllImageEntries = () => {
        imageEntries().forEach(entry => URL.revokeObjectURL(entry.dataUrl))
        setImageEntries([])
    }

    const connectWebsocket = () => {
        const ws = new WebSocket('ws://localhost:3010')
        ws.onmessage = event => {
            const data = event.data
            if(data instanceof ArrayBuffer) {
                onImageData(new Blob([data]))
            } else if(typeof data === 'string') {
                onMetaData(JSON.parse(data))
            } else if(data instanceof Blob) {
                onImageData(data)
            }
        }

        ws.onclose = () => {
            setTimeout(() => {
                connectWebsocket()
            }, 1000)
        }
    }
    connectWebsocket()

    return (
        <>
            <div class="navbar bg-base-100 drop-shadow-lg">
                <span class="text-2xl font-semibold flex-1">Recent Image Display</span>
                <div class="flex-none">
                    <span class="text-xl">{imageEntries().length} images</span>
                    <div class="divider divider-horizontal"/>
                    <button class="btn btn-primary hover:btn-error btn-square" title="Clear All" onClick={removeAllImageEntries}>
                        <VsClearAll size={24}/>
                    </button>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <For each={imageEntries()}>
                    {({meta, dataUrl}, index) => (
                        <div class="card shadow-xl">
                            <div class="flex flex-row gap-2 m-2">
                                <CopyButton text={meta.name}/>
                                <button class="btn btn-error btn-square" onClick={e => removeImageEntry(index())}>
                                    <IoClose size="1.5em"/>
                                </button>
                                <h2 class="card-title text-xl font-semibold">{meta.name}</h2>
                            </div>
                            <details class="collapse bg-base-200" open>
                                <summary class="collapse-title text-xl font-medium">Click to open/close</summary>
                                <div class="collapse-content">
                                    <img src={dataUrl} alt={meta.path}/>
                                </div>
                            </details>
                        </div>
                    )}
                </For>
            </div>
        </>
    )
}

export default App
