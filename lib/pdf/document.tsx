import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { pdfTheme } from './theme'

Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3H0q9O46VvY3Q.ttf' })
Font.register({ family: 'Fraunces', src: 'https://fonts.gstatic.com/s/fraunces/v31/4UaHrEtFpBISc36g8k3n8A.ttf' })

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 12, color: pdfTheme.colors.ink },
  title: { fontFamily: 'Fraunces', fontSize: 26, marginBottom: 4 },
  meta: { fontSize: 10, color: pdfTheme.colors.sub, marginBottom: 20 },
  swatchesRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  swatch: { width: 90, border: `1px solid ${pdfTheme.colors.border}`, borderRadius: 6, overflow: 'hidden' },
  swatchColor: { height: 50 },
  swatchInfo: { padding: 6, borderTop: `1px solid ${pdfTheme.colors.border}` },
  placements: { marginBottom: 20 },
  barRow: { flexDirection: 'row', marginTop: 6, height: 10, width: '100%' },
  narrative: { lineHeight: 1.4, marginTop: 10 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 10, color: pdfTheme.colors.sub }
})

type Story = any

export function ColorStoryPDF({ story }: { story: Story }) {
  const palette = story.palette || []
  const pct = story.placements?.pct || { sixty:60, thirty:30, ten:10 }
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.meta}>{new Date(story.created_at || story.createdAt).toLocaleDateString()} • {story.brand} • {story.vibe}</Text>
        <View style={styles.swatchesRow}>
          {palette.slice(0,5).map((p:any,i:number)=>(
            <View key={i} style={styles.swatch}>
              <View style={[styles.swatchColor,{ backgroundColor:p.hex }]} />
              <View style={styles.swatchInfo}>
                <Text>{p.name}</Text>
                <Text style={{ fontSize:9, color: pdfTheme.colors.sub }}>{p.code}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.placements}>
          <Text style={{ fontFamily:'Fraunces', fontSize:14, marginBottom:4 }}>Placements (60/30/10)</Text>
          <View style={styles.barRow}>
            <View style={{ flexGrow:pct.sixty, backgroundColor:'#111' }} />
            <View style={{ flexGrow:pct.thirty, backgroundColor:'#666' }} />
            <View style={{ flexGrow:pct.ten, backgroundColor:'#aaa' }} />
          </View>
        </View>
        <View>
          <Text style={{ fontFamily:'Fraunces', fontSize:14, marginBottom:6 }}>Narrative</Text>
          <Text style={styles.narrative}>{story.narrative}</Text>
        </View>
        <Text style={styles.footer}>Colrvia • Generated color story • {new Date().getFullYear()}</Text>
      </Page>
    </Document>
  )
}
