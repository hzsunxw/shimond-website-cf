-- Update phone/email for shimondpvc.com
-- Phone: 18158194952 | Email: service@shimondpvc.com

-- 1. site_config: phone + email + whatsapp in social_links JSON
UPDATE site_config
SET phone = '18158194952',
    email = 'service@shimondpvc.com',
    social_links = json_set(
      json_set(
        json_set(
          COALESCE(social_links, '{}'),
          '$.whatsapp', 'https://wa.me/8618158194952'
        ),
        '$.phone', '18158194952'
      ),
      '$.email', 'service@shimondpvc.com'
    ),
    updated_at = datetime('now');

-- 2. site_seo_configs: phone + email for all languages (zh, en, es, ar)
UPDATE site_seo_configs
SET phone = '18158194952',
    email = 'service@shimondpvc.com',
    updated_at = datetime('now');
