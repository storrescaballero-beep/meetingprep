import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { marginBottom: 30, borderBottom: "2pt solid #0E7565", paddingBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0B1B2B", marginBottom: 5 },
  subtitle: { fontSize: 12, color: "#666", marginBottom: 10 },
  section: { marginVertical: 15 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#0E7565", marginBottom: 8, marginTop: 15 },
  text: { fontSize: 10, color: "#333", lineHeight: 1.5, marginBottom: 5 },
  grid: { display: "flex", flexDirection: "row", marginVertical: 10 },
  gridItem: { flex: 1, marginRight: 15 },
  badge: { fontSize: 9, backgroundColor: "#0E7565", color: "white", padding: 4, borderRadius: 2, width: "fit-content", marginBottom: 8 },
  footer: { marginTop: 30, paddingTop: 15, borderTop: "1pt solid #ddd", fontSize: 9, color: "#999" },
});

export function ReunionPDFDocument({ company, meeting, contact, preparation }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>MeetingPrep</Text>
          <Text style={styles.subtitle}>Preparación de Reunión Comercial</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de la Reunión</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.text}><Text style={{ fontWeight: "bold" }}>Empresa:</Text> {company?.name}</Text>
              <Text style={styles.text}><Text style={{ fontWeight: "bold" }}>Sector:</Text> {company?.sector || "—"}</Text>
              <Text style={styles.text}><Text style={{ fontWeight: "bold" }}>País:</Text> {company?.country || "—"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.text}><Text style={{ fontWeight: "bold" }}>Contacto:</Text> {contact?.full_name || "—"}</Text>
              <Text style={styles.text}><Text style={{ fontWeight: "bold" }}>Cargo:</Text> {contact?.job_title || "—"}</Text>
              <Text style={styles.text}><Text style={{ fontWeight: "bold" }}>Fecha:</Text> {meeting?.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString("es-ES") : "—"}</Text>
            </View>
          </View>
          {company?.description && (
            <>
              <Text style={styles.sectionTitle}>Descripción de la Empresa</Text>
              <Text style={styles.text}>{company.description}</Text>
            </>
          )}
        </View>

        {preparation && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
              <Text style={styles.text}>{preparation.resumen_ejecutivo}</Text>
            </View>

            {preparation.hipotesis_negocio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hipótesis de Negocio</Text>
                {Array.isArray(preparation.hipotesis_negocio) && preparation.hipotesis_negocio.map((h: string, i: number) => (
                  <Text key={i} style={styles.text}>• {h}</Text>
                ))}
              </View>
            )}

            {preparation.posibles_dolores && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Posibles Dolores / Puntos de Dolor</Text>
                {Array.isArray(preparation.posibles_dolores) && preparation.posibles_dolores.map((d: string, i: number) => (
                  <Text key={i} style={styles.text}>• {d}</Text>
                ))}
              </View>
            )}

            {preparation.preguntas_discovery && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preguntas de Discovery</Text>
                {Array.isArray(preparation.preguntas_discovery) && preparation.preguntas_discovery.map((p: string, i: number) => (
                  <Text key={i} style={styles.text}>• {p}</Text>
                ))}
              </View>
            )}

            {preparation.apertura_sugerida && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Apertura Sugerida</Text>
                <Text style={styles.text}>{preparation.apertura_sugerida}</Text>
              </View>
            )}

            {preparation.cierre_recomendado && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cierre Recomendado</Text>
                <Text style={styles.text}>{preparation.cierre_recomendado}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text>Generado con MeetingPrep • Preparación Comercial con IA</Text>
          <Text>{new Date().toLocaleDateString("es-ES")}</Text>
        </View>
      </Page>
    </Document>
  );
}
