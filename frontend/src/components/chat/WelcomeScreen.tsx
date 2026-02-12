import { PromptInput } from './PromptInput';


interface WelcomeScreenProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const WelcomeScreen = ({
  input,
  setInput,
  onSubmit,
}: WelcomeScreenProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <div className="mb-12 w-full max-w-3xl">
        <h2 className="text-5xl font-tobias text-white mb-10">Welcome to Novi.AI</h2>
        
        <PromptInput 
          value={input}
          onChange={setInput}
          onSubmit={onSubmit}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl w-full">
        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="text-left">
            <div className="text-blue-400 text-2xl mb-2">🔧</div>
            <h3 className="text-white font-medium mb-1">Task Automation</h3>
            <p className="text-sm text-gray-400">
              Automate tasks, bug scheduling and reminders.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="text-left">
            <div className="text-amber-400 text-2xl mb-2">🌐</div>
            <h3 className="text-white font-medium mb-1">
              Multi-language Support
            </h3>
            <p className="text-sm text-gray-400">
              Converse fluently in multiple languages.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-teal-500/10 to-transparent">
          <div className="text-left">
            <div className="text-teal-400 text-2xl mb-2">💻</div>
            <h3 className="text-white font-medium mb-1">Code snippets</h3>
            <p className="text-sm text-gray-400">
              Request quick, functional code examples on demand.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent">
          <div className="text-left">
            <div className="text-purple-400 text-2xl mb-2">🖼️</div>
            <h3 className="text-white font-medium mb-1">Image Generation</h3>
            <p className="text-sm text-gray-400">
              Create custom images based on user prompts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
