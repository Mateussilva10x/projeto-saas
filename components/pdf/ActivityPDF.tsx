"use client";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ActivityData } from "@/store/useActivityStore";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: 700,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  infoSection: {
    borderBottom: 1,
    borderTop: 1,
    borderColor: "#eee",
    paddingVertical: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
  },
  questionContainer: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 11,
    marginBottom: 5,
    fontWeight: 700,
  },
  optionsList: {
    paddingLeft: 10,
  },
  option: {
    fontSize: 11,
    marginBottom: 3,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

interface Props {
  activity: ActivityData;
}

const ActivityPDF = ({ activity }: Props) => (
  <Document>
    {/* Página de Questões */}
    <Page style={styles.page}>
      <Text style={styles.title}>{activity.title}</Text>
      <Text style={styles.header}>
        {activity.type} - {activity.level}
      </Text>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Escola: ___________________________________
        </Text>
        <Text style={styles.infoText}>Data: ___/___/_____</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Nome: __________________________________________________
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Questões</Text>

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
          {q.type === "discursive" && (
            <View
              style={{
                height: 80,
                borderBottom: 1,
                borderStyle: "dashed",
                marginTop: 10,
              }}
            />
          )}
        </View>
      ))}

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    {/* Página de Gabarito */}
    <Page style={styles.page}>
      <Text style={styles.title}>Gabarito - {activity.title}</Text>

      {activity.answerKey.map((ans, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {index + 1}. {ans.question}
          </Text>
          <Text style={styles.option}>Resposta: {ans.answer}</Text>
        </View>
      ))}

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

export default ActivityPDF;
