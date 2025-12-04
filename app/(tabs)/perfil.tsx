import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';

let Device: any = { isDevice: true };
try {
  Device = require("expo-device");
} catch (e) {
  console.log("expo-device não carregado, usando fallback seguro.");
}

const API_URL = 'https://aura-back-app.onrender.com/api/auth';
const SENSOR_API = 'https://aura-back-app.onrender.com/api/sensores/sensores';
const LIMIAR_BOMBA = 50;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Usuario {
  id: string;
  nome: string;
  email: string;
  profissao?: string;
  empresa?: string;
  foto?: string;
  erro?: string;
}

type NotificacaoItem = {
  id: string;
  tipo: 'solo_seco' | 'ar_seco' | 'bomba_on' | 'bomba_off' | 'info';
  texto: string;
  timestamp: string;
};

async function sendLocalNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (err) {
    console.error('Erro ao notificar:', err);
  }
}

const nowISO = () => new Date().toISOString();

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    profissao: '',
    empresa: '',
    foto: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const hasUnread = notificacoes.length > 0;

  const soloSecoNotificado = useRef(false);
  const arSecoNotificado = useRef(false);
  const bombaLigadaRef = useRef<boolean | null>(null);

  // ================= PERMISSÃO DE NOTIFICAÇÃO =================
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        finalStatus = req.status;
      }
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Ative notificações para receber alertas dos sensores."
        );
      }
    })();
  }, []);

  // ===================== BUSCAR PERFIL =====================
  useEffect(() => {
    async function fetchPerfil() {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setUsuario({ id: '', nome: '', email: '', erro: "Token não encontrado." });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: Usuario = await res.json();
        setUsuario(data);
        setFormData({
          nome: data.nome || "",
          email: data.email || "",
          profissao: data.profissao || "",
          empresa: data.empresa || "",
          foto: data.foto || "",
        });
      } catch {
        setUsuario({ id: '', nome: '', email: '', erro: "Erro ao carregar perfil." });
      }
      setLoading(false);
    }
    fetchPerfil();
  }, []);

  // ====== PUSH NOTIFICAÇÃO ======
  const pushNotificacaoInterna = (tipo: NotificacaoItem["tipo"], texto: string) => {
    setNotificacoes((prev) => [
      {
        id: `${Date.now()}_${Math.random()}`,
        tipo,
        texto,
        timestamp: nowISO()
      },
      ...prev
    ]);
  };

  // ====== BUSCAR SENSORES ======
  const fetchSensoresEProcessa = async () => {
    try {
      const res = await fetch(SENSOR_API);
      if (!res.ok) throw new Error("Falha na requisição do sensor");

      const data = await res.json();
      const umidadeSolo = data.umidadeSolo ?? data.umidade_solo ?? null;
      const umidadeAr = data.umidadeAr ?? data.umidade_ar ?? null;
      const temperatura = data.temperatura ?? data.temp ?? null; // exemplo de sensor extra

      // ===== Checar falha nos dados =====
      if (umidadeSolo === null || umidadeAr === null || temperatura === null) {
        const texto = "Falha no envio de dados do sensor!";
        pushNotificacaoInterna("info", texto);
        sendLocalNotification("Falha Sensor", texto);
        return; // interrompe processamento
      }

      // ===== Notificações normais =====
      if (umidadeSolo < LIMIAR_BOMBA && !soloSecoNotificado.current) {
        const texto = `Umidade do solo ${umidadeSolo}% — abaixo de ${LIMIAR_BOMBA}%.`;
        pushNotificacaoInterna("solo_seco", texto);
        sendLocalNotification("Solo Seco", texto);
        soloSecoNotificado.current = true;
      }
      if (umidadeSolo >= LIMIAR_BOMBA) soloSecoNotificado.current = false;

      if (umidadeAr < LIMIAR_BOMBA && !arSecoNotificado.current) {
        const texto = `Umidade do ar ${umidadeAr}% — abaixo de ${LIMIAR_BOMBA}%.`;
        pushNotificacaoInterna("ar_seco", texto);
        sendLocalNotification("Ar Seco", texto);
        arSecoNotificado.current = true;
      }
      if (umidadeAr >= LIMIAR_BOMBA) arSecoNotificado.current = false;

      const bombaAtiva =
        (typeof umidadeSolo === "number" && umidadeSolo < LIMIAR_BOMBA) ||
        (typeof umidadeAr === "number" && umidadeAr < LIMIAR_BOMBA);

      if (bombaLigadaRef.current === null) {
        bombaLigadaRef.current = bombaAtiva;
      } else {
        if (bombaAtiva && bombaLigadaRef.current === false) {
          pushNotificacaoInterna("bomba_on", "Bomba acionada automaticamente.");
          sendLocalNotification("Bomba Ligada", "A bomba foi ligada.");
        }
        if (!bombaAtiva && bombaLigadaRef.current === true) {
          pushNotificacaoInterna("bomba_off", "Bomba desligada.");
          sendLocalNotification("Bomba Desligada", "A bomba foi desligada.");
        }
        bombaLigadaRef.current = bombaAtiva;
      }
    } catch (err) {
      console.log("Erro sensores:", err);
      const texto = "Falha ao buscar dados do sensor!";
      pushNotificacaoInterna("info", texto);
      sendLocalNotification("Erro Sensor", texto);
    }
  };

  // ===== Intervalo de 2 segundos =====
  useEffect(() => {
    fetchSensoresEProcessa(); // primeira chamada imediata
    const interval = setInterval(fetchSensoresEProcessa, 60 * 60 * 1000); // a cada 1h
    return () => clearInterval(interval);
  }, []);


  // ====== SALVAR PERFIL COM VALIDAÇÃO ======
  const handleSave = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'O campo nome não pode estar vazio.');
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Erro', 'Digite um email válido.');
      return;
    }

    setSaving(true);
    const token = await AsyncStorage.getItem('token');
    if (!token || !usuario?.id) {
      Alert.alert('Erro', 'Token ou ID do usuário não encontrado.');
      setSaving(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('nome', formData.nome);
      form.append('email', formData.email);
      form.append('profissao', formData.profissao);
      form.append('empresa', formData.empresa);

      if (formData.foto && formData.foto.startsWith('file://')) {
        const filename = formData.foto.split('/').pop() || 'foto.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';
        form.append('foto', { uri: formData.foto, name: filename, type } as any);
      }

      const res = await fetch(`${API_URL}/atualizarPerfil`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Erro ao atualizar perfil: ${res.status} - ${errText}`);
      }

      const data: Usuario = await res.json();
      setUsuario(data);
      setFormData({
        nome: data.nome || '',
        email: data.email || '',
        profissao: data.profissao || '',
        empresa: data.empresa || '',
        foto: data.foto || '',
      });
      setEditMode(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  // ====== ESCOLHER FOTO ======
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFormData({ ...formData, foto: uri });
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#1b5e20" style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* NOTIFICAÇÕES */}
        <View style={{ width: "100%", alignItems: "flex-end", marginBottom: 10 }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              setShowNotifications(true);
              setNotificacoes([]);
            }}
          >
            <View>
              <Feather name="bell" size={30} color="#1b5e20" />
              {hasUnread && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>!</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
        < View style={styles.titleContainer}>
          <Text style={styles.titlePerfil1}>Olá,</Text>

          <TextInput
            style={styles.titlePerfil}
            value={formData.nome}
            onChangeText={(t) => setFormData({ ...formData, nome: t })}
            placeholder="Nome"
            placeholderTextColor="#666"
          />


        </View>

        {/* FOTO */}
        <TouchableOpacity onPress={editMode ? handlePickImage : undefined} style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={formData.foto ? { uri: formData.foto } : require('../../assets/images/auone.png')}
          />
          {editMode && (
            <View style={styles.cameraOverlay}>
              <Feather name="camera" size={24} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* CAMPOS */}
        {editMode ? (
          <>
            <View style={styles.section}>
              <View style={styles.inputBox}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#1b5e20" />
                <TextInput
                  style={styles.inputText}
                  value={formData.nome}
                  onChangeText={(t) => setFormData({ ...formData, nome: t })}
                  placeholder="Nome"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.inputBox}>
                <MaterialCommunityIcons name="email-outline" size={22} color="#1b5e20" />
                <TextInput
                  style={styles.inputText}
                  value={formData.email}
                  onChangeText={(t) => setFormData({ ...formData, email: t })}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputBox}>
                <FontAwesome5 name="seedling" size={20} color="#1b5e20" />
                <TextInput
                  style={styles.inputText}
                  value={formData.profissao}
                  onChangeText={(t) => setFormData({ ...formData, profissao: t })}
                  placeholder="Profissão"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.inputBox}>
                <Feather name="briefcase" size={22} color="#1b5e20" />
                <TextInput
                  style={styles.inputText}
                  value={formData.empresa}
                  onChangeText={(t) => setFormData({ ...formData, empresa: t })}
                  placeholder="Empresa"
                  placeholderTextColor="#666"
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.updateButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.fieldBox}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#1b5e20" />
                <Text style={styles.fieldText}>{formData.nome}</Text>
              </View>
              <View style={styles.fieldBox}>
                <MaterialCommunityIcons name="email-outline" size={22} color="#1b5e20" />
                <Text style={styles.fieldText}>{formData.email}</Text>
              </View>
              <View style={styles.fieldBox}>
                <FontAwesome5 name="seedling" size={20} color="#1b5e20" />
                <Text style={styles.fieldText}>{formData.profissao || "—"}</Text>
              </View>
              <View style={styles.fieldBox}>
                <Feather name="briefcase" size={22} color="#1b5e20" />
                <Text style={styles.fieldText}>{formData.empresa || "—"}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.updateButton} onPress={() => setEditMode(true)}>
              <Text style={styles.updateButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* MODAL NOTIFICAÇÕES */}
      {showNotifications && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Notificações</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {notificacoes.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#777" }}>Nenhuma nova notificação.</Text>
              ) : (
                notificacoes.map((n) => (
                  <View key={n.id} style={styles.notificacaoItem}>
                    <Feather name="bell" size={20} color="#1b5e20" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: "600" }}>{n.texto}</Text>
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        {new Date(n.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowNotifications(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
    padding: 25,
  },

  // === Título e Notificações ===
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start', // Alinha o título à esquerda
  },

  titlePerfil1: {
    fontSize: 22,
    fontWeight: "900",
    color: "#004d40",
    marginTop: 3,
  },

  titlePerfil: {
    fontSize: 22,
    fontWeight: "900",
    color: "#004d40",
  },

  // === Avatar ===
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#4caf50",
    backgroundColor: "#e0e0e0",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // === Campos de Exibição/Edição ===
  section: {
    width: "100%",
    marginTop: 30,
  },

  // Estilo para Campos em Modo de Edição
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#333333", // Texto mais escuro
    paddingVertical: 0, // Remove padding vertical padrão do TextInput
  },

  // Estilo para Campos em Modo de Visualização
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },

  // === Botão de Ação ===
  updateButton: {
    backgroundColor: "#004d40",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
    width: '80%',
    elevation: 5,
    shadowColor: "#2e502fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold"
  },

  // === Badge de Notificação ===
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#e53935",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center"
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold"
  },

  // === Modal de Notificações ===
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: "90%", // Um pouco maior
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 15,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#004d40",
    textAlign: "center",
    marginBottom: 15
  },
  notificacaoItem: {
    flexDirection: "row",
    alignItems: 'center',
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  modalButton: {
    backgroundColor: "#004d40",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "center",
    marginTop: 20,
    elevation: 3,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold"
  },
});