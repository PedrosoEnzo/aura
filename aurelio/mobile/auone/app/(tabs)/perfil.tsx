import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/:\d+$/, ':3000');
  }
  return 'http://localhost:3000';
};
const API_URL = getApiUrl();

interface Usuario {
  id: string;
  nome: string;
  email: string;
  profissao?: string;
  empresa?: string;
  foto?: string;
  erro?: string;
}

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

  useEffect(() => {
    async function fetchPerfil() {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setUsuario({ id: '', nome: '', email: '', erro: 'Token não encontrado. Faça login novamente.' });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/perfil`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Erro HTTP! Status: ${res.status}`);
        const data: Usuario = await res.json();
        setUsuario(data);
        setFormData({
          nome: data.nome || '',
          email: data.email || '',
          profissao: data.profissao || '',
          empresa: data.empresa || '',
          foto: data.foto || '',
        });
      } catch (error) {
        setUsuario({ id: '', nome: '', email: '', erro: 'Não foi possível carregar os dados.' });
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || !usuario?.id) {
      Alert.alert('Erro', 'Token ou ID do usuário não encontrado.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Erro ao atualizar perfil.');
      const data: Usuario = await res.json();
      setUsuario(data);
      setEditMode(false);
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        <Image style={styles.avatar} source={formData.foto ? { uri: formData.foto } : undefined} />
        {editMode && (
          <TouchableOpacity style={styles.updateButton} onPress={async () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e: any) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  setFormData((prev) => ({ ...prev, foto: reader.result as string }));
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}>
            <Text style={styles.updateButtonText}>Selecionar foto</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 80 }} />
      <Text style={styles.title}>Atualize e edite seus dados:</Text>
      {editMode ? (
        <>
          <View style={styles.section}>
            <View style={styles.inputIconContainer}>
              <MaterialCommunityIcons name="account-outline" size={22} color="#1b5e20" style={styles.inputIcon} />
              <TextInput
                style={styles.inputStyledWithIcon}
                value={formData.nome}
                onChangeText={(text) => handleChange('nome', text)}
                placeholder="Nome"
              />
            </View>
            <View style={styles.inputIconContainer}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#1b5e20" style={styles.inputIcon} />
              <TextInput
                style={styles.inputStyledWithIcon}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputIconContainer}>
              <FontAwesome5 name="seedling" size={20} color="#1b5e20" style={styles.inputIcon} />
              <TextInput
                style={styles.inputStyledWithIcon}
                value={formData.profissao}
                onChangeText={(text) => handleChange('profissao', text)}
                placeholder="Profissão"
              />
            </View>
            <View style={styles.inputIconContainer}>
              <Feather name="briefcase" size={22} color="#1b5e20" style={styles.inputIcon} />
              <TextInput
                style={styles.inputStyledWithIcon}
                value={formData.empresa}
                onChangeText={(text) => handleChange('empresa', text)}
                placeholder="Empresa"
              />
            </View>
            <View style={styles.inputIconContainer}>
              <MaterialCommunityIcons name="image-outline" size={22} color="#1b5e20" style={styles.inputIcon} />
              <TextInput
                style={styles.inputStyledWithIcon}
                value={formData.foto}
                onChangeText={(text) => handleChange('foto', text)}
                placeholder="URL da foto (opcional)"
              />
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.updateButton, { marginRight: 10 }]} onPress={handleSave}>
              <Text style={styles.updateButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.updateButton, { backgroundColor: '#f44336' }]} onPress={() => setEditMode(false)}>
              <Text style={styles.updateButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.inputIconContainer}>
              <MaterialCommunityIcons name="account-outline" size={22} color="#1b5e20" style={styles.inputIcon} />
              <Text style={styles.inputStyledWithIcon}>{formData.nome}</Text>
            </View>
            <View style={styles.inputIconContainer}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#1b5e20" style={styles.inputIcon} />
              <Text style={styles.inputStyledWithIcon}>{formData.email}</Text>
            </View>
            <View style={styles.inputIconContainer}>
              <Feather name="briefcase" size={22} color="#1b5e20" style={styles.inputIcon} />
              <Text style={styles.inputStyledWithIcon}>{formData.profissao}</Text>
            </View>
            <View style={styles.inputIconContainer}>
              <FontAwesome5 name="seedling" size={20} color="#1b5e20" style={styles.inputIcon} />
              <Text style={styles.inputStyledWithIcon}>{formData.empresa}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={() => setEditMode(true)}>
            <Text style={styles.updateButtonText}>Editar</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 18,
  },
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1b5e20',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    paddingLeft: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputStyled: {
    borderWidth: 1,
    borderColor: '#1b5e20',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    color: '#042b00',
  },
  inputStyledWithIcon: {
    flex: 1,
    fontSize: 16,
    color: '#042b00',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  updateButton: {
    backgroundColor: '#1b5e20',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
});
