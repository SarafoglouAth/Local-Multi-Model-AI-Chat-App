
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
}

const PromptEditor = ({ prompt, onPromptChange, disabled }: PromptEditorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="system-prompt">
        System Prompt
        {disabled && (
          <span className="text-xs text-muted-foreground ml-2">
            (Locked after first message)
          </span>
        )}
      </Label>
      <Textarea
        id="system-prompt"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Enter system prompt here..."
        disabled={disabled}
        rows={4}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground">
        This will be sent as the system message to guide the AI's behavior.
      </p>
    </div>
  );
};

export default PromptEditor;
