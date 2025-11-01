import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor as GrapesEditor, ProjectData } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { apiClient } from '../../hooks/useApi';
import { useUser } from '../../hooks/useUser';

// Tipos para o Page Builder
interface PageSummary {
    id: number;
    name: string;
    pageKey: string;
    description?: string | null;
    publishedVersionId?: number | null;
    createdAt?: string;
    updatedAt?: string;
}

interface PageVersionSummary {
    id: number;
    version: number;
    status: 'draft' | 'published';
    note?: string | null;
    createdAt: string;
    publishedAt?: string | null;
}

interface PageResponsePayload {
    page: PageSummary | null;
    latestVersion: {
        id: number;
        version: number;
        status: 'draft' | 'published';
        note?: string | null;
        content?: any;
        html?: string;
        css?: string;
        createdAt: string;
        publishedAt?: string | null;
    } | null;
    versions: PageVersionSummary[];
}

type SaveStatus = 'idle' | 'saving' | 'publishing';

const DEFAULT_HTML = `<section class="editor-placeholder" data-slot="hero">
  <div class="container">
    <h1 style="font-size:48px;margin-bottom:16px;">Comece seu layout premium aqui</h1>
    <p style="font-size:18px;color:#666;max-width:600px;">
      Use os blocos à esquerda para construir experiências ricas sem quebrar o layout oficial do dashboard.
    </p>
  </div>
</section>`;

const PAGES_TOOLBAR_HEIGHT = 72;

