
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Model } from '../pages/Index';

interface ModelDropdownProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
}

const models: Model[] = [
  // OpenAI Models
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
  
  // Anthropic Models
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },
  
  // Meta Models
  { id: 'llama3-70b', name: 'LLaMA 3 70B', provider: 'meta' },
  { id: 'llama3-8b', name: 'LLaMA 3 8B', provider: 'meta' },
];

const ModelDropdown = ({ selectedModel, onModelChange }: ModelDropdownProps) => {
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🔮';
      case 'meta': return '🦙';
      default: return '🤖';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'text-green-600';
      case 'anthropic': return 'text-orange-600';
      case 'meta': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Select
      value={selectedModel.id}
      onValueChange={(value) => {
        const model = models.find(m => m.id === value);
        if (model) {
          onModelChange(model);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <span>{getProviderIcon(selectedModel.provider)}</span>
            <span>{selectedModel.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center space-x-2">
              <span>{getProviderIcon(model.provider)}</span>
              <span>{model.name}</span>
              <span className={`text-xs ${getProviderColor(model.provider)}`}>
                {model.provider}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModelDropdown;
