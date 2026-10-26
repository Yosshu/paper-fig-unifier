import { useMessages } from '../i18n'
import type { Lang } from '../lib/settings'
import { IconLock, Logo } from './icons'
import { Segmented } from './Segmented'

const LANGS = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
] as const

export function Header({ lang, onLang }: { lang: Lang; onLang: (lang: Lang) => void }) {
  const t = useMessages()
  return (
    <header className="header">
      <div className="brand">
        <Logo />
        <div>
          <h1>Paper Fig Unifier</h1>
          <p className="muted">{t.tagline}</p>
        </div>
      </div>
      <div className="header-tools">
        <p className="privacy">
          <IconLock />
          {t.privacy}
        </p>
        <div className="lang-switch">
          <Segmented label={t.languageLabel} options={LANGS} value={lang} onChange={onLang} />
        </div>
      </div>
    </header>
  )
}
