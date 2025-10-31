import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../hooks/useUser';
import { apiClient } from '../hooks/useApi';
import './InlineEditorStyles.css';

interface InlineEditorProps {
    enabled?: boolean;
    onToggle?: (enabled: boolean) => void;
}

interface EditingState {
    element: HTMLElement | null;
    originalContent: string;
    originalStyles: string;
    position: { x: number; y: number };
}

const InlineEditor: React.FC<InlineEditorProps> = ({ enabled: externalEnabled, onToggle }) => {
    const [isEnabled, setIsEnabled] = useState(externalEnabled || false);
    const [editingState, setEditingState] = useState<EditingState | null>(null);
    const [showStylePanel, setShowStylePanel] = useState(false);
    const [selectedStyles, setSelectedStyles] = useState({
        fontSize: '',
        fontWeight: '',
        color: '',
        backgroundColor: '',
        padding: '',
        paddingTop: '',
        paddingRight: '',
        paddingBottom: '',
        paddingLeft: '',
        margin: '',
        marginTop: '',
        marginRight: '',
        marginBottom: '',
        marginLeft: '',
        borderWidth: '',
        borderStyle: '',
        borderColor: '',
        borderRadius: '',
        width: '',
        height: '',
        textAlign: '',
    });
    
    const { isAdmin } = useUser();
    const overlayRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Toggle editor mode
    const toggleEditor = useCallback(() => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        onToggle?.(newState);
        
        if (newState) {
            // Não alterar cursor globalmente, apenas em elementos editáveis
            document.body.setAttribute('data-editing-mode', 'true');
            // Prevenir scroll lock
            document.body.style.overflow = '';
        } else {
            document.body.removeAttribute('data-editing-mode');
            cleanupEditing();
        }
    }, [isEnabled, onToggle]);

    // Cleanup editing state
    const cleanupEditing = useCallback(() => {
        if (editingState?.element) {
            editingState.element.removeAttribute('contenteditable');
            editingState.element.style.outline = '';
        }
        setEditingState(null);
        setShowStylePanel(false);
    }, [editingState]);

    // Handle element click for editing
    const handleElementClick = useCallback((e: MouseEvent) => {
        if (!isEnabled || !isAdmin) return;
        
        const target = e.target as HTMLElement;
        
        // Ignore clicks on editor UI itself
        if (target.closest('.inline-editor-ui') || target.closest('.style-panel')) {
            return;
        }

        // Prevent navigation/actions while editing
        e.preventDefault();
        e.stopPropagation();

        // Skip certain elements
        const skipSelectors = [
            'script', 'style', 'meta', 'link', 'noscript',
            '.inline-editor-toggle',
            '.inline-editor-overlay',
            '.style-panel'
        ];
        
        if (skipSelectors.some(sel => target.matches(sel) || target.closest(sel))) {
            return;
        }

        // Cleanup previous editing
        cleanupEditing();

        // Set new editing target
        const rect = target.getBoundingClientRect();
        target.setAttribute('contenteditable', 'true');
        target.style.outline = '2px dashed #38ff81';
        target.style.outlineOffset = '2px';
        
        // Get computed styles
        const computed = window.getComputedStyle(target);
        setSelectedStyles({
            fontSize: computed.fontSize || '',
            fontWeight: computed.fontWeight || '',
            color: computed.color || '',
            backgroundColor: computed.backgroundColor !== 'rgba(0, 0, 0, 0)' ? computed.backgroundColor : '',
            padding: computed.padding || '',
            paddingTop: computed.paddingTop || '',
            paddingRight: computed.paddingRight || '',
            paddingBottom: computed.paddingBottom || '',
            paddingLeft: computed.paddingLeft || '',
            margin: computed.margin || '',
            marginTop: computed.marginTop || '',
            marginRight: computed.marginRight || '',
            marginBottom: computed.marginBottom || '',
            marginLeft: computed.marginLeft || '',
            borderWidth: computed.borderWidth || '',
            borderStyle: computed.borderStyle || '',
            borderColor: computed.borderColor !== 'rgba(0, 0, 0, 0)' ? computed.borderColor : '',
            borderRadius: computed.borderRadius || '',
            width: computed.width || '',
            height: computed.height || '',
            textAlign: computed.textAlign || '',
        });

        setEditingState({
            element: target,
            originalContent: target.innerHTML,
            originalStyles: target.getAttribute('style') || '',
            position: {
                x: rect.right + 10,
                y: rect.top
            }
        });

        setShowStylePanel(true);
    }, [isEnabled, isAdmin, cleanupEditing]);

    // Apply style changes
    const applyStyle = useCallback((property: string, value: string) => {
        if (!editingState?.element) return;

        if (value === '') {
            editingState.element.style.removeProperty(property);
        } else {
            editingState.element.style.setProperty(property, value);
        }

        setSelectedStyles(prev => ({
            ...prev,
            [property]: value
        }));
    }, [editingState]);

    // Save changes
    const saveChanges = useCallback(async () => {
        if (!editingState?.element) return;

        const elementData = {
            tag: editingState.element.tagName.toLowerCase(),
            id: editingState.element.id || null,
            classes: editingState.element.className || '',
            content: editingState.element.innerHTML,
            styles: editingState.element.getAttribute('style') || '',
            selector: getElementSelector(editingState.element),
            url: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        try {
            // Try to save to backend first
            if (user?.id) {
                await apiClient.post('/inline-editor/save', {
                    ...elementData,
                    userId: user.id,
                    clientId: user.clientId || 1
                });
                alert('✅ Alterações salvas no servidor!');
            } else {
                throw new Error('User not available');
            }
        } catch (error) {
            // Fallback to localStorage
            console.log('Backend not available, saving locally...', error);
            const savedElements = JSON.parse(localStorage.getItem('inline-editor-saves') || '[]');
            savedElements.push(elementData);
            localStorage.setItem('inline-editor-saves', JSON.stringify(savedElements.slice(-50)));
            alert('💾 Alterações salvas localmente!');
        }

        cleanupEditing();
    }, [editingState, cleanupEditing]);

    // Reset changes
    const resetChanges = useCallback(() => {
        if (!editingState?.element) return;

        editingState.element.innerHTML = editingState.originalContent;
        if (editingState.originalStyles) {
            editingState.element.setAttribute('style', editingState.originalStyles);
        } else {
            editingState.element.removeAttribute('style');
        }

        cleanupEditing();
    }, [editingState, cleanupEditing]);

    // Get element selector
    const getElementSelector = (element: HTMLElement): string => {
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c).join('.');
            if (classes) return `.${classes}`;
        }
        return element.tagName.toLowerCase();
    };

    // Setup event listeners
    useEffect(() => {
        if (!isEnabled || !isAdmin) {
            cleanupEditing();
            return;
        }

        document.addEventListener('click', handleElementClick, true);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && editingState) {
                resetChanges();
            }
        });

        return () => {
            document.removeEventListener('click', handleElementClick, true);
        };
    }, [isEnabled, isAdmin, handleElementClick, editingState, resetChanges, cleanupEditing]);

    // Position style panel
    useEffect(() => {
        if (showStylePanel && editingState && panelRef.current) {
            const panel = panelRef.current;
            const { x, y } = editingState.position;
            
            panel.style.left = `${x}px`;
            panel.style.top = `${y}px`;
            
            // Adjust if panel goes off screen
            const rect = panel.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                panel.style.left = `${editingState.position.x - rect.width - 20}px`;
            }
            if (rect.bottom > window.innerHeight) {
                panel.style.top = `${window.innerHeight - rect.height - 20}px`;
            }
        }
    }, [showStylePanel, editingState]);

    if (!isAdmin) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleEditor}
                className={`fixed bottom-6 right-6 z-[9999] inline-editor-toggle rounded-full p-4 shadow-2xl transition-all ${
                    isEnabled
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-[#02281a]'
                }`}
                title={isEnabled ? 'Desativar modo edição' : 'Ativar modo edição'}
            >
                <span className="material-icons-outlined text-2xl">
                    {isEnabled ? 'edit_off' : 'edit'}
                </span>
            </button>

            {/* Overlay when editing - não interfere com clicks */}
            {isEnabled && (
                <div
                    ref={overlayRef}
                    className="inline-editor-overlay fixed inset-0 z-[9998]"
                    style={{
                        background: 'rgba(56, 255, 129, 0.02)',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Style Panel */}
            {showStylePanel && editingState && (
                <div
                    ref={panelRef}
                    className="style-panel fixed z-[10000] bg-[#1a1a1a] border border-primary/30 rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[320px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <h3 className="text-sm font-semibold text-white">Editar Elemento</h3>
                        <button
                            onClick={cleanupEditing}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <span className="material-icons-outlined text-lg">close</span>
                        </button>
                    </div>

                    <div className="space-y-3 text-sm">
                        {/* Font Size */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Tamanho da Fonte</label>
                            <input
                                type="text"
                                value={selectedStyles.fontSize}
                                onChange={(e) => applyStyle('fontSize', e.target.value)}
                                placeholder="ex: 16px, 1.2rem"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Font Weight */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Peso da Fonte</label>
                            <select
                                value={selectedStyles.fontWeight}
                                onChange={(e) => applyStyle('fontWeight', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Padrão</option>
                                <option value="100">100 (Thin)</option>
                                <option value="300">300 (Light)</option>
                                <option value="400">400 (Normal)</option>
                                <option value="500">500 (Medium)</option>
                                <option value="600">600 (Semi Bold)</option>
                                <option value="700">700 (Bold)</option>
                                <option value="900">900 (Black)</option>
                            </select>
                        </div>

                        {/* Text Color */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Cor do Texto</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={rgbToHex(selectedStyles.color) || '#ffffff'}
                                    onChange={(e) => applyStyle('color', e.target.value)}
                                    className="w-12 h-10 rounded border border-white/10 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selectedStyles.color}
                                    onChange={(e) => applyStyle('color', e.target.value)}
                                    placeholder="#ffffff ou rgb()"
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Background Color */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Cor de Fundo</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={rgbToHex(selectedStyles.backgroundColor) || '#000000'}
                                    onChange={(e) => applyStyle('backgroundColor', e.target.value)}
                                    className="w-12 h-10 rounded border border-white/10 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selectedStyles.backgroundColor}
                                    onChange={(e) => applyStyle('backgroundColor', e.target.value)}
                                    placeholder="#000000 ou transparent"
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Text Align */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Alinhamento</label>
                            <div className="flex gap-2">
                                {['left', 'center', 'right', 'justify'].map(align => (
                                    <button
                                        key={align}
                                        onClick={() => applyStyle('textAlign', align)}
                                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                                            selectedStyles.textAlign === align
                                                ? 'bg-primary text-[#02281a] border-primary'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="material-icons-outlined text-sm">
                                            {align === 'left' ? 'format_align_left' :
                                             align === 'center' ? 'format_align_center' :
                                             align === 'right' ? 'format_align_right' :
                                             'format_align_justify'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-white/10 pt-3">
                            <h4 className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">Dimensões e Espaçamento</h4>
                        </div>

                        {/* Padding - Global */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Padding (Geral)</label>
                            <input
                                type="text"
                                value={selectedStyles.padding}
                                onChange={(e) => applyStyle('padding', e.target.value)}
                                placeholder="ex: 16px ou 10px 20px"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Padding Individual */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Padding Individual</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Top</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.paddingTop}
                                        onChange={(e) => applyStyle('paddingTop', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Right</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.paddingRight}
                                        onChange={(e) => applyStyle('paddingRight', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Bottom</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.paddingBottom}
                                        onChange={(e) => applyStyle('paddingBottom', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Left</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.paddingLeft}
                                        onChange={(e) => applyStyle('paddingLeft', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Margin - Global */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Margin (Geral)</label>
                            <input
                                type="text"
                                value={selectedStyles.margin}
                                onChange={(e) => applyStyle('margin', e.target.value)}
                                placeholder="ex: 16px ou 10px 20px"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Margin Individual */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Margin Individual</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Top</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.marginTop}
                                        onChange={(e) => applyStyle('marginTop', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Right</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.marginRight}
                                        onChange={(e) => applyStyle('marginRight', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Bottom</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.marginBottom}
                                        onChange={(e) => applyStyle('marginBottom', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-white/50 mb-1">Left</label>
                                    <input
                                        type="text"
                                        value={selectedStyles.marginLeft}
                                        onChange={(e) => applyStyle('marginLeft', e.target.value)}
                                        placeholder="0px"
                                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Width and Height */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-white/70 mb-1">Largura</label>
                                <input
                                    type="text"
                                    value={selectedStyles.width}
                                    onChange={(e) => applyStyle('width', e.target.value)}
                                    placeholder="ex: 100%, 300px"
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/70 mb-1">Altura</label>
                                <input
                                    type="text"
                                    value={selectedStyles.height}
                                    onChange={(e) => applyStyle('height', e.target.value)}
                                    placeholder="ex: auto, 200px"
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-white/10 pt-3">
                            <h4 className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">Bordas</h4>
                        </div>

                        {/* Border Width */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Espessura da Borda</label>
                            <input
                                type="text"
                                value={selectedStyles.borderWidth}
                                onChange={(e) => applyStyle('borderWidth', e.target.value)}
                                placeholder="ex: 1px, 2px"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Border Style */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Estilo da Borda</label>
                            <select
                                value={selectedStyles.borderStyle}
                                onChange={(e) => applyStyle('borderStyle', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Nenhum</option>
                                <option value="solid">Sólida</option>
                                <option value="dashed">Tracejada</option>
                                <option value="dotted">Pontilhada</option>
                                <option value="double">Dupla</option>
                                <option value="groove">Groove</option>
                                <option value="ridge">Ridge</option>
                                <option value="inset">Inset</option>
                                <option value="outset">Outset</option>
                            </select>
                        </div>

                        {/* Border Color */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Cor da Borda</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={rgbToHex(selectedStyles.borderColor) || '#ffffff'}
                                    onChange={(e) => applyStyle('borderColor', e.target.value)}
                                    className="w-12 h-10 rounded border border-white/10 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selectedStyles.borderColor}
                                    onChange={(e) => applyStyle('borderColor', e.target.value)}
                                    placeholder="#ffffff"
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Border Radius */}
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Arredondamento</label>
                            <input
                                type="text"
                                value={selectedStyles.borderRadius}
                                onChange={(e) => applyStyle('borderRadius', e.target.value)}
                                placeholder="ex: 8px, 50%"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                            <button
                                onClick={resetChanges}
                                className="flex-1 px-3 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors text-xs font-medium"
                            >
                                Desfazer
                            </button>
                            <button
                                onClick={saveChanges}
                                className="flex-1 px-3 py-2 rounded-lg bg-primary text-[#02281a] hover:bg-primary/80 transition-colors text-xs font-semibold"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Helper: Convert RGB to Hex
function rgbToHex(rgb: string): string {
    if (!rgb || rgb.startsWith('#')) return rgb;
    
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (match) {
        const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
        const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
        const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    
    return rgb;
}

export default InlineEditor;

