'use client'

import { publicAsset } from '@/lib/public-site'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls, RoundedBox } from '@react-three/drei'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

type PoiId = 1 | 2 | 3 | 4 | 5

type Poi = {
  id: PoiId
  title: string
  description: string
  benefits: string[]
  position: [number, number, number]
  camera: [number, number, number]
  target: [number, number, number]
}

const POIS: Poi[] = [
  {
    id: 1,
    title: 'Identificación inteligente',
    description:
      'La estación reconoce la matrícula y vincula el vehículo con la cuenta de Gas&Go antes de iniciar el servicio.',
    benefits: [
      'Llegada sin fricciones',
      'Vehículo y usuario vinculados',
      'Experiencia personalizada',
    ],
    position: [-4.8, 2.4, 2.5],
    camera: [-7.2, 3.4, 7.2],
    target: [-3.7, 1.1, 1.2],
  },
  {
    id: 2,
    title: 'Autorización y pago automático',
    description:
      'Gas&Go identifica al usuario, autoriza la operación y ajusta el cobro automáticamente al importe real.',
    benefits: ['Autorización segura', 'Pago sin pasar por caja', 'Recibo digital inmediato'],
    position: [-1.3, 2.6, 2.2],
    camera: [1.5, 3.3, 7.2],
    target: [-1.3, 1.3, 1],
  },
  {
    id: 3,
    title: 'Repostaje inteligente',
    description:
      'Surtidores conectados con pantalla, autorización desde la app y seguimiento de cada operación.',
    benefits: ['Menos tiempo detenido', 'Control desde el móvil', 'Historial centralizado'],
    position: [2.3, 2.6, 2.1],
    camera: [5.3, 3.4, 7],
    target: [2.2, 1.2, 0.8],
  },
  {
    id: 4,
    title: 'Take&Go',
    description:
      'Supermercado inteligente para comprar sin pasar por una caja convencional, con pago integrado en la aplicación.',
    benefits: ['Compra autónoma', 'Pago integrado', 'Productos y recibos en la app'],
    position: [0, 3.8, -3.5],
    camera: [0.5, 4, 2.2],
    target: [0, 1.8, -4.5],
  },
  {
    id: 5,
    title: 'Recarga eléctrica',
    description:
      'Identificación, autorización y pago integrados para recargar el vehículo bajo una marquesina dedicada.',
    benefits: ['Disponibilidad en tiempo real', 'Activación inmediata', 'Una sola cuenta Gas&Go'],
    position: [7.2, 2.8, 0.2],
    camera: [11.4, 4.2, 6.2],
    target: [7, 1.3, -0.2],
  },
]

const INITIAL_CAMERA = new THREE.Vector3(14, 7.2, 17)
const INITIAL_TARGET = new THREE.Vector3(0.8, 1.3, -1)

class InitialMeasureResizeObserver {
  private readonly callback: ResizeObserverCallback
  private readonly observer: ResizeObserver
  private initialMeasure: number | null = null

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    this.observer = new ResizeObserver(callback)
  }

  observe(target: Element, options?: ResizeObserverOptions) {
    this.observer.observe(target, options)
    this.initialMeasure = window.setTimeout(() => {
      this.callback([], this as unknown as ResizeObserver)
    }, 0)
  }

  unobserve(target: Element) {
    this.observer.unobserve(target)
  }

  disconnect() {
    if (this.initialMeasure !== null) window.clearTimeout(this.initialMeasure)
    this.observer.disconnect()
  }
}

function NeonBar({
  position,
  scale,
  rotation,
  intensity = 8,
}: {
  position: [number, number, number]
  scale: [number, number, number]
  rotation?: [number, number, number]
  intensity?: number
}) {
  return (
    <RoundedBox args={scale} radius={0.06} smoothness={4} position={position} rotation={rotation}>
      <meshStandardMaterial
        color="#fcda2f"
        emissive="#ffc400"
        emissiveIntensity={intensity}
        toneMapped={false}
      />
    </RoundedBox>
  )
}

