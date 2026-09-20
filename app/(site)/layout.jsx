import AnnouncementRibbon from '@/components/layout/AnnouncementRibbon'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav from '@/components/layout/SiteNav'

/** Marketing chrome. The community app at /app deliberately opts out of it. */
export default function SiteLayout({ children }) {
  return (
    <>
      <AnnouncementRibbon />
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  )
}
