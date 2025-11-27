import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

// ===== TIPAGENS =====
type WeatherCondition = 'Clear' | 'Clouds' | 'Rain' | 'Thunderstorm' | 'Drizzle' | 'Cold' | 'Mist' | 'Haze' | 'Default';

interface GradientData {
    color1: string;
    color2: string;
    description: string;
    descriptionPT: string; 
    plantIcon: keyof typeof PLANT_ICONS;
}

interface WeatherData extends GradientData {
    temperatureC: number | null; 
    condition: WeatherCondition; 
}
// Gradiente dependedo da temperatura/clima
const WEATHER_GRADIENTS: Record<WeatherCondition, GradientData> = {
    // Céu Limpo
    'Clear': { color1: '#10B981', color2: '#34D399', description: 'Clear', descriptionPT: 'Céu Limpo', plantIcon: 'Dry' },

    // Nublado
    'Clouds': { color1: '#059669', color2: '#14B8A6', description: 'Clouds', descriptionPT: 'Nublado', plantIcon: 'Healthy' },

    // Chuva Forte
    'Rain': { color1: '#06B6D4', color2: '#2DD4BF', description: 'Rain', descriptionPT: 'Chuva Forte', plantIcon: 'Healthy' },

    // Tempestade
    'Thunderstorm': { color1: '#15803D', color2: '#36B37E', description: 'Thunderstorm', descriptionPT: 'Tempestade', plantIcon: 'Stressed' },

    // Chuvisco
    'Drizzle': { color1: '#6EE7B7', color2: '#A7F3D0', description: 'Drizzle', descriptionPT: 'Chuvisco', plantIcon: 'Healthy' },

    // Neve
    'Cold': { color1: '#94A3B8', color2: '#CBD5E1', description: 'Snow', descriptionPT: 'Neve', plantIcon: 'Frozen' },

    // Neblina/Névoa
    'Mist': { color1: '#E2E8F0', color2: '#F1F5F9', description: 'Mist', descriptionPT: 'Neblina/Névoa', plantIcon: 'Healthy' },

    // Névoa Seca/Bruma
    'Haze': { color1: '#e7ad0cff', color2: '#c7600cff', description: 'Haze', descriptionPT: 'Névoa Seca/Bruma', plantIcon: 'Dry' },

    // Clima Indisponível
    'Default': { color1: '#10B981', color2: '#34D399', description: 'Default', descriptionPT: 'Clima Indisponível', plantIcon: 'Default' }
};
// Definição dos ícones da planta (ícones do MaterialCommunityIcons e Feather)
const PLANT_ICONS = {
    Healthy: ({ color }: { color: string }) => <MaterialCommunityIcons name="flower" size={24} color={color} />,
    Dry: ({ color }: { color: string }) => <MaterialCommunityIcons name="cactus" size={24} color={color} />,
    Frozen: ({ color }: { color: string }) => <MaterialCommunityIcons name="snowflake" size={24} color={color} />,
    Stressed: ({ color }: { color: string }) => <MaterialCommunityIcons name="flash-alert" size={24} color={color} />,
    Default: ({ color }: { color: string }) => <Feather name="help-circle" size={24} color={color} />,
};

