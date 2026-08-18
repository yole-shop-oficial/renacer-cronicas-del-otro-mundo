/**
 * RETRATOS (§79) — bustos vectoriales propios, estilizados con la
 * paleta del juego. Cero imágenes externas: SVG inline, funciona
 * offline y pesa nada. Un retrato por NPC, Diosa y enemigo.
 */

interface P {
  size?: number;
  className?: string;
}

const frame = (p: P) => ({
  width: p.size ?? 44,
  height: p.size ?? 44,
  viewBox: '0 0 64 64',
  className: p.className,
  'aria-hidden': true as const
});

/** Marco común: medallón con borde dorado. */
function Medallion({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <>
      <defs>
        <clipPath id={`clip-${bg.replace(/[^a-z0-9]/gi, '')}`}>
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="30" fill={bg} />
      <g clipPath={`url(#clip-${bg.replace(/[^a-z0-9]/gi, '')})`}>{children}</g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="#d4a94e" strokeWidth="2.5" opacity="0.85" />
    </>
  );
}

export const PortraitGoddess = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#2b1f4e">
      {/* halo amanecer */}
      <circle cx="32" cy="26" r="17" fill="#ffe9a8" opacity="0.35" />
      <circle cx="32" cy="26" r="11" fill="#e8ca8a" opacity="0.5" />
      {/* figura velada */}
      <path d="M32 14c7 0 11 6 11 13v10c0 3-2 5-4 6l4 14H21l4-14c-2-1-4-3-4-6V27c0-7 4-13 11-13Z" fill="#b9a5ec" />
      <path d="M32 17c5 0 8 4.5 8 10v9c0 4-3.5 6.5-8 6.5S24 40 24 36v-9c0-5.5 3-10 8-10Z" fill="#f5efff" />
      {/* rostro sin rasgos: luz */}
      <ellipse cx="32" cy="29" rx="5.5" ry="7" fill="#ffe9a8" opacity="0.9" />
      <circle cx="32" cy="12" r="2" fill="#ffe9a8" />
    </Medallion>
  </svg>
);

export const PortraitMarta = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#3a2f22">
      {/* trenzas grises */}
      <path d="M18 30c0-9 6-16 14-16s14 7 14 16v16H18V30Z" fill="#b8b3aa" />
      <path d="M20 32c1 10-1 16-3 20M44 32c-1 10 1 16 3 20" stroke="#9a958c" strokeWidth="4" strokeLinecap="round" />
      {/* cara */}
      <ellipse cx="32" cy="31" rx="9" ry="10" fill="#e8c795" />
      <path d="M27 30h3M34 30h3" stroke="#5a3a12" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M28.5 36c2 1.6 5 1.6 7 0" stroke="#a96b33" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* delantal */}
      <path d="M18 52c2-8 7-11 14-11s12 3 14 11H18Z" fill="#d9cbb2" />
      <path d="M26 44h12" stroke="#a96b33" strokeWidth="1.4" />
    </Medallion>
  </svg>
);

export const PortraitJoren = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#33251d">
      {/* resplandor de forja */}
      <circle cx="32" cy="46" r="16" fill="#e08a4d" opacity="0.25" />
      {/* cabeza + barba rojiza */}
      <ellipse cx="32" cy="27" rx="9" ry="9.5" fill="#e0b088" />
      <path d="M22 29c0 10 4 15 10 15s10-5 10-15c0 2-4 4-10 4s-10-2-10-4Z" fill="#b5542e" />
      <path d="M27 25h3M34 25h3" stroke="#3a2313" strokeWidth="1.7" strokeLinecap="round" />
      {/* hombros macizos + tirante de cuero */}
      <path d="M14 54c2-9 9-13 18-13s16 4 18 13H14Z" fill="#6d4b2e" />
      <path d="M24 43l10 11" stroke="#3a2313" strokeWidth="3.5" />
      {/* martillo */}
      <rect x="44" y="36" width="4" height="14" rx="1.5" fill="#8a6a45" transform="rotate(18 46 43)" />
      <rect x="40" y="33" width="11" height="6" rx="1.5" fill="#9aa0a8" transform="rotate(18 45.5 36)" />
    </Medallion>
  </svg>
);

