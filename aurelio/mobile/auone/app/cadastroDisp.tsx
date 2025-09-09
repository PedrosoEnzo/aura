import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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
      const res = await fetch('http://10.92.199.8:3000/api/dispositivos', {
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
        Alert.alert('Sucesso', 'Dispositivo cadastrado!');
        router.push('/#'); // ou qualquer rota que você queira
      } else {
        Alert.alert('Erro', data.erro || 'Não foi possível cadastrar o dispositivo.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/images/auone.png')} style={{ width: 300, height: 200 }} />
      </View>
      <Text style={styles.titulo}>Cadastrar Dispositivo</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o ID do dispositivo"
        value={deviceId}
        onChangeText={setDeviceId}
      />
      <TouchableOpacity style={styles.botao} onPress={cadastrarDispositivo}>
        <Text style={styles.botaoTexto}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: "center"
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: 350
  },
  botao: {
    backgroundColor: '#042b00',
    paddingVertical: 12,
    borderRadius: 8,
    width: 150,
    justifyContent: "center",
    alignItems: "center"
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
