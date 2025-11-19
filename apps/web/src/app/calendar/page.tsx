import { CalendarPageContent } from '@/components/pages/CalendarPageContent'
import { SeoJsonLd } from '@/components/SeoJsonLd'
import { breadcrumbListJsonLd, createPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata = createPageMetadata({
  title: 'Event Calendar | Eventura',
  description: 'View on-chain events from Base L2, manage NFT tickets, and export to your calendar.',
  path: '/calendar',
  keywords: ['event calendar', 'Base events', 'NFT calendar', 'blockchain events'],
})

export default function CalendarPage() {
  return (
    <>
      <SeoJsonLd
        data={breadcrumbListJsonLd([
          { name: 'Home', item: siteConfig.url },
          { name: 'Calendar', item: `${siteConfig.url}/calendar` },
        ])}
      />
      <CalendarPageContent />
    </>
  )
}
