import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Edit2, Trash2, Save, X, Layers, FileText, CheckCircle } from 'lucide-react';
import { CopyButtonType } from '../types';

interface CopyButtonCardProps {
  button: CopyButtonType;
  onUpdate: (updated: CopyButtonType) => void;
  onDelete: (id: string) => void;
  isInitiallyEditing?: boolean;
  onCancelNew?: () => void;
}

const COLOR_SCHEMES = {
  emerald: {
    bg: 'bg-emerald-50/70 hover:bg-emerald-50/90 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30',
    border: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-800/50 dark:hover:border-emerald-700/80',
    text: 'text-emerald-800 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    accent: 'emerald',
    ring: 'focus:ring-emerald-500',
    glow: 'hover:shadow-emerald-100/50 dark:hover:shadow-emerald-950/20',
  },
  blue: {
    bg: 'bg-blue-50/70 hover:bg-blue-50/90 dark:bg-blue-950/20 dark:hover:bg-blue-950/30',
    border: 'border-blue-200 hover:border-blue-300 dark:border-blue-800/50 dark:hover:border-blue-700/80',
    text: 'text-blue-800 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    accent: 'blue',
    ring: 'focus:ring-blue-500',
    glow: 'hover:shadow-blue-100/50 dark:hover:shadow-blue-950/20',
  },
  purple: {
    bg: 'bg-purple-50/70 hover:bg-purple-50/90 dark:bg-purple-950/20 dark:hover:bg-purple-950/30',
    border: 'border-purple-200 hover:border-purple-300 dark:border-purple-800/50 dark:hover:border-purple-700/80',
    text: 'text-purple-800 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
    accent: 'purple',
    ring: 'focus:ring-purple-500',
    glow: 'hover:shadow-purple-100/50 dark:hover:shadow-purple-950/20',
  },
  amber: {
    bg: 'bg-amber-50/70 hover:bg-amber-50/90 dark:bg-amber-950/20 dark:hover:bg-amber-950/30',
    border: 'border-amber-200 hover:border-amber-300 dark:border-amber-800/50 dark:hover:border-amber-700/80',
    text: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    accent: 'amber',
    ring: 'focus:ring-amber-500',
    glow: 'hover:shadow-amber-100/50 dark:hover:shadow-amber-950/20',
  },
  rose: {
    bg: 'bg-rose-50/70 hover:bg-rose-50/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/30',
    border: 'border-rose-200 hover:border-rose-300 dark:border-rose-800/50 dark:hover:border-rose-700/80',
    text: 'text-rose-800 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
    accent: 'rose',
    ring: 'focus:ring-rose-500',
    glow: 'hover:shadow-rose-100/50 dark:hover:shadow-rose-950/20',
  },
  slate: {
    bg: 'bg-slate-50/70 hover:bg-slate-50/90 dark:bg-slate-900/30 dark:hover:bg-slate-900/40',
    border: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
    text: 'text-slate-800 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accent: 'slate',
    ring: 'focus:ring-slate-500',
    glow: 'hover:shadow-slate-100/50 dark:hover:shadow-slate-950/20',
  },
};

