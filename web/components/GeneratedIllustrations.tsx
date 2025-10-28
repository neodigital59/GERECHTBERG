import React from "react";

type SvgProps = {
  width?: number;
  height?: number;
  className?: string;
  ariaLabel?: string;
};

// Base helpers
const square = (content: React.ReactNode, props: SvgProps) => (
  <svg
    viewBox="0 0 120 120"
    width={props.width ?? 120}
    height={props.height ?? 120}
    role="img"
    aria-label={props.ariaLabel}
    className={props.className}
  >
    <defs>
      <linearGradient id="gradSquare" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#ECFDF5" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="118" height="118" rx="10" fill="url(#gradSquare)" stroke="#E5E7EB" />
    {content}
  </svg>
);

const wide = (content: React.ReactNode, props: SvgProps) => (
  <svg
    viewBox="0 0 120 68"
    width={props.width ?? 120}
    height={props.height ?? 68}
    role="img"
    aria-label={props.ariaLabel}
    className={props.className}
  >
    <defs>
      <linearGradient id="gradWide" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#ECFDF5" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="118" height="66" rx="10" fill="url(#gradWide)" stroke="#E5E7EB" />
    {content}
  </svg>
);

const icon = (content: React.ReactNode, props: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    width={props.width ?? 24}
    height={props.height ?? 24}
    role="img"
    aria-label={props.ariaLabel}
    className={props.className}
  >
    {content}
  </svg>
);

// Write / Rédaction
export const WriteSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      <rect x="18" y="20" width="84" height="68" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      {/* lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={26} y={30 + i * 12} width={60} height={4} rx={2} fill="#9CA3AF" />
      ))}
      {/* pen */}
      <path d="M88 82l-10 10-12 3 3-12 10-10 9 9z" fill="#10B981" />
      <rect x="74" y="90" width="6" height="3" rx="1.5" fill="#047857" />
    </g>,
    props
  );

export const TranslateSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      {/* bubbles */}
      <rect x="18" y="20" width="48" height="36" rx="8" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="66" y="40" width="36" height="36" rx="8" fill="#FFFFFF" stroke="#D1D5DB" />
      <text x="42" y="43" textAnchor="middle" fontSize="16" fontWeight="600" fill="#111827">A</text>
      <text x="84" y="63" textAnchor="middle" fontSize="16" fontWeight="600" fill="#111827">Я</text>
      {/* arrows */}
      <path d="M62 36h-8l4-5z" fill="#10B981" />
      <path d="M62 60h-8l4 5z" fill="#10B981" />
    </g>,
    props
  );

export const ExportSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      <rect x="22" y="24" width="76" height="56" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      {/* window */}
      <rect x="26" y="28" width="68" height="8" rx="4" fill="#E5E7EB" />
      {/* content */}
      {[0,1,2].map((i)=>(<rect key={i} x="34" y={42+i*10} width="52" height="5" rx="2.5" fill="#9CA3AF"/>))}
      {/* export arrow */}
      <path d="M60 78v-16" stroke="#10B981" strokeWidth="3" />
      <path d="M68 70l-8-8-8 8" fill="none" stroke="#10B981" strokeWidth="3" />
    </g>,
    props
  );

// Wide variants for gallery
export const WriteWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      {/* card */}
      <rect x="10" y="10" width="100" height="44" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      {/* header */}
      <rect x="16" y="16" width="88" height="6" rx="3" fill="#F3F4F6" />
      {/* lines */}
      {[0,1,2].map((i)=>(<rect key={i} x="24" y={28+i*8} width="68" height="4" rx="2" fill="#9CA3AF"/>))}
      {/* pen accent */}
      <path d="M92 50l-7 7-9 2 2-9 7-7 7 7z" fill="#10B981" />
    </g>,
    props
  );

export const TranslateWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      {/* bubbles */}
      <rect x="16" y="16" width="40" height="26" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      <rect x="64" y="24" width="40" height="26" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      <text x="36" y="32" textAnchor="middle" fontSize="12" fontWeight="600" fill="#111827">A</text>
      <text x="84" y="44" textAnchor="middle" fontSize="12" fontWeight="600" fill="#111827">Я</text>
      {/* arrows brand */}
      <path d="M60 24h-6l3-5z" fill="#10B981" />
      <path d="M60 46h-6l3 5z" fill="#10B981" />
    </g>,
    props
  );

