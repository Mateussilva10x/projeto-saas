"use client";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image as PDFImage,
} from "@react-pdf/renderer";
import { ActivityData } from "@/store/useActivityStore";

export interface PDFSettings {
  template: "school" | "tutor";
  schoolName?: string;
  teacherName?: string;
  logo?: string | null;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },

  headerContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
    alignItems: "center",
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 12,
    color: "#475569",
  },
  docTitle: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subTitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#64748b",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#334155",
    backgroundColor: "#f1f5f9",
    padding: 5,
  },
  questionContainer: {
    marginBottom: 12,
  },
  questionText: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "bold",
  },
  optionsList: {
    marginLeft: 10,
  },
  option: {
    fontSize: 10,
    marginBottom: 2,
    color: "#334155",
  },
  discursiveLine: {
    height: 60,
    borderBottom: 1,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "dashed",
    marginTop: 5,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#94a3b8",
  },
});

interface Props {
  activity: ActivityData;
  settings: PDFSettings;
}

const ActivityPDF = ({ activity, settings }: Props) => {
  const isSchoolTemplate = settings.template === "school";

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.headerContainer}>
          {isSchoolTemplate && settings.logo && (
            <View style={styles.logoContainer}>
              <PDFImage src={settings.logo} style={styles.logo} />
            </View>
          )}

          <View style={styles.headerTextContainer}>
            {isSchoolTemplate && settings.schoolName && (
              <Text style={styles.schoolName}>{settings.schoolName}</Text>
            )}
            {settings.teacherName && (
              <Text style={styles.teacherName}>
                Prof. {settings.teacherName}
              </Text>
            )}
            <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
              Data: ____/____/_______ | Turma: _________
            </Text>
          </View>
        </View>

        <Text style={styles.docTitle}>{activity.title}</Text>
        <Text style={styles.subTitle}>
          {activity.type} • {activity.level}
        </Text>

        <Text style={styles.sectionTitle}>QUESTÕES</Text>

        {activity.questions.map((q, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {q.question}
            </Text>
            {q.type === "multiple_choice" && (
              <View style={styles.optionsList}>
                {q.options?.map((opt, i) => (
                  <Text key={i} style={styles.option}>
                    {String.fromCharCode(97 + i)}) {opt}
                  </Text>
                ))}
              </View>
            )}
            {q.type === "discursive" && <View style={styles.discursiveLine} />}
          </View>
        ))}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>

      <Page style={styles.page}>
        <Text style={styles.docTitle}>GABARITO</Text>
        <Text style={styles.subTitle}>Uso exclusivo do professor</Text>

        <View style={{ marginTop: 20 }}>
          {activity.answerKey.map((ans, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                marginBottom: 8,
                borderBottom: 1,
                borderBottomColor: "#eee",
                paddingBottom: 4,
              }}
            >
              <Text style={{ width: 30, fontWeight: "bold" }}>
                {index + 1}.
              </Text>
              <Text style={{ flex: 1, fontSize: 10 }}>{ans.answer}</Text>
            </View>
          ))}
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default ActivityPDF;
