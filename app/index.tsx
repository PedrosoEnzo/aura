import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function Home() {
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCarregando(false);
      router.push("/login"); // Redireciona para a tela de login
    }, 2000);

    return () => clearTimeout(timer); // Limpa o timer ao desmontar
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tudo}>
        <View style={styles.containerPrincipal}>
          <Image
            source={require("../assets/images/auone.png")}
            style={{ width: 300, height: 200 }}
          />
          <Text style={styles.titulo}>Sua estação ambiental inteligente!</Text>
          {carregando ? (
            <ActivityIndicator size="large" color="#0f9b55ff" />
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  tudo: {
    justifyContent: "center",
    alignItems: "center"
  },
  containerPrincipal: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 280,
    paddingBottom: 25
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#042b00",
    marginVertical: 20,
    textAlign: "center"
  },
  textoPrincipal: {
    fontSize: 22,
    color: "#042b00",
    fontWeight: "normal"
  },
  botao: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#042b00",
    borderRadius: 20,
    width: 130,
    height: 40
  },
  textoBotao: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff"
  }
});
