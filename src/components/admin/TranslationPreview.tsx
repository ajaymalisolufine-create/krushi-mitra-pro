import { Sparkles, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface TranslationPreviewProps {
  translations: Record<string, { title: string; message: string; benefits?: string[] }>;
  onUpdate?: (translations: Record<string, { title: string; message: string; benefits?: string[] }>) => void;
}

const LANG_LABELS: Record<string, string> = {
  mr: '🇮🇳 Marathi',
  hi: '🇮🇳 Hindi',
  en: '🇬🇧 English',
};

export const TranslationPreview = ({ translations, onUpdate }: TranslationPreviewProps) => {
  const [editingLang, setEditingLang] = useState<string | null>(null);

  if (!translations || Object.keys(translations).length === 0) return null;

  const handleEdit = (lang: string, field: 'title' | 'message', value: string) => {
    if (!onUpdate) return;
    const updated = {
      ...translations,
      [lang]: { ...translations[lang], [field]: value },
    };
    onUpdate(updated);
  };

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
      <p className="text-xs font-semibold text-primary flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> AI Translations Preview
      </p>
      {(['mr', 'hi', 'en'] as const).map(lang => {
        const t = translations[lang];
        if (!t) return null;
        const isEditing = editingLang === lang;
        return (
          <div key={lang} className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{LANG_LABELS[lang] || lang}</p>
              {onUpdate && (
                <button
                  type="button"
                  onClick={() => setEditingLang(isEditing ? null : lang)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  {isEditing ? 'Done' : 'Edit'}
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={t.title}
                  onChange={e => handleEdit(lang, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <textarea
                  value={t.message}
                  onChange={e => handleEdit(lang, 'message', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={2}
                />
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.message}</p>
                {t.benefits && t.benefits.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Benefits:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                      {t.benefits.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