// Mapeamento de sugestões de plantio (completo) - Sem Alterações
const PLANTING_ADVICE = [
    // Janeiro (0) - Verão, chuvas intensas
    { month: "Janeiro", Rain: "Foque na manutenção e colheita de milho/soja. Prepare o solo para hortaliças de ciclo rápido (couve, alface).", Clear: "Garanta irrigação robusta para culturas de verão. Ideal para batata-doce e melancia.", Clouds: "Boa época para feijão-caupi e hortaliças de folha (salsa, cebolinha)." },

    // Fevereiro (1) - Verão, continua chuvoso
    { month: "Fevereiro", Rain: "Momento de semear arroz irrigado e quiabo. Monitore pragas devido à umidade.", Clear: "Mantenha a irrigação para culturas de grãos e inicie plantio de amendoim.", Clouds: "Ideal para plantar mandioca e tubérculos resistentes." },

    // Março (2) - Fim do Verão, transição
    { month: "Março", Rain: "Início do plantio de trigo e cevada em algumas regiões. Plantio de abóbora e rabanete.", Clear: "Prepare o solo para culturas de outono-inverno. Boa hora para pastagens.", Clouds: "Plante cenoura e beterraba, aproveitando a terra mais úmida." },

    // Abril (3) - Outono, clima ameno
    { month: "Abril", Rain: "Continue o plantio de alho e cebola. Favorece a transição para culturas de inverno.", Clear: "Reduza a irrigação gradualmente. Ideal para brócolis e couve-flor.", Clouds: "Foco em aveia e azevém." },

    // Maio (4) - Outono/Inverno, frio e seco (em algumas regiões)
    { month: "Maio", Rain: "Plantio de inverno em regiões mais quentes: ervilha, lentilha. Mantenha o solo drenado.", Clear: "Semeadura de trigo e culturas de sequeiro. Ideal para alface de inverno.", Clouds: "Plantio de repolho e espinafre." },

    // Junho (5) - Inverno, frio
    { month: "Junho", Rain: "Risco de geadas em regiões frias: proteja as culturas sensíveis. Plantio de favas.", Clear: "Ideal para culturas de inverno resistentes ao frio (alho, cebola, cenoura).", Clouds: "Boa época para mudas de árvores frutíferas e leguminosas." },

    // Julho (6) - Inverno, pico do frio
    { month: "Julho", Rain: "Foco na manutenção do solo e adubação verde. Plantio de batata-doce.", Clear: "Plantio de culturas de ciclo curto: rabanete, nabo.", Clouds: "Cultivo de tubérculos e preparo para a primavera." },

    // Agosto (7) - Fim do Inverno, seca
    { month: "Agosto", Rain: "Início do plantio de milho precoce e hortaliças de verão (tomate, pimentão) em estufas.", Clear: "Preparação intensiva do solo para a primavera. Plantio de melão e melancia.", Clouds: "Melhorar a drenagem do solo. Plantio de morango." },

    // Setembro (8) - Primavera, início das chuvas (em algumas regiões)
    { month: "Setembro", Rain: "Época de semeadura de arroz e milho safrinha. Plantio de alface e rúcula.", Clear: "Plantio de girassol e amendoim. Foco em culturas que demandam calor.", Clouds: "Início do plantio de café em algumas áreas." },

    // Outubro (9) - Primavera, chuvas se intensificam
    { month: "Outubro", Rain: "Plantio principal de soja e milho. Início da safra das águas.", Clear: "Demanda alta por irrigação, mas bom para a fruticultura.", Clouds: "Plantio de mandioca e batata." },

    // Novembro (10) - Primavera/Verão, muito chuvoso
    { month: "Novembro", Rain: "Plantio e desenvolvimento do milho e soja. Risco de doenças fúngicas.", Clear: "Plantio de algodão e feijão-comum. Foco em proteção contra sol forte.", Clouds: "Início do ciclo de culturas que precisam de umidade constante (arroz)." },

    // Dezembro (11) - Verão, chuvas abundantes
    { month: "Dezembro", Rain: "Foco no manejo de doenças e pragas. Plantio de quiabo e pepino.", Clear: "Colheita de frutas de caroço. Garanta sombreamento para mudas novas.", Clouds: "Plantio de abacaxi e preparo para o milho safrinha." }
];

// ===== FUNÇÕES DE LÓGICA =====

/** Retorna a saudação apropriada */
function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Bom dia!";
    if (hour >= 12 && hour < 18) return "Boa tarde!";
    return "Boa noite!";
}

/** Retorna a hora atual no formato HH:MM */
function getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/** Gera e exibe a sugestão de plantio com base no mês e no clima. */
function getPlantingAdvice(weatherCondition: WeatherCondition): string {
    const currentMonthIndex = new Date().getMonth();
    const monthAdvice = PLANTING_ADVICE[currentMonthIndex];

    if (!monthAdvice) return "Sugestão sazonal indisponível para este mês.";

    // Normaliza a condição para encontrar o conselho (simplificado)
    let adviceKey: 'Rain' | 'Clear' | 'Clouds' = 'Clouds'; // Fallback
    if (weatherCondition === 'Clear' || weatherCondition === 'Haze') adviceKey = 'Clear';
    if (weatherCondition === 'Rain' || weatherCondition === 'Thunderstorm' || weatherCondition === 'Drizzle') adviceKey = 'Rain';

    return monthAdvice[adviceKey] || monthAdvice.Clouds;
}

// Simula a busca de dados de clima (agora retorna um objeto completo com temperatura)
async function fetchWeatherSimulation(): Promise<{ condition: WeatherCondition, temperatureC: number }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const conditions: WeatherCondition[] = Object.keys(WEATHER_GRADIENTS).filter(key => key !== 'Default') as WeatherCondition[];
    const randomIndex = Math.floor(Math.random() * conditions.length);
    const condition = conditions[randomIndex];

    // Simulação de temperatura baseada na condição do clima
    let temp;
    if (condition === 'Cold' || condition === 'Mist') {
        temp = Math.floor(Math.random() * 10) + 5; // 5°C a 14°C
    } else if (condition === 'Clear' || condition === 'Haze') {
        temp = Math.floor(Math.random() * 15) + 20; // 20°C a 34°C
    } else { // Rain, Clouds, Thunderstorm, Drizzle
        temp = Math.floor(Math.random() * 10) + 18; // 18°C a 27°C
    }

    return { condition, temperatureC: temp };
}

// Define o estado inicial do clima com a nova interface
const defaultWeatherData: WeatherData = {
    ...WEATHER_GRADIENTS.Default,
    temperatureC: null,
    condition: 'Default'
};

