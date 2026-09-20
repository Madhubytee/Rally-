'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/components/auth/AuthProvider'
import { config } from '@/lib/config'

import authStyles from '@/components/auth/auth.module.css'
import styles from './layout.module.css'

const LINKS = [
  { href: '/map', label: 'Map' },
  { href: '/events', label: 'Events' },
  { href: '/organizers', label: 'Organizers' },
  { href: '/data', label: 'Data' },
]

function RallyMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5c3.6 3.9 5.6 6.9 5.6 9.6a5.6 5.6 0 1 1-11.2 0c0-2.7 2-5.7 5.6-9.6Z"
        fill="#7612fa"
      />
      <circle cx="12" cy="13" r="2.4" fill="#fff" />
    </svg>
  )
}

export default function SiteNav() {
  const pathname = usePathname()
  const { user, hostName, loading, signOut } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={`wrap ${styles.navInner}`}>
        <Link href="/" className={styles.brand}>
          <RallyMark />
          {config.appName}
        </Link>

        <div className={styles.navlinks}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? styles.navlinkActive : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.navend}>
          {/*
            Nothing is rendered for the signed-out/signed-in split until the
            session resolves. Flashing "Log in" at someone who is already
            signed in reads as having been logged out.
          */}
          {!loading &&
            (user ? (
              <span className={authStyles.who}>
                <span className={authStyles.whoName}>{hostName}</span>
                <button type="button" className="btn btn-ghost" onClick={signOut}>
                  Sign out
                </button>
              </span>
            ) : (
              <Link href="/signin" className="btn btn-ghost">
                Log in
              </Link>
            ))}
          <Link href="/app" className="btn btn-dark">
            Open the map
          </Link>
        </div>
      </div>
    </nav>
  )
}