export const PortraitPip = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#2e3b2a">
      {/* pelo pajizo alborotado */}
      <path d="M22 26c-1-8 4-13 10-13s11 5 10 13c-2-3-5-4-10-4s-8 1-10 4Z" fill="#d9b45e" />
      {/* cara pequeña */}
      <ellipse cx="32" cy="29" rx="8" ry="8.5" fill="#edc9a0" />
      <circle cx="28.5" cy="28" r="1.2" fill="#3a2313" />
      <circle cx="35.5" cy="28" r="1.2" fill="#3a2313" />
      <path d="M29 33.5c1.8 1.4 4.2 1.4 6 0" stroke="#a96b33" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* pecas */}
      <circle cx="26.5" cy="31" r="0.6" fill="#c98a4b" />
      <circle cx="37.5" cy="31" r="0.6" fill="#c98a4b" />
      {/* cuerpo menudo + honda al hombro */}
      <path d="M20 52c2-7 6-10 12-10s10 3 12 10H20Z" fill="#7a6a4a" />
      <path d="M24 44c4 3 6 5 6 8" stroke="#4a3a22" strokeWidth="2" fill="none" />
      <circle cx="24" cy="44" r="2" fill="#8a5a20" />
    </Medallion>
  </svg>
);

export const PortraitBren = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#26303d">
      {/* cabeza curtida con pelo corto gris */}
      <path d="M23 22c2-4 5-6 9-6s7 2 9 6l-2 3H25l-2-3Z" fill="#8a8f96" />
      <ellipse cx="32" cy="29" rx="9" ry="10" fill="#d9a97c" />
      {/* cicatriz en la ceja */}
      <path d="M35 21l3 7" stroke="#a96b53" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26.5 27h3.5M34 27h3.5" stroke="#2c2416" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M29 36h6" stroke="#8a5a3a" strokeWidth="1.6" strokeLinecap="round" />
      {/* armadura con estandarte azul */}
      <path d="M15 54c2-9 8-13 17-13s15 4 17 13H15Z" fill="#5a6472" />
      <path d="M32 41v13" stroke="#3d4854" strokeWidth="2.5" />
      <path d="M23 45h6v6l-3-2-3 2v-6Z" fill="#4a7fb5" />
    </Medallion>
  </svg>
);

export const PortraitLu = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#4a3020">
      {/* pañuelo azafrán */}
      <path d="M20 28c0-9 5-14 12-14s12 5 12 14l-2 4c1-6-3-11-10-11s-11 5-10 11l-2-4Z" fill="#e0a94e" />
      <path d="M44 28c2 2 3 6 2 9l-4-5" fill="#c98a3b" />
      {/* cara morena y sonrisa cómplice */}
      <ellipse cx="32" cy="31" rx="8.5" ry="9" fill="#c98a5b" />
      <path d="M27.5 29h3M34 29h3" stroke="#3a2313" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M28.5 35c2.5 1.8 5.5 1.2 7-0.5" stroke="#7a4a22" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* aretes */}
      <circle cx="23.5" cy="33" r="1.5" fill="#e8ca8a" />
      <circle cx="40.5" cy="33" r="1.5" fill="#e8ca8a" />
      {/* chal con especias */}
      <path d="M17 53c2-8 7-12 15-12s13 4 15 12H17Z" fill="#8a4a2e" />
      <circle cx="26" cy="48" r="1.2" fill="#e0a94e" />
      <circle cx="32" cy="50" r="1.2" fill="#d86f6f" />
      <circle cx="38" cy="48" r="1.2" fill="#7fc98f" />
    </Medallion>
  </svg>
);

export const PortraitVela = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#1f2f3d">
      {/* pelo recogido severo */}
      <path d="M23 24c1-6 4-9 9-9s8 3 9 9l-1 2c-1-4-4-6-8-6s-7 2-8 6l-1-2Z" fill="#3a3028" />
      <circle cx="41" cy="20" r="3" fill="#3a3028" />
      {/* cara con ojeras de no dormir */}
      <ellipse cx="32" cy="30" rx="8.5" ry="9.5" fill="#dcb490" />
      <path d="M27 28h3.5M33.5 28h3.5" stroke="#2c2416" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M27.5 31c1 .8 2 .8 3 .3M33.5 31c1 .8 2 .8 3 .3" stroke="#a98a6b" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <path d="M29.5 36h5" stroke="#8a5a3a" strokeWidth="1.5" strokeLinecap="round" />
      {/* uniforme impecable, estandarte azul */}
      <path d="M16 54c2-9 8-13 16-13s14 4 16 13H16Z" fill="#2e4a68" />
      <path d="M32 41v13M26 44h12" stroke="#4a7fb5" strokeWidth="1.6" />
      <circle cx="32" cy="47" r="2" fill="#e8ca8a" />
    </Medallion>
  </svg>
);

