import { NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { LocalDbController } from "@aether/db";

export const dynamic = "force-dynamic";

// Define PDF styles
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#1f2937', fontWeight: 'bold' },
  productCard: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 15,
    border: '1pt solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb'
  },
  image: { width: 100, height: 100, objectFit: 'cover', borderRadius: 4 },
  details: { marginLeft: 15, flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
  price: { fontSize: 14, color: '#059669', marginBottom: 8, fontWeight: 'bold' },
  description: { fontSize: 10, color: '#4b5563', marginBottom: 12, lineHeight: 1.4 },
  button: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 10,
    textAlign: 'center',
    textDecoration: 'none',
    width: 100
  },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 10, color: '#9ca3af', textAlign: 'center' }
});

// PDF Document Component
const CatalogPDF = ({ products, tenantSlug }: { products: any[], tenantSlug: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Product Catalog</Text>
      
      {products.map((product, i) => (
        <View key={i} style={styles.productCard}>
          {product.image ? (
            <Image src={product.image} style={styles.image} />
          ) : (
            <View style={{...styles.image, backgroundColor: '#e5e7eb'}} />
          )}
          <View style={styles.details}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>{product.currency || '$'}{(product.price / 100).toFixed(2)}</Text>
            <Text style={styles.description}>{product.description || 'Premium quality product.'}</Text>
            <Link 
              src={`http://localhost:4022/b/${tenantSlug}/p/${product.id}`} 
              style={styles.button}
            >
              View Product
            </Link>
          </View>
        </View>
      ))}

      <Text style={styles.footer}>
        Generated dynamically by Aether AI Swarm • Click 'View Product' to purchase
      </Text>
    </Page>
  </Document>
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || "demo";
    const productIdsStr = searchParams.get("products");

    if (!productIdsStr) {
      return NextResponse.json({ error: "No products specified" }, { status: 400 });
    }

    // Fetch products
    let products = await LocalDbController.getProductsByTenant(tenantSlug);
    
    // Filter if specific IDs requested
    if (productIdsStr !== "all") {
      const ids = productIdsStr.split(",").map(id => id.trim());
      products = products.filter(p => ids.includes(p.id));
    }

    if (products.length === 0) {
      return NextResponse.json({ error: "No products found matching those IDs" }, { status: 404 });
    }

    // Render to Buffer
    const buffer = await renderToBuffer(<CatalogPDF products={products} tenantSlug={tenantSlug} />);

    // Return the Buffer as a PDF response
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="catalog.pdf"',
      },
    });
  } catch (error: any) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
