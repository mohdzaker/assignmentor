import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Sparkles, Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types';

interface AIChatPanelProps {
  onContentUpdate: (content: string) => void;
  assignmentTopic: string;
  wordLimit: number;
}

export function AIChatPanel({ onContentUpdate, assignmentTopic, wordLimit }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm ready to help you write your assignment on "${assignmentTopic}". Would you like me to generate the initial content, or do you have specific instructions?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

    // Simulate AI response with mock content
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockContent = `${assignmentTopic} is a fascinating subject that encompasses various aspects of modern technology and its applications in our daily lives.

The fundamental concepts of ${assignmentTopic} have evolved significantly over the past decades. Researchers and practitioners have developed numerous methodologies and frameworks to address the challenges in this field.

One of the key aspects to consider is the practical implementation of these concepts. Through careful analysis and systematic approaches, we can better understand how ${assignmentTopic} impacts various sectors including education, healthcare, and business.

Furthermore, the future prospects of ${assignmentTopic} appear promising, with emerging technologies opening new possibilities for innovation and advancement. As we continue to explore this domain, it becomes increasingly important to maintain ethical considerations and ensure sustainable practices.

In conclusion, ${assignmentTopic} represents a critical area of study that will continue to shape our understanding and approach to solving complex problems in the modern era.`;

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I've generated content for your assignment. The text is now appearing in the preview panel. Feel free to ask me to expand on any section, make it more formal, or adjust the content!`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    await simulateStreaming(mockContent);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Generate content",
    "Make it formal",
    "Add examples",
    "Expand more",
  ];

  return (
    <div className="flex flex-col h-full bg-background border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-accent/50 to-background">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">AI Assistant</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Ask AI to improve or regenerate content</p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-3 sm:px-4 py-2 border-b bg-muted/30 overflow-x-auto">
        <div className="flex gap-1.5 sm:gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="h-7 text-xs whitespace-nowrap rounded-full px-3 border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              onClick={() => {
                setInput(prompt);
              }}
              disabled={isLoading}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
        <div className="space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div 
                className={`shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 sm:gap-3">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 h-10 sm:h-11 rounded-full px-4 text-sm"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()} 
            size="icon"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
