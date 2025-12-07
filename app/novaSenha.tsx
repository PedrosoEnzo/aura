import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";

export default function NovaSenha() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Recebe o email da query string
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email;

  const handleRedefinir = async () => {
    if (!senha || !confirmarSenha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://aura-back-app.onrender.com/api/auth/redefinirSenha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, novaSenha: senha }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.erro || "Erro ao redefinir senha");
      }

      Alert.alert("Sucesso", "Senha redefinida com sucesso!");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/auone.png")}
          style={{ width: 300, height: 200 }}
        />
        <Text style={styles.textoPrincipal}>Redefinir Senha</Text>
      </View>

      <View style={styles.corpo}>
        <Text style={styles.subtitulo}>Digite sua nova senha para {email}</Text>

        <TextInput
          style={styles.inputs}
          placeholder="Nova senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          selectionColor="#042b00"
        />

        <TextInput
          style={styles.inputs}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          selectionColor="#042b00"
        />

        <TouchableOpacity
          style={[styles.botao, loading && { opacity: 0.7 }]}
          onPress={handleRedefinir}
          disabled={loading}
        >
          <Text style={styles.textoBotao}>
            {loading ? "Redefinindo..." : "Redefinir Senha"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    marginTop: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  corpo: { justifyContent: "center", alignItems: "center" },
  textoPrincipal: { fontSize: 24, fontWeight: "bold", color: "#042b00", textAlign: "center", marginTop: 10 },
  subtitulo: { fontSize: 14, color: "#042b00", marginBottom: 20, textAlign: "center" },
  inputs: {
    width: 300,
    height: 45,
    borderWidth: 1,
    borderColor: "#042b00",
    borderRadius: 20,
    paddingLeft: 20,
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    color: "#042b00",
    fontWeight: "500",
  },
  botao: {
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 45,
    borderRadius: 20,
    backgroundColor: "#042b00",
    marginBottom: 15,
  },
  textoBotao: { color: "#fff", fontSize: 20, fontWeight: "600" },
});