function MainCanopy({ highlighted, night }: { highlighted: boolean; night: boolean }) {
  const pillars: [number, number][] = [
    [-4.6, -2.7],
    [0, -2.7],
    [4.6, -2.7],
    [-4.6, 2.7],
    [0, 2.7],
    [4.6, 2.7],
  ]

  return (
    <group position={[-1.4, 0, 0.7]}>
      <RoundedBox args={[11.2, 0.55, 6.8]} radius={0.62} smoothness={8} position={[0, 4.8, 0]}>
        <meshPhysicalMaterial
          color={highlighted ? '#0b735e' : '#092f28'}
          metalness={0.78}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.14}
        />
      </RoundedBox>
      <RoundedBox args={[10.7, 0.12, 6.3]} radius={0.3} smoothness={6} position={[0, 4.48, 0]}>
        <meshStandardMaterial color="#17241f" metalness={0.65} roughness={0.28} />
      </RoundedBox>
      <NeonBar position={[0, 5.1, 3.26]} scale={[10.4, 0.12, 0.12]} intensity={night ? 10 : 3} />
      <NeonBar position={[0, 5.1, -3.26]} scale={[10.4, 0.12, 0.12]} intensity={night ? 10 : 3} />
      <NeonBar position={[-5.32, 5.1, 0]} scale={[0.12, 0.12, 6.35]} intensity={night ? 10 : 3} />
      <NeonBar position={[5.32, 5.1, 0]} scale={[0.12, 0.12, 6.35]} intensity={night ? 10 : 3} />
      <NeonBar position={[0, 4.42, 2.85]} scale={[9.7, 0.08, 0.08]} intensity={night ? 7 : 2} />
      {pillars.map(([x, z]) => (
        <RoundedBox
          key={`${x}-${z}`}
          args={[0.42, 4.45, 0.42]}
          radius={0.08}
          smoothness={4}
          position={[x, 2.25, z]}
        >
          <meshPhysicalMaterial color="#123f35" metalness={0.9} roughness={0.16} clearcoat={0.85} />
        </RoundedBox>
      ))}
      {[-3.3, 0, 3.3].map((x) => (
        <pointLight
          key={x}
          position={[x, 4.25, 0.2]}
          color="#ffd75a"
          intensity={night ? 16 : 5}
          distance={8}
          decay={2}
        />
      ))}
    </group>
  )
}

function SecondaryCanopy({ highlighted, night }: { highlighted: boolean; night: boolean }) {
  return (
    <group position={[7, 0, -0.3]}>
      <RoundedBox args={[5.2, 0.46, 4.6]} radius={0.48} smoothness={8} position={[0, 4.15, 0]}>
        <meshPhysicalMaterial
          color={highlighted ? '#0b735e' : '#0a342c'}
          metalness={0.82}
          roughness={0.18}
          clearcoat={1}
        />
      </RoundedBox>
      <NeonBar position={[0, 4.44, 2.18]} scale={[4.7, 0.1, 0.1]} intensity={night ? 10 : 3} />
      <NeonBar position={[0, 4.44, -2.18]} scale={[4.7, 0.1, 0.1]} intensity={night ? 10 : 3} />
      <NeonBar position={[-2.35, 4.44, 0]} scale={[0.1, 0.1, 4.25]} intensity={night ? 10 : 3} />
      <NeonBar position={[2.35, 4.44, 0]} scale={[0.1, 0.1, 4.25]} intensity={night ? 10 : 3} />
      {[-1.8, 1.8].flatMap((x) =>
        [-1.55, 1.55].map((z) => (
          <RoundedBox
            key={`${x}-${z}`}
            args={[0.34, 3.9, 0.34]}
            radius={0.07}
            smoothness={4}
            position={[x, 2, z]}
          >
            <meshPhysicalMaterial color="#123f35" metalness={0.92} roughness={0.14} />
          </RoundedBox>
        )),
      )}
      <pointLight position={[0, 3.8, 0]} color="#ffd75a" intensity={night ? 13 : 4} distance={7} />
    </group>
  )
}