export const PortraitTomas = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#2f3226">
      {/* capucha de cazador vieja */}
      <path d="M19 30c0-10 6-16 13-16s13 6 13 16l-3 3c1-8-4-13-10-13s-11 5-10 13l-3-3Z" fill="#5a5a42" />
      {/* cara arrugada con barba gris */}
      <ellipse cx="32" cy="31" rx="8" ry="9" fill="#d9b491" />
      <path d="M24 34c0 7 3 10 8 10s8-3 8-10c-2 2-4.5 3-8 3s-6-1-8-3Z" fill="#9a958c" />
      <path d="M27.5 29h3M34 29h3" stroke="#3a3222" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 26c1-1 2.5-1.2 4-.8M34 25.2c1.5-.4 3-.2 4 .8" stroke="#8a8578" strokeWidth="1.3" strokeLinecap="round" />
      {/* abrigo remendado */}
      <path d="M17 54c2-8 7-12 15-12s13 4 15 12H17Z" fill="#4a4a36" />
      <path d="M24 47l4 4M40 46l-3 3" stroke="#6a6a52" strokeWidth="1.3" />
    </Medallion>
  </svg>
);

/* ── ENEMIGOS ── */

export const PortraitWolf = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#22282e">
      {/* cabeza de lobo flaco */}
      <path d="M32 14 22 24l-6 4 8 3c-2 5-1 10 2 14l6-4 6 4c3-4 4-9 2-14l8-3-6-4-10-10Z" fill="#5a6470" />
      <path d="M32 20 26 26l6 16 6-16-6-6Z" fill="#7a8590" />
      {/* ojos amarillos hambrientos */}
      <circle cx="27" cy="29" r="2" fill="#e0c94e" />
      <circle cx="37" cy="29" r="2" fill="#e0c94e" />
      <circle cx="27" cy="29" r="0.8" fill="#1a1a10" />
      <circle cx="37" cy="29" r="0.8" fill="#1a1a10" />
      {/* hocico y colmillos */}
      <path d="M32 34v5" stroke="#2c3238" strokeWidth="2" />
      <path d="M29 40l1.5 3 1.5-2 1.5 2 1.5-3" fill="none" stroke="#e8e4da" strokeWidth="1.6" strokeLinecap="round" />
      {/* costillas marcadas */}
      <path d="M20 48c1.5-1 3-1 4.5 0M39.5 48c1.5-1 3-1 4.5 0" stroke="#3d454e" strokeWidth="1.5" />
    </Medallion>
  </svg>
);

export const PortraitPoacher = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#33281e">
      {/* capucha + máscara de trapo */}
      <path d="M20 30c0-10 5-16 12-16s12 6 12 16v6l-4 2v-8c0-6-3-10-8-10s-8 4-8 10v8l-4-2v-6Z" fill="#4a3a26" />
      <ellipse cx="32" cy="30" rx="8" ry="9" fill="#c9a075" />
      <path d="M24 32h16v6c-3 2-6 3-8 3s-5-1-8-3v-6Z" fill="#6a5138" />
      {/* ojos duros */}
      <path d="M26.5 28h4M33.5 28h4" stroke="#241a10" strokeWidth="2" strokeLinecap="round" />
      {/* sello de la sierpe en el pecho */}
      <path d="M16 54c2-8 8-12 16-12s14 4 16 12H16Z" fill="#3d3226" />
      <circle cx="32" cy="48" r="4.5" fill="none" stroke="#8a9a4b" strokeWidth="1.6" />
      <path d="M30 48c1-1.5 3-1.5 4 0" stroke="#8a9a4b" strokeWidth="1.4" fill="none" />
    </Medallion>
  </svg>
);

export const PortraitWraith = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#171226">
      {/* niebla que se eleva */}
      <path d="M32 10c8 4 12 12 12 20 0 4-1 7-3 10 1-4 0-8-4-11 2 5 1 9-2 12 0-4-1-7-3-9-2 2-3 5-3 9-3-3-4-7-2-12-4 3-5 7-4 11-2-3-3-6-3-10 0-8 4-16 12-20Z" fill="#8b6fd8" opacity="0.75" />
      <path d="M32 16c5 3 8 9 8 15 0 5-3 9-8 11-5-2-8-6-8-11 0-6 3-12 8-15Z" fill="#b9a5ec" opacity="0.85" />
      {/* rostro doliente */}
      <ellipse cx="28" cy="30" rx="2" ry="3" fill="#171226" />
      <ellipse cx="36" cy="30" rx="2" ry="3" fill="#171226" />
      <ellipse cx="32" cy="38" rx="2.5" ry="4" fill="#171226" />
      {/* jirones */}
      <path d="M20 48c3 2 5 4 6 8M44 48c-3 2-5 4-6 8M32 50v8" stroke="#8b6fd8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </Medallion>
  </svg>
);

