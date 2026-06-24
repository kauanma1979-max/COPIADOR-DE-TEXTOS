import React, { useState, useEffect, useMemo } from 'react';
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
  const [sessionCopyCount, setSessionCopyCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Local storage loading
  useEffect(() => {
    const saved = localStorage.getItem('quick_copy_buttons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
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

  const handleFileImport = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Não foi possível ler o arquivo.');
        }

        const parsed = JSON.parse(text);
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

        showToast('Botões importados com sucesso!');
      } catch (err: any) {
        const errorMsg = err.message || 'Erro ao processar o arquivo JSON. Verifique a formatação.';
        showToast(errorMsg);
        alert(errorMsg);
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileImport(e.target.files[0]);
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
      return (
        btnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        btnText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [buttons, searchTerm]);

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
        </div>
      </header>

      {/* Sub-toolbar with filter, search, and Add Button */}
      <section className="bg-white border-b border-slate-150 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          
          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative">
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
          </div>

          {/* Action buttons (Add, backup, restore) */}
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => document.getElementById('direct-json-file-input')?.click()}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 font-semibold border border-slate-200"
                title="Importar de arquivo JSON"
                id="import-json-btn"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Importar</span>
              </button>
              <input
                type="file"
                id="direct-json-file-input"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />
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
              key="buttons-grid"
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
              key="empty-state"
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
                {searchTerm 
                  ? 'Tente alterar os seus filtros de pesquisa acima.' 
                  : 'Comece adicionando seu primeiro botão clicável de cópia rápida agora mesmo!'}
              </p>
              
              <div className="mt-5 flex gap-3 justify-center">
                {searchTerm ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                    }}
                    className="px-3.5 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    id="clear-filters-btn"
                  >
                    Limpar Filtros
                  </button>
                ) : (
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer flex items-center gap-1.5"
                    id="empty-add-btn"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Adicionar Botão
                  </button>
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

    </div>
  );
}
