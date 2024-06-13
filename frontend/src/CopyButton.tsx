import {Component, createSignal} from 'solid-js'
import {FaRegularClipboard} from 'solid-icons/fa'

export type CopyButtonProps = {
    text: string
}

const CopyButton: Component<CopyButtonProps> = (props) => {
    const [isCopied, setIsCopied] = createSignal(false)

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(props.text)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 1000)
    }

    return (
        <button class="btn btn-primary" classList={{"btn-success": isCopied()}} onClick={copyToClipboard}>
            <FaRegularClipboard />
        </button>
    )
}

export default CopyButton