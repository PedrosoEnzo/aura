import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ✅ URL correta da API (no plural)
const API_URL = 'https://aura-back-app.onrender.com/api/dispositivo';

export default function CadastroDispositivo() {
  const [deviceId, setDeviceId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      const tokenSalvo = await AsyncStorage.getItem('token');
      const usuarioSalvo = await AsyncStorage.getItem('usuarioId');
      if (tokenSalvo && usuarioSalvo) {
        setToken(tokenSalvo);
        setUsuarioId(usuarioSalvo);
      } else {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.push('/login');
      }
    };
    carregarDados();
  }, []);

  const cadastrarDispositivo = async () => {
    if (!deviceId.trim()) {
      Alert.alert('Erro', 'Digite o ID do dispositivo.');
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: 'Sensor de solo',
          deviceId,
          usuarioId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Sucesso', 'Dispositivo cadastrado com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.push('/home'),
          },
        ]);
      } else {
        console.error('Erro do servidor:', data);
        Alert.alert('Erro', data.erro || 'Não foi possível cadastrar o dispositivo.');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/auone.png')}
          style={{ width: 300, height: 200 }}
        />
      </View>
      <Text style={styles.titulo}>Cadastrar Dispositivo</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o ID do dispositivo"
        value={deviceId}
        onChangeText={setDeviceId}
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        selectionColor="#042b00"
      />
      <TouchableOpacity style={styles.botao} onPress={cadastrarDispositivo}>
        <Text style={styles.botaoTexto}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#042b00',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#042b00',
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
    width: 350,
    backgroundColor: '#f5f5f5',
    color: '#042b00',
    fontWeight: '500',
  },
  botao: {
    backgroundColor: '#042b00',
    paddingVertical: 12,
    borderRadius: 20,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#042b00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
