
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, File } from 'lucide-react';

interface FileUploaderProps {
  onFileContent: (content: string, filename: string) => void;
}

const FileUploader = ({ onFileContent }: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, TXT, or DOCX file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onFileContent(data.content, file.name);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed and will be included in your next message.`
      });

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

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'txt':
        return <File className="w-4 h-4" />;
      case 'docx':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="file-upload">
        Upload File (PDF, TXT, DOCX)
      </Label>
      
      <div className="space-y-2">
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept=".pdf,.txt,.docx"
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
        <p>Supported formats:</p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </div>
          <div className="flex items-center space-x-1">
            <File className="w-3 h-3" />
            <span>TXT</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>DOCX</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
