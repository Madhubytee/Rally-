import LoopDemo from '@/components/demo/LoopDemo'
import AudienceGrid from '@/components/landing/AudienceGrid'
import DataProvenance from '@/components/landing/DataProvenance'
import Hero from '@/components/landing/Hero'
import ImpactStats from '@/components/landing/ImpactStats'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <LoopDemo />
      <ImpactStats />
      <DataProvenance />
      <AudienceGrid />
    </main>
  )
}
