const P = {
  phone: <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  tree: <path d="M12 3l5 6h-3l4 5h-3l4 5H5l4-5H6l4-5H7l5-6zM12 19v2.5" />,
  wreath: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M10 19.5l2-2 2 2" />
    </>
  ),
  path: <path d="M8 21l2-18M16 21l-2-18M6 8h2.5M15.5 8H18M5 15h3M16 15h3" />,
  plug: <path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8zM12 16.5V21" />,
  box: (
    <>
      <path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5v-9z" />
      <path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" />
    </>
  ),
  home: <path d="M3 11.5L12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5" />,
  twostory: <path d="M3 10L12 3l9 7M5 8.5V21h14V8.5M5 14.5h14M9.5 21v-3.5h5V21M9 11h2M13 11h2" />,
  star: <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />,
  pencil: <path d="M4 20l1-4L16 5l3 3L8 19l-4 1zM14 7l3 3" />,
  ladder: <path d="M8 3v18M16 3v18M8 7h8M8 11h8M8 15h8M8 19h8" />,
  takedown: <path d="M12 3v11M8 10l4 4 4-4M4 15v4.5h16V15" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  bulb: <path d="M9 17.5h6M10 21h4M8.5 14.5C7 13.3 6 11.5 6 9.5a6 6 0 0 1 12 0c0 2-1 3.8-2.5 5v3h-7v-3z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '', stroke = 1.8 }) {
  const filled = name === 'phone' || name === 'star';
  return (
    <svg
      className={'icon ' + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {P[name]}
    </svg>
  );
}
