import { useMemo } from 'react';

const SpaceBackground = () => {
  // Generate a stable, sparse starfield once per mount.
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() < 0.85 ? 1 : 2,
        delay: Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Deep-space base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% -10%, #0c1424 0%, #070b16 55%, #05070f 100%)',
        }}
      />

      {/* Two restrained nebula glows — space blue + biology teal */}
      <div
        className="absolute -top-32 left-1/4 h-[42rem] w-[42rem] rounded-full blur-3xl animate-float"
        style={{
          background:
            'radial-gradient(circle at center, rgba(59,116,245,0.16) 0%, rgba(59,116,245,0) 68%)',
        }}
      />
      <div
        className="absolute bottom-[-14rem] right-[8%] h-[34rem] w-[34rem] rounded-full blur-3xl animate-float"
        style={{
          background:
            'radial-gradient(circle at center, rgba(23,172,144,0.14) 0%, rgba(23,172,144,0) 70%)',
          animationDelay: '6s',
        }}
      />

      {/* Starfield */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Faint vignette to seat content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(140% 100% at 50% 40%, transparent 55%, rgba(3,5,12,0.55) 100%)',
        }}
      />
    </div>
  );
};

export default SpaceBackground;
