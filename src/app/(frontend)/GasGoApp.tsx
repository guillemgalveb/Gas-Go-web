'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import dynamic from 'next/dynamic'
import { SplashCursorCar } from './SplashCursorCar'

const StationMap = dynamic(() => import('./StationMap'), {
  loading: () => <div className="station-map-placeholder">Preparando el mapa de España…</div>,
  ssr: false,
})

const Services3D = dynamic(() => import('./Services3D'), {
  loading: () => <div className="services-page-placeholder">Preparando la experiencia 3D…</div>,
  ssr: false,
})

type Page =
  | 'inicio'
  | 'servicios'
  | 'ecosistema'
  | 'estaciones'
  | 'nosotros'
  | 'equipo'
  | 'acceso'
  | 'registro'

const experiences = [
  {
    name: 'GAS&GO',
    type: 'App del conductor',
    description: 'Repostaje y recarga conectados, desde la identificación hasta el pago.',
    href: 'https://rbayes-upc.github.io/GAS-GO/',
    simulator: {
      label: 'Surtidor virtual',
      href: 'https://rbayes-upc.github.io/GAS-GO/surtidor-demo.html',
    },
  },
  {
    name: 'TAKE&GO',
    type: 'App del cliente',
    description: 'Una experiencia de compra ágil, sin pasar por caja.',
    href: 'https://rbayes-upc.github.io/GAS-GO/take-go/',
    simulator: {
      label: 'Tienda virtual',
      href: 'https://rbayes-upc.github.io/GAS-GO/take-go/tienda.html',
    },
  },
  {
    name: 'Service&Go',
    type: 'App del cliente',
    description: 'Inflado de neumáticos y autolavado directamente desde el box.',
    href: 'https://rbayes-upc.github.io/GAS-GO/service-go/',
    simulator: {
      label: 'Simulador de equipos',
      href: 'https://rbayes-upc.github.io/GAS-GO/service-go/equipo.html',
    },
  },
  {
    name: 'Dashboard',
    type: 'Centro de control',
    description: 'Métricas, operaciones e incidencias con datos de demostración.',
    href: 'https://rbayes-upc.github.io/GAS-GO/dashboard/',
  },
]

function Logo({ light = false }: { light?: boolean }) {
  return (
    <button
      className={`logo ${light ? 'logo--light' : ''}`}
      onClick={() => navigate('inicio')}
      aria-label="Ir al inicio"
    >
      <img src="/gasandgo-logo.png" alt="Gas&Go" />
    </button>
  )
}

