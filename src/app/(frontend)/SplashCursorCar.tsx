'use client'

import { useEffect, useRef, useState } from 'react'

type TrackMark = {
  leftX: number
  leftY: number
  rightX: number
  rightY: number
  time: number
  xDirection: number
  yDirection: number
}

function normalizeAngle(angle: number) {
  while (angle > Math.PI) angle -= Math.PI * 2
  while (angle < -Math.PI) angle += Math.PI * 2
  return angle
}

export function SplashCursorCar() {
  const [enabled, setEnabled] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const carRef = useRef<HTMLDivElement>(null)
  const carBodyRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(finePointer && !reducedMotion)
  }, [])

  useEffect(() => {
    if (!enabled || !overlayRef.current || !canvasRef.current || !carRef.current) return

    const overlay = overlayRef.current
    const splash = overlay.parentElement
    const canvas = canvasRef.current
    const car = carRef.current
    const context = canvas.getContext('2d')
    if (!splash || !context) return

    splash.classList.add('splash--car-cursor')

    let width = overlay.clientWidth
    let height = overlay.clientHeight
    let animationFrame = 0
    let pointerInside = false
    let lastTrackX = width / 2
    let lastTrackY = height / 2
    let currentAngle = -Math.PI / 2
    const current = { x: width / 2, y: height / 2 }
    const target = { x: width / 2, y: height / 2 }
    const tracks: TrackMark[] = []

    const resize = () => {
      width = overlay.clientWidth
      height = overlay.clientHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const move = (event: PointerEvent) => {
      const rect = splash.getBoundingClientRect()
      target.x = event.clientX - rect.left
      target.y = event.clientY - rect.top
      pointerInside = true
      car.style.opacity = '1'
      car.classList.toggle(
        'splash-cursor-car--action',
        event.target instanceof Element && Boolean(event.target.closest('button')),
      )
    }

    const enter = () => {
      pointerInside = true
      car.style.opacity = '1'
    }

    const leave = () => {
      pointerInside = false
      car.style.opacity = '0'
      car.classList.remove('splash-cursor-car--action')
    }

    const draw = (time: number) => {
      const previousX = current.x
      const previousY = current.y
      current.x += (target.x - current.x) * 0.145
      current.y += (target.y - current.y) * 0.145

      const velocityX = current.x - previousX
      const velocityY = current.y - previousY
      const speed = Math.hypot(velocityX, velocityY)
      let steering = 0

      if (speed > 0.12) {
        const desiredAngle = Math.atan2(velocityY, velocityX)
        const angleDifference = normalizeAngle(desiredAngle - currentAngle)
        currentAngle += angleDifference * 0.16
        steering = Math.max(-9, Math.min(9, (angleDifference * 180) / Math.PI))
      }

      car.style.transform = `translate3d(${current.x}px,${current.y}px,0) translate(-50%,-50%) rotate(${currentAngle + Math.PI / 2}rad)`
      if (carBodyRef.current) {
        carBodyRef.current.style.transform = `skewX(${steering * 0.38}deg) scale(${car.classList.contains('splash-cursor-car--action') ? 1.08 : 1})`
      }

      const distanceFromLastTrack = Math.hypot(current.x - lastTrackX, current.y - lastTrackY)
      if (pointerInside && speed > 0.35 && distanceFromLastTrack > 8) {
        const xDirection = Math.cos(currentAngle)
        const yDirection = Math.sin(currentAngle)
        const perpendicularX = -yDirection
        const perpendicularY = xDirection
        const rearX = current.x - xDirection * 23
        const rearY = current.y - yDirection * 23

        tracks.push({
          leftX: rearX + perpendicularX * 13,
          leftY: rearY + perpendicularY * 13,
          rightX: rearX - perpendicularX * 13,
          rightY: rearY - perpendicularY * 13,
          time,
          xDirection,
          yDirection,
        })
        lastTrackX = current.x
        lastTrackY = current.y
      }

      context.clearRect(0, 0, width, height)
      for (let index = tracks.length - 1; index >= 0; index -= 1) {
        const mark = tracks[index]
        const age = time - mark.time
        if (age > 1150) {
          tracks.splice(index, 1)
          continue
        }

        const opacity = (1 - age / 1150) * 0.5
        context.beginPath()
        context.moveTo(mark.leftX, mark.leftY)
        context.lineTo(mark.leftX - mark.xDirection * 9, mark.leftY - mark.yDirection * 9)
        context.moveTo(mark.rightX, mark.rightY)
        context.lineTo(mark.rightX - mark.xDirection * 9, mark.rightY - mark.yDirection * 9)
        context.strokeStyle = `rgba(0, 25, 20, ${opacity})`
        context.lineWidth = 3.4
        context.lineCap = 'round'
        context.stroke()
      }

      animationFrame = window.requestAnimationFrame(draw)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(overlay)
    splash.addEventListener('pointermove', move)
    splash.addEventListener('pointerenter', enter)
    splash.addEventListener('pointerleave', leave)
    animationFrame = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      splash.removeEventListener('pointermove', move)
      splash.removeEventListener('pointerenter', enter)
      splash.removeEventListener('pointerleave', leave)
      splash.classList.remove('splash--car-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="splash-cursor-effects" ref={overlayRef} aria-hidden="true">
      <canvas ref={canvasRef} className="splash-track-canvas" />
      <div ref={carRef} className="splash-cursor-car">
        <svg ref={carBodyRef} viewBox="0 0 86 174" role="presentation">
          <ellipse cx="43" cy="89" rx="33" ry="76" className="cursor-car-shadow" />
          <rect x="7" y="32" width="8" height="28" rx="4" className="cursor-car-tyre" />
          <rect x="71" y="32" width="8" height="28" rx="4" className="cursor-car-tyre" />
          <rect x="7" y="125" width="8" height="29" rx="4" className="cursor-car-tyre" />
          <rect x="71" y="125" width="8" height="29" rx="4" className="cursor-car-tyre" />
          <path d="M15 67 L3 62 L2 72 L16 78 Z" className="cursor-car-mirror" />
          <path d="M71 67 L83 62 L84 72 L70 78 Z" className="cursor-car-mirror cursor-car-mirror--right" />
          <path d="M43 4 C56 4 65 9 71 21 C76 36 77 56 75 79 L75 138 C74 153 68 165 58 170 C49 173 37 173 28 170 C18 165 12 153 11 138 L11 79 C9 56 10 36 15 21 C21 9 30 4 43 4 Z" className="cursor-car-body" />
          <path d="M18 22 C25 11 34 8 43 8 C52 8 61 11 68 22 L64 48 L22 48 Z" className="cursor-car-bonnet" />
          <path d="M43 8 L43 48 L22 48 L18 22 Z" className="cursor-car-facet cursor-car-facet--light" />
          <path d="M43 8 L68 22 L64 48 L43 48 Z" className="cursor-car-facet cursor-car-facet--mid" />
          <path d="M22 48 L64 48 L70 76 L16 76 Z" className="cursor-car-window cursor-car-windscreen" />
          <path d="M16 80 L70 80 L69 122 L17 122 Z" className="cursor-car-roof" />
          <path d="M17 81 L27 82 L24 120 L18 121 Z M69 81 L59 82 L62 120 L68 121 Z" className="cursor-car-side-glass" />
          <path d="M23 126 L63 126 L66 144 L59 151 L27 151 L20 144 Z" className="cursor-car-window cursor-car-rear-window" />
          <path d="M18 151 L27 154 L31 169 L24 167 L15 155 Z" className="cursor-car-facet cursor-car-facet--dark" />
          <path d="M68 151 L59 154 L55 169 L62 167 L71 155 Z" className="cursor-car-facet cursor-car-facet--mid" />
          <path d="M24 52 L18 67 M62 52 L68 67" className="cursor-car-glass-edge" />
          <path d="M43 81 L43 121 M19 101 L67 101" className="cursor-car-window-lines" />
          <path d="M17 38 L28 32 M69 38 L58 32" className="cursor-car-headlight" />
          <path d="M32 17 L54 17" className="cursor-car-grille" />
          <path d="M16 151 L28 157 M70 151 L58 157" className="cursor-car-tail-light" />
          <path d="M29 167 L57 167" className="cursor-car-rear-bumper" />
          <path d="M26 153 L60 153" className="cursor-car-spoiler" />
          <path d="M43 128 L43 147" className="cursor-car-antenna" />
          <path d="M34 83 C39 80 47 80 52 83" className="cursor-car-glass-shine" />
        </svg>
      </div>
    </div>
  )
}
