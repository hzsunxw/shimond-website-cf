const fs = require('fs')
const path = require('path')
const https = require('https')

const SITE = 'https://shimondpvc.com'
const IMG_DIR = path.join(__dirname, '..', 'temp-images')

const products = [
  { name: '压花革PVC', summary: '可来样定做，材料环保', img: '01_01.jpg', cat: 'PVC_FOAM', sort: 1 },
  { name: '黑色发泡革', summary: '厚度1.0mm-8.0mm 可做,门幅最宽可做到2米。', img: '01_02.jpg', cat: 'PVC_FOAM', sort: 2 },
  { name: '荧光发泡革', summary: '厚度2.0mm,门幅1.4m', img: '01_03.jpg', cat: 'PVC_FOAM', sort: 3 },
  { name: '灰快回弹发泡革', summary: '厚度4.0mm,门幅1.4m', img: '01_04.jpg', cat: 'PVC_FOAM', sort: 4 },
  { name: '压纹发泡革', summary: '表面耐刮,厚度2.5mm', img: '01_05.jpg', cat: 'PVC_FOAM', sort: 5 },
  { name: 'PVC高发泡材料', summary: '厚度5.0mm,门幅1.4m,可来样定做', img: '01_06.jpg', cat: 'PVC_FOAM', sort: 6 },
  { name: '出口英国桌面革', summary: '厚度2.0mm,可定做卷材、成品等', img: '02_01.jpg', cat: 'TABLE_PROTECTOR', sort: 1 },
  { name: '成品包装桌面革', summary: '规格140*220cm,厚度2.0mm', img: '02_02.png', cat: 'TABLE_PROTECTOR', sort: 2 },
  { name: '桌面保护革', summary: '厚度2.2mm', img: '02_03.jpg', cat: 'TABLE_PROTECTOR', sort: 3 },
  { name: '圆桌面保护革', summary: '规格100*100cm,厚度2.2mm', img: '02_04.gif', cat: 'TABLE_PROTECTOR', sort: 4 },
  { name: '出品桌面保护革', summary: '厚度2.0mm, 材料：PVC+无纺布', img: '02_05.jpg', cat: 'TABLE_PROTECTOR', sort: 5 },
  { name: '油画餐垫', summary: '规格35*45cm,厚度2.0mm,防滑、不渗油', img: '02_06.jpg', cat: 'TABLE_PROTECTOR', sort: 6 },
  { name: '简单风格餐垫', summary: '规格：30*45cm,厚度：2.0mm,耐刮、耐热，不渗油，易清洁', img: '02_07.jpg', cat: 'TABLE_PROTECTOR', sort: 7 },
  { name: '卡通图餐垫', summary: '规格：30*45cm,厚度：2.0mm,耐刮、耐热，不渗油，易清洁', img: '02_08.jpg', cat: 'TABLE_PROTECTOR', sort: 8 },
  { name: 'PVC餐垫', summary: '材料：PVC,规格：30*45cm,厚度：2.0mm,耐刮、耐热，不渗油，易清洁', img: '02_09.jpg', cat: 'TABLE_PROTECTOR', sort: 9 },
  { name: '皮革餐垫', summary: '材料：PVC,规格：30*45cm,厚度：2.0mm,耐刮、耐热，不渗油，易清洁', img: '02_10.jpg', cat: 'TABLE_PROTECTOR', sort: 10 },
  { name: '发泡革餐垫', summary: '材料：PVC,规格：30*45cm,厚度：2.0mm,耐刮、耐热，不渗油，易清洁', img: '02_11.jpg', cat: 'TABLE_PROTECTOR', sort: 11 },
  { name: '布纹餐垫', summary: '材料：PVC,规格：30*45cm,厚度：2.0mm,耐刮、耐热，不渗油，易清洁', img: '02_12.jpg', cat: 'TABLE_PROTECTOR', sort: 12 },
  { name: '环保材料厨房垫', summary: '厚度2.0mm, 材料：PVC+无纺布', img: '03_01.jpg', cat: 'PVC_MATS', sort: 1 },
  { name: '发泡厨房垫', summary: '材料：PVC,规格：45*120cm /45*75cm,厚度：4.0mm,耐刮、防滑，不渗油，易清洁', img: '03_02.jpg', cat: 'PVC_MATS', sort: 2 },
  { name: '人造革厨房垫', summary: '材料：PVC,规格：45*120cm / 45*75cm,厚度：4.0mm,耐刮、防滑，不渗油，易清洁', img: '03_03.jpg', cat: 'PVC_MATS', sort: 3 },
  { name: '防滑厨房垫', summary: '材料：PVC,规格：45*120cm / 45*75cm,厚度：6.0mm,耐刮、防滑，不渗油，易清洁', img: '03_04.jpg', cat: 'PVC_MATS', sort: 4 },
  { name: 'PVC抗疲劳厨房垫', summary: '材料：PVC,规格：45*120cm,厚度：4.0mm,耐刮、防滑，不渗油，易清洁', img: '03_05.jpg', cat: 'PVC_MATS', sort: 5 },
  { name: '皮革厨房垫', summary: '材料：PVC,规格：45*120cm,厚度：4.0mm,耐刮、防滑，不渗油，易清洁', img: '03_06.jpg', cat: 'PVC_MATS', sort: 6 },
  { name: '发泡革垫', summary: '规格：50*80cm 厚度：3.0mm', img: '03_07.jpg', cat: 'PVC_MATS', sort: 7 },
  { name: 'PVC防滑垫', summary: '规格：50*80cm 厚度：3.0mm', img: '03_08.gif', cat: 'PVC_MATS', sort: 8 },
  { name: 'PVC地垫', summary: '规格：50*80CM 厚度：3.0mm', img: '03_09.jpg', cat: 'PVC_MATS', sort: 9 },
  { name: 'UV数码打印', summary: '厚度：3.0mm 规格：50*80cm', img: '03_10.jpg', cat: 'PVC_MATS', sort: 10 },
  { name: '抗疲劳厨房垫', summary: '厚度4.0mm 规格45-120cm', img: '03_11.jpg', cat: 'PVC_MATS', sort: 11 },
]