export const ExportWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="12" y="12" width="96" height="40" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      <rect x="18" y="18" width="84" height="6" rx="3" fill="#F3F4F6" />
      {[0,1,2].map((i)=>(<rect key={i} x="26" y={30+i*8} width="68" height="4" rx="2" fill="#9CA3AF"/>))}
      {/* export arrow up */}
      <path d="M60 54v-12" stroke="#10B981" strokeWidth="3" />
      <path d="M66 48l-6-6-6 6" fill="none" stroke="#10B981" strokeWidth="3" />
    </g>,
    props
  );

// =========================
// New Pro Set (distinct look)
// =========================

// Feature squares (compose, translate, export) — entirely new visuals
export const ComposeSquarePro: React.FC<SvgProps> = (props) =>
  square(
    <g>
      {/* document */}
      <rect x="20" y="22" width="80" height="64" rx="8" fill="#FFFFFF" stroke="#D1D5DB" />
      {/* text lines */}
      {[0,1,2,3].map((i)=>(<rect key={i} x="30" y={34+i*10} width="52" height="4" rx="2" fill="#6B7280"/>))}
      {/* I-beam cursor */}
      <rect x="64" y="30" width="2" height="44" rx="1" style={{ fill: 'var(--brand)' }} className="svg-hover-caret" />
      <rect x="60" y="32" width="10" height="2" rx="1" style={{ fill: 'var(--brand)' }} className="svg-hover-caret" />
      <rect x="60" y="70" width="10" height="2" rx="1" style={{ fill: 'var(--brand)' }} className="svg-hover-caret" />
      {/* accent */}
      <circle cx="86" cy="76" r="6" style={{ fill: 'var(--brand)' }} opacity="0.15" />
    </g>,
    props
  );

export const TranslateSquarePro: React.FC<SvgProps> = (props) =>
  square(
    <g>
      {/* globe */}
      <circle cx="60" cy="60" r="26" fill="#F8FAFC" style={{ stroke: 'var(--brand)' }} className="svg-hover-globe" />
      {/* meridians */}
      <path d="M34 60h52" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      <path d="M60 34v52" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      <path d="M42 44c10 6 26 6 36 0" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      <path d="M42 76c10-6 26-6 36 0" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      {/* arrows around globe */}
      <path d="M92 52l-6 3 2-8" style={{ fill: 'var(--brand)' }} opacity="0.9" />
      <path d="M28 68l6-3-2 8" style={{ fill: 'var(--brand)' }} opacity="0.9" />
    </g>,
    props
  );

export const ExportSquarePro: React.FC<SvgProps> = (props) =>
  square(
    <g>
      {/* file panel */}
      <rect x="22" y="26" width="76" height="56" rx="8" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="28" y="32" width="64" height="6" rx="3" fill="#E5E7EB" />
      {[0,1,2].map((i)=>(<rect key={i} x="34" y={44+i*10} width="52" height="5" rx="2.5" fill="#6B7280"/>))}
      {/* export badge */}
      <circle cx="84" cy="70" r="9" fill="#F8FAFC" style={{ stroke: 'var(--brand)' }} />
      <path d="M84 74v-8" style={{ stroke: 'var(--brand)' }} strokeWidth="2.5" className="svg-hover-arrow" />
      <path d="M90 68l-6-6-6 6" fill="none" style={{ stroke: 'var(--brand)' }} strokeWidth="2.5" className="svg-hover-arrow" />
    </g>,
    props
  );

// Gallery wides — brand-new compositions
export const ComposeProWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="10" y="10" width="100" height="44" rx="10" fill="#FFFFFF" stroke="#E5E7EB" />
      {/* keyboard row */}
      {[0,1,2,3,4,5,6,7,8].map((i)=>(<rect key={i} x={16+i*10} y={40} width="8" height="8" rx="2" fill="#F3F4F6" />))}
      {/* lines */}
      {[0,1,2].map((i)=>(<rect key={i} x="18" y={18+i*8} width="70" height="4" rx="2" fill="#6B7280"/>))}
      {/* caret */}
      <rect x="70" y="16" width="2" height="32" rx="1" style={{ fill: 'var(--brand)' }} className="svg-hover-caret" />
    </g>,
    props
  );

