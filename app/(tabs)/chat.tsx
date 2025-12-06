import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Rotas de Cores
const COLORS = {
  greenDark: '#0a5246ff',
  greenLight: '#e9e9e9ff',
  greenAccent: '#004d40',
  textDark: '#333333',
  textSubtle: '#555555',
  borderLight: '#E0E0E0',
  white: '#FFFFFF',
  grayBackground: '#F5F5F5',
  grayInput: '#F0F0F0',
  grayText: '#a09e9eff',
};

// Configuração da URL da API hospedada no Render
const RENDER_API_URL = "https://aura-back-app.onrender.com/api/chat/message";

interface Suggestion {
  id: string;
  text: string;
}

// --- Dados Mockados ---
const initialSuggestions: Suggestion[] = [
  {
    id: '1',
    text: 'Quando a melhor época para plantar alface?'
  },
  {
    id: '2',
    text: 'Existe método natural para controlar a lagarta do cartucho?'
  },
  {
    id: '3',
    text: 'Como controlar os pulgões da minha platação?'
  },
  {
    id: '4',
    text: 'Qual o risco do adubo orgânico versus o mineral?'
  },
];

const initialMessages = [
  {
    id: 'm1',
    text: 'Olá! Sou sua assistente **Aurora**. Como posso te ajudar hoje?',
    sender: 'assistant',
  },
];

// --- Componente: Icon (Usando SVGs Inline) ---
const Icon = ({ name, color = COLORS.textSubtle, size = '18px', style = {} }: { name: string, color: string, size: string, style?: any }) => {
  const getSvgPath = (name: string) => {
    switch (name) {
      case 'leaf':
        return (
          <path fill="currentColor" d="M16 21l-3 1-4-2.5-4 2.5v-3.82c0-.39-.15-.76-.41-1.04L2 13.5l4-4.5h-.73a.27.27 0 01-.15-.5L5.7 7.7a.27.27 0 01.4-.04l1.6 1.74 3.56-3.9a.27.27 0 01.37 0L14.7 6.4a.27.27 0 010 .37L13 9l3 3h.71a.27.27 0 01.19.08l.94.94a.27.27 0 01-.03.37L16 16.5l3.86 2.87c.28.2.22.61-.13.75L16 21z" />
        );
      case 'sun':
        return (
          <>
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
          </>
        );
      case 'bug':
        return (
          <>
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 13v2M6 13v2M10 20h4M4 19l-1 2m18-2l1 2" />
            <path fill="currentColor" d="M14 6H10c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 12v3c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3M16 12v3c0 2.21 1.79 4 4 4s4-1.79 4-4v-3" />
          </>
        );
      case 'sprinkler':
        return (
          <path fill="currentColor" d="M12 2.69l5.66 5.66a8 8 0 11-11.32 0L12 2.69z" />
        );
      case 'send':
        return (
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        );
      case 'sparkle':
        return (
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.25L13.75 6L15.5 4.25L17.25 6L15.5 7.75L17.25 9.5L15.5 11.25L13.75 9.5L12 11.25L10.25 9.5L8.5 11.25L6.75 9.5L8.5 7.75L6.75 6L8.5 4.25L10.25 6L12 4.25ZM20 18L21.5 19.5L20 21L18.5 19.5L20 18ZM4 18L5.5 19.5L4 21L2.5 19.5L4 18Z"
          />
        );
      case 'chevron-right': // Para o chip do usuário
        return (
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
        );
      case 'home': // Ícone da barra de navegação
        return (
          <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        );
      case 'chart': // Ícone da barra de navegação
        return (
          <path fill="currentColor" d="M12 2L6 8v14h12V8z" />
        );
      case 'chat': // Ícone da barra de navegação
        return (
          <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        );
      case 'profile': // Ícone da barra de navegação
        return (
          <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        );
      case 'assistant': // 🚨 Ícone Adicionado
        return (
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.4 12.3 13 13 13 14h-2c0-1.1.45-2.19 1.18-3l.92-.92c.38-.38.59-.88.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        )
      default:
        return null;
    }
  };

  const svgContent = getSvgPath(name);

  if (!svgContent) return null;

  // Ajusta stroke e fill baseado no tipo de ícone para manter a consistência visual
  const isStrokeIcon = ['sun', 'send', 'chevron-right'].includes(name);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isStrokeIcon ? "none" : "currentColor"}
      stroke={isStrokeIcon ? "currentColor" : "none"}
      strokeWidth={isStrokeIcon ? "2" : "0"}
      style={{ color: color, ...style }}
    >
      {svgContent}
    </svg>
  );
};

