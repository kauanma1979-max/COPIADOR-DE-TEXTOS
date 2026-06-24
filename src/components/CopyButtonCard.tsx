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
    bg: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850',
    border: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
    text: 'text-slate-900 dark:text-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accent: 'slate',
    ring: 'focus:ring-slate-500',
    glow: 'hover:shadow-md hover:shadow-slate-100/30 dark:hover:shadow-slate-950/10',
  },
  blue: {
    bg: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850',
    border: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
    text: 'text-slate-900 dark:text-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accent: 'slate',
    ring: 'focus:ring-slate-500',
    glow: 'hover:shadow-md hover:shadow-slate-100/30 dark:hover:shadow-slate-950/10',
  },
  purple: {
    bg: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850',
    border: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
    text: 'text-slate-900 dark:text-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accent: 'slate',
    ring: 'focus:ring-slate-500',
    glow: 'hover:shadow-md hover:shadow-slate-100/30 dark:hover:shadow-slate-950/10',
  },
  amber: {
    bg: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850',
    border: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
    text: 'text-slate-900 dark:text-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accent: 'slate',
    ring: 'focus:ring-slate-500',
    glow: 'hover:shadow-md hover:shadow-slate-100/30 dark:hover:shadow-slate-950/10',
  },
  rose: {
    bg: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850',
    border: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
    text: 'text-slate-900 dark:text-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accent: 'slate',
    ring: 'focus:ring-slate-500',
    glow: 'hover:shadow-md hover:shadow-slate-100/30 dark:hover:shadow-slate-950/10',
  },
  slate: {
    bg: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850',
    border: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
    text: 'text-slate-900 dark:text-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    accent: 'slate',
    ring: 'focus:ring-slate-500',
    glow: 'hover:shadow-md hover:shadow-slate-100/30 dark:hover:shadow-slate-950/10',
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
    if (!button.name && !button.text && onCancelNew) {
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
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow duration-200"
            id={`edit-card-${button.id}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-black dark:text-white font-sans flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                {!button.name && !button.text ? 'Criar Novo Botão' : 'Editar Botão'}
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
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
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
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100 font-sans"
                  maxLength={50}
                  id={`input-name-${button.id}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Texto para Copiar <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Digite ou cole aqui o conteúdo que será copiado ao clicar..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[90px] max-h-[200px] resize-y dark:text-slate-100 font-sans text-xs"
                  id={`textarea-text-${button.id}`}
                />
              </div>

              {/* No color picker as per user request (fundo branco, fonte preta) */}

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
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
            className={`group relative w-full border ${currentScheme.border} ${currentScheme.bg} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] select-none ${currentScheme.text} ${currentScheme.glow}`}
            id={`copy-card-${button.id}`}
          >
            <div>
              {/* Header inside the clickable card */}
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans font-bold text-slate-900 dark:text-slate-50 text-base leading-tight tracking-tight truncate">
                    {button.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="action-button p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-200/40 dark:border-slate-800"
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
                    className="action-button p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-200/40 dark:border-slate-800"
                    title="Excluir Botão"
                    id={`delete-icon-${button.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text content preview */}
              <div className="relative mt-2 bg-white/50 dark:bg-slate-950/50 border border-slate-100/60 dark:border-slate-900 rounded-xl px-3 py-2.5 min-h-[52px] flex items-center justify-between transition-all">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans font-normal break-all line-clamp-2 leading-relaxed select-text" onClick={(e) => e.stopPropagation()}>
                  {button.text}
                </p>
                <div className="flex-shrink-0 ml-2 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  <FileText className="w-4 h-4 opacity-45 group-hover:opacity-85 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Click to copy hint footer */}
            <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-800/80 flex items-center justify-end text-xs font-semibold">
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

