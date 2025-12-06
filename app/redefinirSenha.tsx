import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import emailjs from "@emailjs/browser";

// IDs do EmailJS (substitua pelos seus)
const SERVICE_ID = "service_mge5lyl";
const TEMPLATE_ID = "template_16ek4mt";
const PUBLIC_KEY = "9Li0MqqT-N3CMkAnV";

export default function RedefinirSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Gera um código de 6 dígitos
  const gerarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleRedefinir = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu e-mail.");
      return;
    }

    // Validação simples de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    const resetCode = gerarCodigo();
    setLoading(true);

    try {
      const templateParams = {
        to_email: email,       // deve bater com {{to_email}} no template
        reset_code: resetCode, // deve bater com {{reset_code}} no template
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

      Alert.alert("Sucesso", `Enviamos um código de redefinição para ${email}.`);

      // Redireciona para tela de validar código, passando params via query
      router.push(`/code?resetCode=${resetCode}&email=${email}`);
    } catch (error: any) {
      console.error("Erro ao enviar e-mail:", error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar o e-mail. Verifique o endereço ou tente novamente."
      );
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
      </View>

      <Text style={styles.textoPrincipal}>Redefinir Senha</Text>

      <View style={styles.corpo}>
        <View style={styles.containerInput}>
          <TextInput
            style={styles.inputs}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
        </View>

        <View style={styles.containerBotao}>
          <TouchableOpacity
            style={[styles.botao, loading && { opacity: 0.7 }]}
            onPress={handleRedefinir}
            disabled={loading}
          >
            <Text style={styles.textoBotao}>
              {loading ? "Enviando..." : "Enviar Código"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { marginTop: 120, justifyContent: "center", alignItems: "center", marginBottom: 30 },
  corpo: { justifyContent: "center", alignItems: "center" },
  textoPrincipal: { fontSize: 24, fontWeight: "bold", color: "#042b00", textAlign: "center", paddingBottom: 20 },
  containerInput: { justifyContent: "center", alignItems: "center" },
  inputs: { borderWidth: 1, borderColor: "#042b00", marginBottom: 15, width: 300, height: 45, borderRadius: 20, paddingLeft: 20, color: "#042b00", fontWeight: "500", backgroundColor: "#f5f5f5" },
  containerBotao: { justifyContent: "center", alignItems: "center", marginTop: 20 },
  botao: { justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#042b00", width: 200, height: 45, borderRadius: 20, backgroundColor: "#042b00" },
  textoBotao: { color: "#fff", fontSize: 20, fontWeight: "600" },
});
