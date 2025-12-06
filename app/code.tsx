import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from "react-native";

export default function ValidarCodigo() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ resetCode: string; email: string }>();

  const resetCode = params.resetCode;
  const email = params.email;

  const handleValidar = () => {
    if (!codigo) {
      Alert.alert("Erro", "Por favor, insira o código.");
      return;
    }

    setLoading(true);
    console.log("Código digitado:", codigo);
    console.log("Código correto:", resetCode);

    if (codigo === resetCode) {
      Alert.alert("Sucesso", "Código validado com sucesso!");
      router.push(`/novaSenha?email=${email}`);
    } else {
      Alert.alert("Erro", "Código inválido. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/images/auone.png")} style={{ width: 300, height: 200 }} />
        <Text style={styles.textoPrincipal}>Validar Código</Text>
      </View>

      <View style={styles.corpo}>
        <Text style={styles.subtitulo}>Insira o código enviado para {email}</Text>

        <TextInput
          style={styles.inputs}
          placeholder="Digite o código"
          value={codigo}
          onChangeText={setCodigo}
          keyboardType="numeric"
          maxLength={6}
          selectionColor="#042b00"
        />

        <TouchableOpacity style={[styles.botao, loading && { opacity: 0.7 }]} onPress={handleValidar} disabled={loading}>
          <Text style={styles.textoBotao}>{loading ? "Validando..." : "Validar Código"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.botaoCadastro2}>Voltar para Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { marginTop: 120, justifyContent: "center", alignItems: "center", marginBottom: 30 },
  corpo: { justifyContent: "center", alignItems: "center" },
  textoPrincipal: { fontSize: 24, fontWeight: "bold", color: "#042b00", textAlign: "center", marginTop: 10 },
  subtitulo: { fontSize: 14, color: "#042b00", marginBottom: 20, textAlign: "center" },
  inputs: { width: 300, height: 45, borderWidth: 1, borderColor: "#042b00", borderRadius: 20, paddingLeft: 20, marginBottom: 20, backgroundColor: "#f5f5f5", color: "#042b00", fontWeight: "500" },
  botao: { justifyContent: "center", alignItems: "center", width: 200, height: 45, borderRadius: 20, backgroundColor: "#042b00", marginBottom: 15 },
  textoBotao: { color: "#fff", fontSize: 20, fontWeight: "600" },
  botaoCadastro2: { fontWeight: "bold", color: "#042b00", fontSize: 14 },
});
