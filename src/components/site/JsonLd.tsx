interface JsonLdProps {
  data: object | object[]
}

/**
 * Renders one or more JSON-LD structured data blocks.
 * Usage: <JsonLd data={organizationSchema} /> or <JsonLd data={[schema1, schema2]} />
 */
export default function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data]
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
