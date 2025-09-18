import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { LineChart, StackedBarChart } from "react-native-chart-kit";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Sensor {
  timestamp: string;
  umidadeSolo?: number;
  luminosidade?: number;
  tempSolo?: number;
  tempAr?: number;
}

export default function RelatorioGraficos() {
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<Sensor[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${API_URL}/sensores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          const agora = new Date();
          const limite = new Date(agora.getTime() - 24 * 60 * 60 * 1000); // últimas 24h
          const filtrados = data.filter((item) => new Date(item.timestamp) >= limite);
          setHistorico(filtrados);
        } else {
          setHistorico([]);
        }
      } catch (err) {
        console.error("Erro ao buscar sensores:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#1b5e20" style={{ marginTop: 50 }} />;
  }

  const labels = historico.map((h) =>
    new Date(h.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
  const umidade = historico.map((h) => h.umidadeSolo || 0);
  const luminosidade = historico.map((h) => h.luminosidade || 0);
  const temperaturas = historico.map((h) => [h.tempSolo || 0, h.tempAr || 0]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>RELATÓRIO DE GRÁFICOS</Text>

      {/* Umidade do solo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="water-percent" size={20} color="#1b5e20" />
          <Text style={styles.cardTitle}>Umidade do solo</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimas 24 horas [%]</Text>
        <LineChart
          data={{ labels, datasets: [{ data: umidade }] }}
          width={Dimensions.get("window").width - 48}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Luminosidade */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="sun" size={20} color="#f57c00" />
          <Text style={styles.cardTitle}>Luminosidade</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimas 24 horas [lux]</Text>
        <LineChart
          data={{ labels, datasets: [{ data: luminosidade }] }}
          width={Dimensions.get("window").width - 48}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Temperatura solo vs ar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="thermometer" size={20} color="#1b5e20" />
          <Text style={styles.cardTitle}>Temperatura Solo vs Ar</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimas 24 horas [°C]</Text>
        <StackedBarChart
          data={{ labels, legend: ["Solo", "Ar"], data: temperaturas, barColors: ["#1b5e20", "#f57c00"] }}
          width={Dimensions.get("window").width - 48}
          height={250}
          chartConfig={chartConfig}
          style={styles.chart}
          hideLegend={false}
        />
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "5", strokeWidth: "2", stroke: "#1b5e20" },
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#042b00",
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderColor: "#c8e6c9",
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 6, color: "#042b00" },
  cardSubtitle: { fontSize: 13, color: "#444", marginBottom: 8 },
  chart: { borderRadius: 12 },
});
