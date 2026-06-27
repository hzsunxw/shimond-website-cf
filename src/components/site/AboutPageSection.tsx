'use client'

import { Shield, Leaf, HardHat, Factory, TrendingUp, Cog, Phone, MapPin, Mail, Globe, Printer } from 'lucide-react'
import { useTranslations } from '@/lib/translations'
import ContactForm from '@/components/site/ContactForm'

export default function AboutPageSection() {
  const t = useTranslations()

  return (
    <div className="pt-[5rem]">

      {/* Certifications & Capacity */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-20 left-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{t('about.cert.title')}</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-sky-400">{t('about.capacity.title')}</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              {[
                { icon: <Shield className="w-6 h-6" />, text: t('about.cert.iso9001'), color: 'sky' },
                { icon: <Leaf className="w-6 h-6" />, text: t('about.cert.iso14001'), color: 'emerald' },
                { icon: <HardHat className="w-6 h-6" />, text: t('about.cert.ohsas'), color: 'amber' },
              ].map((cert, index) => {
                const colorStyles: Record<string, string> = {
                  sky: 'text-sky-400 bg-sky-500/20',
                  emerald: 'text-emerald-400 bg-emerald-500/20',
                  amber: 'text-amber-400 bg-amber-500/20',
                }
                return (
                  <div key={index} className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorStyles[cert.color]}`}>
                      {cert.icon}
                    </div>
                    <span className="text-white font-medium text-lg">{cert.text}</span>
                  </div>
                )
              })}
            </div>

            <div className="space-y-4">
              {[
                { icon: <Factory className="w-6 h-6" />, value: t('about.capacity.area'), label: t('about.capacity.area.label'), color: 'sky' },
                { icon: <TrendingUp className="w-6 h-6" />, value: t('about.capacity.output'), label: t('about.capacity.output.label'), color: 'emerald' },
                { icon: <Cog className="w-6 h-6" />, value: t('about.capacity.auto'), label: t('about.capacity.auto.label'), color: 'amber' },
              ].map((metric, index) => {
                const colorStyles: Record<string, string> = {
                  sky: 'text-sky-400',
                  emerald: 'text-emerald-400',
                  amber: 'text-amber-400',
                }
                return (
                  <div key={index} className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 ${colorStyles[metric.color]}`}>
                      {metric.icon}
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${colorStyles[metric.color]}`}>{metric.value}</div>
                      <div className="text-gray-400 text-sm">{metric.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-4">
              {t('about.contact.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">{t('about.contact.title')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl p-8 text-white shadow-xl">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{t('about.contact.hotline')}</h3>
                <p className="text-3xl font-bold">{t('about.contact.hotlineValue')}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-white/90">{t('about.contact.address')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="text-white/90">{t('about.contact.phone')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-white/90">{t('about.contact.email')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 flex-shrink-0" />
                  <span className="text-white/90">{t('about.contact.website')}</span>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