// Menagem do assistente
const MessageBubble = ({ text, sender }: { text: string, sender: string }) => {
  const isAssistant = sender === 'assistant';
  const bubbleStyles = {
    padding: '12px 16px',
    borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.27)',
    maxWidth: '85%',
    marginBottom: '8px',
    fontSize: '14px',
    lineHeight: '20px',
    // Removido display: flex e alignItems: center para o markdown funcionar com blocos
    borderBottom: isAssistant ? `1px solid ${COLORS.borderLight}` : 'none',
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: isAssistant ? 'flex-start' : 'flex-end',
    marginBottom: '4px',
  };

  const assistantBubbleStyles = {
    backgroundColor: COLORS.greenLight,
    color: COLORS.textDark,
    marginRight: 'auto',
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '16px',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '16px',
  };

  const userBubbleStyles = {
    backgroundColor: COLORS.white,
    color: COLORS.textDark,
    marginLeft: 'auto',
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '16px',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '16px',
    border: `1px solid ${COLORS.borderLight}`,
  };

  return (
    <div style={containerStyles}>
      {isAssistant && (
        <div style={{ alignSelf: 'flex-end', paddingRight: '6px', paddingBottom: '2px' }}>
          <Icon name="assistant" size="20px" color={COLORS.greenDark} />
        </div>
      )}
      <div style={{ ...bubbleStyles, ...(isAssistant ? assistantBubbleStyles : userBubbleStyles) }}>
        {/* 🚨 Aplicação do ReactMarkdown com estilos inline MINIMOS para blocos */}
        <ReactMarkdown
          components={{
            // Estilos para manter a consistência da bolha original
            p: ({ children }) => <p style={{ margin: '0 0 4px 0', fontSize: '14px', lineHeight: '20px' }}>{children}</p>,
            strong: ({ children }) => <strong style={{ fontWeight: '700' }}>{children}</strong>,
            ul: ({ children }) => <ul style={{ margin: '8px 0 4px 15px', padding: '0', listStyleType: 'disc' }}>{children}</ul>,
            li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// --- Componente: UserChip (Sugestão Clicada no Chat) ---

const UserChip = ({ text }: { text: string }) => {
  const gradientColors = '#145c50ff, #0d5549ff, #055245ff';
  const gradientStyle = {
    background: `linear-gradient(90deg, ${gradientColors})`,
    color: COLORS.white,
    border: 'none',
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '16px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.27)',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px', marginTop: '4px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        maxWidth: '85%',
        marginLeft: 'auto',
        cursor: 'default',
        ...gradientStyle
      }}>
        <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '6px' }}>{text}</span>
        <Icon name="chevron-right" size="14px" color={COLORS.white} />
      </div>
    </div>
  );
};

// Sugestões de perguntas
const SuggestionItem = ({ item, onPress }: { onPress: (query: string) => void, item: Suggestion }) => (
  <button
    onClick={() => onPress(item.text)}
    style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      padding: '16px',
      borderRadius: '20px',
      marginBottom: '10px',
      border: `1px solid ${COLORS.greenDark}`,
      boxShadow: '0 1px 4px rgba(22, 21, 21, 0.1)',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      transition: 'background-color 0.15s ease',
      outline: 'none',
      justifyContent: 'space-between',
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.grayBackground}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.white}
  >
    <span style={{ fontSize: '15px', color: COLORS.textDark, fontWeight: '500' }}>{item.text}</span>
    <Icon name="chevron-right" size="18px" color={COLORS.greenDark} style={{ marginLeft: '10px' }} />
  </button>
);

// Input para a digitação do chat
const ChatInput = ({ onSend, value, onChangeText }: { onSend: any, value: string, onChangeText: any }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderTop: `1px solid ${COLORS.borderLight}`,
    backgroundColor: COLORS.white,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    flexShrink: 0,
  }}>
    <input
      type="text"
      style={{
        flex: 1,
        height: '48px',
        backgroundColor: COLORS.grayInput,
        borderRadius: '24px',
        padding: '0 16px',
        marginRight: '10px',
        fontSize: '16px',
        color: COLORS.textDark,
        border: `1px solid ${COLORS.borderLight}`,
        outline: 'none',
      }}
      placeholder="Digite sua pergunta sobre agricultura..."
      value={value}
      onChange={e => onChangeText(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
    />
    <button
      onClick={onSend}
      disabled={!value.trim()}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: value.trim() ? COLORS.greenDark : COLORS.borderLight,
        boxShadow: value.trim() ? '0 2px 8px rgba(58,138,76,0.3)' : 'none',
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
        cursor: value.trim() ? 'pointer' : 'not-allowed',
        outline: 'none',
        border: 'none',
      }}
    >
      <Icon name="send" size="22px" color={COLORS.white} />
    </button>
  </div>
);


