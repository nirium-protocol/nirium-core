'use client';

/**
 * Custom 2D-canvas particle field for the homepage hero - no particle
 * library, same technique stellar.org uses for its own hero (verified by
 * downloading and reading their real JS/CSS on 2026-10-09, not guessed):
 * plain `getContext('2d')`, Float32Array particle state, a pre-rendered
 * radial-gradient glow sprite blitted per particle instead of redrawing a
 * live gradient every frame, device-adaptive particle count, and the
 * animation loop paused via IntersectionObserver + visibilitychange.
 *
 * Scroll sync reuses Framer Motion (already a dependency here) instead of a
 * hand-rolled scroll listener: useScroll + useTransform compute how far the
 * viewport has moved past the hero and write it to `--hero-progress`, which
 * a plain CSS opacity on the canvas's wrapper consumes - same split stellar.org
 * uses (--panel-progress drives CSS, the canvas itself never reads it).
 *
 * Scope, confirmed 2026-10-09: hero only. No second "orbiting cloud" canvas
 * yet - that's a separate piece for later, not built here.
 */

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

type RGB = { r: number; g: number; b: number };
type Theme = 'dark' | 'light';

// El sprite anterior era un degradado radial de punta a punta (sin nucleo) a
// 20-56px: sobre negro se lee como brillo, sobre blanco como mancha. El nuevo
// es un nucleo solido y nitido con un halo corto que decae rapido, y la
// paleta cambia por tema: sobre blanco, teal/dorado mas profundos y menos
// saturados (los de marca puros se ven a stock contra fondo claro).
const PALETTE: Record<Theme, { teal: RGB; gold: RGB }> = {
    dark: { teal: { r: 45, g: 235, b: 232 }, gold: { r: 255, g: 200, b: 0 } },   // #2DEBE8 / #FFC800
    light: { teal: { r: 14, g: 140, b: 138 }, gold: { r: 196, g: 140, b: 20 } }, // #0E8C8A / #C48C14
};

// Sprite a resolucion alta y solo se dibuja reducido (nunca ampliado), para
// que el nucleo conserve el borde nitido.
const SPRITE_SIZE = 64;
const CORE_R = 6;   // radio del nucleo dentro del sprite
const HALO_R = 30;  // radio exterior del halo dentro del sprite