function FuelPump({
  position,
  highlighted,
}: {
  position: [number, number, number]
  highlighted: boolean
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[0.9, 2.1, 0.62]}
        radius={0.14}
        smoothness={5}
        position={[0, 1.05, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#102f29" metalness={0.76} roughness={0.22} clearcoat={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.63, 0.52, 0.04]} radius={0.06} smoothness={4} position={[0, 1.42, 0.34]}>
        <meshStandardMaterial
          color="#071d18"
          emissive={highlighted ? '#fcda2f' : '#0b5444'}
          emissiveIntensity={highlighted ? 4 : 1.2}
        />
      </RoundedBox>
      <NeonBar
        position={[0, 2.06, 0]}
        scale={[0.72, 0.08, 0.52]}
        intensity={highlighted ? 12 : 7}
      />
      <Line
        points={[
          [0.44, 1.5, 0.1],
          [0.7, 1.2, 0.15],
          [0.65, 0.4, 0.2],
        ]}
        color="#101814"
        lineWidth={3}
      />
      <RoundedBox args={[1.25, 0.1, 0.9]} radius={0.05} position={[0, 0.07, 0]}>
        <meshStandardMaterial color="#233d36" metalness={0.45} roughness={0.35} />
      </RoundedBox>
    </group>
  )
}

function Charger({
  position,
  highlighted,
}: {
  position: [number, number, number]
  highlighted: boolean
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[0.95, 2.35, 0.7]}
        radius={0.26}
        smoothness={7}
        position={[0, 1.2, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#123a32" metalness={0.72} roughness={0.2} clearcoat={1} />
      </RoundedBox>
      <RoundedBox args={[0.7, 2.08, 0.04]} radius={0.2} smoothness={6} position={[0, 1.2, 0.38]}>
        <meshStandardMaterial
          color="#173e35"
          emissive="#fcda2f"
          emissiveIntensity={highlighted ? 8 : 4}
          toneMapped={false}
        />
      </RoundedBox>
      <RoundedBox args={[0.46, 1.82, 0.06]} radius={0.15} smoothness={5} position={[0, 1.2, 0.42]}>
        <meshStandardMaterial color="#102d27" metalness={0.75} roughness={0.18} />
      </RoundedBox>
      <mesh position={[0, 1.45, 0.47]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.55, 0.05]} />
        <meshStandardMaterial
          emissive="#fcda2f"
          emissiveIntensity={10}
          color="#fcda2f"
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Store({ highlighted, night }: { highlighted: boolean; night: boolean }) {
  const shelfRows = [-2.7, -0.9, 0.9, 2.7]

  return (
    <group position={[0.8, 0, -5.3]}>
      <RoundedBox args={[10.5, 0.5, 3.8]} radius={0.42} smoothness={7} position={[0, 4.35, 0]}>
        <meshPhysicalMaterial color="#0b352d" metalness={0.75} roughness={0.2} clearcoat={1} />
      </RoundedBox>
      <NeonBar position={[0, 4.65, 1.75]} scale={[9.9, 0.1, 0.1]} intensity={night ? 8 : 2} />
      <RoundedBox args={[0.45, 4, 3.4]} radius={0.08} position={[-5, 2.1, 0]}>
        <meshStandardMaterial color="#0c3029" metalness={0.72} roughness={0.23} />
      </RoundedBox>
      <RoundedBox args={[0.45, 4, 3.4]} radius={0.08} position={[5, 2.1, 0]}>
        <meshStandardMaterial color="#0c3029" metalness={0.72} roughness={0.23} />
      </RoundedBox>
      <mesh position={[0, 2.1, -1.65]}>
        <boxGeometry args={[9.6, 4, 0.16]} />
        <meshStandardMaterial color="#163c34" roughness={0.42} />
      </mesh>
      <mesh position={[0, 2.05, 1.72]}>
        <boxGeometry args={[9.6, 3.7, 0.08]} />
        <meshPhysicalMaterial
          color={highlighted ? '#d4fff4' : '#6eaa9e'}
          transparent
          opacity={0.3}
          transmission={0.5}
          roughness={0.08}
          metalness={0.05}
          clearcoat={1}
        />
      </mesh>
      {shelfRows.map((x) => (
        <group key={x} position={[x, 1.2, 0]}>
          {[0, 0.65, 1.3].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[1.15, 0.08, 2.15]} />
              <meshStandardMaterial color="#b58a3a" metalness={0.18} roughness={0.5} />
            </mesh>
          ))}
          {[-0.7, 0, 0.7].map((z, index) => (
            <RoundedBox
              key={z}
              args={[0.22, 0.38 + index * 0.08, 0.2]}
              radius={0.03}
              position={[0, 1.58, z]}
            >
              <meshStandardMaterial color={index % 2 ? '#fcda2f' : '#e68b52'} roughness={0.45} />
            </RoundedBox>
          ))}
        </group>
      ))}
      <Html position={[-2.6, 3.55, 1.82]} transform distanceFactor={3.5}>
        <div className="services-store-logo services-store-logo--gas">
          <Image src={publicAsset('/gasandgo-logo.png')} alt="Gas&Go" width={280} height={116} unoptimized />
        </div>
      </Html>
      <Html position={[3.55, 2.95, 1.82]} transform distanceFactor={3.5}>
        <div className="services-store-logo services-store-logo--take">
          <Image src={publicAsset('/takeandgo-logo.png')} alt="Take&Go" width={110} height={110} unoptimized />
        </div>
      </Html>
      <pointLight
        position={[0, 3.2, 0.8]}
        color="#ffd48a"
        intensity={night ? 20 : 7}
        distance={9}
      />
      {[-3.4, -1.2, 1.2, 3.4].map((x) => (
        <pointLight
          key={x}
          position={[x, 3.6, 0]}
          color="#ffe1a0"
          intensity={night ? 5 : 2}
          distance={4}
        />
      ))}
    </group>
  )
}

