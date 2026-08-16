/**
 * ICONOGRAFÍA PROPIA DEL JUEGO — SVGs dibujados a mano, cero emojis.
 * Todos usan currentColor + acentos dorado/arcano para heredar el tema.
 */

interface IconProps {
  size?: number;
  className?: string;
}

const S = (p: IconProps) => ({
  width: p.size ?? 20,
  height: p.size ?? 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: p.className,
  'aria-hidden': true
});

export const IconBook = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 5.5C10 3.8 7 3.4 4 3.8v14.4c3-.4 6 0 8 1.8 2-1.8 5-2.2 8-1.8V3.8c-3-.4-6 0-8 1.7Z" />
    <path d="M12 5.5V20" />
    <path d="M6.5 8c1.5-.2 3 0 4 .6M6.5 11.5c1.5-.2 3 0 4 .6" opacity=".6" />
  </svg>
);

export const IconHelm = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M5 13v-2a7 7 0 0 1 14 0v2l1.5 3-3 1-1-2H7.5l-1 2-3-1L5 13Z" />
    <path d="M12 4v6M9 20l.8-3h4.4l.8 3" />
    <circle cx="12" cy="12.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconBag = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M6 9h12l-1 11H7L6 9Z" />
    <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    <path d="M9.5 13c.8 1.2 4.2 1.2 5 0" opacity=".6" />
  </svg>
);

export const IconScroll = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M7 4h11a2 2 0 0 1 2 2v1h-4" />
    <path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 1-2 2h13a2 2 0 0 0 2-2V6" />
    <path d="M8.5 9.5h6M8.5 12.5h6M8.5 15.5h4" opacity=".65" />
  </svg>
);

export const IconMap = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
    <path d="M9 4v14M15 6v14" opacity=".5" />
    <circle cx="12" cy="11" r="1.6" />
    <path d="M12 12.6V15" opacity=".7" />
  </svg>
);

export const IconGear = (p: IconProps) => (
  <svg {...S(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
  </svg>
);

export const IconSword = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M19 5 9.5 14.5" />
    <path d="M19 5l-.5 4L14 13.5 10.5 10 15 5.5 19 5Z" fill="currentColor" fillOpacity=".18" />
    <path d="M8 13l3 3M6.5 17.5 5 19M9 19l-4-4 1.5-1.5L10.5 17 9 19Z" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 3.5c2.6 1.2 5 1.8 7 2v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-6c2-.2 4.4-.8 7-2Z" />
    <path d="M12 7v10.5M8.5 10H15.5" opacity=".55" />
  </svg>
);

export const IconRing = (p: IconProps) => (
  <svg {...S(p)}>
    <circle cx="12" cy="14" r="5.5" />
    <path d="m12 8.5-2.5-3L12 3l2.5 2.5-2.5 3Z" fill="currentColor" fillOpacity=".25" />
  </svg>
);

export const IconPotion = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M10 3.5h4M11 3.5v4L7.5 13a5 5 0 1 0 9 0L13 7.5v-4" />
    <path d="M8.2 14.5c2 1.4 5.6 1.4 7.6 0" opacity=".7" />
    <circle cx="11" cy="17" r=".7" fill="currentColor" stroke="none" opacity=".7" />
    <circle cx="13.5" cy="18.2" r=".55" fill="currentColor" stroke="none" opacity=".5" />
  </svg>
);

export const IconOre = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="m12 4 6 4 2 7-5 5H9l-5-5 2-7 6-4Z" />
    <path d="M12 4v6.5M6 8l6 2.5M18 8l-6 2.5M12 10.5 9 20M12 10.5 15 20" opacity=".45" />
  </svg>
);

export const IconRune = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 3 5 8.5v7L12 21l7-5.5v-7L12 3Z" />
    <path d="M12 7.5v9M8.5 10.5l7 3M15.5 10.5l-7 3" opacity=".7" />
  </svg>
);

export const IconStar = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="m12 3 2.2 5.6 5.8.6-4.4 3.9 1.3 5.9L12 15.8 7.1 19l1.3-5.9L4 9.2l5.8-.6L12 3Z" fill="currentColor" fillOpacity=".2" />
  </svg>
);