const TypingIndicator = () => {
  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: COLORS.greenDark,
    margin: '0 2px',
    animation: 'dot-flashing 1s infinite alternate',
    display: 'inline-block',
  };

  // Carregando a mensagem SPAN
  const Dot = ({ delay }: { delay: string }) => (
    <span style={{
      ...dotStyle,
      animationDelay: delay,
    }}></span>
  );

  const typingBubbleStyle = {
    padding: '12px 16px',
    borderRadius: '16px',
    borderTopLeftRadius: '4px',
    maxWidth: 'fit-content',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    marginLeft: '6px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px', marginTop: '4px' }}>
      <div style={{ alignSelf: 'flex-end', paddingRight: '6px', paddingBottom: '2px' }}>
        <Icon name="assistant" size="20px" color={COLORS.greenDark} />
        <style>
          {`
          @keyframes dot-flashing {
            0% {
              opacity: 0.3;
              transform: translateY(0);
            }
            100% {
              opacity: 1;
              transform: translateY(-4px);
            }
          }
        `}
        </style>
      </div>
      <div style={typingBubbleStyle}>

        <div style={{ display: 'flex', alignItems: 'center', height: '10px' }}>
          <Dot delay="0s" />
          <Dot delay="0.2s" />
          <Dot delay="0.4s" />
        </div>
      </div>

    </div>
  );
};


const App = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Efeito para rolar automaticamente para o final

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Simula a resposta do assistente 
  const simulateAssistantResponse = (query: string): void => {
    // Resposta simulada com Markdown para teste
    const responseText = `Entendi sua pergunta sobre **"${query}"**. Esta é uma resposta simulada. 
    
**Para mais detalhes, considere:**
* Usar **markdown** para formatação.\n
* Usar _italico_ para ênfase.\n
* Utilizar listas para organização.`;

    setIsTyping(true);

    // Simula um pequeno delay para a resposta
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `m${prev.length + 1}`, text: responseText, sender: 'assistant' },
      ]);
      setIsTyping(false); // Para a simulação de digitação
    }, 1500);
  };

  const handleSendMessage = (query = inputText) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isTyping) return; // Impede envio se estiver digitando

    // 1. Adiciona a mensagem do usuário
    setMessages((prev) => [
      ...prev,
      { id: `u${prev.length + 1}`, text: trimmedQuery, sender: 'user_chip' },
    ]);
    setInputText('');


    sendMessageToAPI(trimmedQuery);
    setShowSuggestions(false);

  }


  async function sendMessageToAPI(message: string) {
  setIsTyping(true);

  try {
    // Recupera o id salvo no login
    const userId = await AsyncStorage.getItem("usuarioId");

    if (!userId) {
      console.error("Nenhum usuário logado encontrado");
      setIsTyping(false);
      return;
    }

    const response = await fetch(RENDER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,   // agora vai o id real do AsyncStorage
        message: message,
      }),
    });

    const data = await response.json();

    setIsTyping(false);

    if (response.ok) {
      console.log("Resposta da API:", data.response);
      setMessages((prev) => [
        ...prev,
        { id: `m${prev.length + 1}`, text: data.response, sender: "assistant" },
      ]);
    } else {
      console.error("Erro da API:", data.error || data);
      simulateAssistantResponse(message);
    }
  } catch (error) {
    setIsTyping(false);
    console.error("Erro ao chamar a API:", error);
    simulateAssistantResponse(message);
  }
}

  //Não deve permitir clique se o assistente estiver digitando
  const handleSuggestionPress = (query: string) => {
    if (isTyping) return;

    // Adiciona o chip de usuário
    setMessages((prev) => [
      ...prev,
      { id: `u_s${prev.length + 1}`, text: query, sender: 'user_chip' },
    ]);
    setShowSuggestions(false);

    sendMessageToAPI(query);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: COLORS.grayBackground,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>

      {/* Header (Topo) */}
      <div style={{
        padding: '18px 18px',
        borderBottom: 'none',
        background: 'linear-gradient(90deg, #145c50ff, #0d5549ff, #055245ff)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.33)',
        borderRadius: '0 0 22px 22px',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.white }}>Chat assistente</span>
      </div>

      {/* Área de Chat (Scrollable) */}
      <div ref={scrollRef} style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {messages.map((msg) => {
          if (msg.sender === 'user_chip') {
            return <UserChip key={msg.id} text={msg.text} />;
          }
          return <MessageBubble key={msg.id} text={msg.text} sender={msg.sender} />;
        })}

        {/* INDICADOR DE DIGITAÇÃO AQUI */}
        {isTyping && <TypingIndicator />}

        {/* Seção de Sugestões (Estado Inicial) */}
        {showSuggestions && messages.length === 1 && (
          <div style={{ marginTop: '20px', padding: '0 4px' }}>
            {initialSuggestions.map((item) => (
              <SuggestionItem key={item.id} item={item} onPress={handleSuggestionPress} />
            ))}
          </div>
        )}
      </div>

      {/* Input de Chat */}
      <ChatInput
        onSend={() => handleSendMessage()}
        value={inputText}
        onChangeText={setInputText}
      />
    </div>
  );
};

export default App;