function Car({
  position,
  rotation = 0,
  color = '#193f37',
}: {
  position: [number, number, number]
  rotation?: number
  color?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox
        args={[3.3, 0.72, 1.48]}
        radius={0.38}
        smoothness={8}
        position={[0, 0.72, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.84}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </RoundedBox>
      <RoundedBox args={[1.75, 0.58, 1.3]} radius={0.28} smoothness={7} position={[-0.15, 1.28, 0]}>
        <meshPhysicalMaterial color="#0a2520" metalness={0.55} roughness={0.08} clearcoat={1} />
      </RoundedBox>
      {[-1.08, 1.08].flatMap((x) =>
        [-0.76, 0.76].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.47, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.22, 24]} />
            <meshStandardMaterial color="#07110f" metalness={0.38} roughness={0.42} />
          </mesh>
        )),
      )}
      <NeonBar position={[-1.64, 0.8, 0]} scale={[0.05, 0.14, 0.95]} intensity={4} />
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[1.5, 0.45, 1.5]} radius={0.18} position={[0, 0.25, 0]} receiveShadow>
        <meshPhysicalMaterial color="#153a31" metalness={0.38} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 3.2, 10]} />
        <meshStandardMaterial color="#685136" roughness={0.75} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[(i % 2 ? 0.45 : -0.38) * (i ? 1 : 0), 3.1 + (i % 2) * 0.35, (i - 1.5) * 0.28]}
          castShadow
        >
          <icosahedronGeometry args={[0.9 - i * 0.06, 2]} />
          <meshStandardMaterial
            color={i % 2 ? '#0e6a50' : '#174f3e'}
            emissive="#0a5a42"
            emissiveIntensity={0.18}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

function PointOfInterest({
  poi,
  selected,
  onSelect,
  onHover,
}: {
  poi: Poi
  selected: boolean
  onSelect: (id: PoiId) => void
  onHover: (id: PoiId | null) => void
}) {
  return (
    <Html position={poi.position} center distanceFactor={9} zIndexRange={[20, 0]}>
      <button
        className={`services-poi ${selected ? 'services-poi--active' : ''}`}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(poi.id)
        }}
        onPointerEnter={() => onHover(poi.id)}
        onPointerLeave={() => onHover(null)}
        aria-label={`${String(poi.id).padStart(2, '0')} — ${poi.title}`}
      >
        {String(poi.id).padStart(2, '0')}
      </button>
    </Html>
  )
}

