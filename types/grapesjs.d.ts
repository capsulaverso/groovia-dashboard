declare module 'grapesjs' {
    export interface Editor {
        getProjectData(): any;
        loadProjectData(data: any): void;
        getHtml(): string;
        getCss(): string;
        setComponents(components: string): void;
        setStyle(style: string): void;
        destroy(): void;
    }

    export type ProjectData = any;

    interface GrapesJS {
        init(config: Record<string, any>): Editor;
    }

    const grapesjs: GrapesJS;
    export default grapesjs;
}

declare module 'grapesjs/dist/css/grapes.min.css';