export const TranslateProWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="10" y="10" width="100" height="44" rx="10" fill="#FFFFFF" stroke="#E5E7EB" />
      {/* globe */}
      <circle cx="60" cy="32" r="16" fill="#F8FAFC" style={{ stroke: 'var(--brand)' }} className="svg-hover-globe" />
      <path d="M44 32h32" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      <path d="M60 16v32" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      <path d="M48 24c6 4 18 4 24 0" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      <path d="M48 40c6-4 18-4 24 0" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      {/* direction arrows */}
      <path d="M84 24l-5 2 1-6" style={{ fill: 'var(--brand)' }} />
      <path d="M36 40l5-2-1 6" style={{ fill: 'var(--brand)' }} />
    </g>,
    props
  );

export const ExportProWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="10" y="10" width="100" height="44" rx="10" fill="#FFFFFF" stroke="#E5E7EB" />
      {/* tray */}
      <rect x="22" y="36" width="76" height="10" rx="3" fill="#F3F4F6" />
      {/* document */}
      <rect x="30" y="16" width="60" height="18" rx="4" fill="#F8FAFC" stroke="#D1D5DB" />
      {/* up arrow */}
      <path d="M60 38v-12" style={{ stroke: 'var(--brand)' }} strokeWidth="3" className="svg-hover-arrow" />
      <path d="M66 30l-6-6-6 6" fill="none" style={{ stroke: 'var(--brand)' }} strokeWidth="3" className="svg-hover-arrow" />
    </g>,
    props
  );

// Usecases — brand-new icons
export const TerminationProSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      {/* envelope */}
      <rect x="24" y="30" width="72" height="48" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <path d="M24 30l36 24 36-24" fill="#F3F4F6" />
      {/* outbound arrow */}
      <circle cx="86" cy="70" r="9" fill="#F3F4F6" stroke="#6B7280" />
      <path d="M86 66l6 6-6 6" fill="none" style={{ stroke: 'var(--brand)' }} strokeWidth="2" className="svg-hover-arrow" />
      <path d="M92 72h-12" style={{ stroke: 'var(--brand)' }} strokeWidth="2" className="svg-hover-arrow" />
    </g>,
    props
  );

export const ContractProSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      {/* two pages linked */}
      <rect x="22" y="24" width="40" height="56" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="58" y="28" width="40" height="52" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      {[0,1,2].map((i)=>(<rect key={i} x="28" y={34+i*10} width="26" height="4" rx="2" fill="#6B7280"/>))}
      {[0,1,2].map((i)=>(<rect key={i} x="64" y={40+i*10} width="26" height="4" rx="2" fill="#6B7280"/>))}
      {/* chain link */}
      <path d="M50 64h20" style={{ stroke: 'var(--brand)' }} strokeWidth="3" />
      <rect x="48" y="60" width="8" height="8" rx="4" style={{ fill: 'var(--brand)' }} opacity="0.2" />
      <rect x="64" y="60" width="8" height="8" rx="4" style={{ fill: 'var(--brand)' }} opacity="0.2" />
    </g>,
    props
  );

export const CertificateProSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      {/* page */}
      <rect x="26" y="24" width="68" height="60" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      {[0,1,2].map((i)=>(<rect key={i} x="34" y={34+i*10} width="52" height="5" rx="2.5" fill="#6B7280"/>))}
      {/* ribbon rosette */}
      <circle cx="84" cy="74" r="9" fill="#F8FAFC" style={{ stroke: 'var(--brand)' }} />
      <path d="M80 78l4-4 4 4" style={{ stroke: 'var(--brand)' }} strokeWidth="2" />
      <path d="M82 83l2-3 2 3" style={{ stroke: 'var(--brand)' }} strokeWidth="2" />
    </g>,
    props
  );

// Mini Icons Pro
export const ComposeIconPro: React.FC<SvgProps> = (props) =>
  icon(
    <g>
      <rect x="3" y="4" width="14" height="10" rx="2" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="5" y="7" width="10" height="2" rx="1" fill="#6B7280" />
      <rect x="11" y="6" width="2" height="8" rx="1" style={{ fill: 'var(--brand)' }} className="svg-hover-caret" />
    </g>,
    props
  );

