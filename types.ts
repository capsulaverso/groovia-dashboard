
export interface ScanCardData {
    id: number;
    title: string;
    description: string;
    progress: number;
}

export interface InfoItemData {
    id: number;
    title: string;
    description: string;
    buttonText: string;
}

export interface InstructionBoxProps {
    title: string;
    description: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
    onClose?: () => void;
    showCloseButton?: boolean;
    variant?: 'info' | 'warning' | 'success' | 'error';
    icon?: string;
}
