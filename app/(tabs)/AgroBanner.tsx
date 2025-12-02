import Ionicons from "@expo/vector-icons/build/Ionicons";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; // Importar LinearGradient

// Obter a largura da tela para melhor responsividade
const { width } = Dimensions.get('window');


//  sugestões de plantio 
const PLANTING_ADVICE = [
  { month: "Janeiro", Rain: "Foque na manutenção e colheita de milho/soja. Prepare o solo para hortaliças de ciclo rápido (couve, alface).", Clear: "Garanta irrigação robusta para culturas de verão. Ideal para batata-doce e melancia.", Clouds: "Boa época para feijão-caupi e hortaliças de folha (salsa, cebolinha)." },
  { month: "Fevereiro", Rain: "Momento de semear arroz irrigado e quiabo. Monitore pragas devido à umidade.", Clear: "Mantenha a irrigação para culturas de grãos e inicie plantio de amendoim.", Clouds: "Ideal para plantar mandioca e tubérculos resistentes." },
  { month: "Março", Rain: "Início do plantio de trigo e cevada em algumas regiões. Plantio de abóbora e rabanete.", Clear: "Prepare o solo para culturas de outono-inverno. Boa hora para pastagens.", Clouds: "Plante cenoura e beterraba, aproveitando a terra mais úmida." },
  { month: "Abril", Rain: "Continue o plantio de alho e cebola. Favorece a transição para culturas de inverno.", Clear: "Reduza a irrigação gradualmente. Ideal para brócolis e couve-flor.", Clouds: "Foco em aveia e azevém." },
  { month: "Maio", Rain: "Plantio de inverno em regiões mais quentes: ervilha, lentilha. Mantenha o solo drenado.", Clear: "Semeadura de trigo e culturas de sequeiro. Ideal para alface de inverno.", Clouds: "Plantio de repolho e espinafre." },
  { month: "Junho", Rain: "Risco de geadas em regiões frias: proteja as culturas sensíveis. Plantio de favas.", Clear: "Ideal para culturas de inverno resistentes ao frio (alho, cebola, cenoura).", Clouds: "Boa época para mudas de árvores frutíferas e leguminosas." },
  { month: "Julho", Rain: "Foco na manutenção do solo e adubação verde. Plantio de batata-doce.", Clear: "Plantio de culturas de ciclo curto: rabanete, nabo.", Clouds: "Cultivo de tubérculos e preparo para a primavera." },
  { month: "Agosto", Rain: "Início do plantio de milho precoce e hortaliças de verão (tomate, pimentão) em estufas.", Clear: "Preparação intensiva do solo para a primavera. Plantio de melão e melancia.", Clouds: "Melhorar a drenagem do solo. Plantio de morango." },
  { month: "Setembro", Rain: "Época de semeadura de arroz e milho safrinha. Plantio de alface e rúcula.", Clear: "Plantio de girassol e amendoim. Foco em culturas que demandam calor.", Clouds: "Início do plantio de café em algumas áreas." },
  { month: "Outubro", Rain: "Plantio principal de soja e milho. Início da safra das águas.", Clear: "Demanda alta por irrigação, mas bom para a fruticultura.", Clouds: "Plantio de mandioca e batata." },
  { month: "Novembro", Rain: "Plantio e desenvolvimento do milho e soja. Risco de doenças fúngicas.", Clear: "Plantio de algodão e feijão-comum. Foco em proteção contra sol forte.", Clouds: "Início do ciclo de culturas que precisam de umidade constante (arroz)." },
  { month: "Dezembro", Rain: "Foco no manejo de doenças e pragas. Plantio de quiabo e pepino.", Clear: "Colheita de frutas de caroço. Garanta sombreamento para mudas novas.", Clouds: "Plantio de abacaxi e preparo para o milho safrinha." }
];


// Tipos de condições climáticas
export type CondicaoClimatica =
  | "Limpo"
  | "Chuva"
  | "Frio"
  | "Tempestade"
  | "Neblina"
  | "Nublado"
  | "Garoa"
  | "Padrao";

