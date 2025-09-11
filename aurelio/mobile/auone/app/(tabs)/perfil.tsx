import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detecta ambiente automaticamente
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Web
    return window.location.origin.replace(/:\d+$/, ':3000');
  }
  // Mobile: Expo/React Native
  return 'http://localhost:3000'; // Porta ajustada para 3000
};
const API_URL = getApiUrl();

// Tipo do usuário conforme esperado pelo backend
interface Usuario {
  id: string;
  nome: string;
  email: string;
  profissao?: string;
  empresa?: string;
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
    if (!token) {
      Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
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
        <Image
          style={styles.avatar}
        />
      </View>
      <View style={{ height: 80 }} />
      <Text style={styles.title}>Atualize e edite seus dados:</Text>
      {editMode ? (
        <>
          <View style={styles.section}>
            <TextInput
              style={styles.inputStyled}
              value={formData.nome}
              onChangeText={(text) => handleChange('nome', text)}
              placeholder="Nome"
            />
            <TextInput
              style={styles.inputStyled}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.inputStyled}
              value={formData.profissao}
              onChangeText={(text) => handleChange('profissao', text)}
              placeholder="Profissão"
            />
            <TextInput
              style={styles.inputStyled}
              value={formData.empresa}
              onChangeText={(text) => handleChange('empresa', text)}
              placeholder="Empresa"
            />
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
            <Text style={styles.inputStyled}>{formData.nome}</Text>
            <Text style={styles.inputStyled}>{formData.email}</Text>
            <Text style={styles.inputStyled}>{formData.profissao}</Text>
            <Text style={styles.inputStyled}>{formData.empresa}</Text>
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
