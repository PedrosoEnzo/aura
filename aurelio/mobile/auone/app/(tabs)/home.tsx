import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      const usuarioId = await AsyncStorage.getItem("usuarioId");
      if (!usuarioId) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      try {
        const res = await fetch(`http://10.92.199.8:3000/api/usuario/${usuarioId}`);
        const json = await res.json();
        setUsuario(json);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados.");
      }
    };
    carregarDados();
  }, []);

  if (!usuario) return <Text style={{ marginTop: 50, textAlign: "center" }}>Carregando...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{usuario.nome || "Usuário sem nome"}</Text>
      <Text style={styles.subtitulo}>{usuario.email}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Dispositivos Ativos:</Text>
        <Text style={styles.valor}>{usuario.dispositivos?.length || 0}</Text>
      </View>

      {usuario.dispositivos?.length > 0 && (
        <Text style={[styles.label, { marginBottom: 10 }]}>Últimos dados dos sensores:</Text>
      )}

      {usuario.dispositivos?.map((disp, index) => {
        const sensor = disp.sensores?.[0];
        return (
          <View key={disp.id} style={styles.dispositivoCard}>
            <Text style={styles.dispositivoTitulo}>{disp.nome || `Dispositivo ${index + 1}`}</Text>
            {sensor ? (
              <>
                <Text style={styles.metric}>🌱 Umidade: {sensor.umidadeSolo}%</Text>
                <Text style={styles.metric}>🌡️ Temp. Solo: {sensor.temperaturaSolo}°C</Text>
                <Text style={styles.metric}>🌬️ Temp. Ar: {sensor.temperaturaAr}°C</Text>
                <Text style={styles.metric}>☀️ Luminosidade: {sensor.luminosidade} lux</Text>
                <Text style={styles.metric}>📅 Leitura: {new Date(sensor.criadoEm).toLocaleString()}</Text>
              </>
            ) : (
              <Text style={styles.metric}>Nenhum sensor registrado</Text>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.botao}>
        <Text style={styles.botaoTexto}>Gerar Relatório</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#042b00",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    color: "#042b00",
    fontSize: 16,
  },
  valor: {
    fontSize: 16,
    color: "#333",
  },
  dispositivoCard: {
    backgroundColor: "#e6ffe6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dispositivoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#042b00",
    marginBottom: 10,
  },
  metric: {
    fontSize: 15,
    marginBottom: 5,
    color: "#042b00",
  },
  botao: {
    backgroundColor: "#042b00",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
