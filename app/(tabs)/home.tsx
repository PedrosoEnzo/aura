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

const API_URL = "https://aura-back-app.onrender.com/api/auth";

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
  const [sensores, setSensores] = useState({
    umidadeSolo: null,
    luminosidade: null,
    tempSolo: null,
    tempAr: null,
  });

  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [parametro, setParametro] = useState('todos');
  const [relatorio, setRelatorio] = useState<any[]>([]);

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
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const gerarRelatorio = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Erro', 'Token não encontrado.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/sensores/relatorio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        console.error('Erro ao gerar relatório:', res.status, errorText);
        Alert.alert('Erro', 'Não foi possível gerar o relatório.');
        return;
      }

      const dados = await res.json();
      setRelatorio(dados);
      Alert.alert('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      Alert.alert('Erro', 'Falha na comunicação com o servidor.');
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        </View>

        <View style={styles.sensorCard}>
          <Feather name="thermometer" size={24} color="#1b5e20" />
          <Text style={styles.sensorLabel}>Temp. do Ar</Text>
          <Text style={styles.sensorValue}>
            {sensores.tempAr !== null ? `${sensores.tempAr}°` : "-"}
          </Text>
        </View>
      </View>

      {/* Gerador de Gráficos */}
      <View style={styles.containerChart}>
        <Text style={styles.textChart}>
          Gerador de Gráficos
        </Text>
        <Text style={styles.subTextChart}>
          Análise detalhada de dados ambientais por período
        </Text>

        <TextInput
          style={styles.inputStyled}
          placeholder="Data Inicial (dd/mm/aaaa)"
          value={dataInicial}
          onChangeText={setDataInicial}
        />
        <TextInput
          style={styles.inputStyled}
          placeholder="Data Final (dd/mm/aaaa)"
          value={dataFinal}
          onChangeText={setDataFinal}
        />
        <TextInput
          style={styles.inputStyled}
          placeholder="Parâmetro (ex: umidadeSolo, todos)"
          value={parametro}
          onChangeText={setParametro}
        />

        <TouchableOpacity style={styles.chartButton} onPress={gerarRelatorio}>
          <Text style={styles.chartButtonText}>Gerar Relatório</Text>
        </TouchableOpacity>

        {relatorio.length > 0 && (
          <View style={styles.containerReports}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#042b00', marginBottom: 8 }}>
              Dados do Relatório:
            </Text>
            {relatorio.map((item, index) => (
              <Text key={index} style={{ color: '#1b5e20', marginBottom: 4 }}>
                {JSON.stringify(item)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 18
  },
  header: {
    alignItems: "center",
    marginTop: 24
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#042b00',
    textAlign: 'center'
  },
  profissao: {
    fontSize: 16,
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 4
  },
  empresaButton: {
    backgroundColor: '#1b5e20',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginBottom: 12
  },
  empresaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  infoCol: {
    flex: 1,
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 13,
    color: '#1b5e20'
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#042b00'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12
  },
  actionButton: {
    backgroundColor: '#fff',
    borderColor: '#1b5e20',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 4
  },
  actionButtonText: {
    color: '#1b5e20',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chartButton: {
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderColor: '#1b5e20',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    width: '50%',
    alignItems: 'center'
  },
  chartButtonText: {
    color: '#1b5e20',
    fontWeight: 'bold',
    fontSize: 15,
    alignItems: 'center'
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
    marginBottom: 12
  },
  sensorLabel: {
    fontSize: 14,
    color: '#1b5e20',
    marginTop: 4
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#042b00',
    marginTop: 2
  },
  containerChart: {
    marginVertical: 20
  },
  textChart: {
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#042b00', 
    marginBottom: 8
  },
  subTextChart: {
    fontSize: 14, 
    color: '#1b5e20', 
    marginBottom: 12
  },
  inputStyled: {
    borderWidth: 1,
    borderColor: '#1b5e20',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    color: '#042b00',
    fontSize: 15,
  },
  containerReports: {
    marginTop: 20
  },
  reportingData: {
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#042b00', 
    marginBottom: 8
  }
});
