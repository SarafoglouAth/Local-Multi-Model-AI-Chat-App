
import { useState } from 'react';
import { ChatUI, ModelDropdown, PromptEditor, FileUploader } from '../components';
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
    id: 'claude-3-5-sonnet-20241022', 
    name: 'Claude 3 Sonnet', 
    provider: 'anthropic' 
  });
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const callOpenAI = async (messages: Message[], model: string, apiKey: string) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };
  function calculateAnthropicCostInEuros(
  usage:any,
  model = "claude-3-5-sonnet-20241022"
) {
  // Pricing in USD per million tokens (as of January 2025)
  const pricing = {
    "claude-3-5-sonnet-20241022": {
      input: 3.0,
      output: 15.0,
    },
    "claude-3-5-haiku-20241022": {
      input: 1.0,
      output: 5.0,
    },
    "claude-3-opus-20240229": {
      input: 15.0,
      output: 75.0,
    },
  };

  // Current USD to EUR exchange rate (approximate)
  const USD_TO_EUR = 0.95; // Update this with current exchange rate

  if (!pricing[model]) {
    throw new Error(
      `Unknown model: ${model}. Available models: ${Object.keys(pricing).join(
        ", "
      )}`
    );
  }

  const modelPricing = pricing[model];

  // Calculate costs in USD
  const inputCost = (usage.input_tokens / 1000000) * modelPricing.input;
  const outputCost = (usage.output_tokens / 1000000) * modelPricing.output;

  const totalUSD = inputCost + outputCost;
  const totalEUR = totalUSD * USD_TO_EUR;
  console.log(`Total cost: €${totalEUR.toFixed(6)}`);
    console.log("Full breakdown:", {
    breakdown: {
      input_tokens: {
        count: usage.input_tokens,
        cost_usd: inputCost,
        cost_eur: inputCost * USD_TO_EUR,
      },
      output_tokens: {
        count: usage.output_tokens,
        cost_usd: outputCost,
        cost_eur: outputCost * USD_TO_EUR,
      },
    },
    total_usd: totalUSD,
    total_eur: totalEUR,
    exchange_rate: USD_TO_EUR,
    model: model,
  });
}
  const callAnthropic = async (messages: Message[], model: string, apiKey: string) => {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    alert(`Using Anthropic model: ${model}`);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        system: systemMessage?.content || systemPrompt,
        messages: userMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      })
    });
    // const response = {
    //   ok: true,
    //   json: async () => ({
    //     content: [{ text: "This is a mock response from Anthropic." }],
    //     usage: {
    //       input_tokens: 1000,
    //       output_tokens: 500
    //     }
    //   }),
    //   status: 200
    // };

   

     
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }
    
    const data = await response.json();
    calculateAnthropicCostInEuros(data.usage, model);
    return data.content[0].text;
  };

  const sendMessage = async (content: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key first.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Add system prompt if this is the first message
      const messagesToSend = messages.length === 0 ? 
        [{ id: 'system', role: 'system' as const, content: systemPrompt, timestamp: new Date() }, ...newMessages] :
        newMessages;

      let responseContent: string;

      if (selectedModel.provider === 'openai') {
        responseContent = await callOpenAI(messagesToSend, selectedModel.id, apiKey);
      } else if (selectedModel.provider === 'anthropic') {
        responseContent = await callAnthropic(messagesToSend, selectedModel.id, apiKey);
      } else {
        throw new Error('Meta models not supported in frontend-only mode');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    toast({
      title: "Chat Reset",
      description: "Conversation history has been cleared."
    });
  };

  const handleFileUpload = async (content: string, filename: string) => {
    const fileMessage = `📎 Attached file: ${filename}\n\n${content}`;
    await sendMessage(fileMessage);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileContent(file);
      handleFileUpload(content, file.name);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed and will be included in your next message.`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen max-h-screen">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">API Key</h2>
              <input
                type="password"
                placeholder={`Enter ${selectedModel.provider} API key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>

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
              <FileUploader onFileContent={handleFileUpload} onFileSelect={handleFileSelect} />
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
