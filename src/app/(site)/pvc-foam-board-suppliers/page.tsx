import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Factory,
  Award,
  Globe2,
  Truck,
  ShieldCheck,
  Package,
  FileCheck,
  Users,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue } from '@/lib/i18n'
import SectionHeader from '@/components/site/SectionComponents'
import ContactSection from '@/components/site/ContactSection'
import JsonLd from '@/components/site/JsonLd'
import { generateOrganizationSchema, generateBreadcrumbSchema } from '@/lib/structured-data'

async function getFoamProducts() {
  try {
    const products = await prisma.serviceItem.findMany({
      where: { status: 'ACTIVE', category: 'PVC_FOAM' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        titleEs: true,
        titleAr: true,
        slug: true,
        summary: true,
        summaryEn: true,
        summaryEs: true,
        summaryAr: true,
        coverImage: true,
        category: true,
      },
    })
    return products
  } catch {
    return []
  }
}

async function getContactConfig() {
  try {
    return await prisma.siteConfig.findFirst({
      select: {
        address: true,
        phone: true,
        email: true,
        socialLinks: true,
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const seo = await getSiteSeo(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = 'PVC Foam Board Suppliers | Factory-Direct Manufacturer from China | Shimond'
  const description =
    'Trusted PVC foam board supplier from China. Factory-direct manufacturer of Celuka, free foam, and co-extruded PVC boards. ISO 9001 & REACH certified, 10M+ sqm annual capacity, OEM/ODM available. Get a quote today.'
  const ogImage = seo?.defaultOgImage || `${siteUrl}/og-image.png`

  return {
    title,
    description,
    keywords:
      'PVC foam board suppliers, PVC foam board manufacturer, expanded PVC sheet supplier, Celuka PVC board factory, PVC board wholesale China',
    openGraph: {
      title,
      description,
      url: `${siteUrl}/pvc-foam-board-suppliers`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/pvc-foam-board-suppliers`,
    },
  }
}

export default async function PvcFoamBoardSuppliersPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const [products, config] = await Promise.all([getFoamProducts(), getContactConfig()])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const seo = await getSiteSeo(locale)
  const pageUrl = `${siteUrl}/pvc-foam-board-suppliers`

  const organizationSchema = generateOrganizationSchema({
    siteUrl,
    seo,
    logo: `${siteUrl}/og-image.png`,
    socialLinks: config?.socialLinks as Record<string, string> | null,
  })
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t('home'), url: siteUrl },
    { name: 'PVC Foam Board Suppliers', url: pageUrl },
  ])

  const advantages = [
    {
      icon: <Factory className="w-8 h-8" />,
      title: 'Real Factory, No Middlemen',
      desc: 'We manufacture in our own 4,108 sqm facility in Chizhou, Anhui. Factory-direct pricing saves you 30-50% vs. trading companies.',
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Full Customization',
      desc: 'Custom sizes (up to 2m width), custom colors (Pantone matching), custom density (0.45-0.75 g/cm³), and custom formulations including flame-retardant and UV-resistant.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Certified Quality',
      desc: 'ISO 9001, ISO 14001, and OHSAS 18001 certified. EU ROHS and REACH compliant formulations trusted by buyers in 50+ countries.',
    },
    {
      icon: <Globe2 className="w-8 h-8" />,
      title: 'Global Export Experience',
      desc: '15+ years serving furniture makers, signage companies, and distributors across Europe, North America, Middle East, and Asia.',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Reliable Lead Times',
      desc: 'Standard orders ship in 15-20 days, custom orders in 30 days from our factory near Shanghai port. Flexible MOQ from 500 sqm.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Dedicated Technical Support',
      desc: 'Work directly with production engineers. Get formulation advice, specification matching, and sample development support.',
    },
  ]

  const certifications = ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'EU ROHS', 'REACH']

  const faqs = [
    {
      q: 'Are you a real factory or a trading company?',
      a: 'We are a genuine manufacturer. Hangzhou Shimond Import & Export Co., Ltd. handles export, and our production base, Anhui Shimond New Material Technology Co., Ltd., operates a 4,108 sqm facility in Chizhou, Anhui with four production units: batching, PVC foaming, molding, and surface treatment.',
    },
    {
      q: 'What is your minimum order quantity (MOQ)?',
      a: 'Our standard MOQ is 500 sqm for expanded PVC sheets. We also offer sample orders so you can verify quality before committing to bulk production.',
    },
    {
      q: 'What types of PVC foam board do you manufacture?',
      a: 'We produce all three types: Celuka PVC foam board (high-density, smooth surface), free foam PVC board (economical), and co-extruded PVC board (multi-layer for premium applications).',
    },
    {
      q: 'Can you make custom sizes and colors?',
      a: 'Yes. We offer custom widths up to 2 meters, custom lengths, custom colors with Pantone matching, and custom densities from 0.45 to 0.75 g/cm³.',
    },
    {
      q: 'What is your production capacity and lead time?',
      a: 'Our annual capacity exceeds 10 million sqm. Standard orders ship in 15-20 days, custom orders in 30 days. We can accommodate large bulk orders with staged delivery.',
    },
    {
      q: 'What certifications do you hold?',
      a: 'We hold ISO 9001 (Quality Management), ISO 14001 (Environmental Management), and OHSAS 18001 (Occupational Health & Safety). Our formulations meet EU ROHS and REACH environmental standards.',
    },
    {
      q: 'Can you provide samples before ordering?',
      a: 'Yes, we provide samples for quality verification. Contact us with your specifications and we will arrange sample shipment.',
    },
    {
      q: 'What payment terms do you accept?',
      a: 'We accept T/T, L/C, and Western Union. Standard terms are 30% deposit and 70% balance before shipment, or negotiable terms for long-term partners.',
    },
  ]

  const whatsappNumber =
    String((config?.socialLinks as Record<string, string> | null)?.whatsapp || '')
      .replace('https://wa.me/', '')
      .replace(/\D/g, '') || '8618158194952'

  return (
    <div className="pt-[5rem]">
      <JsonLd data={[organizationSchema, breadcrumbSchema]} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-900 via-sky-800 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium text-sky-200 mb-6">
                <ShieldCheck className="w-4 h-4 mr-2" />
                ISO 9001 Certified Manufacturer
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                PVC Foam Board Suppliers
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300 mt-2">
                  Factory-Direct from China
                </span>
              </h1>
              <p className="text-lg text-sky-100 leading-relaxed mb-8">
                Shimond is a leading Chinese manufacturer of Celuka, free foam, and co-extruded
                PVC boards. We supply furniture makers, signage companies, and distributors in
                50+ countries with certified, customizable PVC foam board at factory-direct prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-sky-900 font-semibold px-8 py-4 rounded-full hover:bg-sky-50 transition-colors"
                >
                  <span>Get a Free Quote</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold">15+</div>
                  <div className="text-sm text-sky-200 mt-1">Years Manufacturing</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10M+</div>
                  <div className="text-sm text-sky-200 mt-1">Sqm Annual Capacity</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm text-sky-200 mt-1">Countries Served</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/10">
                <div className="grid gap-6">
                  {[
                    { icon: <Award className="w-6 h-6" />, label: 'ISO 9001 / 14001 / OHSAS 18001' },
                    { icon: <ShieldCheck className="w-6 h-6" />, label: 'EU ROHS & REACH Compliant' },
                    { icon: <Package className="w-6 h-6" />, label: 'Custom Sizes, Colors & Density' },
                    { icon: <Truck className="w-6 h-6" />, label: '15-30 Day Lead Times' },
                    { icon: <Globe2 className="w-6 h-6" />, label: 'Export to 50+ Countries' },
                    { icon: <Users className="w-6 h-6" />, label: 'Direct Factory Support' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                        {item.icon}
                      </div>
                      <span className="text-sky-100">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-4">
          {certifications.map((cert) => (
            <span key={cert} className="inline-flex items-center text-sm font-medium text-gray-600">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
              {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="PVC FOAM BOARD"
            title="Our PVC Foam Board Products"
            subtitle="Explore our range of high-quality, customizable PVC foam boards"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {(products.length > 0 ? products : []).slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={p.coverImage || 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&h=450&fit=crop'}
                    alt={getLocalizedValue(p, locale, 'title') || p.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {getLocalizedValue(p, locale, 'title') || p.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {getLocalizedValue(p, locale, 'summary') || p.summary || ''}
                  </p>
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-flex items-center text-sky-600 font-medium hover:text-sky-700"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Shimond */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="WHY SHIMOND"
            title="Why Buyers Choose Shimond"
            subtitle="Factory-direct advantages you won't get from trading companies"
            badgeColor="emerald"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {advantages.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Factory Capability */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="FACTORY"
            title="Our Manufacturing Facility"
            subtitle="Real production capability, verifiable by audit"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { icon: <Factory className="w-8 h-8" />, num: '4,108', label: 'Sqm Factory Area', unit: 'm²' },
              { icon: <FileCheck className="w-8 h-8" />, num: '4', label: 'Production Units', unit: '' },
              { icon: <Package className="w-8 h-8" />, num: '20M', label: 'Meters Annual Output', unit: 'm' },
              { icon: <Truck className="w-8 h-8" />, num: '50+', label: 'Countries Exported', unit: '' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl p-8 text-white text-center"
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <div className="text-4xl font-bold">
                  {item.num}
                  {item.unit}
                </div>
                <div className="text-sky-100 mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="FAQ"
            title="Frequently Asked Questions"
            subtitle="Answers to the questions buyers ask us most"
            badgeColor="amber"
          />
          <div className="space-y-4 mt-12">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-2xl p-6 shadow border border-gray-100 group"
              >
                <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900">
                  <span>{faq.q}</span>
                  <span className="text-sky-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactSection
            address={config?.address}
            phone={config?.phone}
            email={config?.email}
            socialLinks={config?.socialLinks as Record<string, string> | null}
          />
        </div>
      </section>
    </div>
  )
}

