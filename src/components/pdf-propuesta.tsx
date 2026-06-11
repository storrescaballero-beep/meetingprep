import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { marginBottom: 30, borderBottom: "2pt solid #0E7565", paddingBottom: 15 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0B1B2B", marginBottom: 5 },
  subtitle: { fontSize: 11, color: "#666", marginBottom: 10 },
  section: { marginVertical: 15 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#0E7565", marginBottom: 8, marginTop: 12 },
  text: { fontSize: 10, color: "#333", lineHeight: 1.6, marginBottom: 5 },
  footer: { marginTop: 30, paddingTop: 15, borderTop: "1pt solid #ddd", fontSize: 9, color: "#999" },
});

export function PropuestaPDFDocument({ company, proposal }: any) {
  const content = proposal?.content || {};
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{proposal?.title || "Propuesta Comercial"}</Text>
          <Text style={styles.subtitle}>Para {company?.name}</Text>
        </View>

        {content.contexto && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contexto</Text>
            <Text style={styles.text}>{content.contexto}</Text>
          </View>
        )}

        {content.necesidad_detectada && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Necesidad Detectada</Text>
            <Text style={styles.text}>{content.necesidad_detectada}</Text>
          </View>
        )}

        {content.diagnostico && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diagnóstico</Text>
            <Text style={styles.text}>{content.diagnostico}</Text>
          </View>
        )}

        {content.solucion_propuesta && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solución Propuesta</Text>
            <Text style={styles.text}>{content.solucion_propuesta}</Text>
          </View>
        )}

        {content.alcance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alcance</Text>
            {Array.isArray(content.alcance) && content.alcance.map((a: string, i: number) => (
              <Text key={i} style={styles.text}>• {a}</Text>
            ))}
          </View>
        )}

        {content.metodologia && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metodología</Text>
            {Array.isArray(content.metodologia) && content.metodologia.map((m: string, i: number) => (
              <Text key={i} style={styles.text}>• {m}</Text>
            ))}
          </View>
        )}

        {content.cronograma && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cronograma</Text>
            {Array.isArray(content.cronograma) && content.cronograma.map((c: string, i: number) => (
              <Text key={i} style={styles.text}>• {c}</Text>
            ))}
          </View>
        )}

        {content.pricing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inversión</Text>
            <Text style={styles.text}>{content.pricing}</Text>
          </View>
        )}

        {content.proximos_pasos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Próximos Pasos</Text>
            {Array.isArray(content.proximos_pasos) && content.proximos_pasos.map((p: string, i: number) => (
              <Text key={i} style={styles.text}>• {p}</Text>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Propuesta generada con MeetingPrep • {new Date().toLocaleDateString("es-ES")}</Text>
        </View>
      </Page>
    </Document>
  );
}