export const PortraitSentinel = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#2a2620">
      {/* cabeza bifronte de piedra */}
      <path d="M32 12c9 0 14 6 14 14v10c0 6-6 10-14 10s-14-4-14-10V26c0-8 5-14 14-14Z" fill="#8a8578" />
      <path d="M32 12v34" stroke="#5a564c" strokeWidth="2" />
      {/* rostro izquierdo (piedra) */}
      <path d="M23 27h5M24 34h4" stroke="#4a463c" strokeWidth="2" strokeLinecap="round" />
      {/* rostro derecho (cristal) */}
      <path d="M36 27h5M36 34h4" stroke="#b9d5ec" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 20l4 4M42 20l-4 4" stroke="#b9d5ec" strokeWidth="1.2" opacity="0.7" />
      {/* grietas doradas */}
      <path d="M28 16l-2 6 3 5M38 42l2-5-2-4" stroke="#d4a94e" strokeWidth="1.3" fill="none" opacity="0.8" />
      {/* hombros colosales */}
      <path d="M12 54c2-6 8-9 20-9s18 3 20 9H12Z" fill="#6a655a" />
      <circle cx="32" cy="50" r="2.5" fill="#d4a94e" opacity="0.9" />
    </Medallion>
  </svg>
);

export const PortraitFlayer = (p: P) => (
  <svg {...frame(p)}>
    <Medallion bg="#26201c">
      {/* capucha de cuero */}
      <path d="M20 30c0-10 5-17 12-17s12 7 12 17v8h-4v-8c0-7-3-12-8-12s-8 5-8 12v8h-4v-8Z" fill="#3d3226" />
      {/* máscara pálida SIN boca */}
      <path d="M25 24c0-4 3-7 7-7s7 3 7 7v10c0 5-3 8-7 8s-7-3-7-8V24Z" fill="#ded8cc" />
      {/* ranuras oscuras en vez de ojos */}
      <path d="M28 27h2.5M33.5 27h2.5" stroke="#1a1512" strokeWidth="2.4" strokeLinecap="round" />
      {/* grieta fina en la máscara */}
      <path d="M35 18l-1.5 5 2 4" stroke="#a89f8e" strokeWidth="0.9" fill="none" />
      {/* delantal de cuero con correas */}
      <path d="M17 54c2-8 7-12 15-12s13 4 15 12H17Z" fill="#4a3826" />
      <path d="M26 44v9M38 44v9M23 48h18" stroke="#2c2014" strokeWidth="1.6" />
      {/* látigo enrollado al costado */}
      <circle cx="45" cy="47" r="4.5" fill="none" stroke="#6a5138" strokeWidth="2" />
      <circle cx="45" cy="47" r="1.8" fill="none" stroke="#6a5138" strokeWidth="1.2" />
      <path d="M41 44l-2-2" stroke="#8a8578" strokeWidth="1.4" strokeLinecap="round" />
    </Medallion>
  </svg>
);

/* ── REGISTRO ── */

const PORTRAITS = {
  goddess: PortraitGoddess,
  marta: PortraitMarta,
  joren: PortraitJoren,
  pip: PortraitPip,
  capitan_bren: PortraitBren,
  vendedora_lu: PortraitLu,
  sargento_vela: PortraitVela,
  cazador_tomas: PortraitTomas,
  lobo_famelico: PortraitWolf,
  furtivo_sierpe: PortraitPoacher,
  espectro_velo: PortraitWraith,
  centinela_gemelo: PortraitSentinel,
  desollador: PortraitFlayer
} as const;

export type PortraitId = keyof typeof PORTRAITS;

export function hasPortrait(id: string): id is PortraitId {
  return id in PORTRAITS;
}

export function Portrait({ id, size, className }: { id: string; size?: number; className?: string }) {
  if (!hasPortrait(id)) return null;
  const C = PORTRAITS[id];
  return <C size={size} className={className} />;
}
