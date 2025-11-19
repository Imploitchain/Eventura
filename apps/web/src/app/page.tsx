import { HomePageContent } from '@/components/pages/HomePageContent'
import { SeoJsonLd } from '@/components/SeoJsonLd'
import { breadcrumbListJsonLd, createPageMetadata, organizationJsonLd } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata = createPageMetadata({
  title: 'Eventura - Connect with Event Attendees Before You Arrive',
  description:
    'The first platform where you connect with attendees before events. Buy NFT tickets, create personas, and network before you arrive.',
  path: '/',
  keywords: ['event tickets', 'NFT tickets', 'networking', 'blockchain events', 'pre-event connections'],
})

export default function Home() {
  return (
    <>
      <SeoJsonLd
        data={[
          organizationJsonLd(),
          breadcrumbListJsonLd([
            {
              name: 'Home',
              item: siteConfig.url,
            },
          ]),
        ]}
      />
      <HomePageContent />
    </>
  )
}