function CameraControls({
  active,
  resetSignal,
  onExplore,
}: {
  active: Poi | null
  resetSignal: number
  onExplore: () => void
}) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const [transitioning, setTransitioning] = useState(true)
  const [explored, setExplored] = useState(false)
  const desiredPosition = useMemo(
    () => new THREE.Vector3(...(active?.camera ?? INITIAL_CAMERA.toArray())),
    [active],
  )
  const desiredTarget = useMemo(
    () => new THREE.Vector3(...(active?.target ?? INITIAL_TARGET.toArray())),
    [active],
  )

  useEffect(() => {
    setTransitioning(true)
  }, [active, resetSignal])

  useFrame((_, delta) => {
    if (!transitioning || !controls.current) return
    const alpha = 1 - Math.exp(-delta * 2.6)
    camera.position.lerp(desiredPosition, alpha)
    controls.current.target.lerp(desiredTarget, alpha)
    controls.current.update()
    if (
      camera.position.distanceTo(desiredPosition) < 0.04 &&
      controls.current.target.distanceTo(desiredTarget) < 0.04
    ) {
      setTransitioning(false)
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.055}
      minDistance={5}
      maxDistance={30}
      minPolarAngle={0.28}
      maxPolarAngle={Math.PI / 2.08}
      enablePan
      panSpeed={0.72}
      rotateSpeed={0.55}
      zoomSpeed={0.75}
      autoRotate={!explored && !active && !transitioning}
      autoRotateSpeed={0.22}
      onStart={() => {
        setExplored(true)
        setTransitioning(false)
        onExplore()
      }}
    />
  )
}

