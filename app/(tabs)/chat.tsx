import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  greenDark: '#0a5246ff',
  greenLight: '#e9e9e9ff',
  textDark: '#333333',
  borderLight: '#E0E0E0',
  white: '#FFFFFF',
  grayBackground: '#F5F5F5',
};

const RENDER_API_URL = 'https://aura-back-app.onrender.com/api/chat/message';

// Mensagem inicial
const initialMessages = [
  {
    id: 'm1',
    text: 'Olá! Sou sua assistente **Aurora**. Como posso te ajudar hoje?',
    sender: 'assistant',
  },
];

// Pool grande de sugestões
const suggestionsPool = [
  'Quando a melhor época para plantar alface?',
  'Existe método natural para controlar a lagarta do cartucho?',
  'Como controlar os pulgões da minha plantação?',
  'Qual o risco do adubo orgânico versus o mineral?',
  'Quais doenças são comuns na alface?',
  'Como preparar o solo corretamente?',
  'Quais fertilizantes naturais usar?',
  'Como economizar água na irrigação?',
  'Qual a melhor época para plantar tomate?',
  'Como combater a mosca branca?',
  'Quais são os adubos orgânicos mais eficientes?',
  'Como controlar doenças fúngicas na lavoura?',
  'Qual irrigação é mais eficiente para hortaliças?',
  'Como evitar excesso de pragas em verduras?',
  'Quais cuidados com o solo após a colheita?',
  'Como aumentar a produtividade sem fertilizantes químicos?',
  'Quais plantas podem ser cultivadas juntas?',
  'Como identificar deficiência de nutrientes nas plantas?',
  'Qual método natural para controlar pulgões?',
  'Como prevenir pragas em plantas jovens?',
];

// Embaralhar array
const shuffleArray = (array: string[]) => array.sort(() => 0.5 - Math.random());

// Bolha de mensagem
const MessageBubble = ({ text, sender }: { text: string; sender: string }) => {
  const isAssistant = sender === 'assistant';
  return (
    <View style={[styles.messageContainer, { justifyContent: isAssistant ? 'flex-start' : 'flex-end' }]}>
      {isAssistant && <Text style={styles.assistantIcon}>🤖</Text>}
      <View style={[styles.bubbleBase, isAssistant ? styles.assistantBubble : styles.userBubble]}>
        <Markdown
          style={{
            body: { color: COLORS.textDark, fontSize: 14, lineHeight: 20 },
            strong: { fontWeight: '700' },
            list_item: { marginBottom: 4 },
          }}
        >
          {text}
        </Markdown>
      </View>
    </View>
  );
};

// Chip do usuário
const UserChip = ({ text }: { text: string }) => (
  <View style={{ alignSelf: 'flex-end', marginVertical: 4 }}>
    <View style={styles.userChip}>
      <Text style={{ color: COLORS.white, fontWeight: '600' }}>{text}</Text>
    </View>
  </View>
);

// Sugestão
const SuggestionItem = ({ item, onPress }: { item: string; onPress: (text: string) => void }) => (
  <TouchableOpacity style={styles.suggestionButton} onPress={() => onPress(item)}>
    <Text style={styles.suggestionText}>{item}</Text>
  </TouchableOpacity>
);

// Indicador de digitação
const TypingIndicator = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
    <Text style={styles.assistantIcon}>🤖</Text>
    <View style={styles.typingBubble}>
      <Text>...</Text>
    </View>
  </View>
);

const App = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [availableSuggestions, setAvailableSuggestions] = useState(shuffleArray(suggestionsPool));
  const [visibleSuggestions, setVisibleSuggestions] = useState(availableSuggestions.slice(0, 4));
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Scroll automático
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping, visibleSuggestions]);

  // Ao clicar em uma sugestão
  const handleSuggestionPress = (query: string) => {
    setMessages(prev => [...prev, { id: `u_s${prev.length + 1}`, text: query, sender: 'user_chip' }]);
    setVisibleSuggestions([]); // esconde alternativas enquanto responde
    sendMessageToAPI(query);
  };

  // Atualiza sugestões depois da resposta
  const updateSuggestions = (clickedText: string) => {
    const newAvailable = availableSuggestions.filter(s => s !== clickedText);
    const newVisible = newAvailable.slice(0, 4);
    setAvailableSuggestions(newAvailable);
    setVisibleSuggestions(newVisible);
  };

  const sendMessageToAPI = async (message: string) => {
  setIsTyping(true);

  try {
    const userId = await AsyncStorage.getItem('usuarioId');

    if (!userId) {
      throw new Error("Usuário não encontrado no dispositivo.");
    }

    const response = await fetch(RENDER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || "Erro ao obter resposta do servidor.");
    }

    // RESPOSTA REAL DO BACKEND
    setMessages(prev => [
      ...prev,
      { id: `m${prev.length + 1}`, text: data.response, sender: 'assistant' },
    ]);

  } catch (error: any) {
    setMessages(prev => [
      ...prev,
      { id: `err${prev.length + 1}`, text: `Erro: ${error.message}`, sender: 'assistant' },
    ]);
  } finally {
    setIsTyping(false);
    updateSuggestions(message);
  }
};


  const simulateAssistantResponse = (query: string) => {
    const responseText = `Entendi sua pergunta sobre **"${query}"**. Esta é uma resposta simulada.`;
    setMessages(prev => [...prev, { id: `m${prev.length + 1}`, text: responseText, sender: 'assistant' }]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat assistente</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 180 : 160 }}
      >
        {messages.map(msg =>
          msg.sender === 'user_chip' ? (
            <UserChip key={msg.id} text={msg.text} />
          ) : (
            <MessageBubble key={msg.id} text={msg.text} sender={msg.sender} />
          )
        )}

        {isTyping && <TypingIndicator />}

        {visibleSuggestions.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {visibleSuggestions.map(item => (
              <SuggestionItem key={item} item={item} onPress={handleSuggestionPress} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayBackground },
  header: { padding: 18, backgroundColor: COLORS.greenDark, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, alignItems: 'center' },
  headerText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  chatArea: { flex: 1, padding: 16 },
  messageContainer: { flexDirection: 'row', marginBottom: 8 },
  bubbleBase: { padding: 12, borderRadius: 16, maxWidth: '85%' },
  assistantBubble: { backgroundColor: COLORS.greenLight, borderTopLeftRadius: 18, borderTopRightRadius: 16, borderBottomLeftRadius: 4, borderBottomRightRadius: 16 },
  userBubble: { backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 16, borderBottomLeftRadius: 4, borderBottomRightRadius: 16, borderWidth: 1, borderColor: COLORS.borderLight },
  assistantIcon: { marginRight: 6, fontSize: 20 },
  userChip: { backgroundColor: COLORS.greenDark, padding: 12, borderRadius: 16, maxWidth: '85%', alignItems: 'center', justifyContent: 'center' },
  suggestionButton: { backgroundColor: COLORS.white, padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: COLORS.greenDark },
  suggestionText: { color: COLORS.textDark, fontSize: 15, fontWeight: '500' },
  typingBubble: { backgroundColor: COLORS.greenLight, padding: 12, borderRadius: 16, maxWidth: '50%', justifyContent: 'center', marginLeft: 6 },
});