export const TranslateIconPro: React.FC<SvgProps> = (props) =>
  icon(
    <g>
      <circle cx="12" cy="12" r="6" fill="#F8FAFC" style={{ stroke: 'var(--brand)' }} className="svg-hover-globe" />
      <path d="M8 12h8" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
      <path d="M12 8v8" style={{ stroke: 'var(--brand)' }} opacity={0.6} />
    </g>,
    props
  );

export const ExportIconPro: React.FC<SvgProps> = (props) =>
  icon(
    <g>
      <rect x="4" y="5" width="14" height="10" rx="2" fill="#FFFFFF" stroke="#D1D5DB" />
      <path d="M11 15v-5" style={{ stroke: 'var(--brand)' }} strokeWidth="2" className="svg-hover-arrow" />
      <path d="M14 12l-3-3-3 3" fill="none" style={{ stroke: 'var(--brand)' }} strokeWidth="2" className="svg-hover-arrow" />
    </g>,
    props
  );

// Usecases: Résiliation, Contrat, Attestation (square + wide)
export const ResiliationSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      <rect x="22" y="24" width="76" height="56" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="28" y="30" width="48" height="36" rx="4" fill="#F3F4F6" />
      {[0,1,2].map((i)=>(<rect key={i} x="34" y={36+i*10} width="36" height="5" rx="2.5" fill="#9CA3AF"/>))}
      {/* neutral end badge (no red cross) */}
      <circle cx="82" cy="70" r="10" fill="#F3F4F6" stroke="#9CA3AF" />
      <rect x="77" y="69" width="10" height="2" rx="1" fill="#374151" />
    </g>,
    props
  );

export const ContractSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      <rect x="24" y="22" width="72" height="64" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="30" y="30" width="60" height="6" rx="3" fill="#E5E7EB" />
      {[0,1,2].map((i)=>(<rect key={i} x="34" y={42+i*10} width="52" height="5" rx="2.5" fill="#9CA3AF"/>))}
      {/* handshake */}
      <path d="M40 78c6-6 14-6 20 0" stroke="#10B981" strokeWidth="3" />
      <circle cx="40" cy="78" r="3" fill="#10B981" />
      <circle cx="60" cy="78" r="3" fill="#10B981" />
    </g>,
    props
  );

export const CertificateSquare: React.FC<SvgProps> = (props) =>
  square(
    <g>
      <rect x="26" y="24" width="68" height="60" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      {[0,1,2].map((i)=>(<rect key={i} x="34" y={34+i*10} width="52" height="5" rx="2.5" fill="#9CA3AF"/>))}
      {/* seal */}
      <circle cx="80" cy="74" r="8" fill="#DBEAFE" stroke="#2563EB" />
      <path d="M76 76l4-6 4 6" stroke="#2563EB" strokeWidth="2" />
    </g>,
    props
  );

export const ResiliationWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="16" y="12" width="88" height="36" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="22" y="18" width="44" height="24" rx="4" fill="#F3F4F6" />
      {[0,1,2].map((i)=>(<rect key={i} x="26" y={22+i*7} width="36" height="4" rx="2" fill="#9CA3AF"/>))}
      {/* neutral end badge */}
      <circle cx="92" cy="40" r="9" fill="#F3F4F6" stroke="#9CA3AF" />
      <rect x="88" y="39" width="8" height="2" rx="1" fill="#374151" />
    </g>,
    props
  );

export const ContractWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="16" y="12" width="88" height="36" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="20" y="16" width="80" height="6" rx="3" fill="#E5E7EB" />
      {[0,1,2].map((i)=>(<rect key={i} x="28" y={26+i*7} width="64" height="4" rx="2" fill="#9CA3AF"/>))}
      <path d="M40 48c7-7 17-7 24 0" stroke="#10B981" strokeWidth="3" />
      <circle cx="40" cy="48" r="3" fill="#10B981" />
      <circle cx="64" cy="48" r="3" fill="#10B981" />
    </g>,
    props
  );

