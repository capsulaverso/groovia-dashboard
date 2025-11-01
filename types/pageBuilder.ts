export interface PageSummary {
    id: number;
    pageKey: string;
    name: string;
}

export interface PageVersionSummary {
    id: number;
    version: number;
    status: 'draft' | 'published';
    author: string;
    createdAt: string;
    note?: string;
}

export interface PageVersionDetail {
    id: number;
    version: number;
    status: 'draft' | 'published';
    note?: string;
    content?: any;
    html?: string;
    css?: string;
}

export interface PageResponsePayload {
    page: PageSummary | null;
    latestVersion: PageVersionDetail | null;
    versions: PageVersionSummary[];
}

export interface PageListItem {
    id: number;
    name: string;
    pageKey: string;
    description?: string | null;
    updatedAt: string;
    publishedVersion?: number | null;
    publishedAt?: string | null;
}

export interface PageListResponse {
    pages: PageListItem[];
}