export const IconMystery = (p: IconProps) => (
  <svg {...S(p)}>
    <circle cx="12" cy="12" r="8.5" strokeDasharray="3 2.4" />
    <path d="M9.8 9.7A2.3 2.3 0 1 1 12 13v1.4" />
    <circle cx="12" cy="17.3" r=".8" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCoin = (p: IconProps) => (
  <svg {...S(p)}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="5" opacity=".5" />
    <path d="M12 9.5v5M10.5 11l1.5-1.5 1.5 1.5" opacity=".8" />
  </svg>
);

export const IconHeart = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 20c-5-3.5-8-6.6-8-10a4.4 4.4 0 0 1 8-2.5A4.4 4.4 0 0 1 20 10c0 3.4-3 6.5-8 10Z" fill="currentColor" fillOpacity=".2" />
  </svg>
);

export const IconDrop = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 3.5c3.5 4.4 6 7.6 6 10.6a6 6 0 1 1-12 0c0-3 2.5-6.2 6-10.6Z" fill="currentColor" fillOpacity=".2" />
    <path d="M9.5 14.5a3 3 0 0 0 2 2.8" opacity=".7" />
  </svg>
);

export const IconPower = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="m5 4 6 6M19 4l-6 6M8 13l-2.5 2.5M16 13l2.5 2.5" />
    <path d="M5 4 4 8l4.5 4.5M19 4l1 4-4.5 4.5" fill="currentColor" fillOpacity=".15" />
    <path d="m6 19-1.5-1.5M18 19l1.5-1.5M12 11l4.5 4.5M12 11 7.5 15.5" />
    <circle cx="12" cy="18.5" r="1.6" />
  </svg>
);

export const IconBond = (p: IconProps) => (
  <svg {...S(p)}>
    <circle cx="8" cy="9" r="3.2" />
    <circle cx="16" cy="9" r="3.2" />
    <path d="M4.5 19c.4-2.8 1.8-4.4 3.5-4.4S11 16.2 11.5 19M12.5 19c.4-2.8 1.8-4.4 3.5-4.4s3 1.6 3.5 4.4" />
    <path d="M11 9h2" opacity=".7" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...S(p)}>
    <rect x="6" y="10.5" width="12" height="9" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconMedal = (p: IconProps) => (
  <svg {...S(p)}>
    <circle cx="12" cy="14.5" r="5" />
    <path d="m12 12 .9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3L12 12Z" fill="currentColor" fillOpacity=".3" stroke="none" />
    <path d="m8.5 10.5-2-6.5h4L12 8l1.5-4h4l-2 6.5" />
  </svg>
);

export const IconSoul = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 3c3 3.4 5.5 6.4 5.5 9.6 0 2.4-1.3 4.3-3.2 5.2.3-1.5-.2-3-2.3-4.8-2.1 1.8-2.6 3.3-2.3 4.8-1.9-.9-3.2-2.8-3.2-5.2C6.5 9.4 9 6.4 12 3Z" fill="currentColor" fillOpacity=".22" />
    <path d="M9.5 19.8c.8.5 1.6.7 2.5.7s1.7-.2 2.5-.7" opacity=".7" />
  </svg>
);

export const IconLink = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="M11 6.5 13 4.5a3.5 3.5 0 0 1 5 5l-2 2M13 17.5l-2 2a3.5 3.5 0 0 1-5-5l2-2" />
  </svg>
);

export const IconWave = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 18.5h.01" strokeWidth="2.6" />
    <path d="M8.8 15.2a4.5 4.5 0 0 1 6.4 0" />
    <path d="M6 12.4a8.5 8.5 0 0 1 12 0" />
    <path d="M3.2 9.5a12.5 12.5 0 0 1 17.6 0" opacity=".6" />
  </svg>
);

export const IconVillage = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="m3 12 4.5-4L12 12v8H3v-8Z" />
    <path d="m12 9 4-3.5L21 10v10h-9" />
    <path d="M7 20v-4h2v4M15.5 20v-5h2.5v5" opacity=".6" />
    <path d="M5.5 8V5.5" opacity=".5" />
  </svg>
);