function uploadImage(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(IMG_DIR, filename)
    const data = fs.readFileSync(filePath)
    const boundary = '----FormBoundary' + Date.now()
    const ext = filename.split('.').pop().toLowerCase()
    const ct = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'
    const body = Buffer.concat([
      Buffer.from('--' + boundary + '\r\n'),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="' + filename + '"\r\n'),
      Buffer.from('Content-Type: ' + ct + '\r\n\r\n'),
      data,
      Buffer.from('\r\n--' + boundary + '--\r\n'),
    ])
    const req = https.request(SITE + '/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Content-Length': body.length },
    }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve(JSON.parse(d)) } catch (e) { reject(new Error('Parse error: ' + d)) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function createProduct(product) {
  return new Promise((resolve, reject) => {
    const slug = product.cat.toLowerCase().replace(/_/g, '-') + '-' + product.sort
    const features = ['耐磨损', '易清洁', '环保材料', '可定制']
    const body = JSON.stringify({
      title: product.name,
      slug: slug,
      summary: product.summary,
      coverImage: product.imageUrl,
      gallery: [],
      description: product.summary,
      features: features,
      featuresEn: [], featuresEs: [], featuresAr: [],
      specs: [{ label: '材料', value: 'PVC' }],
      specsEn: [], specsEs: [], specsAr: [],
      price: null, priceUnit: null, priceCurrency: 'USD', priceStrategy: 'CONTACT',
      sortOrder: product.sort,
      status: 'ACTIVE',
      category: product.cat,
      seoTitle: null, seoDescription: null, seoKeywords: null,
      seoTitleEn: null, seoDescriptionEn: null, seoKeywordsEn: null,
      seoTitleEs: null, seoDescriptionEs: null, seoKeywordsEs: null,
      seoTitleAr: null, seoDescriptionAr: null, seoKeywordsAr: null,
    })
    const req = https.request(SITE + '/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }) } catch (e) { reject(new Error('Parse error: ' + d)) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  let ok = 0, fail = 0
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    try {
      console.log(`[${i + 1}/${products.length}] Uploading image: ${p.img}`)
      const uploadRes = await uploadImage(p.img)
      if (!uploadRes.url) {
        console.error(`  FAIL upload: ${JSON.stringify(uploadRes)}`)
        fail++
        continue
      }
      p.imageUrl = uploadRes.url
      console.log(`  Image uploaded: ${uploadRes.url}`)

      console.log(`  Creating product: ${p.name}`)
      const createRes = await createProduct(p)
      if (createRes.status === 200) {
        console.log(`  OK: ${p.name} (slug: ${p.cat.toLowerCase().replace(/_/g, '-') + '-' + p.sort})`)
        ok++
      } else {
        console.error(`  FAIL create (${createRes.status}): ${JSON.stringify(createRes.data)}`)
        fail++
      }
    } catch (e) {
      console.error(`  ERROR: ${e.message}`)
      fail++
    }
  }
  console.log(`\nDone: ${ok} success, ${fail} fail`)
}

main()
