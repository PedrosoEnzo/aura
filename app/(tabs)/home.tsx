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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";

// ===== CONFIGURAÇÃO DAS APIs =====
const API_URL = "https://aura-back-app.onrender.com/api/auth";
const SENSOR_API = "http://10.92.199.19:3000/data"; // <-- rota do ESP32

// ===== TIPO DO USUÁRIO =====
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
        if (!token) {
          console.warn("Token não encontrado");
          return;
        }

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

  // ===== FUNÇÃO PARA BUSCAR DADOS DOS SENSORES (ESP32) =====
  const fetchSensores = async () => {
    try {
      const res = await fetch(SENSOR_API);
      const data = await res.json();
      setSensores({
        umidadeSolo: data.umidadeSolo ?? null,
        luminosidade: data.luminosidade ?? null,
        tempSolo: data.temperaturaSolo ?? null,
        tempAr: data.temperaturaAr ?? null,
        umidadeAr: data.umidadeAr ?? null,
      });
    } catch (err) {
      console.error("Erro ao buscar sensores:", err);
    }
  };

  // ===== ATUALIZA AUTOMATICAMENTE OS SENSORES =====
  useEffect(() => {
    fetchSensores(); // primeira atualização
    const interval = setInterval(fetchSensores, 2000); // atualiza a cada 2s
    return () => clearInterval(interval);
  }, []);

  // ===== MANIPULAÇÃO DE CAMPOS =====
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== SALVAR PERFIL =====
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("Token não encontrado");
        return;
      }

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

  // ===== GERAR RELATÓRIO (opcional, se tiver backend configurado) =====
  const gerarRelatorio = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Erro", "Token não encontrado.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/sensores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dataInicial,
          dataFinal,
          parametro,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao gerar relatório:", res.status, errorText);
        Alert.alert("Erro", "Não foi possível gerar o relatório.");
        return;
      }

      const dados = await res.json();
      setRelatorio(dados);
      Alert.alert("Relatório gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
    }
  };

  // ===== LOADING =====
  if (loading)
    return (
      <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
    );

  // ===== RENDERIZAÇÃO =====
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ===== CABEÇALHO ===== */}
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

      {/* ===== INFORMAÇÕES ===== */}
      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Área Total</Text>
          {editMode ? (
            <TextInput
              style={styles.infoValue}
              value={formData.areaTotal?.toString() || ""}
              onChangeText={(text) =>
                handleChange("areaTotal", text.replace(/[^\d.]/g, ""))
              }
              keyboardType="numeric"
              placeholder="hectares"
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
              onChangeText={(text) => handleChange("cultivos", text)}
              placeholder="Ex: Alface, Soja, Milho"
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
              onChangeText={(text) =>
                handleChange("dispositivosAtivos", text.replace(/[^\d]/g, ""))
              }
              keyboardType="numeric"
              placeholder="Quantidade"
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
        <TouchableOpacity
          style={styles.actionButton}
          onPress={gerarRelatorio}
        >
          <Text style={styles.actionButtonText}>Relatório Completo</Text>
        </TouchableOpacity>

        {editMode ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>Salvar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setEditMode(true)}
          >
            <Text style={styles.actionButtonText}>Editar informações</Text>
          </TouchableOpacity>
        )}
      </View>

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
          <FontAwesome5 name="seedling" size={22} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Temp. do Solo</Text>
          <Text style={styles.sensorValue}>
            {sensores.tempSolo !== null ? `${sensores.tempSolo}°` : "-"}
          </Text>
        </View>

        <View style={styles.sensorCard}>
          <Feather name="thermometer" size={24} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Temp. do Ar</Text>
          <Text style={styles.sensorValue}>
            {sensores.tempAr !== null ? `${sensores.tempAr}°` : "-"}
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
    </ScrollView>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 18 },
  header: { alignItems: "center", marginTop: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 8 },
  nome: { fontSize: 22, fontWeight: "bold", color: "#042b00", textAlign: "center" },
  profissao: { fontSize: 16, color: "#1b5e20", textAlign: "center", marginBottom: 4 },
  empresaButton: {
    backgroundColor: "#1b5e20",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 18,
    alignSelf: "center",
    marginBottom: 12,
  },
  empresaButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  infoCol: { flex: 1, alignItems: "center" },
  infoLabel: { fontSize: 13, color: "#1b5e20" },
  infoValue: { fontSize: 15, fontWeight: "bold", color: "#042b00" },
  buttonRow: { flexDirection: "row", justifyContent: "center", marginVertical: 12 },
  actionButton: {
    backgroundColor: "#fff",
    borderColor: "#1b5e20",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 4,
  },
  actionButtonText: { color: "#1b5e20", fontWeight: "bold", fontSize: 15 },
  sensoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 18,
  },
  sensorCard: {
    width: "47%",
    backgroundColor: "#f5f5f5",
    borderColor: "#1b5e20",
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
  },
  sensorLabel: { fontSize: 14, color: "#1b5e20", marginTop: 4 },
  sensorValue: { fontSize: 22, fontWeight: "bold", color: "#042b00", marginTop: 2 },
});
