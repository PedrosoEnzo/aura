import {
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView, // IOS
} from "react-native";
import { LineChart } from "react-native-chart-kit";

// Ajustei o screenWidth para cálculo dos gráficos mais abaixo
const screenWidth = Dimensions.get("window").width;

// ✔ ROTA DO BANCO CORRETA
const API_URL = "https://aura-back-app.onrender.com/api/sensores/sensores";

interface SensorData {
  timestamp: string;
  umidadeSolo: number;
  luminosidade: number;
  temperaturaAr: number;
  umidadeAr: number;
}

interface ChartInfo {
  label: string;
  data: number[];
  color: string;
}

// CORES
const COLORS = {
  primary: '#1b5e20',
  secondary: '#c8e6c9',
  background: '#ffffffff', // Fundo bem claro
  cardBackground: '#ffffff', // Fundo dos cards (usado para o cabeçalho também)
  textPrimary: '#042b00',
  textSecondary: '#555',
  soilHumidity: '#4db6ac',
  light: '#f5c900', // Alterei para algo mais representativo de luz
  airTemperature: '#ff7043', // Alterei para algo mais representativo de temperatura
  airHumidity: '#29b6f6', // Alterei para algo mais representativo de umidade
  // Novas cores para status (funcionalidade adicionada)
  statusNormal: '#4caf50', // Verde
  statusAlerta: '#ff9800', // Laranja
  statusCritico: '#f44336', // Vermelho
};

// Limites de funcionamento ideal para o Alerta de Status
const THRESHOLDS = {
  umidadeSolo: { min: 20, max: 70 }, // 20-70% ideal
  temperaturaAr: { min: 18, max: 30 }, // 18-30°C ideal
  luminosidade: { min: 100, max: 800 }, // 100-800 lux ideal
  umidadeAr: { min: 40, max: 70 }, // 40-70% ideal
};


