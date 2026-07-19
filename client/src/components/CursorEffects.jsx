import { useEffect, useRef } from 'react';

/**
 * Subtle, desktop-only cursor effects drawn on a single full-screen canvas:
 *  - an eased ambient glow that trails the pointer (adds depth), and
 *  - a fading comet tracer in the accent colors (blue -> teal).
 * Disabled for touch devices and when the user prefers reduced motion.
 */
const CursorEffects = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
    const glow = { x: mouse.x, y: mouse.y };
    const trail = [];
    let lastAdd = 0;

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      const now = performance.now();
      if (now - lastAdd > 14) {
        trail.push({ x: mouse.x, y: mouse.y, t: now });
        lastAdd = now;
      }
    };
    const onLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    const LIFE = 480; // ms a trail point lives
    let raf;

    const render = (now) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      // Eased ambient glow
      glow.x += (mouse.x - glow.x) * 0.09;
      glow.y += (mouse.y - glow.y) * 0.09;
      if (mouse.active) {
        const r = 260;
        const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, r);
        g.addColorStop(0, 'rgba(59,116,245,0.10)');
        g.addColorStop(0.5, 'rgba(23,172,144,0.05)');
        g.addColorStop(1, 'rgba(59,116,245,0)');
        ctx.fillStyle = g;
        ctx.fillRect(glow.x - r, glow.y - r, r * 2, r * 2);
      }

      // Drop expired trail points
      while (trail.length && now - trail[0].t > LIFE) trail.shift();

      // Comet tracer (additive blending for a soft glow)
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const age = (now - p.t) / LIFE; // 0 new -> 1 old
        const fade = 1 - age;
        const t = i / trail.length; // position along tail (0 tail -> 1 head)
        const radius = 0.8 + fade * 3.4 * (0.35 + t);
        const cr = Math.round(59 + (23 - 59) * (1 - t));
        const cg = Math.round(116 + (172 - 116) * (1 - t));
        const cb = Math.round(245 + (144 - 245) * (1 - t));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${fade * 0.5})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright head
      if (mouse.active && trail.length) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(147,187,253,0.85)';
        ctx.arc(mouse.x, mouse.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden lg:block"
    />
  );
};

export default CursorEffects;
