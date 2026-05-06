import { Check, Globe } from 'lucide-react';
import { indianStates } from '@/lib/crops';

interface StateMultiSelectProps {
  value: string[];
  onChange: (states: string[]) => void;
}

export const StateMultiSelect = ({ value, onChange }: StateMultiSelectProps) => {
  const isGlobal = value.length === 0;

  const toggle = (state: string) => {
    if (value.includes(state)) {
      onChange(value.filter((s) => s !== state));
    } else {
      onChange([...value, state]);
    }
  };

  const setGlobal = () => onChange([]);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Available States
        <span className="text-xs text-muted-foreground ml-2">
          ({isGlobal ? 'Global – visible in all states' : `${value.length} state(s)`})
        </span>
      </label>
      <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-2 bg-muted rounded-xl border border-border">
        <button
          type="button"
          onClick={setGlobal}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isGlobal ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
          }`}
        >
          <Globe className="w-3 h-3" /> Show in All States (Global)
        </button>
        {indianStates.map((state) => {
          const selected = value.includes(state);
          return (
            <button
              key={state}
              type="button"
              onClick={() => toggle(state)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selected ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              {selected && <Check className="w-3 h-3" />} {state}
            </button>
          );
        })}
      </div>
    </div>
  );
};
