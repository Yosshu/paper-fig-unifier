import type { ReactNode } from 'react'

function Icon({ size = 16, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export function Logo() {
  return (
    <svg className="logo" width={34} height={34} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--accent)" />
      <path
        d="M11 6.5v15h14.5M6.5 11h15v14.5"
        fill="none"
        stroke="#fff"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconLock = () => (
  <Icon size={14}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
)

export const IconUpload = () => (
  <Icon size={20}>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Icon>
)

export const IconCheck = () => (
  <Icon>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

export const IconAlert = () => (
  <Icon>
    <path d="M12 3.5L21.5 20H2.5ZM12 10v4.5M12 17.2v.3" />
  </Icon>
)

export const IconClose = () => (
  <Icon>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const IconReset = () => (
  <Icon size={14}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5" />
  </Icon>
)

export const IconDownload = () => (
  <Icon size={18}>
    <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
  </Icon>
)
