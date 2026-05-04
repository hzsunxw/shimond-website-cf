import { Metadata } from 'next'
import { MapPin, Phone, Mail, Video, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import SectionHeader from '@/components/site/SectionComponents'
import ContactForm from '@/components/site/ContactForm'

async function getContactData() {
  try {
    const config = await prisma.siteConfig.findFirst({
      select: {
        companyName: true,
        address: true,
        phone: true,
        email: true,
        socialLinks: true,
      },
    })
    return config
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  return {
    title: `${t('contact')} - Shimond`,
    description: t('contact.subtitle'),
  }
}

export default async function ContactPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const config = await getContactData()

  const socialIcons: Record<string, React.ReactNode> = {
    tiktok: <Video className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    whatsapp: <MessageCircle className="w-5 h-5" />,
  }

  const socialColors: Record<string, string> = {
    tiktok: 'bg-black hover:scale-110',
    facebook: 'bg-blue-600 hover:scale-110',
    instagram: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 hover:scale-110',
    linkedin: 'bg-blue-700 hover:scale-110',
    whatsapp: 'bg-green-500 hover:scale-110',
  }

  const socialLinks = config?.socialLinks as Record<string, string> | null

  return (
    <div className="pt-[5rem] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('contact.badge')}
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
        />

        <div className="grid lg:grid-cols-2 gap-12">
          <ContactForm />

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('contact.address')}</h3>
                <p className="text-gray-600">{config?.address || 'No. 1688 Xingye Road, Xiaoshan District, Hangzhou, China'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('contact.phone')}</h3>
                <p className="text-gray-600">{config?.phone || '+86 571 8273 8888'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('contact.email')}</h3>
                <p className="text-gray-600">{config?.email || 'info@shimond.com'}</p>
              </div>
            </div>

            {socialLinks && Object.values(socialLinks).some((url) => url && String(url).trim()) && (
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contact.followUs')}</h3>
                <div className="flex space-x-4">
                  {Object.entries(socialLinks)
                    .filter(([, url]) => url && String(url).trim())
                    .map(([key, url]) => (
                      <a
                        key={key}
                        href={String(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform ${
                          socialColors[key] || 'bg-gray-500 hover:scale-110'
                        }`}
                      >
                        {socialIcons[key] || <span className="text-xs uppercase">{key[0]}</span>}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
