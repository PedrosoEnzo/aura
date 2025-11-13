import React, { useState, useRef, useEffect } from 'react';

// === ROTAS DE CORES OTIMIZADAS PARA MODERNIDADE E HARMONIA ===
const COLORS = {
  // Cores Primárias (Mais escuras e vibrantes)
  greenPrimary: '#3A8A4C', // Cor principal do tema
  greenAccent: '#1ED760', // Para destaque (botões ativos)

  // Cores Secundárias (Fundo e Bolhas)
  background: '#F9F9F9', // Fundo mais limpo
  assistantBubble: '#EBF4ED', // Bolha do assistente mais suave
  userBubble: '#FFFFFF', // Bolha do usuário (Branco)

  // Texto
  textDark: '#262626', // Texto mais escuro
  textSubtle: '#6B7280', // Texto mais sutil
  
  // Bordas e Separadores
  borderLight: '#E5E7EB', // Borda sutil
  grayInput: '#F5F5F5', // Fundo do input
  white: '#FFFFFF',
};

// --- Dados Mockados (Mantidos) ---
const initialSuggestions = [
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
    text: 'Olá! Sou sua assistente Aurora. Como posso ajudá-lo hoje?',
    sender: 'assistant',
  },
];

// --- Componente: Icon (Usando SVGs Inline - Incluindo 'sparkle') ---
const Icon = ({ name, color = COLORS.textSubtle, size = '18px', style = {} }) => {
  const getSvgPath = (name) => {
    switch (name) {
      // ... (Outros ícones mantidos, mas omitidos para brevidade) ...

      case 'send':
        return (
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        );

      // NOVO ÍCONE DE BRILHO (SPARKLE)
      case 'sparkle': 
        return (
          <path 
            fill="none" 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M10 20c.34-.64.55-1.35.63-2.07c.06-.5-.38-.93-.86-.93H5.5a1.5 1.5 0 01-1.5-1.5V11.5c0-.47-.42-.8-.92-.85c-.72-.08-1.42-.3-2.07-.63l-.7-.35a.5.5 0 010-.86l.35-.7c.64-.34 1.35-.55 2.07-.63c.5-.06.93-.38.93-.86V5.5a1.5 1.5 0 011.5-1.5h3.11c.47 0 .8.42.85.92c.08.72.3 1.42.63 2.07l.35.7a.5.5 0 01.86 0l.7-.35c.34-.64.55-1.35.63-2.07c.06-.5.38-.93.93-.93H18.5a1.5 1.5 0 011.5 1.5v3.11c0 .47.42.8.92.85c.72.08 1.42.3 2.07.63l.7.35a.5.5 0 010 .86l-.35.7c-.64.34-1.35.55-2.07.63c-.5.06-.93.38-.93.86V18.5a1.5 1.5 0 01-1.5 1.5h-3.11c-.47 0-.8-.42-.85-.92c-.08-.72-.3-1.42-.63-2.07l-.35-.7a.5.5 0 01-.86 0l-.7.35z" />
          />
        );

      case 'chevron-right': // Para o chip do usuário
        return (
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
        );
      
      // ... (Outros ícones mantidos, mas omitidos para brevidade) ...
      default:
        return null;
    }
  };

  const svgContent = getSvgPath(name);

  if (!svgContent) return null;

  const isStrokeIcon = ['sun', 'send', 'chevron-right', 'sparkle'].includes(name);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isStrokeIcon ? "none" : "currentColor"}
      stroke={isStrokeIcon ? "currentColor" : "none"}
      strokeWidth={isStrokeIcon ? (name === 'sparkle' ? "1.5" : "2") : "0"} 
      style={{ color: color, ...style }}
    >
      {svgContent}
    </svg>
  );
};

// --- Componente: MessageBubble (Bolha de Mensagem) ---
const MessageBubble = ({ text, sender }) => {
  const isAssistant = sender === 'assistant';
  const bubbleStyles = {
    padding: '12px 16px',
    borderRadius: '20px', 
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)', 
    maxWidth: '85%',
    marginBottom: '8px',
    fontSize: '15px', 
    lineHeight: '20px',
    display: 'flex',
    alignItems: 'center',
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: isAssistant ? 'flex-start' : 'flex-end',
    marginBottom: '6px',
    paddingLeft: isAssistant ? '0' : '26px', 
  };

  const assistantBubbleStyles = {
    backgroundColor: COLORS.assistantBubble, 
    color: COLORS.textDark,
    marginRight: 'auto',
    borderBottomLeftRadius: '4px', 
  };

  const userBubbleStyles = {
    backgroundColor: COLORS.userBubble,
    color: COLORS.textDark,
    marginLeft: 'auto',
    borderBottomRightRadius: '4px', 
    border: `1px solid ${COLORS.borderLight}`,
  };

  return (
    <div style={containerStyles}>
      {isAssistant && (
        <div style={{ alignSelf: 'flex-start', paddingRight: '8px', paddingTop: '4px' }}>
          <Icon name="sparkle" size="24px" color={COLORS.greenPrimary} />
        </div>
      )}
      <div style={{ ...bubbleStyles, ...(isAssistant ? assistantBubbleStyles : userBubbleStyles) }}>
        <span>{text}</span>
      </div>
    </div>
  );
};

