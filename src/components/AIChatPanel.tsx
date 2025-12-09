import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">AI Assistant</h3>
        <p className="text-sm text-muted-foreground">Ask AI to improve or regenerate content</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
