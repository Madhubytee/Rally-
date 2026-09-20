/**
 * Stylised city blocks behind the pins. Purely decorative — the real slippy
 * map replaces this element, not the pin layer sitting on top of it.
 */
export default function CityMapSvg() {
  return (
    <svg viewBox="0 0 280 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="280" height="400" fill="#eef0f2" />
      <rect x="14" y="20" width="96" height="74" rx="3" fill="#e2e6e9" />
      <rect x="132" y="20" width="76" height="74" rx="3" fill="#e2e6e9" />
      <rect x="226" y="20" width="60" height="74" rx="3" fill="#e2e6e9" />
      <rect x="14" y="116" width="96" height="92" rx="3" fill="#e2e6e9" />
      <rect x="132" y="116" width="76" height="92" rx="3" fill="#dfe8e2" />
      <rect x="226" y="116" width="60" height="92" rx="3" fill="#e2e6e9" />
      <rect x="14" y="230" width="96" height="86" rx="3" fill="#e2e6e9" />
      <rect x="132" y="230" width="76" height="86" rx="3" fill="#e2e6e9" />
      <rect x="226" y="230" width="60" height="86" rx="3" fill="#e2e6e9" />
      <rect x="14" y="338" width="96" height="70" rx="3" fill="#e2e6e9" />
      <rect x="132" y="338" width="76" height="70" rx="3" fill="#dfe8e2" />
      <rect x="226" y="338" width="60" height="70" rx="3" fill="#e2e6e9" />
      <path
        d="M0 104h280M0 216h280M0 324h280M120 0v400M216 0v400"
        stroke="#fbfcfc"
        strokeWidth="10"
        fill="none"
      />
      <path
        d="M-6 150c44 22 74-6 116 12s70 54 118 40 66-30 66-30"
        stroke="#cfe0ea"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
