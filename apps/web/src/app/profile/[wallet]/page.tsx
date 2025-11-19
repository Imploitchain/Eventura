import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SeoJsonLd } from '@/components/SeoJsonLd'
import { sampleProfiles } from '@/data/sampleProfiles'
import { breadcrumbListJsonLd, createPageMetadata } from '@/lib/seo'
import { getSiteUrl, siteConfig } from '@/config/site'

interface ProfilePageProps {
  params: {
    wallet: string
  }
}

const getProfile = (wallet: string) => sampleProfiles.find((profile) => profile.wallet === wallet)

export async function generateStaticParams() {
  return sampleProfiles.map((profile) => ({
    wallet: profile.wallet,
  }))
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const profile = getProfile(params.wallet)

  if (!profile) {
    return {}
  }

  const description = profile.bio.slice(0, 150)

  return createPageMetadata({
    title: `${profile.name} on Eventura`,
    description,
    path: `/profile/${profile.wallet}`,
    type: 'profile',
    keywords: [profile.name, 'Eventura profile', ...profile.expertise],
    images: [profile.avatar],
    robots: profile.isPrivate
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : undefined,
  })
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const profile = getProfile(params.wallet)

  if (!profile) {
    notFound()
  }

  const profileUrl = getSiteUrl(`/profile/${profile.wallet}`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <SeoJsonLd
        data={[
          breadcrumbListJsonLd([
            { name: 'Home', item: siteConfig.url },
            { name: 'Profile', item: profileUrl },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            url: profileUrl,
            description: profile.bio,
            image: profile.avatar,
            address: profile.location,
          },
        ]}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Profile', href: '/profile' },
            { label: profile.name },
          ]}
          className="mb-6"
        />

        <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={profile.avatar}
              alt={`${profile.name} avatar`}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold">{profile.name}</h1>
              <p className="text-gray-300 mt-2">{profile.location}</p>
              <p className="text-gray-200 mt-4">{profile.bio}</p>
              {profile.isPrivate && (
                <p className="mt-4 inline-block rounded-full bg-yellow-500/20 text-yellow-200 px-4 py-1 text-sm">
                  Private profile – search engines blocked
                </p>
              )}
            </div>
          </div>

          {!profile.isPrivate && (
            <div className="mt-8">
              <p className="text-sm uppercase tracking-wide text-gray-400 mb-3">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