function buildSprite(color: RGB): HTMLCanvasElement {
    const sprite = document.createElement('canvas');
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const ctx = sprite.getContext('2d');
    if (!ctx) return sprite;
    const mid = SPRITE_SIZE / 2;
    const rgb = `${color.r},${color.g},${color.b}`;

    // Halo: arranca en el borde del nucleo y cae casi exponencial.
    const halo = ctx.createRadialGradient(mid, mid, CORE_R * 0.8, mid, mid, HALO_R);
    halo.addColorStop(0, `rgba(${rgb},0.40)`);
    halo.addColorStop(0.12, `rgba(${rgb},0.16)`);
    halo.addColorStop(0.35, `rgba(${rgb},0.05)`);
    halo.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

    // Nucleo solido.
    ctx.beginPath();
    ctx.arc(mid, mid, CORE_R, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},1)`;
    ctx.fill();
    return sprite;
}

function buildSprites(theme: Theme): HTMLCanvasElement[] {
    const { teal, gold } = PALETTE[theme];
    return [teal, teal, teal, gold].map(buildSprite); // teal dominante, dorado de acento
}

function currentTheme(): Theme {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

// Escalado corto a proposito (9-oct-2026): la version anterior tenia 110 en
// desktop y competia con el titular.
function particleCount(): number {
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 768;
    return coarse || narrow ? 22 : 40;
}

// Dos capas: polvo casi invisible (la mayoria) y un punado en primer plano,
// mas grande, mas opaco y un poco mas rapido (paralaje). Todas derivan hacia
// la misma direccion general (arriba y levemente a la derecha) con una
// variacion chica por particula: polvo flotando, no ruido.
const FOREGROUND_SHARE = 0.15;
const DRIFT_ANGLE = -75 * (Math.PI / 180);
const DRIFT_JITTER = 0.25; // radianes, +- por particula
// Sobre blanco el mismo alfa pesa mas que sobre negro.
const THEME_ALPHA: Record<Theme, number> = { dark: 1, light: 0.85 };

export default function HeroParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    // Scroll sync: 0 at the top of the hero, 1 once it's fully scrolled past.
    // Mirrors stellar.org's --panel-progress pattern for this single panel.
    const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end start'] });
    const heroProgress = useTransform(scrollYProgress, [0, 1], [1, 0]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        const wrapperEl = wrapperRef.current;
        if (!canvasEl || !wrapperEl || prefersReducedMotion) return;
        const ctx2d = canvasEl.getContext('2d');
        if (!ctx2d) return;
        // Non-null locals so the resize/tick closures below don't need TS to
        // re-narrow a ref read through a nested function every call.
        const canvas = canvasEl;
        const wrapper = wrapperEl;
        const ctx = ctx2d;

        let sprites = buildSprites(currentTheme());
        let themeAlpha = THEME_ALPHA[currentTheme()];
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        // Tamano en pantalla del sprite completo por cada px de diametro de nucleo.
        const spriteScale = SPRITE_SIZE / (CORE_R * 2);

        let width = 0;
        let height = 0;
        let count = particleCount();
        let x = new Float32Array(count);
        let y = new Float32Array(count);
        let vx = new Float32Array(count);
        let vy = new Float32Array(count);
        let radius = new Float32Array(count);
        let alpha = new Float32Array(count);
        let sprite = new Uint8Array(count);

        function seed() {
            count = particleCount();
            x = new Float32Array(count);
            y = new Float32Array(count);
            vx = new Float32Array(count);
            vy = new Float32Array(count);
            radius = new Float32Array(count);
            alpha = new Float32Array(count);
            sprite = new Uint8Array(count);
            for (let i = 0; i < count; i++) {
                const foreground = Math.random() < FOREGROUND_SHARE;
                const speed = foreground ? 0.14 + Math.random() * 0.06 : 0.05 + Math.random() * 0.05;
                const angle = DRIFT_ANGLE + (Math.random() - 0.5) * 2 * DRIFT_JITTER;
                x[i] = Math.random() * width;
                y[i] = Math.random() * height;
                vx[i] = Math.cos(angle) * speed;
                vy[i] = Math.sin(angle) * speed;
                // diametro del nucleo en px de pantalla
                radius[i] = foreground ? 3 + Math.random() : 1.5 + Math.random();
                alpha[i] = foreground ? 0.45 + Math.random() * 0.2 : 0.15 + Math.random() * 0.2;
                sprite[i] = Math.floor(Math.random() * sprites.length);
            }
        }

        function resize() {
            const rect = wrapper.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        }

        let raf = 0;
        let running = true;

        function tick() {
            if (!running) return;
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < count; i++) {
                x[i] += vx[i];
                y[i] += vy[i];
                if (x[i] < -24) x[i] = width + 24;
                if (x[i] > width + 24) x[i] = -24;
                if (y[i] < -24) y[i] = height + 24;
                if (y[i] > height + 24) y[i] = -24;
                const d = radius[i] * spriteScale;
                ctx.globalAlpha = alpha[i] * themeAlpha;
                ctx.drawImage(sprites[sprite[i]], x[i] - d / 2, y[i] - d / 2, d, d);
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(tick);
        }

        function start() {
            if (raf) return;
            raf = requestAnimationFrame(tick);
        }
        function stop() {
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
        }

        resize();
        start();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(wrapper);

        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                const visible = entries[0]?.isIntersecting ?? true;
                if (visible && document.visibilityState === 'visible') start();
                else stop();
            },
            { threshold: 0 }
        );
        intersectionObserver.observe(wrapper);

        function onVisibilityChange() {
            if (document.visibilityState === 'hidden') stop();
            else start();
        }
        document.addEventListener('visibilitychange', onVisibilityChange);

        // El toggle de tema solo cambia data-theme en <html>; se reconstruyen
        // los sprites sin re-sembrar, asi las particulas no saltan de lugar.
        const themeObserver = new MutationObserver(() => {
            const theme = currentTheme();
            sprites = buildSprites(theme);
            themeAlpha = THEME_ALPHA[theme];
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        return () => {
            running = false;
            stop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            themeObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [prefersReducedMotion]);

    return (
        <motion.div
            ref={wrapperRef}
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ opacity: prefersReducedMotion ? 0.35 : heroProgress }}
        >
            {prefersReducedMotion ? (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.1),transparent_60%)]" />
            ) : (
                <canvas ref={canvasRef} className="absolute inset-0" />
            )}
        </motion.div>
    );
}
