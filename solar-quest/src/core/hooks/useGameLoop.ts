import { useEffect, useRef } from 'react'

export function useGameLoop(callback: (delta: number) => void) {
    const lastTime = useRef(performance.now())

    useEffect(() => {
        let frame: number
        const loop = (time: number) => {
            const delta = (time - lastTime.current) / 1000
            lastTime.current = time
            callback(delta)
            frame = requestAnimationFrame(loop)
        }
        frame = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(frame)
    }, [callback])
}