// degradde do clima - Alterado para simular o fundo azul-acinzentado da imagem
const GRADIENTES_CLIMA: Record<CondicaoClimatica, string[]> = {
  Limpo: ["#607D8B", "#78909C"], // Cinza Azulado
  Chuva: ["#607D8B", "#78909C"], // Cinza Azulado
  Frio: ["#607D8B", "#78909C"], // Cinza Azulado
  Tempestade: ["#607D8B", "#78909C"], // Cinza Azulado
  Neblina: ["#607D8B", "#78909C"], // Cinza Azulado
  Nublado: ["#607D8B", "#78909C"], // Cinza Azulado
  Garoa: ["#607D8B", "#78909C"], // Cinza Azulado
  Padrao: ["#607D8B", "#78909C"], // Cinza Azulado
};

// icones das temperaturas
const ICONES_CLIMA: Record<CondicaoClimatica, any> = {
  Limpo: require("../../assets/images/sun.png"),
  Chuva: require("../../assets/images/rain.png"), // Usado como base para o ícone de gota d'água/chuva
  Frio: require("../../assets/images/cold.png"),
  Tempestade: require("../../assets/images/storm.png"),
  Neblina: require("../../assets/images/cloud.png"),
  Nublado: require("../../assets/images/cloud.png"),
  Garoa: require("../../assets/images/drizzle.png"),
  Padrao: require("../../assets/images/cloud.png"),
};

function mapearCondicaoParaChave(condicao: CondicaoClimatica): "Rain" | "Clear" | "Clouds" | null {
  switch (condicao) {
    case "Chuva": case "Garoa": case "Tempestade": return "Rain";
    case "Limpo": return "Clear";
    case "Nublado": case "Neblina": case "Frio": case "Padrao": default: return "Clouds";
  }
}

function obterSugestaoPlantio(condicao: CondicaoClimatica): string {
  const mesAtual = new Date().getMonth();
  const sugestaoMensal = PLANTING_ADVICE[mesAtual];
  if (!sugestaoMensal) return "Não foi possível carregar sugestões para este mês.";
  const chaveClimatica = mapearCondicaoParaChave(condicao);
  return chaveClimatica ? sugestaoMensal[chaveClimatica] : "Consulte um agrônomo para o clima atual.";
}

// BUSCA O CLIMA EM TEMPO REAL (Mantida)
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

    // Limita a temperatura a uma casa decimal e arredonda
    const temperaturaBruta = dados?.current?.temperature_2m ?? 0;
    const temperatura = Math.round(temperaturaBruta);

    const codigoClima = dados?.current?.weather_code;

    const mapaCodigo: Record<number, CondicaoClimatica> = {
      0: "Limpo", 1: "Nublado", 2: "Nublado", 3: "Nublado",
      45: "Neblina", 48: "Neblina", 51: "Garoa", 53: "Garoa",
      55: "Garoa", 56: "Garoa", 57: "Garoa", 61: "Chuva",
      63: "Chuva", 65: "Chuva", 66: "Chuva", 67: "Chuva",
      71: "Frio", 73: "Frio", 75: "Frio", 77: "Frio",
      80: "Chuva", 81: "Chuva", 82: "Chuva", 95: "Tempestade",
      96: "Tempestade", 99: "Tempestade",
    };

    const condicao = mapaCodigo[codigoClima] || "Padrao";
    // FORÇANDO CONDIÇÃO E TEMPERATURA DA IMAGEM
    // return { condicao: "Chuva", temperatura: 28 }; 
    return { condicao, temperatura };
  } catch (error) {
    console.error("Erro ao buscar clima:", error);
    return { condicao: "Padrao", temperatura: 0 };
  }
}


// Componente Sugestão
interface SugestaoCardProps {
  sugestao: string;
}

const SugestaoAgroCard: React.FC<SugestaoCardProps> = ({ sugestao }) => {
  return (
    <View style={styles.sugestaoAgroContainer}>
      <View style={styles.sugestaoHeader}>
        <Ionicons
          name="leaf-outline"
          size={20}
          color="#38A169"
          style={styles.sugestaoIcone}
        />
        <Text style={styles.sugestaoTituloAgro}>Sugestão Agronômica</Text>
      </View>
      <Text style={styles.sugestaoTextoAgro}>{sugestao}</Text>
    </View>
  );
};