// ===== COMPONENTE REACT NATIVE =====
export default function AgroBanner() {
    const [currentTime, setCurrentTime] = useState(getCurrentTime());
    const [greeting, setGreeting] = useState(getGreeting());
    // Usa a nova interface WeatherData
    const [weatherData, setWeatherData] = useState<WeatherData>(defaultWeatherData);
    const [plantingAdvice, setPlantingAdvice] = useState<string>("Aguardando dados de clima para sugestão de plantio...");
    const [loading, setLoading] = useState(false);

    const updateCard = useCallback(async (isInitialLoad: boolean) => {
        setLoading(true);

        setGreeting(getGreeting());
        setCurrentTime(getCurrentTime());

        try {
            if (isInitialLoad) {
                setWeatherData(defaultWeatherData);
            }

            const { condition, temperatureC } = await fetchWeatherSimulation();
            const newGradientData = WEATHER_GRADIENTS[condition] || WEATHER_GRADIENTS.Default;

            // Combina os dados do gradiente com a temperatura e a condição
            const newWeatherData: WeatherData = {
                ...newGradientData,
                temperatureC: temperatureC,
                condition: condition
            };

            setWeatherData(newWeatherData);
            setPlantingAdvice(getPlantingAdvice(condition));
        } catch (error) {
            console.error("Erro ao buscar clima:", error);
            setWeatherData(defaultWeatherData);
            setPlantingAdvice("Não foi possível carregar o clima. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Timer para atualização da hora e saudação (a cada minuto)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTime());
            setGreeting(getGreeting());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Busca inicial do clima
    useEffect(() => {
        updateCard(true);
    }, [updateCard]);

    const PlantIconComponent = PLANT_ICONS[weatherData.plantIcon];

    // Formata a temperatura para exibição
    const temperatureDisplay = weatherData.temperatureC !== null
        ? `${weatherData.temperatureC}°C | ${weatherData.descriptionPT}`
        : weatherData.descriptionPT;


    return (
        <View style={bannerStyles.container}>
            {/* 1. Cartão Principal (com degradê dinâmico) */}
            <LinearGradient
                colors={[weatherData.color1, weatherData.color2]}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
                style={bannerStyles.agroCardContainer}
            >
                <View style={bannerStyles.agroCard}>

                    {/* Linha superior */}
                    <View style={bannerStyles.topRow}>
                        <View style={bannerStyles.titleIcon}>
                            <Feather name="grid" size={16} color="white" style={{ marginRight: 5 }} />
                            <Text style={bannerStyles.topTitle}>DIA PRODUTIVO NO CAMPO</Text>
                        </View>
                        <View style={bannerStyles.timeWeather}>
                            <PlantIconComponent color="white" />
                            {/* Exibe a temperatura em Celsius e a descrição em português */}
                            <Text style={bannerStyles.timeText}>{temperatureDisplay}</Text>
                            <MaterialCommunityIcons name="clock-outline" size={18} color="white" style={{ marginLeft: 8 }} />
                            <Text style={bannerStyles.timeTextSmall}>{currentTime}</Text>
                        </View>
                    </View>

                    {/* Título Principal (Saudação Dinâmica) */}
                    <Text style={bannerStyles.mainTitle}>{greeting}</Text>

                    {/* Subtítulo / Slogan */}
                    <Text style={bannerStyles.subTitle}>
                        É hora de cuidar do que plantamos.
                    </Text>

                    {/* Botão de Atualizar Clima */}
                    <TouchableOpacity
                        style={bannerStyles.refreshButton}
                        onPress={() => updateCard(false)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#059669" size="small" style={{ marginRight: 5 }} />
                        ) : (
                            <MaterialCommunityIcons name="weather-cloudy-alert" size={18} color="#059669" style={{ marginRight: 5 }} />
                        )}
                        <Text style={bannerStyles.refreshButtonText}>
                            {loading ? "Atualizando..." : "Atualizar Clima"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* 2. Aviso de Plantio Dinâmico */}
            <View style={bannerStyles.adviceContainer}>
                <View style={bannerStyles.adviceHeader}>
                    <MaterialCommunityIcons name="sprout" size={24} color="#059669" style={{ marginRight: 5 }} />
                    <Text style={bannerStyles.adviceTitle}>Sugestão Agronômica</Text>
                </View>
                <Text style={bannerStyles.adviceText}>{plantingAdvice}</Text>
            </View>

        </View>
    );
}

const bannerStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: '100%',
    },
    agroCardContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
        marginTop: 20,
        marginBottom: 16,
    },
    agroCard: {
        padding: 24,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    timeWeather: {
        flexDirection: 'row',
        alignItems: 'center',
        // Permite que o texto de clima/temperatura ocupe espaço
        flexShrink: 1,
        marginLeft: 10,
    },
    timeText: {
        fontSize: 14, // Reduzido para caber mais informações
        fontWeight: '700',
        color: 'white',
        marginLeft: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    timeTextSmall: {
        fontSize: 14,
        fontWeight: '700',
        color: 'white',
        marginLeft: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 12,
        lineHeight: 36,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 24,
        color: 'rgba(255, 255, 255, 0.9)',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    refreshButton: {
        backgroundColor: '#ECFDF5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshButtonText: {
        color: '#059669',
        fontWeight: '600',
        fontSize: 14,
    },
    //Banner de susgestão
    adviceContainer: {
        width: '100%',
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    adviceTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    adviceText: {
        fontSize: 14,
        color: '#4B5563',
    },
});