// --- Componente: UserChip (Sugestão Clicada no Chat) ---
const UserChip = ({ text }) => {
  const gradientStyle = {
    background: COLORS.greenPrimary, 
    color: COLORS.white,
    border: 'none',
    borderRadius: '20px',
    borderBottomRightRadius: '4px', 
    boxShadow: '0 2px 6px rgba(58, 138, 76, 0.3)', 
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
        <span style={{ fontWeight: '600', fontSize: '15px', marginRight: '6px' }}>{text}</span>
        <Icon name="chevron-right" size="16px" color={COLORS.white} />
      </div>
    </div>
  );
};

// --- Componente: SuggestionItem (Item da Lista de Sugestões Iniciais) ---
const SuggestionItem = ({ item, onPress }) => (
  <button
    onClick={() => onPress(item.text)}
    style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      padding: '16px', 
      borderRadius: '14px', 
      marginBottom: '10px', 
      border: `1px solid ${COLORS.borderLight}`, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      transition: 'background-color 0.15s ease',
      outline: 'none',
      justifyContent: 'space-between',
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.grayInput}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.white}
  >
    <span style={{ fontSize: '15px', color: COLORS.textDark, fontWeight: '500' }}>{item.text}</span>
    <Icon name="chevron-right" size="18px" color={COLORS.greenPrimary} style={{ marginLeft: '10px' }} />
  </button>
);

// --- Componente: ChatInput (Barra de Digitação) ---
const ChatInput = ({ onSend, value, onChangeText }) => (
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
        padding: '0 18px',
        marginRight: '10px',
        fontSize: '16px',
        color: COLORS.textDark,
        border: 'none', 
        outline: 'none',
        transition: 'box-shadow 0.2s',
        boxShadow: `inset 0 0 0 1px ${COLORS.borderLight}`, 
      }}
      onFocus={(e) => e.target.style.boxShadow = `inset 0 0 0 2px ${COLORS.greenPrimary}`}
      onBlur={(e) => e.target.style.boxShadow = `inset 0 0 0 1px ${COLORS.borderLight}`}
      placeholder="Digite sua pergunta sobre agricultura..."
      value={value}
      onChange={e => onChangeText(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
    />
    <button
      onClick={onSend}
      disabled={!value.trim()}
      style={{
        width: '48px', 
        height: '48px', 
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: value.trim() ? COLORS.greenPrimary : COLORS.borderLight, 
        boxShadow: value.trim() ? '0 2px 8px rgba(58,138,76,0.3)' : 'none',
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
        cursor: value.trim() ? 'pointer' : 'not-allowed',
        outline: 'none',
        border: 'none',
      }}
    >
      <Icon name="send" size="24px" color={COLORS.white} />
    </button>
  </div>
);

// --- Componente: NavigationBar (Mantido para estrutura, mas vazio) ---
const NavigationBar = () => (
  <div style={{
    height: '38px',
    marginBottom: '30px',
    borderRadius: '30px',
    backgroundColor: 'transparent',
  }}>
  </div>
);


// --- Novo Componente: TypingIndicator (Usando 'sparkle') ---
const TypingIndicator = () => {
  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: COLORS.greenPrimary,
    margin: '0 2px',
    animation: 'dot-flashing 1s infinite alternate',
    display: 'inline-block',
  };

  const Dot = ({ delay }) => (
    <span style={{
      ...dotStyle,
      animationDelay: delay,
    }}></span>
  );

  const typingBubbleStyle = {
    padding: '12px 16px',
    borderRadius: '20px',
    backgroundColor: COLORS.assistantBubble,
    borderBottomLeftRadius: '4px',
    maxWidth: 'fit-content',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    marginLeft: '8px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px', marginTop: '4px' }}>
      <div style={{ alignSelf: 'flex-start', paddingRight: '8px', paddingTop: '4px' }}>
        <Icon name="sparkle" size="24px" color={COLORS.greenPrimary} />
      </div>
      <div style={typingBubbleStyle}>
        <div style={{ display: 'flex', alignItems: 'center', height: '10px' }}>
          <Dot delay="0s" />
          <Dot delay="0.2s" />
          <Dot delay="0.4s" />
        </div>
      </div>
      {/* Styles for the animation */}
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
  );
};


// --- Componente Principal: App ---
const App = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const simulateAssistantResponse = (query: string): void => {
    const responseText = `Entendi sua pergunta sobre "${query}". Esta é uma resposta simulada. Para implementar um chat real com IA, você pode usar a AI SDK da Vercel com modelos como GPT ou Claude.`;

    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `m${prev.length + 1}`, text: responseText, sender: 'assistant' },
      ]);
      setIsTyping(false); 
    }, 1500);
  };

  const handleSendMessage = (query = inputText) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `u${prev.length + 1}`, text: trimmedQuery, sender: 'user_chip' },
    ]);
    setInputText('');
    setShowSuggestions(false);

    simulateAssistantResponse(trimmedQuery);
  };

  const handleSuggestionPress = (query: string) => {
    if (isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `u_s${prev.length + 1}`, text: query, sender: 'user_chip' },
    ]);
    setShowSuggestions(false);
    simulateAssistantResponse(query);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: COLORS.background, 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>

      {/* Header (Topo) */}
      <div style={{
        padding: '18px 18px',
        background: `linear-gradient(90deg, ${COLORS.greenPrimary}, #4BA06F)`, 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', 
        borderRadius: '0 0 24px 24px', 
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.white }}>Chat Assistente</span>
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

      <NavigationBar />
    </div>
  );
};

export default App;