export const CertificateWide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="18" y="12" width="86" height="36" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      {[0,1,2].map((i)=>(<rect key={i} x="24" y={20+i*7} width="72" height="4" rx="2" fill="#9CA3AF"/>))}
      <circle cx="92" cy="44" r="7" fill="#DBEAFE" stroke="#2563EB" />
      <path d="M88 46l4-6 4 6" stroke="#2563EB" strokeWidth="2" />
    </g>,
    props
  );

// Steps wide
export const Step1Wide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="16" y="12" width="88" height="36" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="22" y="20" width="26" height="18" rx="4" fill="#F3F4F6" />
      <text x="35" y="31" textAnchor="middle" fontSize="10" fontWeight="600" fill="#111827">A</text>
      <rect x="52" y="20" width="26" height="18" rx="4" fill="#F3F4F6" />
      <text x="65" y="31" textAnchor="middle" fontSize="10" fontWeight="600" fill="#111827">合同</text>
      <rect x="82" y="18" width="16" height="6" rx="3" fill="#E5E7EB" />
    </g>,
    props
  );

export const Step2Wide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="16" y="12" width="88" height="36" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      {[0,1,2,3].map((i)=>(<rect key={i} x="24" y={18+i*6} width="64" height="4" rx="2" fill="#9CA3AF"/>))}
      <path d="M88 44l-8 8-10 2 2-10 8-8 8 8z" fill="#10B981" />
    </g>,
    props
  );

export const Step3Wide: React.FC<SvgProps> = (props) =>
  wide(
    <g>
      <rect x="16" y="12" width="88" height="36" rx="6" fill="#FFFFFF" stroke="#D1D5DB" />
      <path d="M60 46v-12" stroke="#2563EB" strokeWidth="3" />
      <path d="M66 40l-6-6-6 6" fill="none" stroke="#2563EB" strokeWidth="3" />
      <circle cx="88" cy="44" r="7" fill="#FDE68A" stroke="#D97706" />
      <path d="M84 46l4-6 4 6" stroke="#D97706" strokeWidth="2" />
    </g>,
    props
  );

// Icon variants for small sizes
export const WriteIcon: React.FC<SvgProps> = (props) =>
  icon(
    <g>
      <rect x="3" y="4" width="14" height="10" rx="2" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="5" y="7" width="10" height="2" rx="1" fill="#9CA3AF" />
      <path d="M18 16l-3 3-4 1 1-4 3-3 3 3z" fill="#10B981" />
    </g>,
    props
  );

export const TranslateIcon: React.FC<SvgProps> = (props) =>
  icon(
    <g>
      <rect x="3" y="4" width="8" height="6" rx="2" fill="#FFFFFF" stroke="#D1D5DB" />
      <rect x="13" y="9" width="8" height="6" rx="2" fill="#FFFFFF" stroke="#D1D5DB" />
      <text x="7" y="8" textAnchor="middle" fontSize="4" fontWeight="600" fill="#111827">A</text>
      <text x="17" y="13" textAnchor="middle" fontSize="4" fontWeight="600" fill="#111827">Я</text>
      <path d="M12 6h-3l1.5-2z" fill="#10B981" />
      <path d="M12 12h-3l1.5 2z" fill="#10B981" />
    </g>,
    props
  );

export const ExportIcon: React.FC<SvgProps> = (props) =>
  icon(
    <g>
      <rect x="4" y="5" width="14" height="10" rx="2" fill="#FFFFFF" stroke="#D1D5DB" />
      <path d="M11 15v-5" stroke="#10B981" strokeWidth="2" />
      <path d="M14 12l-3-3-3 3" fill="none" stroke="#10B981" strokeWidth="2" />
    </g>,
    props
  );

export default {
  WriteSquare,
  TranslateSquare,
  ExportSquare,
  WriteWide,
  TranslateWide,
  ExportWide,
  WriteIcon,
  TranslateIcon,
  ExportIcon,
  ResiliationSquare,
  ContractSquare,
  CertificateSquare,
  ResiliationWide,
  ContractWide,
  CertificateWide,
  Step1Wide,
  Step2Wide,
  Step3Wide,
  // New pro set
  ComposeSquarePro,
  TranslateSquarePro,
  ExportSquarePro,
  ComposeProWide,
  TranslateProWide,
  ExportProWide,
  TerminationProSquare,
  ContractProSquare,
  CertificateProSquare,
  ComposeIconPro,
  TranslateIconPro,
  ExportIconPro,
};