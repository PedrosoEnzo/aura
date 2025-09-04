import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from 'expo-router';

type Dispositivo = {
  id: string;
  nome: string;
  status: 'online' | 'offline';
};

export default function Conexao() {
  const navigation = useNavigation();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Simula escaneamento BLE
    setTimeout(() => {
      setDispositivos([
        { id: '1', nome: 'AUONE01', status: 'online' },
        { id: '2', nome: 'AUONE02', status: 'online' },
        { id: '3', nome: 'AUONE03', status: 'online' },
      ]);
      setCarregando(false);
    }, 2000);
  }, []);

  const conectarDispositivo = (dispositivo: Dispositivo) => {
    Alert.alert('Conectado', `Dispositivo ${dispositivo.nome} conectado!`);
    navigation.navigate('configurarWiFi', { dispositivoId: dispositivo.id });
  };

  const renderItem = ({ item }: { item: Dispositivo }) => (
    <View style={styles.card}>
      <Text style={styles.nome}>{item.nome}</Text>
      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Online</Text>
      </View>
      <TouchableOpacity
        style={styles.botao}
        onPress={() => conectarDispositivo(item)}
      >
        <Text style={styles.botaoTexto}>Conectar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.imagem} source={require('../assets/images/auone.png')} />
      </View>
      <Text style={styles.titulo}>Conecte seu Dispositivo</Text>
      {carregando ? (
        <ActivityIndicator size="large" color="#00cc66" />
      ) : (
        <FlatList
          data={dispositivos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum dispositivo encontrado</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 120,
    marginBottom: 30
  },
  imagem: {
    width: 300,
    height: 200
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#042b00',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  nome: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00cc66',
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#042b00',
  },
  botao: {
    backgroundColor: '#042b00',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});
