import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const API_URL = "https://auone-backend.onrender.com";

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

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Usuario>({});
  const [token, setToken] = useState<string | null>(null);
  const [sensores, setSensores] = useState({
    umidadeSolo: null,
    luminosidade: null,
    tempSolo: null,
    tempAr: null,
  });

  useEffect(() => {
    const carregarToken = async () => {
      const t = await AsyncStorage.getItem("token");
      setToken(t);
    };
    carregarToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      setLoading(true);
      try {
        const resUser = await fetch(`${API_URL}/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();
        setUsuario(userData);
        setFormData(userData);

        const resSensores = await fetch(`${API_URL}/sensores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sensoresData = await resSensores.json();
        setSensores(sensoresData);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/perfil`, {
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

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#2196F3"
        style={{ marginTop: 50 }}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ alignItems: "center", marginTop: 24 }}>
        <Image
          source={usuario?.foto ? { uri: usuario.foto } : undefined}
          style={styles.avatar}
        />
        <Text style={styles.nome}>{usuario?.nome || "-"}</Text>
        <Text style={styles.profissao}>{usuario?.profissao || "-"}</Text>
        <TouchableOpacity style={styles.empresaButton}>
          <Text style={styles.empresaButtonText}>
            {usuario?.empresa || "-"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Informações */}
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
              {usuario?.areaTotal
                ? `${usuario.areaTotal} hectares`
                : "-"}
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
            <Text style={styles.infoValue}>
              {usuario?.cultivos || "-"}
            </Text>
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

      {/* Botões */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setEditMode(false)}
          disabled={!editMode}
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

      {/* Sensores */}
      <View style={styles.sensoresGrid}>
        <View style={styles.sensorCard}>
          <MaterialCommunityIcons
            name="water-percent"
            size={24}
            color="#1b5e20"
          />
          <Text style={styles.sensorLabel}>Umidade Solo</Text>
          <Text style={styles.sensorValue}>
            {sensores.umidadeSolo !== null
              ? `${sensores.umidadeSolo}%`
              : "-"}
          </Text>
        </View>
        <View style={styles.sensorCard}>
          <Feather name="sun" size={24} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Luminosidade</Text>
          <Text style={styles.sensorValue}>
            {sensores.luminosidade !== null
              ? `${sensores.luminosidade} lux`
              : "-"}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 18 },
    avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#042b00',
    textAlign: 'center',
  },
  profissao: {
    fontSize: 16,
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 4,
  },
  empresaButton: {
    backgroundColor: '#1b5e20',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginBottom: 12,
  },
  empresaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#1b5e20',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#042b00',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderColor: '#1b5e20',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#1b5e20',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sensoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 18,
  },
  sensorCard: {
    width: '47%',
    backgroundColor: '#f5f5f5',
    borderColor: '#1b5e20',
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  sensorLabel: {
    fontSize: 14,
    color: '#1b5e20',
    marginTop: 4,
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#042b00',
    marginTop: 2,
  },
});
