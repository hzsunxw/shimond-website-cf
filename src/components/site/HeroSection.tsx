'use client'

import { ArrowRight, Play, ShieldCheck } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

export default function HeroSection() {
  const t = useTranslations()
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-[5rem]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm">{t('hero.tagline')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('hero.title1')}
              <br />
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                {t('hero.title2')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="/products"
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-sky-500/40 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>{t('hero.cta1')}</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#contact"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>{t('hero.cta2')}</span>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-white">15+</div>
                <div className="text-gray-400 text-sm mt-1">{t('hero.stats.years')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
                <div className="text-gray-400 text-sm mt-1">{t('hero.stats.clients')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-white">1000+</div>
                <div className="text-gray-400 text-sm mt-1">{t('hero.stats.products')}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-800 aspect-video">
              <img
                src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=450&fit=crop"
                alt="PVC"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 animate-bounce" style={{ animationDuration: '6s' }}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">ISO 9001</div>
                  <div className="text-sm text-gray-500">Certified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
