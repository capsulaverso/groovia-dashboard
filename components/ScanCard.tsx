
import React from 'react';
import ProgressRing from './ProgressRing';
import type { ScanCardData } from '../types';

interface ScanCardProps extends Omit<ScanCardData, 'id'> {}

const ScanCard: React.FC<ScanCardProps> = ({ title, description, progress }) => {
    const hasProgress = progress > 0;

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl flex flex-col justify-between min-h-[280px] h-full">
            <div>
                <div className="flex items-center justify-end mb-4">
                    <div className="relative inline-flex items-center justify-center bg-primary rounded-full w-7 h-7">
                        {hasProgress && <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-white"></div>}
                    </div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className={`h-3.5 ${hasProgress ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'} rounded-full w-full transition-colors`}></div>
                    <div className={`h-3.5 ${hasProgress ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'} rounded-full w-full transition-colors`}></div>
                    <div className={`h-3.5 ${hasProgress ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'} rounded-full w-full transition-colors`}></div>
                </div>
                {hasProgress && (
                    <div className="flex items-center justify-between text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
                        <span>SCAN {progress}%</span>
                        <div className="w-8 h-8">
                            <ProgressRing progress={progress} />
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-auto">
                <h3 className="text-lg font-bold mb-2 text-on-surface-light dark:text-on-surface-dark leading-tight line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}>{title}</h3>
                <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark leading-relaxed line-clamp-3" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>{description}</p>
            </div>
        </div>
    );
};

export default ScanCard;
