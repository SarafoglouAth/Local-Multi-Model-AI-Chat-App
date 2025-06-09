
import { useState } from 'react';
import ChatUI from '../components/ChatUI';
import ModelDropdown from '../components/ModelDropdown';
import PromptEditor from '../components/PromptEditor';
import FileUploader from '../components/FileUploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Model {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'meta';
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model>({ 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    provider: 'openai' 
  });
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
          systemPrompt: messages.length === 0 ? systemPrompt : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setMessages([]);
      toast({
        title: "Chat Reset",
        description: "Conversation history has been cleared."
      });
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  const handleFileUpload = async (content: string, filename: string) => {
    const fileMessage = `📎 Attached file: ${filename}\n\n${content}`;
    await sendMessage(fileMessage);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen max-h-screen">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">Model Selection</h2>
              <ModelDropdown 
                selectedModel={selectedModel} 
                onModelChange={setSelectedModel} 
              />
            </div>

            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">System Prompt</h2>
              <PromptEditor 
                prompt={systemPrompt} 
                onPromptChange={setSystemPrompt}
                disabled={messages.length > 0}
              />
            </div>

            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">File Upload</h2>
              <FileUploader onFileContent={handleFileUpload} />
            </div>

            <Button 
              onClick={resetChat} 
              variant="outline" 
              className="w-full"
            >
              Reset Chat
            </Button>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <ChatUI 
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              selectedModel={selectedModel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