function StationScene({
  active,
  hovered,
  night,
  resetSignal,
  onSelect,
  onHover,
  onExplore,
}: {
  active: Poi | null
  hovered: PoiId | null
  night: boolean
  resetSignal: number
  onSelect: (id: PoiId) => void
  onHover: (id: PoiId | null) => void
  onExplore: () => void
}) {
  const highlighted = hovered ?? active?.id ?? null

  return (
    <>
      <color attach="background" args={[night ? '#021c17' : '#b8d8cf']} />
      <fog attach="fog" args={[night ? '#021c17' : '#b8d8cf', 17, 42]} />
      <ambientLight intensity={night ? 0.34 : 1.35} color={night ? '#68a899' : '#ffffff'} />
      <hemisphereLight args={[night ? '#0b6d59' : '#c9eeea', '#071a16', night ? 0.6 : 1.8]} />
      <directionalLight
        castShadow
        position={[-8, 14, 10]}
        intensity={night ? 2.8 : 4.5}
        color={night ? '#b5fff0' : '#fff8df'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={45}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={16}
        shadow-camera-bottom={-14}
      />
      <rectAreaLight
        intensity={night ? 8 : 4}
        color={night ? '#0b705a' : '#ffffff'}
        position={[0, 10, -10]}
        width={18}
        height={8}
        rotation={[Math.PI / 4, 0, 0]}
      />

      <RoundedBox
        args={[29, 0.35, 19]}
        radius={0.42}
        smoothness={6}
        position={[1, -0.28, 0]}
        receiveShadow
      >
        <meshPhysicalMaterial
          color={night ? '#0a211c' : '#6f8881'}
          metalness={night ? 0.62 : 0.24}
          roughness={night ? 0.16 : 0.48}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </RoundedBox>
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, -0.08, 6.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.1, 0.08]} />
          <meshBasicMaterial color="#fcda2f" />
        </mesh>
      ))}

      <Store highlighted={highlighted === 4} night={night} />
      <MainCanopy highlighted={[1, 2, 3].includes(highlighted ?? 0)} night={night} />
      <SecondaryCanopy highlighted={highlighted === 5} night={night} />

      <FuelPump position={[-5, 0, 1]} highlighted={highlighted === 1} />
      <FuelPump position={[-1.5, 0, 1]} highlighted={highlighted === 2} />
      <FuelPump position={[2, 0, 1]} highlighted={highlighted === 3} />
      <Charger position={[6, 0, 0.2]} highlighted={highlighted === 5} />
      <Charger position={[8, 0, 0.2]} highlighted={highlighted === 5} />

      <Car position={[-4.4, 0, 3.8]} rotation={-0.05} color="#203f39" />
      <Car position={[7.2, 0, 2.8]} rotation={0.08} color="#0e5446" />
      <Car position={[1.8, 0, 6.1]} rotation={Math.PI} color="#273a36" />

      <Tree position={[-8.2, 0, -4]} scale={0.85} />
      <Tree position={[7.5, 0, -5.2]} scale={0.92} />
      <Tree position={[11, 0, -2.8]} scale={0.75} />
      <Tree position={[-10, 0, 2]} scale={0.66} />

      {POIS.map((poi) => (
        <PointOfInterest
          key={poi.id}
          poi={poi}
          selected={active?.id === poi.id}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
      <CameraControls active={active} resetSignal={resetSignal} onExplore={onExplore} />
    </>
  )
}

function LoadingScene() {
  return (
    <div className="services-loading">
      <span />
      <p>Preparando la estación Gas&amp;Go</p>
    </div>
  )
}

export default function Services3D() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeId, setActiveId] = useState<PoiId | null>(null)
  const [hovered, setHovered] = useState<PoiId | null>(null)
  const [night, setNight] = useState(true)
  const [resetSignal, setResetSignal] = useState(0)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const active = POIS.find((poi) => poi.id === activeId) ?? null

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      setWebgl(Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')))
    } catch {
      setWebgl(false)
    }
  }, [])

  const resetView = () => {
    setActiveId(null)
    setHovered(null)
    setResetSignal((value) => value + 1)
  }

  const toggleFullscreen = async () => {
    if (!sectionRef.current) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await sectionRef.current.requestFullscreen()
    }
  }

  return (
    <section className="services-experience" ref={sectionRef}>
      <div className="services-copy">
        <span>Nuestros servicios</span>
        <h1>Descubre la estación de servicio del futuro.</h1>
        <p>
          Explora el ecosistema Gas&amp;Go y descubre una nueva forma de repostar, recargar y
          comprar.
        </p>
      </div>

      <div className="services-canvas" aria-label="Estación Gas&Go tridimensional e interactiva">
        {webgl === null && <LoadingScene />}
        {webgl === false && (
          <div className="services-fallback">
            <Image
              src={publicAsset('/gasandgo-station-reference.png')}
              alt="Estación de servicio Gas&Go de noche"
              fill
              sizes="100vw"
              priority
              unoptimized
            />
            <div className="services-fallback-points">
              {POIS.map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => setActiveId(poi.id)}
                  aria-label={`${String(poi.id).padStart(2, '0')} — ${poi.title}`}
                >
                  {String(poi.id).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}
        {webgl && (
          <Canvas
            shadows
            dpr={[1, 1.6]}
            resize={{
              scroll: false,
              debounce: 0,
              polyfill: InitialMeasureResizeObserver as unknown as typeof ResizeObserver,
            }}
            camera={{ position: INITIAL_CAMERA.toArray(), fov: 42, near: 0.1, far: 100 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = night ? 1.05 : 0.9
              gl.outputColorSpace = THREE.SRGBColorSpace
            }}
          >
            <StationScene
              active={active}
              hovered={hovered}
              night={night}
              resetSignal={resetSignal}
              onSelect={setActiveId}
              onHover={setHovered}
              onExplore={() => undefined}
            />
          </Canvas>
        )}
      </div>

      <div className="services-controls" aria-label="Controles de la escena">
        <button onClick={resetView} aria-label="Recuperar perspectiva inicial">
          <span aria-hidden="true">↺</span>
          Vista general
        </button>
        <button onClick={() => setNight((value) => !value)} aria-label="Cambiar iluminación">
          <span aria-hidden="true">{night ? '☼' : '◐'}</span>
          {night ? 'Modo día' : 'Modo noche'}
        </button>
        <button onClick={toggleFullscreen} aria-label="Activar pantalla completa">
          <span aria-hidden="true">⛶</span>
          Pantalla completa
        </button>
      </div>

      <div className="services-instruction">Arrastra para explorar · Pulsa para descubrir</div>

      {active && (
        <aside className="services-info" aria-live="polite">
          <div className="services-info__number">{String(active.id).padStart(2, '0')}</div>
          <button
            className="services-info__close"
            onClick={resetView}
            aria-label="Volver a la vista general"
          >
            ×
          </button>
          <span>Servicio Gas&amp;Go</span>
          <h2>{active.title}</h2>
          <p>{active.description}</p>
          <ul>
            {active.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <button className="services-info__back" onClick={resetView}>
            ← Volver a la vista general
          </button>
        </aside>
      )}
    </section>
  )
}