export default function RelatorioGraficos() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<SensorData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartInfo | null>(null);

  const MAX_DADOS = 7;

  const sanitize = (arr: number[]) => arr.map((v) => (isFinite(v) ? v : 0));

  // ✔ Corrigido para puxar corretamente o último registro
  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      console.log("📡 Dados recebidos:", data);

      const novoDado = Array.isArray(data) ? data : [data];

      setDados((prev) => {
        const combinado = [...prev, ...novoDado];
        // Garantindo que não ultrapasse o limite de dados (MAX_DADOS)
        return combinado.slice(-MAX_DADOS);
      });
    } catch (err) {
      console.error("Erro ao buscar sensores", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Status do sistema
  const getSystemStatus = (latestData: SensorData | null) => {
    if (!latestData) return { status: 'loading', message: 'Aguardando dados...', icon: 'clock' as const };

    let status: 'normal' | 'alerta' | 'critico' = 'normal';
    let message = 'Todos os parâmetros estão dentro da faixa ideal.';
    let icon: 'check-circle' | 'alert-triangle' | 'x-circle' = 'check-circle';

    const violations = [];

    // Violações
    if (latestData.umidadeSolo < THRESHOLDS.umidadeSolo.min) violations.push("Umidade do Solo Baixa");
    else if (latestData.umidadeSolo > THRESHOLDS.umidadeSolo.max) violations.push("Umidade do Solo Alta");
    
    if (latestData.temperaturaAr < THRESHOLDS.temperaturaAr.min) violations.push("Temperatura do Ar Baixa");
    else if (latestData.temperaturaAr > THRESHOLDS.temperaturaAr.max) violations.push("Temperatura do Ar Alta");

    if (latestData.luminosidade < THRESHOLDS.luminosidade.min) violations.push("Luminosidade Baixa");
    else if (latestData.luminosidade > THRESHOLDS.luminosidade.max) violations.push("Luminosidade Alta");

    // Lógica para definir o nível do status
    if (violations.length > 0) {
      status = 'alerta';
      icon = 'alert-triangle' as const;
      message = 'ALERTA: ' + violations.join(', ');
      
      // Condição para estado crítico (ex: 3 ou mais violações, ou Temperatura Alta)
      if (violations.length >= 3 || violations.some(v => v.includes("Temperatura Alta"))) {
        status = 'critico';
        icon = 'x-circle' as const;
      }
    }

    return { status, message, icon };
  };


  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 50 }}
        />
        <Text style={{ color: COLORS.primary, marginTop: 10 }}>Carregando dados...</Text>
      </View>
    );

  if (!dados.length)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.textSecondary }}>Nenhum dado disponível ainda.</Text>
      </View>
    );

  // Dados e Status para Renderização
  const latestData = dados[dados.length - 1];
  const { status, message, icon } = getSystemStatus(latestData);


  // Labels: Usando segundos ou minutos para mais detalhe se os timestamps forem próximos
  // Mantive horas como você tinha, mas se a coleta for a cada poucos segundos, minutos ou segundos seriam melhores.
  const labels = dados.map((d) => new Date(d.timestamp).getHours() + "h");

  const umidade = sanitize(dados.map((d) => d.umidadeSolo ?? 0));
  const luminosidade = sanitize(dados.map((d) => d.luminosidade ?? 0));
  const temperaturaAr = sanitize(dados.map((d) => d.temperaturaAr ?? 0));
  const umidadeAr = sanitize(dados.map((d) => d.umidadeAr ?? 0));

  const chartConfig = {
    // Configuração base para o gráfico
    backgroundGradientFrom: COLORS.cardBackground,
    backgroundGradientTo: COLORS.cardBackground,
    color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`, // Cor principal dos eixos/labels
    labelColor: (opacity = 1) => `rgba(4, 43, 0, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: "4", strokeWidth: "1", stroke: COLORS.primary },
    // Estilos customizados para o eixo Y
    propsForLabels: {
      fontSize: 10,
      fontWeight: '500',
    },
    decimalPlaces: 1,
    // Garante que o gráfico desenhe dentro do padding
    paddingRight: 30, 
  };

  const openModal = (label: string, data: number[], color: string) => {
    setSelectedChart({ label, data: sanitize(data), color });
    setModalVisible(true);
  };

  const ChartCard = ({ title, icon, data, chartColor, unit }: {
    title: string,
    icon: React.ReactNode,
    data: number[],
    chartColor: string,
    unit: string,
  }) => (
    // Adicionado marginVertical para separar bem os cards
    <TouchableOpacity onPress={() => openModal(title, data, chartColor)} style={{ marginVertical: 10 }}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {icon}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardSubtitle}>Últimos {MAX_DADOS} registros ({unit})</Text>
        <LineChart
          data={{ labels, datasets: [{ data, color: () => chartColor }] }}
          // Ajuste na largura do gráfico para melhor proporção dentro do card
          width={screenWidth - 50} 
          height={220}
          chartConfig={{
            ...chartConfig,
            // Sobrescreve a cor do gráfico principal
            color: (opacity = 1) => chartColor,
            propsForDots: { r: "4", strokeWidth: "1", stroke: chartColor },
          }}
          bezier
          style={styles.chart}
          fromZero
        />
      </View>
    </TouchableOpacity>
  );

  // NOVO COMPONENTE: Exibe o status do sistema em tempo real
  const StatusAlert = () => {
    let color;
    switch (status) {
      case 'normal':
        color = COLORS.statusNormal;
        break;
      case 'alerta':
        color = COLORS.statusAlerta;
        break;
      case 'critico':
        color = COLORS.statusCritico;
        break;
      default:
        color = COLORS.textSecondary;
    }

    return (
      <View style={[styles.statusAlertContainer, { borderLeftColor: color }]}>
        <Feather name={icon} size={24} color={color} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTitle, { color }]}>
            {status.toUpperCase()} DO SISTEMA
          </Text>
          <Text style={styles.statusMessage}>{message}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* NOVO ELEMENTO: Contêiner do Cabeçalho com o underline verde */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>RELATÓRIO DE GRÁFICOS</Text>
          <View style={styles.headerUnderline} />
        </View>

        {/* NOVO ELEMENTO: Alerta de Status do Sistema */}
        <StatusAlert />
        
        {/* VIEW que envolve os cards - Removida a altura fixa e usada uma cor de fundo limpa */}
        <View style={{ backgroundColor: COLORS.background }}> 

          {/* Umidade do Solo */}
          <ChartCard
            title="Umidade do Solo"
            icon={<MaterialCommunityIcons name="water-percent" size={24} color={COLORS.soilHumidity} />}
            data={umidade}
            chartColor={COLORS.soilHumidity}
            unit="%"
          />

          {/* Luminosidade */}
          <ChartCard
            title="Luminosidade"
            icon={<Feather name="sun" size={24} color={COLORS.light} />}
            data={luminosidade}
            chartColor={COLORS.light}
            unit="lux"
          />

          {/* Temperatura do Ar */}
          <ChartCard
            title="Temperatura do Ar"
            icon={<Feather name="thermometer" size={24} color={COLORS.airTemperature} />}
            data={temperaturaAr}
            chartColor={COLORS.airTemperature}
            unit="°C"
          />

          {/* Umidade do Ar */}
          <ChartCard
            title="Umidade do Ar"
            icon={<Feather name="droplet" size={24} color={COLORS.airHumidity} />}
            data={umidadeAr}
            chartColor={COLORS.airHumidity}
            unit="%"
          />
        </View>
        {/* Modal Expandido */}
        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            {selectedChart && (
              <>
                <Text style={[styles.modalTitle, { color: selectedChart.color }]}>{selectedChart.label} - Gráfico Detalhado</Text>
                <LineChart
                  data={{ labels, datasets: [{ data: selectedChart.data, color: () => selectedChart.color }] }}
                  // Gráfico do modal ocupa a largura total da tela (screenWidth)
                  width={screenWidth}
                  height={400}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => selectedChart.color,
                    propsForDots: { r: "4", strokeWidth: "1", stroke: selectedChart.color },
                  }}
                  bezier
                  style={styles.chart}
                  fromZero
                />
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: selectedChart.color }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  // Removido padding: 0 para melhor controle do espaçamento
  container: { flex: 1 }, 
  // O padding horizontal foi mantido aqui para espaçar o conteúdo do card
  scrollContent: { paddingVertical: 10, paddingHorizontal: 15 }, 

  // --- NOVOS ESTILOS PARA O CABEÇALHO ---
  headerContainer: {
    backgroundColor: COLORS.cardBackground, // Fundo branco e arredondado
    borderRadius: 10,
    paddingVertical: 15, // Espaçamento interno vertical
    // Ajuste de margens para o componente ocupar a largura do scrollContent
    marginBottom: 15,
    marginTop: 0,
    marginHorizontal: 0, 
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8, // Espaço acima da linha
  },
  headerUnderline: {
    width: 50, // Tamanho pequeno da linha
    height: 3,
    backgroundColor: COLORS.primary, // Cor verde principal
    alignSelf: 'center', // Centraliza a linha
  },
  // --- NOVOS ESTILOS PARA O ALERTA DE STATUS ---
  statusAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderLeftWidth: 5, // A cor do status vai aqui
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  // ----------------------------------------

  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20, // Diminuí um pouco o raio da borda
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8, // Diminuí um pouco a sombra
    elevation: 3, // Diminuí a elevação
    padding: 15,
    // marginHorizontal: 10, // Não precisa mais, pois o scrollContent já tem padding
  },
  cardHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    // Removido width: '50%', que limitava desnecessariamente
    marginBottom: 6 
  },
  cardTitle: {
    fontSize: 18, // Aumentei um pouco a fonte do título
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginLeft: 8
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontStyle: 'italic'
  },
  chart: {
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'center',
    // Adicionado um pequeno margin para ajudar a centralizar
    marginRight: 15, 
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20
  },
  modalTitle: {
    fontSize: 22, // Aumentei um pouco o título do modal
    fontWeight: "bold",
    marginBottom: 30, // Aumentei o espaço
  },
  closeButton: {
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18
  },
});