import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../hooks/useApi';
import { useUser } from '../../hooks/useUser';

// Tipos para o Page Builder
interface PageListItem {
    id: number;
    name: string;
    pageKey: string;
    description?: string | null;
    publishedVersion?: number | null;
    publishedAt?: string | null;
    updatedAt?: string | null;
}

interface PageListResponse {
    pages: PageListItem[];
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
    page: PageListItem | null;
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

interface VersionsCache {
    [pageKey: string]: PageVersionSummary[];
}

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const AdminPagesPanel: React.FC = () => {
    const { user, isAdmin } = useUser();
    const [pages, setPages] = useState<PageListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [titleInput, setTitleInput] = useState<string>('');
    const [slugInput, setSlugInput] = useState<string>('');
    const [descriptionInput, setDescriptionInput] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
    const [versionsCache, setVersionsCache] = useState<VersionsCache>({});

    const normalizedSlug = useMemo(() => slugify(slugInput || titleInput), [slugInput, titleInput]);

    const fetchPages = useCallback(async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get<PageListResponse>(`/pages?userId=${user?.id}&clientId=${user?.clientId || 1}`);
            setPages(response.pages || []);
        } catch (err) {
            console.error('Erro ao buscar páginas:', err);
            setError('Não foi possível carregar a lista de páginas.');
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    useEffect(() => {
        if (!showModal) {
            setTitleInput('');
            setSlugInput('');
            setDescriptionInput('');
        }
    }, [showModal]);

    const handleCreatePage = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isAdmin) {
            return;
        }

        if (!titleInput.trim()) {
            setError('Informe um título para a página.');
            return;
        }

        if (!normalizedSlug) {
            setError('Informe um slug válido.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: titleInput.trim(),
                pageKey: normalizedSlug,
                description: descriptionInput.trim() || undefined,
            };
            await apiClient.post<PageListResponse>(`/pages?userId=${user?.id}&clientId=${user?.clientId || 1}`, payload);
            setShowModal(false);
            await fetchPages();
            window.location.href = `/?page=${normalizedSlug}`;
        } catch (err) {
            console.error('Erro ao criar página:', err);
            setError('Não foi possível criar a nova página. Verifique os dados e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (slug: string) => {
        window.location.href = `/?page=${slug}`;
    };

    const handleToggleVersions = async (slug: string) => {
        if (expandedSlug === slug) {
            setExpandedSlug(null);
            return;
        }

        setExpandedSlug(slug);

        if (versionsCache[slug]) {
            return;
        }

        try {
            const payload = await apiClient.get<PageResponsePayload>(`/pages/${slug}?userId=${user?.id}&clientId=${user?.clientId || 1}`);
            setVersionsCache(prev => ({ ...prev, [slug]: payload.versions || [] }));
        } catch (err) {
            console.error('Erro ao carregar versões:', err);
            setVersionsCache(prev => ({ ...prev, [slug]: [] }));
        }
    };

    if (!user || !isAdmin) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-6 text-center text-white">
                <div className="max-w-md space-y-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-primary">Acesso restrito</span>
                    <h1 className="text-3xl font-semibold">Somente administradores podem gerenciar páginas</h1>
                    <p className="text-sm text-white/70">
                        Solicite permissões ou entre com uma conta administrativa para continuar.
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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-8 py-10 text-white">
            <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-primary">Administração</span>
                    <h1 className="text-3xl font-semibold">Gerenciamento de Páginas</h1>
                    <p className="text-sm text-white/60">
                        Crie, edite e publique páginas do portal sem alterar a estrutura principal.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-[#02281a] transition hover:bg-primary/80"
                >
                    <span className="material-icons-outlined text-base">add</span>
                    Criar nova página
                </button>
            </header>

            {error && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-widest text-white/40">
                    <span className="col-span-3">Título</span>
                    <span className="col-span-2">Slug</span>
                    <span className="col-span-3">Última versão publicada</span>
                    <span className="col-span-2">Atualizado em</span>
                    <span className="col-span-2 text-right">Ações</span>
                </div>

                {loading ? (
                    <div className="space-y-3 px-6 py-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-12 animate-pulse rounded-xl bg-white/5" />
                        ))}
                    </div>
                ) : pages.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-white/60">
                        Nenhuma página criada ainda. Clique em "Criar nova página" para começar.
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {pages.map(page => {
                            const publishedLabel = page.publishedVersion
                                ? `Versão v${page.publishedVersion}`
                                : 'Ainda não publicada';
                            const publishedAtLabel = page.publishedAt
                                ? new Date(page.publishedAt).toLocaleString('pt-BR')
                                : '—';
                            const updatedAtLabel = page.updatedAt
                                ? new Date(page.updatedAt).toLocaleString('pt-BR')
                                : '—';

                            const isExpanded = expandedSlug === page.pageKey;
                            const versions = versionsCache[page.pageKey] || [];

                            return (
                                <div key={page.id} className="px-6 py-4">
                                    <div className="grid grid-cols-12 items-center gap-4">
                                        <div className="col-span-3">
                                            <p className="text-sm font-semibold text-white">{page.name}</p>
                                            {page.description && (
                                                <p className="text-xs text-white/50">{page.description}</p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-mono text-white/80">
                                                {page.pageKey}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-sm text-white/80">
                                            <p>{publishedLabel}</p>
                                            <p className="text-xs text-white/50">{publishedAtLabel}</p>
                                        </div>
                                        <div className="col-span-2 text-sm text-white/70">
                                            {updatedAtLabel}
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(page.pageKey)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                                            >
                                                <span className="material-icons-outlined text-sm">edit</span>
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVersions(page.pageKey)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10"
                                            >
                                                <span className="material-icons-outlined text-sm">history</span>
                                                Histórico
                                                <span className="material-icons-outlined text-xs">
                                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                                            {versions.length === 0 ? (
                                                <p className="text-white/60">
                                                    Nenhuma versão registrada ainda para esta página.
                                                </p>
                                            ) : (
                                                <ul className="space-y-2">
                                                    {versions.map(version => (
                                                        <li key={version.id} className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-white">Versão v{version.version}</p>
                                                                <p className="text-xs text-white/50">
                                                                    {new Date(version.createdAt).toLocaleString('pt-BR')} • {version.status === 'published' ? 'Publicado' : 'Rascunho'}
                                                                </p>
                                                                {version.note && (
                                                                    <p className="text-xs text-white/60">{version.note}</p>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#181818] p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <span className="text-xs uppercase tracking-[0.3em] text-primary">Nova página</span>
                                <h2 className="text-xl font-semibold">Criar página personalizada</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-full bg-white/10 p-2 text-white/60 transition hover:bg-white/20"
                            >
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form className="space-y-5" onSubmit={handleCreatePage}>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/40">Título</label>
                                <input
                                    type="text"
                                    value={titleInput}
                                    onChange={(event) => setTitleInput(event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex.: Página de onboarding"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-xs uppercase tracking-widest text-white/40">
                                    <span>Slug</span>
                                    <span className="text-[10px] text-white/30">Será usado na URL: /{normalizedSlug || 'minha-pagina'}</span>
                                </label>
                                <input
                                    type="text"
                                    value={slugInput}
                                    onChange={(event) => setSlugInput(event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex.: onboarding"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/40">Descrição (opcional)</label>
                                <textarea
                                    value={descriptionInput}
                                    onChange={(event) => setDescriptionInput(event.target.value)}
                                    className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Resumo sobre o objetivo da página"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-[#02281a] transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? 'Criando...' : 'Criar página'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPagesPanel;

