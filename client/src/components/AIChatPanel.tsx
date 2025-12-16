import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types';
import { marked } from 'marked';

interface AIChatPanelProps {
  onContentUpdate: (content: string) => void;
  assignmentTopic: string;
  assignmentId: string;
  initialChats?: ChatMessage[];
}

export function AIChatPanel({ onContentUpdate, assignmentTopic, assignmentId, initialChats = [] }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialChats && initialChats.length > 0) {
      // Ensure timestamps are Date objects
      return initialChats.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }));
    }
    // Show different greeting based on whether topic is set
    const greeting = assignmentTopic
      ? `Hello! I'm here to help you write about "${assignmentTopic}". What would you like me to help with?`
      : `Hello! I'm your AI writing assistant. Please tell me the topic of your assignment to get started.`;

    return [
      {
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Configure marked for chat rendering
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const simulateStreaming = async (text: string) => {
    const words = text.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      currentContent += (i === 0 ? '' : ' ') + words[i];
      onContentUpdate(currentContent);
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    return currentContent;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to backend
    // Note: In a real app we might debounce this or save eagerly
    // For now we will assume the backend handles saving the "session" or we push individual messages
    // Since we don't have a granular "add message" endpoint, we might just rely on updating the assignment
    // BUT the user asked to SAVE chats.

    // Let's create a local helper to save chat
    const saveChat = async (msg: ChatMessage) => {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/assignments/${assignmentId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })
        });
      } catch (e) {
        console.error("Failed to save chat", e);
      }
    };

    saveChat(userMessage);

    // Call Backend API
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.trim(),
          topic: assignmentTopic
        }),
      });

      if (!response.ok) {
        throw new Error('AI Generation failed');
      }

      const data = await response.json();
      const generatedContent = data.content || "Sorry, I couldn't generate content.";

      // Show the actual AI response in chat
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generatedContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      saveChat(assistantMessage);

      // Also stream to the document preview
      await simulateStreaming(generatedContent);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error connecting to the AI server. Please check your backend connection.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  // Load initial chats if available
  // We need to fetch the assignment to get chats, but the parent component has the assignment.
  // Ideally, the parent should pass the chat history down.
  // For now, let's just make sure we save outgoing chats.

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = assignmentTopic ? [
    "Draft outline",
    "Expand this",
    "Make formal",
    "Add examples",
  ] : [
    "Write introduction",
    "Create outline",
    "Generate content",
    "Add conclusion",
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Chat Header */}
      <div className="px-4 py-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Writing Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105 ${message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                  : 'bg-gradient-to-br from-card to-muted border-2 border-primary/20 text-primary'
                  }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[85%] px-4 py-3 shadow-md transition-all hover:shadow-lg ${message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm'
                  : 'bg-card/80 backdrop-blur-sm border border-border/50 text-foreground rounded-2xl rounded-tl-sm'
                  }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div
                    className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert
                      prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2
                      prose-li:my-0 prose-strong:font-semibold prose-code:bg-muted/50
                      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                      prose-code:border prose-code:border-border/50"
                    dangerouslySetInnerHTML={{ __html: marked.parse(message.content, { async: false }) as string }}
                  />
                )}
                <p className="text-[10px] opacity-70 mt-2 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-card to-muted border-2 border-primary/20 flex items-center justify-center shadow-md">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                <div className="flex gap-2 items-center h-full">
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-card/50 backdrop-blur-sm border-t">
        {/* Quick Prompts */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-gradient-to-r from-secondary/70 to-secondary/50 hover:from-secondary hover:to-secondary/80 text-xs font-medium rounded-full text-secondary-foreground transition-all whitespace-nowrap border border-primary/10 hover:border-primary/30 shadow-sm hover:shadow-md"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 h-12 rounded-2xl px-5 pr-12 text-sm bg-background/50 backdrop-blur-sm border-2 border-muted-foreground/20 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="absolute right-1.5 h-9 w-9 rounded-xl shadow-md bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
