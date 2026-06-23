import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  RotateCcw, 
  Clipboard, 
  HelpCircle, 
  Flame, 
  Sparkles, 
  X, 
  Check, 
  Filter,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { CopyButtonType } from './types';
import CopyButtonCard from './components/CopyButtonCard';

const INITIAL_TEMPLATES: CopyButtonType[] = [
  {
    id: 'tpl-pix',
    name: '🔑 Chave Pix de Recebimento',
    text: 'pix@empresa.com.br',
    color: 'emerald',
    createdAt: Date.now() - 4000,
  },
  {
    id: 'tpl-email',
    name: '✉️ E-mail do Suporte',
    text: 'suporte@empresa.com.br',
    color: 'blue',
    createdAt: Date.now() - 3000,
  },
  {
    id: 'tpl-boasvindas',
    name: '👋 Mensagem de Boas-vindas',
    text: 'Olá! Seja muito bem-vindo ao nosso suporte. Como posso te ajudar hoje? 😊',
    color: 'purple',
    createdAt: Date.now() - 2000,
  },
  {
    id: 'tpl-agradecimento',
    name: '🛍️ Agradecimento de Pedido',
    text: 'Muito obrigado pela sua preferência! Seu pedido foi confirmado e já está em fase de preparação. Logo mais enviaremos o código de rastreamento. Tenha um ótimo dia!',
    color: 'amber',
    createdAt: Date.now() - 1000,
  },
];

