import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { marginBottom: 24, borderBottom: "2pt solid #0E7565", paddingBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0B1B2B", marginBottom: 5 },
  subtitle: { fontSize: 12, color: "#666", marginBottom: 10 },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#0E7565", marginBottom: 6, marginTop: 12 },
  subSectionTitle: { fontSize: 11, fontWeight: "bold", color: "#0B1B2B", marginBottom: 4, marginTop: 8 },
  text: { fontSize: 10, color: "#333", lineHeight: 1.5, marginBottom: 4 },
  bullet: { fontSize: 10, color: "#333", lineHeight: 1.5, marginBottom: 4, paddingLeft: 8 },
  grid: { display: "flex", flexDirection: "row", marginVertical: 8 },
  gridItem: { flex: 1, marginRight: 15 },
  noticia: { marginBottom: 8, padding: 8, backgroundColor: "#f5f5f5" },
  noticiaFecha: { fontSize: 9, color: "#0E7565", marginBottom: 2 },
  noticiaTexto: { fontSize: 10, color: "#333", lineHeight: 1.4, marginBottom: 2 },
  noticiaRel: { fontSize: 9, color: "#666", fontStyle: "italic" },
  objecion: { marginBottom: 10, paddingLeft: 8, borderLeft: "2pt solid #0E7565" },
  highlight: { backgroundColor: "#f0faf8", padding: 8, marginVertical: 6 },
  footer: { marginTop: 24, paddingTop: 12, borderTop: "1pt solid #ddd", fontSize: 9, color: "#999" },
});

export function ReunionPDFDocument({ company, meeting, contact, preparation }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>MeetingPrep</Text>
          <Text style={styles.subtitle}>Preparación de Reunión Comercial</Text>
        </View>

        {/* DATOS */}
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
            {/* RESUMEN EJECUTIVO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
              <Text style={styles.text}>{preparation.resumen_ejecutivo}</Text>
            </View>

            {/* NOTICIAS RECIENTES */}
            {preparation.noticias_recientes?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Noticias y Movimientos Recientes</Text>
                {preparation.noticias_recientes.map((n: any, i: number) => (
                  <View key={i} style={styles.noticia}>
                    {n.fecha && <Text style={styles.noticiaFecha}>{n.fecha}</Text>}
                    <Text style={styles.noticiaTexto}>{n.titular}</Text>
                    {n.relevancia_comercial && <Text style={styles.noticiaRel}>→ {n.relevancia_comercial}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* CONTEXTO MERCADO */}
            {preparation.contexto_mercado && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contexto de Mercado</Text>
                <Text style={styles.text}>{preparation.contexto_mercado}</Text>
              </View>
            )}

            {/* PERFIL INTERLOCUTOR */}
            {preparation.perfil_interlocutor && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Perfil del Interlocutor</Text>
                {preparation.perfil_interlocutor.resumen && (
                  <>
                    <Text style={styles.subSectionTitle}>Trayectoria y rol</Text>
                    <Text style={styles.text}>{preparation.perfil_interlocutor.resumen}</Text>
                  </>
                )}
                {preparation.perfil_interlocutor.prioridades_actuales && (
                  <>
                    <Text style={styles.subSectionTitle}>Prioridades actuales</Text>
                    <Text style={styles.text}>{preparation.perfil_interlocutor.prioridades_actuales}</Text>
                  </>
                )}
                {preparation.perfil_interlocutor.estilo_probable && (
                  <>
                    <Text style={styles.subSectionTitle}>Estilo de comunicación</Text>
                    <Text style={styles.text}>{preparation.perfil_interlocutor.estilo_probable}</Text>
                  </>
                )}
                {preparation.perfil_interlocutor.como_prepararle && (
                  <View style={styles.highlight}>
                    <Text style={styles.subSectionTitle}>Cómo preparar esta reunión con él/ella</Text>
                    <Text style={styles.text}>{preparation.perfil_interlocutor.como_prepararle}</Text>
                  </View>
                )}
                {preparation.perfil_interlocutor.datos_encontrados?.length > 0 && (
                  <>
                    <Text style={styles.subSectionTitle}>Datos encontrados</Text>
                    {preparation.perfil_interlocutor.datos_encontrados.map((d: string, i: number) => (
                      <Text key={i} style={styles.bullet}>• {d}</Text>
                    ))}
                  </>
                )}
              </View>
            )}

            {/* HIPÓTESIS */}
            {preparation.hipotesis_negocio?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hipótesis de Negocio</Text>
                {preparation.hipotesis_negocio.map((h: string, i: number) => (
                  <Text key={i} style={styles.bullet}>• {h}</Text>
                ))}
              </View>
            )}

            {/* DOLORES */}
            {preparation.posibles_dolores?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Posibles Dolores / Puntos de Dolor</Text>
                {preparation.posibles_dolores.map((d: string, i: number) => (
                  <Text key={i} style={styles.bullet}>• {d}</Text>
                ))}
              </View>
            )}

            {/* MAPA DE PODER */}
            {preparation.mapa_poder && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mapa de Poder</Text>
                <Text style={styles.text}>{preparation.mapa_poder}</Text>
              </View>
            )}

            {/* PREGUNTAS DISCOVERY */}
            {preparation.preguntas_discovery?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preguntas de Discovery</Text>
                {preparation.preguntas_discovery.map((p: string, i: number) => (
                  <Text key={i} style={styles.bullet}>• {p}</Text>
                ))}
              </View>
            )}

            {/* PREGUNTAS ESTRATÉGICAS */}
            {preparation.preguntas_estrategicas?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preguntas Estratégicas</Text>
                {preparation.preguntas_estrategicas.map((p: string, i: number) => (
                  <Text key={i} style={styles.bullet}>• {p}</Text>
                ))}
              </View>
            )}

            {/* PREGUNTAS INCÓMODAS */}
            {preparation.preguntas_incomodas?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preguntas Incómodas (pero útiles)</Text>
                {preparation.preguntas_incomodas.map((p: string, i: number) => (
                  <Text key={i} style={styles.bullet}>• {p}</Text>
                ))}
              </View>
            )}

            {/* OBJECIONES */}
            {preparation.objeciones_probables?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Objeciones Probables</Text>
                {preparation.objeciones_probables.map((o: any, i: number) => (
                  <View key={i} style={styles.objecion}>
                    <Text style={[styles.text, { fontWeight: "bold" }]}>"{o.objecion}"</Text>
                    {o.que_significa && <Text style={styles.text}>Qué significa: {o.que_significa}</Text>}
                    {o.respuesta_recomendada && <Text style={[styles.text, { color: "#0E7565" }]}>Respuesta: {o.respuesta_recomendada}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* APERTURA */}
            {preparation.apertura_sugerida && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Apertura Sugerida</Text>
                <View style={styles.highlight}>
                  <Text style={styles.text}>{preparation.apertura_sugerida}</Text>
                </View>
              </View>
            )}

            {/* CIERRE */}
            {preparation.cierre_recomendado && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cierre Recomendado</Text>
                <View style={styles.highlight}>
                  <Text style={styles.text}>{preparation.cierre_recomendado}</Text>
                </View>
              </View>
            )}

            {/* SIGUIENTE PASO */}
            {preparation.siguiente_paso_ideal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Siguiente Paso Ideal</Text>
                <Text style={styles.text}>{preparation.siguiente_paso_ideal}</Text>
              </View>
            )}

            {/* CHECKLIST */}
            {preparation.checklist?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Checklist Pre-Reunión</Text>
                {preparation.checklist.map((c: string, i: number) => (
                  <Text key={i} style={styles.bullet}>☐ {c}</Text>
                ))}
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
