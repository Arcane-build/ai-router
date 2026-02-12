import { PromptInput } from './PromptInput';
import { ModelCarousel } from './ModelCarousel';
import { TRENDING_MODELS } from '@/data/models';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ value, onChange, onSubmit }: ChatInputProps) => {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-[800px] mx-auto px-2 sm:px-0">
        <ModelCarousel models={TRENDING_MODELS} />
        <PromptInput 
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