export default function App() {
  const [buttons, setButtons] = useState<CopyButtonType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');
  const [sessionCopyCount, setSessionCopyCount] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Local storage loading
  useEffect(() => {
    const saved = localStorage.getItem('quick_copy_buttons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((btn: any) => ({
            id: btn.id || `btn-${Math.random().toString(36).substring(2, 9)}`,
            name: typeof btn.name === 'string' ? btn.name : '',
            text: typeof btn.text === 'string' ? btn.text : '',
            color: ['emerald', 'blue', 'purple', 'amber', 'rose', 'slate'].includes(btn.color) ? btn.color : 'slate',
            createdAt: Number(btn.createdAt) || Date.now(),
          }));
          setButtons(sanitized);
        } else {
          setButtons(INITIAL_TEMPLATES);
        }
      } catch (e) {
        setButtons(INITIAL_TEMPLATES);
      }
    } else {
      setButtons(INITIAL_TEMPLATES);
    }

    // Load copy stats
    const stats = sessionStorage.getItem('session_copy_count');
    if (stats) {
      setSessionCopyCount(parseInt(stats, 10));
    }
  }, []);

  // Sync to local storage
  const saveButtons = (newButtons: CopyButtonType[]) => {
    setButtons(newButtons);
    localStorage.setItem('quick_copy_buttons', JSON.stringify(newButtons));
  };

  // Add click session counter listener
  useEffect(() => {
    const handleCopyIncrement = () => {
      setSessionCopyCount((prev) => {
        const next = prev + 1;
        sessionStorage.setItem('session_copy_count', next.toString());
        return next;
      });
    };

    // Override or listen to copy actions safely
    window.addEventListener('copy', handleCopyIncrement);
    return () => {
      window.removeEventListener('copy', handleCopyIncrement);
    };
  }, []);

  const handleCreateNew = () => {
    const newId = `btn-${Math.random().toString(36).substr(2, 9)}`;
    const newButton: CopyButtonType = {
      id: newId,
      name: '',
      text: '',
      color: 'slate',
      createdAt: Date.now(),
    };

    // Add to state, placing it first in the array so it goes immediately to the top of the grid
    setButtons((prev) => [newButton, ...prev]);
  };

  const handleUpdate = (updated: CopyButtonType) => {
    const nextButtons = buttons.map((b) => (b.id === updated.id ? updated : b));
    saveButtons(nextButtons);
    showToast('Botão salvo com sucesso!');
  };

  const handleDelete = (id: string) => {
    const nextButtons = buttons.filter((b) => b.id !== id);
    saveButtons(nextButtons);
    showToast('Botão excluído.');
  };

  const handleCancelNew = (id: string) => {
    // If the button has no text and name, we can safely remove it from the list
    const found = buttons.find((b) => b.id === id);
    if (found && !found.name && !found.text) {
      setButtons((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleResetToTemplates = () => {
    if (window.confirm('Deseja restaurar os botões de exemplo padrão? Isso adicionará os modelos padrão à sua lista atual.')) {
      const merged = [...INITIAL_TEMPLATES, ...buttons.filter((b) => !b.id.startsWith('tpl-'))];
      // Keep only unique ones or just merge
      const uniqueMap = new Map();
      merged.forEach((item) => uniqueMap.set(item.id, item));
      saveButtons(Array.from(uniqueMap.values()));
      showToast('Modelos padrão restaurados!');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(buttons, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `botoes_copia_rapida_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON exportado com sucesso!');
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error('O conteúdo deve ser uma lista válida de botões.');
      }
      
      // Validate structure
      const validated: CopyButtonType[] = parsed.map((item: any, idx: number) => {
        if (!item.id || !item.name || !item.text) {
          throw new Error(`Item na posição ${idx + 1} está com estrutura inválida (precisa de id, name e text).`);
        }
        return {
          id: item.id,
          name: item.name,
          text: item.text,
          color: ['emerald', 'blue', 'purple', 'amber', 'rose', 'slate'].includes(item.color) ? item.color : 'slate',
          createdAt: Number(item.createdAt) || Date.now(),
        };
      });

      // Merge or overwrite
      if (window.confirm(`Deseja mesclar estes ${validated.length} botões com seus botões atuais?`)) {
        const uniqueMap = new Map();
        buttons.forEach((b) => uniqueMap.set(b.id, b));
        validated.forEach((b) => uniqueMap.set(b.id, b));
        saveButtons(Array.from(uniqueMap.values()));
      } else {
        saveButtons(validated);
      }

      setShowImportModal(false);
      setImportText('');
      setImportError('');
      showToast('Botões importados com sucesso!');
    } catch (err: any) {
      setImportError(err.message || 'Erro ao processar o arquivo JSON. Verifique a formatação.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Filter & Search computation
  const filteredButtons = useMemo(() => {
    return buttons.filter((btn) => {
      const btnName = btn.name || '';
      const btnText = btn.text || '';
      const matchesSearch = 
        btnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        btnText.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesColor = selectedColorFilter === 'all' || btn.color === selectedColorFilter;

      return matchesSearch && matchesColor;
    });
  }, [buttons, searchTerm, selectedColorFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 flex flex-col font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with minimal & crafted look */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Clipboard className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight font-display text-slate-900">
                Copiador de Textos
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Seus snippets de texto a um clique de distância
              </p>
            </div>
          </div>

          {/* Quick Session Stats and actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {sessionCopyCount > 0 && (
              <div className="bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-orange-700 animate-pulse">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{sessionCopyCount} {sessionCopyCount === 1 ? 'cópia realizada' : 'cópias realizadas'}</span>
              </div>
            )}
            
            <button
              onClick={handleResetToTemplates}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold border border-slate-200"
              title="Restaurar botões padrão"
              id="restore-templates-btn"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Modelos</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-toolbar with filter, search, and Add Button */}
      <section className="bg-white border-b border-slate-150 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          
          {/* Search bar & Color filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-3xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar por título ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                id="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Color Pill Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1 flex-shrink-0">
                <Filter className="w-3 h-3" />
                Filtrar:
              </span>
              <button
                onClick={() => setSelectedColorFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold border cursor-pointer transition-colors ${
                  selectedColorFilter === 'all'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                id="filter-all"
              >
                Todos
              </button>
              {['emerald', 'blue', 'purple', 'amber', 'rose', 'slate'].map((c) => {
                const colorLabel = {
                  emerald: 'Verde',
                  blue: 'Azul',
                  purple: 'Roxo',
                  amber: 'Laranja',
                  rose: 'Rosa',
                  slate: 'Cinza'
                }[c];
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedColorFilter(c)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold border cursor-pointer transition-colors flex items-center gap-1.5 ${
                      selectedColorFilter === c
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    id={`filter-${c}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      c === 'emerald' ? 'bg-emerald-500' :
                      c === 'blue' ? 'bg-blue-500' :
                      c === 'purple' ? 'bg-purple-500' :
                      c === 'amber' ? 'bg-amber-500' :
                      c === 'rose' ? 'bg-rose-500' :
                      'bg-slate-500'
                    }`} />
                    <span className="hidden sm:inline">{colorLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons (Add, backup, restore) */}
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 font-semibold border border-slate-200"
                title="Importar de arquivo JSON"
                id="import-json-btn"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Importar</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 font-semibold border border-slate-200"
                title="Exportar para arquivo JSON"
                id="export-json-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>

            {/* Glowing Add Button */}
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-200/80 hover:shadow-lg hover:shadow-blue-300/80"
              id="add-button"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Adicionar Botão
            </button>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Dynamic Card Grid */}
        <AnimatePresence mode="popLayout">
          {filteredButtons.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredButtons.map((btn) => (
                <CopyButtonCard
                  key={btn.id}
                  button={btn}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isInitiallyEditing={!btn.name && !btn.text}
                  onCancelNew={() => handleCancelNew(btn.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto text-center py-16 px-4"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Clipboard className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">
                Nenhum botão encontrado
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                {searchTerm || selectedColorFilter !== 'all' 
                  ? 'Tente alterar os seus filtros de pesquisa ou cores acima.' 
                  : 'Comece adicionando seu primeiro botão clicável de cópia rápida agora mesmo!'}
              </p>
              
              <div className="mt-5 flex gap-3 justify-center">
                {searchTerm || selectedColorFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedColorFilter('all');
                    }}
                    className="px-3.5 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    id="clear-filters-btn"
                  >
                    Limpar Filtros
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCreateNew}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer flex items-center gap-1.5"
                      id="empty-add-btn"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      Adicionar Botão
                    </button>
                    <button
                      onClick={handleResetToTemplates}
                      className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      id="empty-load-templates-btn"
                    >
                      Carregar Exemplos
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer information */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>App 100% offline — Seus dados ficam salvos localmente</span>
          </div>
          <div className="text-center sm:text-right font-medium">
            Desenvolvido como um Gerenciador de Snippets Inteligente
          </div>
        </div>
      </footer>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl relative z-10"
              id="import-modal-body"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  Importar Botões (JSON)
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  id="close-import-modal"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cole o código JSON exportado de outro dispositivo ou backup no campo abaixo para restaurar ou adicionar os botões à sua biblioteca.
                </p>

                <div>
                  <textarea
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      if (importError) setImportError('');
                    }}
                    placeholder='[\n  {\n    "id": "1",\n    "name": "Meu Link",\n    "text": "https://...",\n    "color": "blue"\n  }\n]'
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[160px] font-mono leading-relaxed"
                    id="import-textarea"
                  />
                </div>

                {importError && (
                  <div className="text-xs text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                    ⚠️ {importError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleImportJSON}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    id="confirm-import-btn"
                  >
                    Confirmar Importação
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText('');
                      setImportError('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    id="cancel-import-btn"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
