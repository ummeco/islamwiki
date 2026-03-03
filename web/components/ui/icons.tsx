interface IconProps {
  className?: string
  size?: number
}

function Icon({ className = '', size = 24, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  )
}

/** Open Quran / Mushaf */
export function QuranIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 4c0-1.1.9-2 2-2h5a3 3 0 0 1 3 3v15a2 2 0 0 0-2-2H4a2 2 0 0 1-2-2V4Z" />
      <path d="M22 4c0-1.1-.9-2-2-2h-5a3 3 0 0 0-3 3v15a2 2 0 0 1 2-2h6a2 2 0 0 0 2-2V4Z" />
      <path d="M6 7h3" />
      <path d="M6 11h3" />
      <path d="M15 7h3" />
      <path d="M15 11h3" />
    </Icon>
  )
}

/** Hadith scroll */
export function HadithIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z" />
      <path d="M3 5v2a2 2 0 0 0 2 2" />
      <path d="M21 5v2a2 2 0 0 1-2 2" />
      <path d="M9 12h6" />
      <path d="M9 15h4" />
      <circle cx="12" cy="6" r="0.5" fill="currentColor" stroke="none" />
    </Icon>
  )
}

/** Mosque dome — Seerah */
export function MosqueIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 21V12" />
      <path d="M18 21V12" />
      <path d="M6 12h12" />
      <path d="M6 12c0-4 3-7 6-9 3 2 6 5 6 9" />
      <path d="M3 21h18" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
      <line x1="12" y1="3" x2="12" y2="2" />
      <path d="M3 21v-3a1 1 0 0 1 1-1h1" />
      <path d="M21 21v-3a1 1 0 0 0-1-1h-1" />
    </Icon>
  )
}

/** Scholar / Person */
export function ScholarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M9 4.5C9 3.1 10.3 2 12 2s3 1.1 3 2.5" />
    </Icon>
  )
}

/** Stacked books */
export function BooksIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="8" y="8" width="7" height="7" rx="1" />
      <rect x="13" y="3" width="7" height="7" rx="1" />
      <path d="M5 14v-1a1 1 0 0 1 1-1h1" />
      <path d="M10 8V7a1 1 0 0 1 1-1h1" />
    </Icon>
  )
}

/** Articles / Document with pen */
export function ArticlesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
      <path d="M8 9h2" />
    </Icon>
  )
}

/** Video / Play */
export function VideoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </Icon>
  )
}

/** Audio / Waveform */
export function AudioIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 13v-2" />
      <path d="M5 17V7" />
      <path d="M8 20V4" />
      <path d="M11 17V7" />
      <path d="M14 14v-4" />
      <path d="M17 18V6" />
      <path d="M20 16V8" />
      <path d="M22 13v-2" />
    </Icon>
  )
}

/** Wiki / Globe with crescent */
export function WikiIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10" />
      <path d="M12 2a15 15 0 0 0-4 10 15 15 0 0 0 4 10" />
      <path d="M2 12h20" />
      <path d="M4.5 7h15" />
      <path d="M4.5 17h15" />
    </Icon>
  )
}

/** Sects / Branches diverging */
export function SectsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M12 7v4" />
      <path d="M12 11l-6 6" />
      <path d="M12 11l6 6" />
      <circle cx="12" cy="13" r="2" />
    </Icon>
  )
}

/** Map of icon names to components */
export const iconMap: Record<string, React.FC<IconProps>> = {
  quran: QuranIcon,
  hadith: HadithIcon,
  mosque: MosqueIcon,
  seerah: MosqueIcon,
  scholar: ScholarIcon,
  people: ScholarIcon,
  books: BooksIcon,
  articles: ArticlesIcon,
  video: VideoIcon,
  videos: VideoIcon,
  audio: AudioIcon,
  wiki: WikiIcon,
  sects: SectsIcon,
}
