// Home.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

import AgroBanner from "../components/AgroBanner";

// ===== CONFIGURAÇÃO DAS APIs =====
const API_URL = "https://aura-back-app.onrender.com/api/auth";
const SENSOR_API = "https://aura-back-app.onrender.com/api/sensores/sensores";


interface Usuario {
  id?: string;
  nome?: string;
  email?: string;
  profissao?: string;
  empresa?: string;
  foto?: string;
  areaTotal?: number;
  cultivos?: string;
  dispositivosAtivos?: number;
  ultimaAtualizacao?: string;
}

// ===== COMPONENTE PRINCIPAL =====
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Usuario>({});
  const [sensores, setSensores] = useState({
    umidadeSolo: null as number | null,
    luminosidade: null as number | null,
    tempSolo: null as number | null,
    tempAr: null as number | null,
    umidadeAr: null as number | null,
  });

  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [parametro, setParametro] = useState("todos");
  const [relatorio, setRelatorio] = useState<any[]>([]);

  // ===== BUSCA DE DADOS DO USUÁRIO =====
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const resUser = await fetch(`${API_URL}/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = await resUser.json();
        setUsuario(userData);
        setFormData(userData);
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ===== BUSCAR DADOS DO BANCO (SENSORES) =====
  const fetchSensores = async () => {
    try {
      const res = await fetch(SENSOR_API);
      const data = await res.json();

      console.log("📡 Dados recebidos do banco:", data);

      setSensores({
        umidadeSolo: data.umidadeSolo ?? null,
        luminosidade: data.luminosidade ?? null,
        tempSolo: null, // não existe no banco
        tempAr: data.temperaturaAr ?? null,
        umidadeAr: data.umidadeAr ?? null,
      });

    } catch (err) {
      console.error("Erro ao buscar sensores:", err);
    }
  };

  // ===== ATUALIZAOS SENSORES =====
  useEffect(() => {
    fetchSensores();
    const interval = setInterval(fetchSensores, 3600000); // A cada 1 hora
    return () => clearInterval(interval);
  }, []);

  // ===== MANIPULAÇÃO DE CAMPOS =====
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ===== SALVAR PERFIL =====
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/atualizarPerfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setUsuario(data);
      setEditMode(false);
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOADING =====
  if (loading)
    return <ActivityIndicator size="large" color="#269726ff" style={{ marginTop: 50 }} />;

  // ===== RENDER =====
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ===== CABEÇALHO (Informações do Perfil) ===== */}
      <View style={styles.header}>
        <Image
          source={usuario?.foto ? { uri: usuario.foto } : undefined}
          style={styles.avatar}
        />
        <Text style={styles.nome}>{usuario?.nome || "-"}</Text>
        <Text style={styles.profissao}>{usuario?.profissao || "-"}</Text>

        <TouchableOpacity style={styles.empresaButton}>
          <Text style={styles.empresaButtonText}>{usuario?.empresa || "-"}</Text>
        </TouchableOpacity>
      </View>

      {/* ===== AGRO BANNER ===== */}
      <AgroBanner />

      {/* ===== SENSOR CARDS ===== */}
      <View style={styles.sensoresGrid}>
        <View style={styles.sensorCard}>
          <MaterialCommunityIcons name="water-percent" size={24} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Umidade Solo</Text>
          <Text style={styles.sensorValue}>
            {sensores.umidadeSolo !== null ? `${sensores.umidadeSolo}%` : "-"}
          </Text>
        </View>

        <View style={styles.sensorCard}>
          <Feather name="sun" size={24} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Luminosidade</Text>
          <Text style={styles.sensorValue}>
            {sensores.luminosidade !== null ? `${sensores.luminosidade} lux` : "-"}
          </Text>
        </View>

        <View style={styles.sensorCard}>
          <Feather name="thermometer" size={24} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Temp. do Ar</Text>
          <Text style={styles.sensorValue}>
            {sensores.tempAr !== null ? `${sensores.tempAr}°C` : "-"}
          </Text>
        </View>

        <View style={styles.sensorCard}>
          <MaterialCommunityIcons name="air-humidifier" size={24} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Umidade do Ar</Text>
          <Text style={styles.sensorValue}>
            {sensores.umidadeAr !== null ? `${sensores.umidadeAr}%` : "-"}
          </Text>
        </View>
      </View>


      {/* ===== INFO E BOTÕES (Container Branco) ===== */}
      <View style={styles.retangle}>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Área Total</Text>
            {editMode ? (
              <TextInput
                style={styles.infoValue}
                value={formData.areaTotal?.toString() || ""}
                onChangeText={(t) => handleChange("areaTotal", t.replace(/[^\d.]/g, ""))}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>
                {usuario?.areaTotal ? `${usuario.areaTotal} hectares` : "-"}
              </Text>
            )}
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Cultivos</Text>
            {editMode ? (
              <TextInput
                style={styles.infoValue}
                value={formData.cultivos || ""}
                onChangeText={(t) => handleChange("cultivos", t)}
              />
            ) : (
              <Text style={styles.infoValue}>{usuario?.cultivos || "-"}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Dispositivos Ativos</Text>
            {editMode ? (
              <TextInput
                style={styles.infoValue}
                value={formData.dispositivosAtivos?.toString() || ""}
                onChangeText={(t) => handleChange("dispositivosAtivos", t.replace(/[^\d]/g, ""))}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>
                {usuario?.dispositivosAtivos
                  ? `${usuario.dispositivosAtivos} unidades`
                  : "-"}
              </Text>
            )}
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Última Atualização</Text>
            <Text style={styles.infoValue}>
              {usuario?.ultimaAtualizacao
                ? new Date(usuario.ultimaAtualizacao).toLocaleString()
                : "-"}
            </Text>
          </View>
        </View>

        {/* ===== BOTÕES ===== */}
        <View style={styles.buttonRow}>
          {/* Botão Secundário - Relatório */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={() => alert('Função de Relatório será implementada aqui!')} // Ação temporária
          >
            <Text style={styles.secondaryButtonText}>Relatório Dos Dados</Text>
          </TouchableOpacity>

          {editMode ? (
            // Botão Primário - Salvar
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Salvar</Text>
            </TouchableOpacity>
          ) : (
            // Botão Secundário - Editar
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setEditMode(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// ===== ESTILOS DA HOME =====
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9fafb",
    padding: 0,
  },
  header: {
    alignItems: "center",
    marginTop: 50,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: "#0a5246", // ALTERADO: De #4caf50 para #0a5246
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  nome: {
    fontSize: 24,
    fontWeight: "700",
    color: "#004d40", // ALTERADO: De #1b5e20 para #004d40
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  profissao: {
    fontSize: 15,
    color: "#6b6b6b",
    marginTop: 4,
    fontWeight: "500",
  },

  empresaButton: {
    backgroundColor: "#0a5246", // ALTERADO: De #4caf50 para #0a5246
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginTop: 16,
    shadowColor: "#0a5246", // ALTERADO: De #4caf50 para #0a5246
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  empresaButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  // 1. Estilo do Contêiner Principal
  retangle: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    marginBottom: 100,
    marginHorizontal: 20,
    shadowColor: "#004d40", // ALTERADO: De #204b22ff para #004d40
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 6,
    // Removido alignItems: "center" para permitir que o infoRow ocupe 100% da largura.
  },

  // --- Linha (Flex Container) ---
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginVertical: 8,
  },

  infoCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  infoLabel: {
    fontSize: 14,
    color: "#6b6b6b",
    marginBottom: 6,
    textAlign: "center",
  },

  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#004d40", // ALTERADO: De #2e7d32 para #004d40
    textAlign: "center",
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: "#0a5246", // ALTERADO: De #2e7d32 para #0a5246
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderColor: "#0a5246", // ALTERADO: De #2e7d32 para #0a5246
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#0a5246", // ALTERADO: De #2e7d32 para #0a5246
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sensoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 20,
    paddingHorizontal: 24,
  },
  sensorCard: {
    width: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    alignItems: "center",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 1,
  },
  sensorLabel: {
    fontSize: 14,
    color: "#0a5246", // ALTERADO: De #4caf50 para #0a5246
    marginTop: 6
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#004d40", // ALTERADO: De #1b5e20 para #004d40
    marginTop: 4
  },
});