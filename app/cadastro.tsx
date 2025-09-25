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

// ✅ URL pública da sua API
const API_URL = 'https://auone-backend.onrender.com';

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [profissao, setProfissao] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [foco, setFoco] = useState("");
  const router = useRouter();

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !profissao || !empresa) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      console.log('Dados enviados para cadastro:', { nome, email, senha, profissao, empresa });
      const response = await fetch(`${API_URL}/api/auth/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, profissao, empresa }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erro", data.erro || JSON.stringify(data));
        return;
      }

      if (data.usuario?.id && data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("usuarioId", String(data.usuario.id));

        Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
        router.push("/home");
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar.");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      Alert.alert("Erro", "Falha na conexão com o servidor.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/images/auone.png")} style={{ width: 300, height: 200 }} />
      </View>
      <Text style={styles.textoPrincipal}>Cadastro</Text>
      <View style={styles.corpo}>
        <View style={styles.containerInput}>
          <TextInput
            style={[styles.inputs, foco === "nome" && styles.inputFocado]}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            onFocus={() => setFoco("nome")}
            onBlur={() => setFoco("")}
            autoCapitalize="words"
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
          <TextInput
            style={[styles.inputs, foco === "email" && styles.inputFocado]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFoco("email")}
            onBlur={() => setFoco("")}
            autoCapitalize="none"
            keyboardType="email-address"
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
          <TextInput
            style={[styles.inputs, foco === "senha" && styles.inputFocado]}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            onFocus={() => setFoco("senha")}
            onBlur={() => setFoco("")}
            secureTextEntry
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
          <TextInput
            style={[styles.inputs, foco === "confirmar" && styles.inputFocado]}
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            onFocus={() => setFoco("confirmar")}
            onBlur={() => setFoco("")}
            secureTextEntry
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
          <TextInput
            style={[styles.inputs, foco === "profissao" && styles.inputFocado]}
            placeholder="Profissão"
            value={profissao}
            onChangeText={setProfissao}
            onFocus={() => setFoco("profissao")}
            onBlur={() => setFoco("")}
            autoCapitalize="words"
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
          <TextInput
            style={[styles.inputs, foco === "empresa" && styles.inputFocado]}
            placeholder="Empresa"
            value={empresa}
            onChangeText={setEmpresa}
            onFocus={() => setFoco("empresa")}
            onBlur={() => setFoco("")}
            autoCapitalize="words"
            underlineColorAndroid="transparent"
            selectionColor="#042b00"
          />
        </View>
        <View style={styles.containerBotao}>
          <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
            <Text style={styles.textoBotao}>Cadastrar</Text>
          </TouchableOpacity>
          <Text style={styles.botaoCadastro}>
            Já possui conta?
            <Link href={"/login"}>
              <Text style={styles.botaoCadastro2}> Login</Text>
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
    marginBottom: 15,
    width: 300,
    height: 45,
    borderRadius: 20,
    paddingLeft: 20,
    color: "#042b00",
    fontWeight: "500",
    borderColor: "#042b00",
    backgroundColor: "#f5f5f5",
  },
  inputFocado: {
    borderColor: "#00a859",
    borderWidth: 2,
    shadowColor: "#00a859",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  containerBotao: {
    justifyContent: "center",
    alignItems: "center",
  },
  botao: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#042b00",
    marginBottom: 15,
    marginTop: 25,
    width: 200,
    height: 45,
    borderRadius: 20,
    backgroundColor: "#042b00",
  },
  textoBotao: {
    color: "#fff",
    fontSize: 18,
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
