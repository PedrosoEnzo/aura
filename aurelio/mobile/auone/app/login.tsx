import { useState } from "react";
import { Link, useRouter } from "expo-router";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("http://10.92.199.10:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok && data.usuario?.id && data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("usuarioId", data.usuario.id);
        router.push("/home");
      } else {
        Alert.alert("Erro", data.erro || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro de login:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/images/auone.png")} style={{ width: 300, height: 200 }} />
      </View>
      <Text style={styles.textoPrincipal}>Login</Text>
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
          <TextInput
            style={styles.inputs}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
        </View>
        <Text style={styles.esqueceuSenha}>
          Esqueceu sua senha?
          <Link href={"/#"}>
            <Text style={styles.esqueceuSenha2}> Criar Nova</Text>
          </Link>
        </Text>
        <View style={styles.containerBotao}>
          <TouchableOpacity style={styles.botao} onPress={handleLogin}>
            <Text style={styles.textoBotao}>Entrar</Text>
          </TouchableOpacity>
          <Text style={styles.botaoCadastro}>
            Não possui conta?
            <Link href={"/cadastro"}>
              <Text style={styles.botaoCadastro2}> Cadastre-se</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  corpo: {
    justifyContent: "center",
    alignItems: "center",
  },
  textoPrincipal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#042b00",
    marginLeft: 65,
    paddingBottom: 15,
  },
  containerInput: {
    justifyContent: "center",
    alignItems: "center",
  },
  inputs: {
    borderWidth: 1,
    borderColor: "#042b00",
    marginBottom: 15,
    width: 300,
    height: 45,
    borderRadius: 20,
    paddingLeft: 20,
    color: "#042b00",
    fontWeight: "500",
    backgroundColor: "#f5f5f5",
  },
  esqueceuSenha: {
    fontSize: 12,
    color: "#042b00",
  },
  esqueceuSenha2: {
    fontWeight: "bold",
    color: "#042b00",
  },
  containerBotao: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  botao: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#042b00",
    marginBottom: 15,
    width: 200,
    height: 45,
    borderRadius: 20,
    backgroundColor: "#042b00",
  },
  textoBotao: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  botaoCadastro: {
    fontSize: 12,
    color: "#042b00",
  },
  botaoCadastro2: {
    fontWeight: "bold",
    color: "#042b00",
  },
});
