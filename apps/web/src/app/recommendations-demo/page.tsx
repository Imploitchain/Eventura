import { RecommendationsDemoPageContent } from '@/components/pages/RecommendationsDemoPageContent'
import { SeoJsonLd } from '@/components/SeoJsonLd'
import { breadcrumbListJsonLd, createPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata = createPageMetadata({
  title: 'Recommendations Demo | Eventura',
  description: 'Interact with the Eventura AI engine to see how personalized event recommendations adapt to your on-chain actions.',
  path: '/recommendations-demo',
  keywords: ['event recommendations', 'AI events', 'web3 personalization'],
})

export default function RecommendationsDemoPage() {
  return (
    <>
      <SeoJsonLd
        data={breadcrumbListJsonLd([
          { name: 'Home', item: siteConfig.url },
          { name: 'Recommendations Demo', item: `${siteConfig.url}/recommendations-demo` },
        ])}
      />
      <RecommendationsDemoPageContent />
    </>
  )
}