const CopyButtonCard: React.FC<CopyButtonCardProps> = ({
  button,
  onUpdate,
  onDelete,
  isInitiallyEditing = false,
  onCancelNew,
}) => {
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(button.name);
  const [text, setText] = useState(button.text);
  const [color, setColor] = useState(button.color);
  const [error, setError] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    // Prevent copying if we are clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('.action-button')) {
      return;
    }

    try {
      await navigator.clipboard.writeText(button.text);
      setCopied(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Por favor, insira um nome ou identificador para o botão.');
      return;
    }
    if (!text.trim()) {
      setError('Por favor, insira o texto que será copiado.');
      return;
    }

    setError('');
    onUpdate({
      ...button,
      name: name.trim(),
      text: text.trim(),
      color,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (onCancelNew) {
      onCancelNew();
    } else {
      setName(button.name);
      setText(button.text);
      setColor(button.color);
      setError('');
      setIsEditing(false);
    }
  };

  const currentScheme = COLOR_SCHEMES[button.color] || COLOR_SCHEMES.slate;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            id={`edit-card-${button.id}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-display flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                {onCancelNew ? 'Criar Novo Botão' : 'Editar Botão'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Cancelar"
                id={`cancel-btn-${button.id}`}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Nome do Botão <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ex: Minha Chave Pix, Link do Zoom, Saudação"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                  maxLength={50}
                  id={`input-name-${button.id}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Texto para Copiar <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Digite ou cole aqui o conteúdo que será copiado ao clicar..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[90px] max-h-[200px] resize-y dark:text-slate-100 font-mono text-xs"
                  id={`textarea-text-${button.id}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Cor de Destaque
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(COLOR_SCHEMES) as Array<keyof typeof COLOR_SCHEMES>).map((col) => {
                    const active = col === color;
                    const scheme = COLOR_SCHEMES[col];
                    const activeBorder = {
                      emerald: 'ring-emerald-500 bg-emerald-500',
                      blue: 'ring-blue-500 bg-blue-500',
                      purple: 'ring-purple-500 bg-purple-500',
                      amber: 'ring-amber-500 bg-amber-500',
                      rose: 'ring-rose-500 bg-rose-500',
                      slate: 'ring-slate-500 bg-slate-500',
                    }[col];

                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColor(col)}
                        className={`w-7 h-7 rounded-full cursor-pointer relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                          col === 'emerald' ? 'bg-emerald-100 border border-emerald-300 dark:bg-emerald-950' :
                          col === 'blue' ? 'bg-blue-100 border border-blue-300 dark:bg-blue-950' :
                          col === 'purple' ? 'bg-purple-100 border border-purple-300 dark:bg-purple-950' :
                          col === 'amber' ? 'bg-amber-100 border border-amber-300 dark:bg-amber-950' :
                          col === 'rose' ? 'bg-rose-100 border border-rose-300 dark:bg-rose-950' :
                          'bg-slate-100 border border-slate-300 dark:bg-slate-800'
                        }`}
                        title={col}
                        id={`color-btn-${button.id}-${col}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${
                          col === 'emerald' ? 'bg-emerald-500' :
                          col === 'blue' ? 'bg-blue-500' :
                          col === 'purple' ? 'bg-purple-500' :
                          col === 'amber' ? 'bg-amber-500' :
                          col === 'rose' ? 'bg-rose-500' :
                          'bg-slate-600 dark:bg-slate-400'
                        }`} />
                        {active && (
                          <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-2.5 rounded-xl flex items-start gap-1.5">
                  <span className="font-semibold">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-100 dark:shadow-none"
                  id={`save-btn-${button.id}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Botão
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  id={`cancel-secondary-btn-${button.id}`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="button-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={handleCopy}
            className={`group relative w-full border ${currentScheme.border} ${currentScheme.bg} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] select-none`}
            id={`copy-card-${button.id}`}
          >
            {/* Ambient inner background decorative elements for high fidelity */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-white/10 to-transparent pointer-events-none rounded-bl-full" />
            
            <div>
              {/* Header inside the clickable card */}
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base leading-tight tracking-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                    {button.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="action-button p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                    title="Editar Texto"
                    id={`edit-icon-${button.id}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Excluir o botão "${button.name}"?`)) {
                        onDelete(button.id);
                      }
                    }}
                    className="action-button p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/60 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                    title="Excluir Botão"
                    id={`delete-icon-${button.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text content preview */}
              <div className="relative mt-2 bg-white/40 dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2.5 min-h-[52px] flex items-center justify-between group-hover:bg-white/70 dark:group-hover:bg-slate-900/60 transition-all">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono break-all line-clamp-2 leading-relaxed select-text" onClick={(e) => e.stopPropagation()}>
                  {button.text}
                </p>
                <div className="flex-shrink-0 ml-2 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  <FileText className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Click to copy hint footer */}
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold">
              <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider ${currentScheme.badge}`}>
                {button.color === 'slate' ? 'padrão' : button.color}
              </span>

              <div className={`flex items-center gap-1.5 transition-colors duration-200 ${copied ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="font-sans">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span className="font-sans group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      Clique para Copiar
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CopyButtonCard;

