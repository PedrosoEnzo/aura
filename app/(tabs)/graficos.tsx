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

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
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
        color="#264d00"
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

  // 🔥 NOVO DESIGN – estilo SLIM e científico
  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",

    decimalPlaces: 1,
    color: () => "#4a5e39", // verde musgo elegante
    labelColor: () => "#555",

    strokeWidth: 1.8, // linha fina, igual à imagem

    propsForDots: {
      r: "0", // sem bolinhas para ficar clean
    },

    propsForBackgroundLines: {
      stroke: "#d0d0d0",
      strokeWidth: 1,
    },
  };

  const openModal = (label: string, data: number[], color: string) => {
    setSelectedChart({ label, data: sanitize(data), color });
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>RELATÓRIO DE GRÁFICOS</Text>

      {/* Umidade do Solo */}
      <TouchableOpacity
        onPress={() => openModal("Umidade do Solo", umidade, "#4a5e39")}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="water-percent"
              size={20}
              color="#4a5e39"
            />
            <Text style={styles.cardTitle}>Umidade do Solo</Text>
          </View>

          <LineChart
            data={{ labels, datasets: [{ data: umidade }] }}
            width={screenWidth - 40}
            height={170}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Luminosidade */}
      <TouchableOpacity
        onPress={() => openModal("Luminosidade", luminosidade, "#4a5e39")}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="sun" size={20} color="#4a5e39" />
            <Text style={styles.cardTitle}>Luminosidade</Text>
          </View>

          <LineChart
            data={{ labels, datasets: [{ data: luminosidade }] }}
            width={screenWidth - 40}
            height={170}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Temperatura do Ar */}
      <TouchableOpacity
        onPress={() =>
          openModal("Temperatura do Ar", temperaturaAr, "#4a5e39")
        }
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="thermometer" size={20} color="#4a5e39" />
            <Text style={styles.cardTitle}>Temperatura do Ar</Text>
          </View>

          <LineChart
            data={{ labels, datasets: [{ data: temperaturaAr }] }}
            width={screenWidth - 40}
            height={170}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Umidade do Ar */}
      <TouchableOpacity
        onPress={() => openModal("Umidade do Ar", umidadeAr, "#4a5e39")}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="droplet" size={20} color="#4a5e39" />
            <Text style={styles.cardTitle}>Umidade do Ar</Text>
          </View>

          <LineChart
            data={{ labels, datasets: [{ data: umidadeAr }] }}
            width={screenWidth - 40}
            height={170}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          {selectedChart && (
            <>
              <Text style={styles.modalTitle}>{selectedChart.label}</Text>

              <LineChart
                data={{
                  labels,
                  datasets: [
                    {
                      data: selectedChart.data,
                      color: () => selectedChart.color,
                    },
                  ],
                }}
                width={screenWidth}
                height={300}
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
  container: {
    backgroundColor: "#ffffff",
    padding: 12,
  },

  header: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3a3a3a",
    textAlign: "center",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    padding: 14,
    marginBottom: 24,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4a5e39",
    marginLeft: 6,
  },

  chart: {
    borderRadius: 12,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 40,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#4a5e39",
  },

  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#4a5e39",
    borderRadius: 8,
  },

  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