export default function AgroBanner() {
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [condicao, setCondicao] = useState<CondicaoClimatica>("Padrao");
  const [sugestao, setSugestao] = useState<string>("");
  const [carregando, setCarregando] = useState(true);

  async function atualizarBanner() {
    setCarregando(true);

    // Usando dados da imagem para replicar o design
    const dadosClima = await buscarClimaAPI();
    // *** ATENÇÃO: COMENTE ESTAS DUAS LINHAS SE QUISER O CLIMA EM TEMPO REAL ***
    const temperaturaFinal = 28;
    const condicaoFinal: CondicaoClimatica = "Chuva";
    // *************************************************************************


    setTemperatura(temperaturaFinal);
    setCondicao(condicaoFinal);

    const sugestaoAtual = obterSugestaoPlantio(condicaoFinal);
    setSugestao(sugestaoAtual);

    setCarregando(false);
  }

  useEffect(() => {
    atualizarBanner();
  }, []);

  const gradiente = GRADIENTES_CLIMA[condicao];

  return (
    <View>
      <View
        style={[
          styles.bannerContainer,
          {
            backgroundColor: gradiente[0],
          },
        ]}
      >
        {carregando ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <View style={styles.bannerContent}>
            {/* Lado Esquerdo - Cidade e Clima Atual */}
            <View style={styles.leftContent}>
              <Text style={styles.climaAtual}>Clima Atual</Text>
              <Text style={styles.cidade}>SÃO PAULO, SP</Text>
            </View>

            {/* Lado Direito - Ícone, Temperatura e Condição */}
            <View style={styles.rightContent}>
              <Image source={ICONES_CLIMA[condicao]} style={styles.icone} />
              <View style={styles.tempAndCond}>
                <Text style={styles.temperatura}>{temperatura}°</Text>
                <Text style={styles.condicao}>{condicao}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      {!carregando && <SugestaoAgroCard sugestao={sugestao} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    // Cor alterada nos GRADIENTES_CLIMA para simular a cor da imagem
    padding: 20, // Menos padding que o original
    borderRadius: 15,
    margin: 18,
    height: 120, // Altura fixa para se parecer com a imagem
    justifyContent: "center", // Centraliza o conteúdo verticalmente
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 10,
    overflow: 'hidden', // Importante para o borderRadius
  },

  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Alinha itens no centro verticalmente
    width: '100%',
    paddingHorizontal: 10, // Pequeno padding interno
  },

  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },

  rightContent: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha verticalmente
    justifyContent: 'flex-end',
    minWidth: 100, // Garante espaço para o ícone e texto
  },

  tempAndCond: {
    marginLeft: 10, // Espaçamento entre ícone e temperatura
  },

  climaAtual: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 2, // Espaço entre o título e a cidade
  },

  cidade: {
    color: "#fff",
    fontSize: 24, // Maior para o destaque
    fontWeight: "900", // Mais negrito para destaque
    opacity: 1,
  },

  icone: {
    width: 45, // Ícone menor
    height: 45,
    tintColor: "#fff",
    // É difícil replicar o design exato da gota d'água com o ícone padrão, 
    // mas a posição está correta. O ícone de chuva é o mais próximo.
  },

  temperatura: {
    fontSize: 48, // Tamanho da temperatura no lado direito
    color: "#fff",
    fontWeight: "800",
    lineHeight: 48, // Ajusta a altura da linha para que o texto fique mais junto
  },

  condicao: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2, // Espaço entre temperatura e condição
    fontWeight: '500',
  },

  // Susgestão de plantio (Mantido o mesmo)
  sugestaoAgroContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 20,
    shadowColor: "#204b22ff",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderColor: "#216d25ff",
  },

  sugestaoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sugestaoIcone: {
    marginRight: 8,
    marginLeft: 4,
  },

  sugestaoTituloAgro: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263a29ff",
    alignItems: "center",
    textAlign: "center",
  },

  sugestaoTextoAgro: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 22, // Alterado para melhor legibilidade
    marginLeft: 28,
  },
});