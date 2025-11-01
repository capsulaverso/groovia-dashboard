import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../hooks/useApi';
import type { PageResponsePayload } from '../types/pageBuilder';

interface PageContentRendererProps {
    pageId: string;
    status?: 'published' | 'draft';
    className?: string;
    emptyFallback?: React.ReactNode;
}

const PageContentRenderer: React.FC<PageContentRendererProps> = ({
    pageId,
    status = 'published',
    className,
    emptyFallback,
}) => {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const styleElementId = useMemo(() => `page-style-${pageId}`, [pageId]);

    useEffect(() => {
        let isMounted = true;

        const applyStyle = (css?: string | null) => {
            const existingStyle = document.getElementById(styleElementId) as HTMLStyleElement | null;
            if (css) {
                const styleTag = existingStyle ?? document.createElement('style');
                styleTag.id = styleElementId;
                styleTag.textContent = css;
                if (!existingStyle) {
                    document.head.appendChild(styleTag);
                }
            } else if (existingStyle && existingStyle.parentNode) {
                existingStyle.parentNode.removeChild(existingStyle);
            }
        };

        const fetchContent = async () => {
            setLoading(true);
            setError(null);

            try {
                const query = status ? `?status=${status}` : '';
                const payload = await apiClient.get<PageResponsePayload>(`/pages/${pageId}${query}`);
                const latest = payload.latestVersion;

                if (latest?.html) {
                    applyStyle(latest.css ?? null);
                    if (isMounted) {
                        setHtmlContent(latest.html);
                    }
                } else {
                    applyStyle(null);
                    if (isMounted) {
                        setHtmlContent(null);
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar conteúdo dinâmico:', err);
                applyStyle(null);
                if (isMounted) {
                    setError('Falha ao carregar conteúdo dinâmico.');
                    setHtmlContent(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchContent();

        return () => {
            isMounted = false;
            const existingStyle = document.getElementById(styleElementId);
            if (existingStyle && existingStyle.parentNode) {
                existingStyle.parentNode.removeChild(existingStyle);
            }
        };
    }, [pageId, status, styleElementId]);

    if (loading || error) {
        return emptyFallback ? <>{emptyFallback}</> : null;
    }

    if (!htmlContent) {
        return emptyFallback ? <>{emptyFallback}</> : null;
    }

    return (
        <div
            className={className}
            data-page-content={`page-${pageId}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};

export default PageContentRenderer;

