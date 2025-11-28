import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";

// TIPAGEM DAS CONDIÇÕES CLIMÁTICAS
export type CondicaoClimatica =
  | "Limpo"
  | "Chuva"
  | "Frio"
  | "Tempestade"
  | "Neblina"
  | "Nublado"
  | "Garoa"
  | "Padrao";

// CORES DE DEGRADÊ BASEADAS NO CLIMA (estilo do card enviado)
const GRADIENTES_CLIMA: Record<CondicaoClimatica, string[]> = {
  Limpo: ["#8EC5FC", "#E0C3FC"],
  Chuva: ["#5D7E9A", "#8BA6C1"],
  Frio: ["#A0C4FF", "#BBD0FF"],
  Tempestade: ["#373B44", "#4286f4"],
  Neblina: ["#BAC3C8", "#DDE3E6"],
  Nublado: ["#9AA5B1", "#CBD2D9"],
  Garoa: ["#A8D0E6", "#B8E1FF"],
  Padrao: ["#8EC5FC", "#E0C3FC"],
};

// ÍCONES PARA CADA TIPO DE CLIMA
const ICONES_CLIMA: Record<CondicaoClimatica, any> = {
  Limpo: require("../../assets/images/sun.png"),
  Chuva: require("../../assets/images/rain.png"),
  Frio: require("../../assets/images/cold.png"),
  Tempestade: require("../../assets/images/storm.png"),
  Neblina: require("../../assets/images/cloud.png"), 
  Nublado: require("../../assets/images/cloud.png"),
  Garoa: require("../../assets/images/drizzle.png"),
  Padrao: require("../../assets/images/cloud.png"),
};


// TIPAGEM DAS SUGESTÕES
type SugestaoPlantio = {
  temperaturaMin: number;
  temperaturaMax: number;
  umidadeMin: number;
  sugestao: string;
};

// SUGESTÕES BASEADAS NO CLIMA
const SUGESTOES_PLANTIO: SugestaoPlantio[] = [
  {
    temperaturaMin: 20,
    temperaturaMax: 35,
    umidadeMin: 50,
    sugestao: "Perfeito para hortaliças e frutas delicadas 🌱🍓",
  },
  {
    temperaturaMin: 15,
    temperaturaMax: 25,
    umidadeMin: 40,
    sugestao: "Ótimo para verduras e plantas folhosas como alface 🥬",
  },
  {
    temperaturaMin: 10,
    temperaturaMax: 20,
    umidadeMin: 30,
    sugestao: "Clima ameno — ideal para cenouras, raízes e tubérculos 🥕",
  },
  {
    temperaturaMin: 25,
    temperaturaMax: 40,
    umidadeMin: 60,
    sugestao: "Excelente para mandioca, milho e plantas tropicais 🌾",
  },
];

// BUSCA O CLIMA EM TEMPO REAL
async function buscarClimaAPI(): Promise<{
  condicao: CondicaoClimatica;
  temperatura: number;
}> {
  try {
    const latitude = -23.55;
    const longitude = -46.63;

    const resposta = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
    );
    const dados = await resposta.json();

    const temperatura = dados?.current?.temperature_2m ?? 0;
    const codigoClima = dados?.current?.weather_code;

    const mapaCodigo: Record<number, CondicaoClimatica> = {
      0: "Limpo",
      1: "Nublado",
      2: "Nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina",
      51: "Garoa",
      53: "Garoa",
      55: "Garoa",
      56: "Garoa",
      57: "Garoa",
      61: "Chuva",
      63: "Chuva",
      65: "Chuva",
      66: "Chuva",
      67: "Chuva",
      71: "Frio",
      73: "Frio",
      75: "Frio",
      77: "Frio",
      80: "Chuva",
      81: "Chuva",
      82: "Chuva",
      95: "Tempestade",
      96: "Tempestade",
      99: "Tempestade",
    };

    const condicao = mapaCodigo[codigoClima] || "Padrao";

    return { condicao, temperatura };
  } catch (error) {
    console.error("Erro ao buscar clima:", error);
    return { condicao: "Padrao", temperatura: 0 };
  }
}

export default function AgroBanner() {
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [condicao, setCondicao] = useState<CondicaoClimatica>("Padrao");
  const [sugestao, setSugestao] = useState<string>("");
  const [carregando, setCarregando] = useState(true);

  async function atualizarBanner() {
    setCarregando(true);

    const { temperatura, condicao } = await buscarClimaAPI();
    setTemperatura(temperatura);
    setCondicao(condicao);

    const encontrada = SUGESTOES_PLANTIO.find(
      (item) =>
        temperatura >= item.temperaturaMin &&
        temperatura <= item.temperaturaMax &&
        50 >= item.umidadeMin
    );

    setSugestao(encontrada?.sugestao || "Clima estável — cultivo normal 🌿");

    setCarregando(false);
  }

  useEffect(() => {
    atualizarBanner();
  }, []);

  const gradiente = GRADIENTES_CLIMA[condicao];

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: gradiente[0],
        },
      ]}
    >
      {carregando ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <>
          <Text style={styles.cidade}>Clima Atual</Text>

          <Image source={ICONES_CLIMA[condicao]} style={styles.icone} />

          <Text style={styles.temperatura}>{temperatura}°</Text>
          <Text style={styles.condicao}>{condicao}</Text>

          <View style={styles.sugestaoBox}>
            <Text style={styles.sugestaoTitulo}>Sugestão de Plantio</Text>
            <Text style={styles.sugestaoTexto}>{sugestao}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 30,
    borderRadius: 25,
    margin: 18,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },

  cidade: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 5,
  },

  icone: {
    width: 90,
    height: 90,
    marginBottom: 10,
    tintColor: "#fff",
  },

  temperatura: {
    fontSize: 64,
    color: "#fff",
    fontWeight: "800",
  },

  condicao: {
    color: "#fff",
    fontSize: 20,
    opacity: 0.9,
    marginBottom: 15,
  },

  sugestaoBox: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 18,
    borderRadius: 20,
    width: "100%",
  },

  sugestaoTitulo: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },

  sugestaoTexto: {
    marginTop: 6,
    fontSize: 15,
    color: "#fff",
    opacity: 0.9,
  },
});