const PageEditor: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<GrapesEditor | null>(null);
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [versions, setVersions] = useState<PageVersionSummary[]>([]);
    const [pageSummary, setPageSummary] = useState<PageSummary | null>(null);
    const [note, setNote] = useState('');
    const { user, isAdmin } = useUser();

    const pageKey = useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('page') || 'home';
    }, []);

    const ensureEditor = useCallback(async (): Promise<GrapesEditor | null> => {
        if (editorRef.current) {
            return editorRef.current;
        }

        if (!containerRef.current) {
            return null;
        }

        const grapesjsModule = await import('grapesjs');
        const grapesjs = grapesjsModule.default ?? grapesjsModule;

        const instance = grapesjs.init({
            container: containerRef.current,
            height: `calc(100vh - ${PAGES_TOOLBAR_HEIGHT}px)`,
            fromElement: false,
            storageManager: false,
            blockManager: {
                appendTo: '#editor-blocks',
            },
            panels: {
                defaults: [
                    {
                        id: 'layers',
                        el: '#editor-layers',
                        resizable: true,
                    },
                    {
                        id: 'styles',
                        el: '#editor-styles',
                        resizable: true,
                    },
                ],
            },
            canvas: {
                styles: [
                    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                    '/design-system.css',
                ],
            },
        });

        editorRef.current = instance;
        return instance;
    }, []);

    const hydrateEditor = useCallback(async () => {
        if (!user) {
            setError('É necessário estar autenticado para acessar o editor.');
            setLoading(false);
            return;
        }

        if (!isAdmin) {
            setError('Acesso restrito. Apenas administradores podem editar páginas.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = await apiClient.get<PageResponsePayload>(`/pages/${pageKey}`);

            setVersions(payload.versions ?? []);
            setPageSummary(payload.page ?? null);

            const editor = await ensureEditor();
            if (!editor) {
                return;
            }

            if (payload.latestVersion?.content) {
                editor.loadProjectData(payload.latestVersion.content as ProjectData);
            } else if (payload.latestVersion?.html) {
                editor.setComponents(payload.latestVersion.html);
                if (payload.latestVersion.css) {
                    editor.setStyle(payload.latestVersion.css);
                }
            } else {
                editor.setComponents(DEFAULT_HTML);
            }
        } catch (err) {
            console.error('Erro ao carregar página do editor:', err);
            setError('Não foi possível carregar o conteúdo para edição.');
            const editor = editorRef.current || (await ensureEditor());
            if (editor && !editor.getHtml()) {
                editor.setComponents(DEFAULT_HTML);
            }
        } finally {
            setLoading(false);
        }
    }, [ensureEditor, isAdmin, pageKey, user]);

    useEffect(() => {
        hydrateEditor();

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [hydrateEditor]);

    const prefixIds = useCallback((project: ProjectData, pageId: string) => {
        const prefix = `${pageId}-`;

        const processComponent = (component: any) => {
            if (!component) return;

            if (component.attributes?.id) {
                const currentId: string = component.attributes.id;
                if (!currentId.startsWith(prefix)) {
                    const newId = `${prefix}${currentId}`;
                    component.attributes.id = newId;
                }
            }

            if (Array.isArray(component.components)) {
                component.components.forEach(processComponent);
            }
        };

        if (Array.isArray(project?.pages)) {
            project.pages.forEach((page: any) => {
                if (Array.isArray(page?.components)) {
                    page.components.forEach(processComponent);
                }
            });
        }

        if (Array.isArray((project as any)?.components)) {
            (project as any).components.forEach(processComponent);
        }

        return project;
    }, []);

    const buildPayload = useCallback((editor: GrapesEditor, currentStatus: 'draft' | 'published') => {
        const project = editor.getProjectData();
        const projectWithIds = prefixIds(project, pageKey);

        const html = editor.getHtml();
        const css = editor.getCss();

        const prefix = `${pageKey}-`;
        const prefixedHtml = html.replace(/id="([^"]+)"/g, (_, id) => {
            if (id.startsWith(prefix)) return `id="${id}"`;
            return `id="${prefix}${id}"`;
        });

        const prefixedCss = css.replace(/#([A-Za-z_-][A-Za-z0-9_-]*)/g, (match, id) => {
            if (id.startsWith(prefix)) return `#${id}`;
            return `#${prefix}${id}`;
        });

        return {
            pageKey,
            status: currentStatus,
            note: note?.trim() || undefined,
            content: projectWithIds,
            html: prefixedHtml,
            css: prefixedCss,
        };
    }, [note, pageKey, prefixIds]);

    const handleSave = useCallback(async (mode: 'draft' | 'published') => {
        if (!editorRef.current || !user?.id || !isAdmin) {
            setError('Usuário não autenticado ou editor indisponível.');
            return;
        }

        setStatus(mode === 'draft' ? 'saving' : 'publishing');
        setError(null);

        try {
            const requestBody = buildPayload(editorRef.current, mode);
            const result = await apiClient.post<PageResponsePayload>(`/pages/${pageKey}`, requestBody);
            setVersions(result.versions ?? []);
            setPageSummary(result.page ?? null);
            if (mode === 'published') {
                await hydrateEditor();
                setNote('');
            }
        } catch (err) {
            console.error('Erro ao salvar página:', err);
            setError('Falha ao salvar alterações. Tente novamente.');
        } finally {
            setStatus('idle');
        }
    }, [buildPayload, hydrateEditor, isAdmin, pageKey, user?.id]);

    const handleCancel = useCallback(() => {
        window.location.href = '/';
    }, []);

    const isSaving = status === 'saving' || status === 'publishing';

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#111111] px-6 text-center text-white">
                <div className="max-w-md space-y-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-primary">Acesso restrito</span>
                    <h1 className="text-2xl font-semibold">Área disponível apenas para administradores</h1>
                    <p className="text-sm text-white/70">
                        Entre com uma conta administrativa para editar páginas ou volte ao dashboard principal.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.href = '/'}
                        className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-[#02281a] transition hover:bg-primary/80"
                    >
                        Voltar ao dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#111111] text-white">
            <header className="flex h-[72px] items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-8">
                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.2em] text-primary">Editor Visual</span>
                    <h1 className="text-xl font-semibold">
                        {pageSummary?.name || 'Página sem título'}
                    </h1>
                    <span className="text-xs text-white/50">Slug: {pageKey}</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Adicionar nota da versão (opcional)"
                        disabled={!isAdmin}
                        className="w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="button"
                        onClick={() => handleSave('draft')}
                        disabled={isSaving || !isAdmin}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Salvar rascunho
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave('published')}
                        disabled={isSaving || !isAdmin}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-[#02281a] transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {status === 'publishing' ? 'Publicando...' : 'Publicar'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                    >
                        Cancelar
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#141414] xl:flex">
                    <div className="border-b border-white/10 p-4">
                        <h2 className="text-sm font-semibold text-white/80">Blocos</h2>
                    </div>
                    <div id="editor-blocks" className="flex-1 overflow-y-auto px-4 py-3 text-sm" />
                </aside>

                <main className="flex-1 overflow-hidden bg-white">
                    {loading && (
                        <div className="flex h-full items-center justify-center bg-white text-gray-500">
                            Carregando editor...
                        </div>
                    )}
                    <div ref={containerRef} className="editor-canvas h-full w-full" />
                </main>

                <aside className="hidden w-80 flex-col border-l border-white/10 bg-[#141414] lg:flex">
                    <div className="border-b border-white/10 p-4">
                        <h2 className="text-sm font-semibold text-white/80">Estilos</h2>
                    </div>
                    <div id="editor-styles" className="flex-1 overflow-y-auto px-4 py-3" />
                    <div className="border-t border-white/10 p-4">
                        <h2 className="mb-3 text-sm font-semibold text-white/80">Versões</h2>
                        <div className="space-y-2 text-sm">
                            {versions.length === 0 && (
                                <div className="rounded-lg border border-white/10 px-3 py-2 text-white/50">
                                    Nenhuma versão salva ainda.
                                </div>
                            )}
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/90">v{version.version}</span>
                                        <span className={`text-xs ${version.status === 'published' ? 'text-primary' : 'text-white/50'}`}>
                                            {version.status === 'published' ? 'Publicado' : 'Rascunho'}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs text-white/60">
                                        {new Date(version.createdAt).toLocaleString('pt-BR')}
                                    </div>
                                    {version.note && (
                                        <div className="mt-1 text-xs text-white/50">{version.note}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {error && (
                <div className="border-t border-red-500/40 bg-red-500/10 px-8 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}
        </div>
    );
};

export default PageEditor;

