'use client'

import { MapPin, Phone, Mail, Video, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react'
import SectionHeader from './SectionComponents'
import ContactForm from './ContactForm'
import { useTranslations } from '@/lib/translations'

interface ContactSectionProps {
  address?: string | null
  phone?: string | null
  email?: string | null
  socialLinks?: Record<string, string> | null
}

export default function ContactSection({ address, phone, email, socialLinks }: ContactSectionProps) {
  const t = useTranslations()
  
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

  return (
    <section id="contact" className="py-20 bg-white">
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
                <p className="text-gray-600">{address || 'No. 1688 Xingye Road, Xiaoshan District, Hangzhou, China'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('contact.phone')}</h3>
                <p className="text-gray-600">{phone || '+86 571 8273 8888'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('contact.email')}</h3>
                <p className="text-gray-600">{email || 'info@shimond.com'}</p>
              </div>
            </div>

            {socialLinks && Object.keys(socialLinks).length > 0 && (
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contact.followUs')}</h3>
                <div className="flex space-x-4">
                  {Object.entries(socialLinks).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
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
    </section>
  )
}