export const IconForest = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M8 4 4 10h2l-2.5 4.5H7V20" />
    <path d="M8 4l4 6h-2l2.5 4.5H9" />
    <path d="M16 6l-3.5 5.5H14L11 16h9l-3-4.5h1.5L16 6Z" fill="currentColor" fillOpacity=".18" />
    <path d="M16 16v4M7 14.5V20" opacity=".7" />
  </svg>
);

export const IconCity = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M4 20V8l3-1.5V4l2 1 2-1v2.5L14 8v12" />
    <path d="M14 20V10l6 2.5V20H4" />
    <path d="M7 11h1.5M7 14h1.5M10.5 11H12M10.5 14H12M16.5 14.5H18M16.5 17H18" opacity=".55" />
  </svg>
);

export const IconRuins = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M5 20V9M8.5 20V7.5M5 9l3.5-1.5" />
    <path d="M12 20v-6l4-8 3 1.5-3.5 7V20" />
    <path d="M3.5 20h17" />
    <path d="M5.8 12h2M5.8 15.5h2" opacity=".5" />
  </svg>
);

export const IconTemple = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M4 9.5 12 4l8 5.5" />
    <path d="M5.5 9.5V18M9.8 9.5V18M14.2 9.5V18M18.5 9.5V18M3.5 20h17M4.5 18h15" />
    <circle cx="12" cy="7.5" r=".9" fill="currentColor" stroke="none" opacity=".7" />
  </svg>
);

export const IconPoi = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 21c-4-4.4-6.5-7.6-6.5-10.6a6.5 6.5 0 0 1 13 0c0 3-2.5 6.2-6.5 10.6Z" fill="currentColor" fillOpacity=".2" />
    <circle cx="12" cy="10.3" r="2.4" />
  </svg>
);

export const IconSpark = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
    <path d="M12 9.5 13 11.5 15 12.5 13 13.5 12 15.5 11 13.5 9 12.5 11 11.5 12 9.5Z" fill="currentColor" fillOpacity=".4" />
  </svg>
);

export const IconArrow = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M5 12h13M13 6.5 19 12l-6 5.5" />
  </svg>
);

export const IconTreeOfLife = (p: IconProps) => (
  <svg {...S(p)} viewBox="0 0 64 64" strokeWidth={2}>
    <circle cx="32" cy="24" r="16" fill="currentColor" fillOpacity=".15" />
    <circle cx="24" cy="24" r="8" fill="currentColor" fillOpacity=".2" stroke="none" />
    <circle cx="40" cy="24" r="8" fill="currentColor" fillOpacity=".2" stroke="none" />
    <circle cx="32" cy="17" r="9" fill="currentColor" fillOpacity=".25" stroke="none" />
    <path d="M30 32c-1 6-3 8-6 12h4c2-3 3-5 4-7 1 2 2 4 4 7h4c-3-4-5-6-6-12" />
    <path d="M24 44c-4 3-8 3-12 6M28 45c-2 3-4 5-6 7M32 45v7M36 45c2 3 4 5 6 7M40 44c4 3 8 3 12 6" opacity=".8" />
  </svg>
);

/** Registro por nombre para uso dinámico. */
const REGISTRY = {
  book: IconBook,
  helm: IconHelm,
  bag: IconBag,
  scroll: IconScroll,
  map: IconMap,
  gear: IconGear,
  sword: IconSword,
  shield: IconShield,
  ring: IconRing,
  potion: IconPotion,
  ore: IconOre,
  rune: IconRune,
  star: IconStar,
  mystery: IconMystery,
  coin: IconCoin,
  heart: IconHeart,
  drop: IconDrop,
  power: IconPower,
  bond: IconBond,
  lock: IconLock,
  medal: IconMedal,
  soul: IconSoul,
  link: IconLink,
  wave: IconWave,
  village: IconVillage,
  forest: IconForest,
  city: IconCity,
  ruins: IconRuins,
  temple: IconTemple,
  poi: IconPoi,
  spark: IconSpark,
  arrow: IconArrow,
  treeoflife: IconTreeOfLife
} as const;

export type IconName = keyof typeof REGISTRY;

export function GameIcon({ name, size, className }: { name: IconName; size?: number; className?: string }) {
  const C = REGISTRY[name];
  return <C size={size} className={className} />;
}
