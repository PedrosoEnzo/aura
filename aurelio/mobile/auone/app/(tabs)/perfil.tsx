import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
  erro?: string;
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '' });
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
        setFormData({ nome: data.nome, email: data.email });
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
      const res = await fetch(`${API_URL}/atualizarperfil`, {
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
      <Text style={styles.title}>Perfil do Usuário</Text>
      {usuario?.erro ? (
        <Text style={styles.error}>{usuario.erro}</Text>
      ) : editMode ? (
        <>
          <Text style={styles.label}>Nome:</Text>
          <TextInput
            style={styles.input}
            value={formData.nome}
            onChangeText={(text) => handleChange('nome', text)}
          />
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
          />
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditMode(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.info}><Text style={styles.bold}>Nome:</Text> {usuario?.nome}</Text>
          <Text style={styles.info}><Text style={styles.bold}>Email:</Text> {usuario?.email}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setEditMode(true)}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});
