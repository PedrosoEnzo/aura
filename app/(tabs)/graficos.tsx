import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons, Feather, FontAwesome5 } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const API_URL = "http://localhost:3000"; // ajuste para sua API

interface SensorData {
  timestamp: string;
  umidadeSolo: number;
  luminosidade: number;
  tempSolo: number;
  tempAr: number;
}

export default function RelatorioGraficos() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<SensorData[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/sensores/historico?horas=24`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setDados(data);
      } catch (err) {
        console.error("Erro ao buscar sensores", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />;

  const labels = dados.map(d => new Date(d.timestamp).getHours() + "h");
  const umidade = dados.map(d => d.umidadeSolo);
  const luminosidade = dados.map(d => d.luminosidade);
  const tempSolo = dados.map(d => d.tempSolo);
  const tempAr = dados.map(d => d.tempAr);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(4, 43, 0, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: "4", strokeWidth: "1", stroke: "#1b5e20" },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>RELATÓRIO DE GRÁFICOS</Text>

      {/* Umidade do solo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="water-percent" size={20} color="#1b5e20" />
          <Text style={styles.cardTitle}>Umidade do Solo</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimas 24 horas (%)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: umidade }] }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Luminosidade */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="sun" size={20} color="#1b5e20" />
          <Text style={styles.cardTitle}>Luminosidade</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimas 24 horas (lux)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: luminosidade }] }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Temperatura do Solo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="seedling" size={18} color="#1b5e20" />
          <Text style={styles.cardTitle}>Temperatura do Solo</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimas 24 horas (°C)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: tempSolo }] }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Temperatura e Umidade do Ar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="thermometer" size={20} color="#1b5e20" />
          <Text style={styles.cardTitle}>Temperatura e Umidade do Ar</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimas 24 horas</Text>
        <LineChart
          data={{
            labels,
            datasets: [
              { data: tempAr, color: () => "rgba(255, 99, 71, 1)" }, // vermelho p/ temp
              { data: umidade, color: () => "rgba(30, 136, 229, 1)" }, // azul p/ umidade
            ],
            legend: ["Temperatura do Ar (°C)", "Umidade do Solo (%)"],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
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
    alignSelf: "center",
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
});
