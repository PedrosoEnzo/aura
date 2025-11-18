import {
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// ✔ ROTA DO BANCO CORRETA
const API_URL = "https://aura-back-app.onrender.com/api/sensores/sensores";

interface SensorData {
  timestamp: string;
  umidadeSolo: number;
  luminosidade: number;
  temperaturaAr: number;
  umidadeAr: number;
}

interface ChartInfo {
  label: string;
  data: number[];
  color: string;
}

export default function RelatorioGraficos() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<SensorData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartInfo | null>(null);

  const MAX_DADOS = 7;

  const sanitize = (arr: number[]) => arr.map((v) => (isFinite(v) ? v : 0));

  // ✔ Corrigido para puxar corretamente o último registro
  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      console.log("📡 Dados recebidos:", data);

      const novoDado = Array.isArray(data) ? data : [data];

      setDados((prev) => {
        const combinado = [...prev, ...novoDado];
        return combinado.slice(-MAX_DADOS);
      });
    } catch (err) {
      console.error("Erro ao buscar sensores", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#2196F3"
        style={{ marginTop: 50 }}
      />
    );

  if (!dados.length)
    return (
      <View style={{ marginTop: 50, alignItems: "center" }}>
        <Text style={{ color: "#999" }}>Nenhum dado disponível ainda.</Text>
      </View>
    );

  const labels = dados.map((d) => new Date(d.timestamp).getHours() + "h");

  const umidade = sanitize(dados.map((d) => d.umidadeSolo ?? 0));
  const luminosidade = sanitize(dados.map((d) => d.luminosidade ?? 0));
  const temperaturaAr = sanitize(dados.map((d) => d.temperaturaAr ?? 0));
  const umidadeAr = sanitize(dados.map((d) => d.umidadeAr ?? 0));

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(4, 43, 0, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: "4", strokeWidth: "1", stroke: "#1b5e20" },
  };

  const openModal = (label: string, data: number[], color: string) => {
    setSelectedChart({ label, data: sanitize(data), color });
    setModalVisible(true);
  };

  return (
    <ScrollView
      style={styles.container}
      {...(Platform.OS === "web" ? { onStartShouldSetResponder: undefined } : {})}
    >
      <Text style={styles.header}>RELATÓRIO DE GRÁFICOS</Text>

      {/* Umidade do Solo */}
      <TouchableOpacity onPress={() => openModal("Umidade do Solo", umidade, "#1b5e20")}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="water-percent" size={20} color="#1b5e20" />
            <Text style={styles.cardTitle}>Umidade do Solo</Text>
          </View>
          <Text style={styles.cardSubtitle}>Últimos 7 registros (%)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: umidade }] }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Luminosidade */}
      <TouchableOpacity onPress={() => openModal("Luminosidade", luminosidade, "#ff9800")}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="sun" size={20} color="#1b5e20" />
            <Text style={styles.cardTitle}>Luminosidade</Text>
          </View>
          <Text style={styles.cardSubtitle}>Últimos 7 registros (lux)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: luminosidade }] }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Temperatura do Ar */}
      <TouchableOpacity onPress={() => openModal("Temperatura do Ar", temperaturaAr, "#ff6347")}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="thermometer" size={20} color="#1b5e20" />
            <Text style={styles.cardTitle}>Temperatura do Ar</Text>
          </View>
          <Text style={styles.cardSubtitle}>Últimos 7 registros (°C)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: temperaturaAr, color: () => "#ff6347" }] }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Umidade do Ar */}
      <TouchableOpacity onPress={() => openModal("Umidade do Ar", umidadeAr, "#1e88e5")}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="droplet" size={20} color="#1b5e20" />
            <Text style={styles.cardTitle}>Umidade do Ar</Text>
          </View>
          <Text style={styles.cardSubtitle}>Últimos 7 registros (%)</Text>
          <LineChart
            data={{ labels, datasets: [{ data: umidadeAr, color: () => "#1e88e5" }] }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Modal Expandido */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          {selectedChart && (
            <>
              <Text style={styles.modalTitle}>{selectedChart.label}</Text>
              <LineChart
                data={{ labels, datasets: [{ data: selectedChart.data, color: () => selectedChart.color }] }}
                width={screenWidth}
                height={400}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#042b00",
    textAlign: "center",
    marginVertical: 12,
    backgroundColor: "#e8f5e9",
    padding: 6,
    borderRadius: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c8e6c9",
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#1b5e20", marginLeft: 6 },
  cardSubtitle: { fontSize: 12, color: "#555", marginBottom: 8 },
  chart: { borderRadius: 12 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  closeButton: { marginTop: 20, padding: 10, backgroundColor: "#1b5e20", borderRadius: 8 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});