function navigate(page: Page) {
  window.location.hash = page === 'inicio' ? '' : page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Header({ page }: { page: Page }) {
  const [open, setOpen] = useState(false)
  const go = (target: Page) => {
    navigate(target)
    setOpen(false)
  }
  return (
    <header className="header">
      <Logo />
      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <span />
        <span />
      </button>
      <nav className={open ? 'nav nav--open' : 'nav'}>
        <button
          className={`nav-selected-color ${page === 'servicios' ? 'active' : ''}`}
          onClick={() => go('servicios')}
        >
          Servicios
        </button>
        <button
          className={`nav-selected-color ${page === 'ecosistema' ? 'active' : ''}`}
          onClick={() => go('ecosistema')}
        >
          Ecosistema
        </button>
        <button
          className={`nav-selected-color ${page === 'estaciones' ? 'active' : ''}`}
          onClick={() => go('estaciones')}
        >
          Estaciones
        </button>
        <button
          className={`nav-selected-color ${page === 'nosotros' ? 'active' : ''}`}
          onClick={() => go('nosotros')}
        >
          Qué ofrecemos
        </button>
        <button
          className={`nav-selected-color ${page === 'equipo' ? 'active' : ''}`}
          onClick={() => go('equipo')}
        >
          Quiénes somos
        </button>
        <button className="nav-login nav-selected-color" onClick={() => go('acceso')}>
          Iniciar sesión
        </button>
        <button className="button button--small" onClick={() => go('registro')}>
          Hazte cliente <span>→</span>
        </button>
      </nav>
    </header>
  )
}

function SearchBox({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate('estaciones')
  }
  return (
    <form className={compact ? 'search search--compact' : 'search'} onSubmit={submit}>
      <div className="search-label">
        <span className="pin">●</span>
        <div>
          <small>¿Dónde estás?</small>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ciudad, calle o código postal"
            aria-label="Ubicación"
          />
        </div>
      </div>
      <button className="button" type="submit">
        Buscar estación <span>→</span>
      </button>
    </form>
  )
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const hasClickedLogo = useRef(false)
  const hintTimeout = useRef<number | null>(null)
  const menuItems: Array<{ label: string; page: Page; className: string }> = [
    { label: 'Estaciones', page: 'estaciones', className: 'splash-link--one' },
    { label: 'Qué ofrecemos', page: 'nosotros', className: 'splash-link--two' },
    { label: 'Iniciar sesión', page: 'acceso', className: 'splash-link--three' },
    { label: 'Hazte cliente', page: 'registro', className: 'splash-link--four' },
    { label: 'Quiénes somos', page: 'equipo', className: 'splash-link--five' },
    { label: 'Ecosistema', page: 'ecosistema', className: 'splash-link--six' },
    { label: 'Servicios', page: 'servicios', className: 'splash-link--seven' },
  ]

  useEffect(() => {
    const showHint = () => {
      if (hasClickedLogo.current) return

      setHintVisible(true)
      if (hintTimeout.current) window.clearTimeout(hintTimeout.current)
      hintTimeout.current = window.setTimeout(() => setHintVisible(false), 4200)
    }

    const inactivityTimeout = window.setTimeout(showHint, 10000)
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > 2) showHint()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(event.key)) showHint()
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('scroll', showHint, { passive: true })
    window.addEventListener('touchmove', showHint, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(inactivityTimeout)
      if (hintTimeout.current) window.clearTimeout(hintTimeout.current)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', showHint)
      window.removeEventListener('touchmove', showHint)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleMenu = () => {
    hasClickedLogo.current = true
    setHintVisible(false)
    if (hintTimeout.current) window.clearTimeout(hintTimeout.current)
    setMenuOpen((open) => !open)
  }

  return (
    <main className={`splash ${menuOpen ? 'splash--open' : ''}`}>
      <SplashCursorCar />
      <nav className="splash-menu" aria-label="Navegación principal">
        {menuItems.map((item) => (
          <button
            className={`splash-link ${item.className}`}
            key={item.page}
            onClick={() => navigate(item.page)}
            tabIndex={menuOpen ? 0 : -1}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="splash-center">
        <button
          className="splash-logo"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <img src="/gasandgo-home-logo.png" alt="Gas&Go" />
        </button>
        <AnimatePresence>
          {hintVisible && !menuOpen && (
            <motion.div
              className="splash-hint"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true" />
              Haz clic en el logo para descubrir Gas&amp;Go
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function Ecosystem() {
  return (
    <main className="experience-page">
      <section className="experience-intro">
        <span className="eyebrow">Ecosistema GAS&amp;GO</span>
        <h1>
          Una entrada.
          <br />
          Cuatro experiencias.
        </h1>
        <p>
          Accede a cada producto o abre directamente su simulador para recorrer la experiencia
          completa.
        </p>
      </section>
      <section className="experience-grid" aria-label="Aplicaciones de Gas&Go">
        {experiences.map((experience, index) => (
          <article className="experience-card" key={experience.name}>
            <div className="experience-card__heading">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <small>{experience.type}</small>
            </div>
            <div>
              <h2>{experience.name}</h2>
              <p>{experience.description}</p>
            </div>
            <div className="experience-card__actions">
              <a href={experience.href} target="_blank" rel="noreferrer">
                Abrir app <span aria-hidden="true">↗</span>
              </a>
              {experience.simulator && (
                <a
                  className="experience-card__secondary"
                  href={experience.simulator.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {experience.simulator.label} <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function Stations() {
  return (
    <main className="inner-page">
      <section className="page-intro">
        <span className="eyebrow">Comparador inteligente</span>
        <h1>
          Elige la mejor parada,
          <br />
          no solo la más cercana.
        </h1>
        <p>
          Compara combustible y recarga por precio, distancia, ocupación y tiempo total estimado.
        </p>
        <div className="official-data-badge">
          <span /> Estaciones y precios del Geoportal oficial
        </div>
      </section>
      <StationMap />
    </main>
  )
}

function FlowSlider() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const reduceMotion = useReducedMotion()
  const sliderRef = useRef<HTMLDivElement>(null)
  const cooldown = useRef(false)
  const touchStartY = useRef(0)
  const slides = [
    {
      tag: 'Llegada',
      title: 'Llega a la estación',
      caption: 'Tu llegada activa una experiencia conectada desde el primer momento.',
    },
    {
      tag: 'Identificación',
      title: 'Te reconocemos',
      caption: 'El sistema verifica la matrícula y valida tu cuenta Gas&Go.',
    },
    {
      tag: 'Conexión',
      title: 'Seleccionamos el surtidor',
      caption: 'La app vincula automáticamente el surtidor correcto mediante Bluetooth.',
    },
    {
      tag: 'Autorización',
      title: 'Preautorización segura',
      caption: 'Se comprueba la disponibilidad del método de pago antes de activar el suministro.',
    },
    {
      tag: 'Repostaje',
      title: 'Reposta sin esperas',
      caption: 'El surtidor se activa y puedes comenzar el repostaje.',
    },
    {
      tag: 'Pago',
      title: 'Pago automático',
      caption: 'El cargo inicial se ajusta al consumo real al terminar.',
    },
    {
      tag: 'Resumen',
      title: 'Recibe tu resumen',
      caption: 'Importe, vehículo y operación quedan disponibles en tu historial.',
    },
    {
      tag: 'Salida',
      title: 'Continúa tu camino',
      caption: 'Terminas de forma rápida, cómoda y segura.',
    },
  ]

  const changeSlide = useCallback((next: number, nextDirection: number) => {
    if (cooldown.current) return
    cooldown.current = true
    setDirection(nextDirection)
    setActiveSlide(next)
    window.setTimeout(() => {
      cooldown.current = false
    }, 620)
  }, [])

  useEffect(() => {
    const section = sliderRef.current
    if (!section) return
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8 || cooldown.current) {
        return
      }
      if (event.deltaY > 0 && activeSlide < slides.length - 1) {
        event.preventDefault()
        changeSlide(activeSlide + 1, 1)
      } else if (event.deltaY < 0 && activeSlide > 0) {
        event.preventDefault()
        changeSlide(activeSlide - 1, -1)
      }
    }
    section.addEventListener('wheel', handleWheel, { passive: false })
    return () => section.removeEventListener('wheel', handleWheel)
  }, [activeSlide, changeSlide, slides.length])

  const textVariants = {
    enter: (moveDirection: number) => ({
      y: moveDirection > 0 ? 34 : -34,
      opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: (moveDirection: number) => ({
      y: moveDirection > 0 ? -34 : 34,
      opacity: 0,
    }),
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' && activeSlide < slides.length - 1) {
      event.preventDefault()
      changeSlide(activeSlide + 1, 1)
    }
    if (event.key === 'ArrowUp' && activeSlide > 0) {
      event.preventDefault()
      changeSlide(activeSlide - 1, -1)
    }
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const distance = touchStartY.current - event.changedTouches[0].clientY
    if (Math.abs(distance) < 35) return
    if (distance > 0 && activeSlide < slides.length - 1) changeSlide(activeSlide + 1, 1)
    if (distance < 0 && activeSlide > 0) changeSlide(activeSlide - 1, -1)
  }

  return (
    <section className="flow-slider" aria-label="Flujo de repostaje con Gas&Go">
      <div className="flow-shell">
        <div className="flow-heading">
          <div>
            <span className="eyebrow">Paso a paso</span>
            <h2>Así es repostar con Gas&amp;Go.</h2>
          </div>
          <p>
            Ocho momentos conectados. Desplázate sobre las imágenes para recorrer la experiencia.
          </p>
        </div>

        <div className="flow-editorial-stage">
          <div className="flow-copy flow-copy--left" aria-live="polite">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={activeSlide}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduceMotion ? 0.01 : 0.38, ease: [0.4, 0, 0.2, 1] }}
              >
                <span>{String(activeSlide + 1).padStart(2, '0')}</span>
                <h3>{slides[activeSlide].title}</h3>
                <p>{slides[activeSlide].caption}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="flow-reel"
            ref={sliderRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onTouchStart={(event) => {
              touchStartY.current = event.touches[0].clientY
            }}
            onTouchEnd={handleTouchEnd}
            aria-label="Carrusel de pasos. Usa la rueda, desliza o pulsa las flechas arriba y abajo."
          >
            <div className="flow-thread" aria-hidden="true" />
            <div className="flow-reel-cards">
              {slides.map((slide, index) => {
                const relativePosition = index - activeSlide
                const distance = Math.abs(relativePosition)
                return (
                  <motion.button
                    className={`flow-reel-card ${distance === 0 ? 'flow-reel-card--active' : ''}`}
                    type="button"
                    key={slide.title}
                    initial={false}
                    animate={{
                      opacity: distance > 2 ? 0 : distance === 0 ? 1 : distance === 1 ? 0.62 : 0.18,
                      rotate: relativePosition * (distance === 1 ? 2.4 : 1.4),
                      scale: distance === 0 ? 1 : distance === 1 ? 0.86 : 0.74,
                      x: relativePosition === 0 ? 0 : relativePosition % 2 === 0 ? 13 : -13,
                      y: `${relativePosition * 116}%`,
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0.01 }
                        : { type: 'spring', stiffness: 135, damping: 22, mass: 0.85 }
                    }
                    onClick={() =>
                      distance > 0 && changeSlide(index, relativePosition > 0 ? 1 : -1)
                    }
                    tabIndex={distance <= 1 ? 0 : -1}
                    aria-label={`Ir al paso ${index + 1}: ${slide.title}`}
                    style={{
                      pointerEvents: distance <= 1 ? 'auto' : 'none',
                      zIndex: slides.length - distance,
                    }}
                  >
                    <img src={`/flow/step-${index + 1}.png`} alt="" />
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </motion.button>
                )
              })}
            </div>
            <div className="flow-reel-scroll" aria-hidden="true">
              <span>
                <i />
              </span>
              <small>
                {activeSlide === slides.length - 1 ? 'Continúa bajando' : 'Scroll para avanzar'}
              </small>
            </div>
          </div>

          <div className="flow-copy flow-copy--right" aria-live="polite">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={activeSlide}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduceMotion ? 0.01 : 0.38, ease: [0.4, 0, 0.2, 1] }}
              >
                <small>Repostaje · {slides[activeSlide].tag}</small>
                <h3>Gas&amp;Go</h3>
                <span>
                  {String(activeSlide + 1).padStart(2, '0')} /{' '}
                  {String(slides.length).padStart(2, '0')}
                </span>
              </motion.div>
            </AnimatePresence>
            <div className="flow-index" aria-label="Seleccionar paso">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  className={index === activeSlide ? 'active' : ''}
                  key={slide.title}
                  onClick={() =>
                    index !== activeSlide && changeSlide(index, index > activeSlide ? 1 : -1)
                  }
                  aria-label={`Paso ${index + 1}: ${slide.title}`}
                  aria-current={index === activeSlide ? 'step' : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  const [activePoint, setActivePoint] = useState<number | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const points = [
    {
      title: 'La mejor parada',
      text: 'Compara estaciones por precio, distancia, ocupación y tiempo total estimado antes de iniciar tu ruta.',
      className: 'story-point--route',
    },
    {
      title: 'Identificación segura',
      text: 'Al llegar, Gas&Go reconoce el vehículo vinculado y prepara una autorización segura sin pasos innecesarios.',
      className: 'story-point--vehicle',
    },
    {
      title: 'Repostaje sin esperas',
      text: 'El surtidor queda autorizado para que puedas llegar, repostar y continuar. El objetivo es reducir un 30 % el tiempo total.',
      className: 'story-point--fuel',
    },
    {
      title: 'Pago y fidelización',
      text: 'El cobro se ajusta al importe realmente suministrado y la wallet propone la tarjeta de fidelización compatible.',
      className: 'story-point--store',
    },
    {
      title: 'También en eléctrico',
      text: 'Localiza puntos de recarga, consulta potencia y disponibilidad, y estima el tiempo según la energía que necesitas.',
      className: 'story-point--electric',
    },
  ]

  const moveScene = (event: React.PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current
    if (!scene) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    scene.style.setProperty('--scene-rx', `${-y * 4}deg`)
    scene.style.setProperty('--scene-ry', `${x * 6}deg`)
    scene.style.setProperty('--scene-x', `${x * 18}px`)
    scene.style.setProperty('--scene-y', `${y * 12}px`)
  }

  const resetScene = () => {
    const scene = sceneRef.current
    if (!scene) return
    scene.style.removeProperty('--scene-rx')
    scene.style.removeProperty('--scene-ry')
    scene.style.removeProperty('--scene-x')
    scene.style.removeProperty('--scene-y')
  }

  return (
    <main className="story-page">
      <section className="interactive-story" onPointerMove={moveScene} onPointerLeave={resetScene}>
        <div
          className="station-viewport"
          role="img"
          aria-label="Maqueta tridimensional de una estación Gas&Go con tienda, surtidores y recarga eléctrica"
        >
          <div className="station-orbit station-orbit--outer" aria-hidden="true" />
          <div className="station-orbit station-orbit--inner" aria-hidden="true" />
          <div className="station-diorama" ref={sceneRef} aria-hidden="true">
            <svg className="station-model" viewBox="0 0 960 640">
              <defs>
                <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#57756b" />
                  <stop offset="1" stopColor="#173f36" />
                </linearGradient>
                <linearGradient id="roof" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#dce9df" />
                </linearGradient>
                <linearGradient id="pillar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ffe96a" />
                  <stop offset="0.48" stopColor="#fcda2f" />
                  <stop offset="1" stopColor="#9e7900" />
                </linearGradient>
                <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#a9d8cd" />
                  <stop offset="1" stopColor="#1e6657" />
                </linearGradient>
                <filter id="station-shadow" x="-30%" y="-30%" width="160%" height="180%">
                  <feDropShadow
                    dx="0"
                    dy="24"
                    stdDeviation="18"
                    floodColor="#001b16"
                    floodOpacity=".52"
                  />
                </filter>
                <filter id="roof-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="7"
                    floodColor="#fcda2f"
                    floodOpacity=".42"
                  />
                </filter>
              </defs>

              <g filter="url(#station-shadow)">
                <path d="M85 485 420 612 892 405 554 282Z" fill="url(#ground)" />
                <path d="M85 485 420 612 420 638 85 510Z" fill="#0a2f27" />
                <path d="M420 612 892 405 892 430 420 638Z" fill="#061f1a" />
                <path
                  d="m117 475 318 121 423-186"
                  fill="none"
                  stroke="#fcda2f"
                  strokeWidth="3"
                  strokeDasharray="34 24"
                />
                <path
                  d="m145 431 290 109 380-167"
                  fill="none"
                  stroke="#e8f2ed"
                  strokeOpacity=".55"
                  strokeWidth="2"
                />

                <g className="station-svg-shop">
                  <path
                    d="m586 249 178 65 120-54-179-63Z"
                    fill="url(#roof)"
                    stroke="#fcda2f"
                    strokeWidth="8"
                  />
                  <path d="m586 249 178 65v119l-178-65Z" fill="#075141" />
                  <path d="m764 314 120-54v119l-120 54Z" fill="#033d32" />
                  <path
                    d="m606 280 44 16v76l-44-16Zm57 21 44 16v76l-44-16Zm57 21 28 10v76l-28-10Z"
                    fill="url(#glass)"
                    stroke="#cce2dc"
                    strokeWidth="3"
                  />
                  <text
                    x="664"
                    y="249"
                    fill="#035141"
                    fontSize="18"
                    fontWeight="800"
                    letterSpacing="4"
                    transform="rotate(20 664 249)"
                  >
                    GAS&amp;GO
                  </text>
                </g>

                <g className="station-svg-pillars">
                  <path d="m245 230 18 7v214l-18-7Z" fill="url(#pillar)" />
                  <path d="m263 237 10-5v214l-10 5Z" fill="#8f7108" />
                  <path d="m521 330 18 7v214l-18-7Z" fill="url(#pillar)" />
                  <path d="m539 337 10-5v214l-10 5Z" fill="#8f7108" />
                  <path d="m432 174 16 6v190l-16-6Z" fill="url(#pillar)" />
                  <path d="m448 180 10-5v190l-10 5Z" fill="#8f7108" />
                  <path d="m713 269 16 6v185l-16-6Z" fill="url(#pillar)" />
                  <path d="m729 275 10-5v185l-10 5Z" fill="#8f7108" />
                </g>

                <g className="station-svg-canopy" filter="url(#roof-glow)">
                  <path
                    d="m211 201 349 126 209-92-350-124Z"
                    fill="url(#roof)"
                    stroke="#fcda2f"
                    strokeWidth="9"
                  />
                  <path
                    d="m211 201 349 126v31L211 231Z"
                    fill="#075141"
                    stroke="#fcda2f"
                    strokeWidth="5"
                  />
                  <path
                    d="m560 327 209-92v31l-209 92Z"
                    fill="#023b31"
                    stroke="#d9ad08"
                    strokeWidth="5"
                  />
                  <text
                    x="325"
                    y="216"
                    fill="#035141"
                    fontSize="22"
                    fontWeight="800"
                    letterSpacing="5"
                    transform="rotate(20 325 216)"
                  >
                    GAS&amp;GO
                  </text>
                </g>

                <g className="station-svg-pumps">
                  <g transform="translate(298 354)">
                    <path d="m0 0 36 13v89L0 89Z" fill="#f5f8f4" />
                    <path d="m36 13 17-8v89l-17 8Z" fill="#b8cec5" />
                    <path d="m6 9 24 9v25L6 34Z" fill="#063d32" />
                    <path d="m0 0 36 13 17-8L17-8Z" fill="#fcda2f" />
                  </g>
                  <g transform="translate(402 392)">
                    <path d="m0 0 36 13v89L0 89Z" fill="#f5f8f4" />
                    <path d="m36 13 17-8v89l-17 8Z" fill="#b8cec5" />
                    <path d="m6 9 24 9v25L6 34Z" fill="#063d32" />
                    <path d="m0 0 36 13 17-8L17-8Z" fill="#fcda2f" />
                  </g>
                  <g transform="translate(505 429)">
                    <path d="m0 0 36 13v89L0 89Z" fill="#f5f8f4" />
                    <path d="m36 13 17-8v89l-17 8Z" fill="#b8cec5" />
                    <path d="m6 9 24 9v25L6 34Z" fill="#063d32" />
                    <path d="m0 0 36 13 17-8L17-8Z" fill="#fcda2f" />
                  </g>
                </g>

                <g className="station-svg-car">
                  <path
                    d="m635 489 105 38 82-36-107-38Z"
                    fill="#fcda2f"
                    stroke="#fff3a5"
                    strokeWidth="4"
                  />
                  <path d="m670 477 50 18 40-18-51-18Z" fill="#15463d" />
                  <ellipse cx="663" cy="512" rx="13" ry="8" fill="#081f1a" />
                  <ellipse cx="772" cy="509" rx="13" ry="8" fill="#081f1a" />
                </g>
              </g>
            </svg>
          </div>
          <div className="station-depth-label" aria-hidden="true">
            <span />
            Mueve el cursor para explorar
          </div>
        </div>
        <div className="story-intro">
          <span>Qué ofrecemos</span>
          <h1>
            Descubre otra forma
            <br />
            de repostar.
          </h1>
          <p>Pulsa los puntos para recorrer la experiencia Gas&amp;Go.</p>
        </div>
        <div className="story-points">
          {points.map((point, index) => (
            <button
              className={`story-point ${point.className} ${activePoint === index ? 'story-point--active' : ''}`}
              key={point.title}
              onClick={() => setActivePoint(activePoint === index ? null : index)}
              aria-label={`Descubrir: ${point.title}`}
              aria-expanded={activePoint === index}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <aside
          className={`story-card ${activePoint !== null ? 'story-card--visible' : ''}`}
          aria-live="polite"
        >
          {activePoint !== null && (
            <>
              <span>{String(activePoint + 1).padStart(2, '0')}</span>
              <div>
                <h2>{points[activePoint].title}</h2>
                <p>{points[activePoint].text}</p>
              </div>
              <button onClick={() => setActivePoint(null)} aria-label="Cerrar información">
                ×
              </button>
            </>
          )}
        </aside>
      </section>
      <FlowSlider />
    </main>
  )
}

function Team() {
  return (
    <main className="team-page">
      <section className="team-story">
        <div className="team-copy">
          <span className="eyebrow">Quiénes somos</span>
          <h1>
            Dos apasionados
            <br />
            por el motor.
            <br />
            Una idea en marcha.
          </h1>
          <p className="team-lead">
            Gas&amp;Go es una startup que nace de una experiencia muy cotidiana: dos apasionados por
            el motor se dieron cuenta de cuánto tiempo perdían cada vez que paraban a repostar.
          </p>
          <p>
            No querían cambiar el viaje, sino mejorar esa pausa. Se preguntaron por qué
            identificarse, autorizar el surtidor y pagar seguían siendo acciones separadas cuando la
            tecnología podía unirlas en una experiencia más ágil.
          </p>
          <blockquote>
            “¿Y si repostar pudiera ser tan sencillo como llegar, llenar el depósito y continuar?”
          </blockquote>
        </div>
        <figure className="team-photo">
          <img src="/gasandgo-founders.png" alt="Los dos creadores de Gas&Go" />
          <figcaption>
            <span>Los fundadores</span>
            <strong>El equipo detrás de Gas&amp;Go</strong>
          </figcaption>
        </figure>
        <div className="team-origin">
          <article>
            <span>01</span>
            <h2>Una espera</h2>
            <p>La frustración de tardar más en gestionar el pago que en repostar.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Una pregunta</h2>
            <p>¿Podemos reducir pasos sin renunciar a la seguridad ni a la comodidad?</p>
          </article>
          <article>
            <span>03</span>
            <h2>Una startup</h2>
            <p>Una solución que conecta vehículo, estación y pago para continuar antes el viaje.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

function Auth({ register = false }: { register?: boolean }) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const reduceMotion = useReducedMotion()
  const sweepDirection = register ? 1 : -1

  useEffect(() => {
    setError('')
    setPending(false)
  }, [register])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setPending(true)

    const formData = new FormData(event.currentTarget)
    const body = {
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
    }

    try {
      const response = await fetch(`/api/app-auth/${register ? 'register' : 'login'}`, {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'No se ha podido completar la operación.')
        return
      }

      window.location.assign('/portal')
    } catch {
      setError('No se ha podido conectar con el servidor. Inténtalo de nuevo.')
    } finally {
      setPending(false)
    }
  }

  const sweepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      skewX: direction > 0 ? -2.5 : 2.5,
    }),
    center: { x: 0, skewX: 0 },
    exit: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      skewX: direction > 0 ? 2.5 : -2.5,
    }),
  }

  return (
    <div className="auth-transition-shell">
      <AnimatePresence initial={false} custom={sweepDirection} mode="sync">
        <motion.main
          className={`auth-page ${register ? 'auth-page--register' : 'auth-page--login'}`}
          key={register ? 'register' : 'login'}
          custom={sweepDirection}
          variants={sweepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduceMotion ? 0.01 : 0.72, ease: [0.76, 0, 0.24, 1] }}
        >
          <section className="auth-message">
            <Logo light />
            <div>
              <span className="eyebrow">Área personal</span>
              <h1>{register ? 'Tu próxima parada empieza aquí.' : 'Qué bien verte de nuevo.'}</h1>
              <p>
                {register
                  ? 'Crea tu cuenta y después vincula tu vehículo y método de pago.'
                  : 'Tus vehículos, repostajes, facturas y tarjetas, siempre a mano.'}
              </p>
            </div>
            <small>Gas&amp;Go · Llega, reposta y continúa.</small>
          </section>
          <section className="auth-form">
            <button className="back" onClick={() => navigate('inicio')}>
              ← Volver al inicio
            </button>
            <form onSubmit={submit}>
              <span className="eyebrow">{register ? 'Crea tu cuenta' : 'Accede a tu cuenta'}</span>
              <h2>{register ? 'Hazte cliente' : 'Iniciar sesión'}</h2>
              {register && (
                <label>
                  Nombre completo
                  <input
                    required
                    name="name"
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Tu nombre"
                  />
                </label>
              )}
              <label>
                Correo electrónico
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                />
              </label>
              <label>
                Contraseña
                <input
                  required
                  name="password"
                  type="password"
                  minLength={register ? 8 : 6}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  placeholder={register ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                />
              </label>
              {register && (
                <label className="check">
                  <input required type="checkbox" /> Acepto la política de privacidad y las
                  condiciones de uso.
                </label>
              )}
              <button className="button button--wide" type="submit" disabled={pending}>
                {pending ? 'Procesando…' : register ? 'Crear mi cuenta' : 'Entrar'} <span>→</span>
              </button>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <p className="switch">
                {register ? '¿Ya tienes una cuenta?' : '¿Aún no eres cliente?'}{' '}
                <button type="button" onClick={() => navigate(register ? 'acceso' : 'registro')}>
                  {register ? 'Inicia sesión' : 'Regístrate gratis'}
                </button>
              </p>
            </form>
          </section>
          <motion.div
            className={`auth-sweep-edge auth-sweep-edge--${register ? 'right' : 'left'}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.24, delay: reduceMotion ? 0 : 0.48 }}
            aria-hidden="true"
          />
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

function Footer() {
  return (
    <footer>
      <div>
        <Logo light />
        <p>
          Repostar ágilmente,
          <br />
          sin esperas.
        </p>
      </div>
      <div>
        <b>Gas&Go</b>
        <button onClick={() => navigate('servicios')}>Servicios</button>
        <button onClick={() => navigate('ecosistema')}>Ecosistema</button>
        <button onClick={() => navigate('nosotros')}>Qué ofrecemos</button>
        <button onClick={() => navigate('equipo')}>Quiénes somos</button>
        <button onClick={() => navigate('estaciones')}>Estaciones</button>
        <button>Contacto</button>
      </div>
      <div>
        <b>Ayuda</b>
        <button>Preguntas frecuentes</button>
        <button>Aviso legal</button>
        <button>Privacidad</button>
      </div>
      <div>
        <b>Descarga la app</b>
        <span className="store">Disponible próximamente</span>
      </div>
      <small>© 2025 Gas&amp;Go. Todos los derechos reservados.</small>
    </footer>
  )
}

export default function App() {
  const getPage = (): Page => {
    const value = window.location.hash.slice(1)
    return [
      'servicios',
      'ecosistema',
      'estaciones',
      'nosotros',
      'equipo',
      'acceso',
      'registro',
    ].includes(value)
      ? (value as Page)
      : 'inicio'
  }
  const [page, setPage] = useState<Page>('inicio')
  useEffect(() => {
    const update = () => setPage(getPage())
    update()
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  const auth = page === 'acceso' || page === 'registro'
  return (
    <div className="site">
      {!auth && page !== 'inicio' && <Header page={page} />}
      {page === 'inicio' && <Home />}
      {page === 'servicios' && <Services3D />}
      {page === 'ecosistema' && <Ecosystem />}
      {page === 'estaciones' && <Stations />}
      {page === 'nosotros' && <About />}
      {page === 'equipo' && <Team />}
      {auth && <Auth register={page === 'registro'} />}
      {!auth && page !== 'inicio' && <Footer />}
    </div>
  )
}
