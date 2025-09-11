import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  dispositivos: any[];
};

export default function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const usuarioId = await AsyncStorage.getItem("usuarioId");

        if (!usuarioId || usuarioId === "null") {
          Alert.alert("Erro", "Usuário não autenticado.");
          setCarregando(false);
          return;
        }

        const res = await fetch(`http://10.92.199.10:3000/api/usuarios/${usuarioId}`);
        const json = await res.json();
        console.log('Dados recebidos do backend:', json); // Adicionado para depuração

        if (res.ok && json && json.id) {
          setUsuario(json);
        } else {
          Alert.alert("Erro", json.erro || "Não foi possível carregar os dados do usuário.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        Alert.alert("Erro", "Falha na conexão com o servidor.");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#042b00" />
        <Text style={{ marginTop: 10, color: "#042b00" }}>Carregando dados...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#042b00" }}>Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{usuario.nome || "Usuário sem nome"}</Text>
      <Text style={styles.subtitulo}>{usuario.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#042b00",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  valor: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    color: "#042b00",
    fontSize: 16,
  },
  dispositivoCard: {
    backgroundColor: "#e6ffe6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dispositivoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#042b00",
    marginBottom: 10,
  },
  metric: {
    fontSize: 15,
    marginBottom: 5,
    color: "#042b00",
  },
  botao: {
    backgroundColor: "#042b00",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
