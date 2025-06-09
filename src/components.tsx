
// src/components.tsx
import PromptEditor from './components/PromptEditor';
import ModelDropdown from './components/ModelDropdown';
import ChatUI from './components/ChatUI';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, File } from 'lucide-react';

export { PromptEditor, ModelDropdown, ChatUI };

// FileUploader Component - Updated for frontend-only file reading
interface FileUploaderProps {
  onFileContent: (content: string, filename: string) => void;
  onFileSelect?: (file: File) => void;
}

export const FileUploader = ({ onFileContent, onFileSelect }: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type for text files only (since we're reading directly in browser)
    if (file.type !== 'text/plain') {
      toast({
        title: "Unsupported file type",
        description: "Please upload a TXT file for frontend-only mode.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      if (onFileSelect) {
        await onFileSelect(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileContent(content, file.name);
          toast({
            title: "File uploaded successfully",
            description: `${file.name} has been processed and will be included in your next message.`
          });
        };
        reader.readAsText(file);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="file-upload">
        Upload File (TXT only in frontend mode)
      </Label>
      
      <div className="space-y-2">
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Processing...' : 'Choose File'}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Supported formats in frontend mode:</p>
        <div className="flex items-center space-x-1">
          <File className="w-3 h-3" />
          <span>TXT</span>
        </div>
      </div>
    </div>
  );
};
