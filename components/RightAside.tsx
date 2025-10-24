
import React from 'react';
import { INFO_ITEMS_DATA } from '../constants';
import type { InfoItemData } from '../types';

const InfoItem: React.FC<{ item: InfoItemData }> = ({ item }) => {
    return (
        <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-green-500 mt-0.5">info</span>
            <div>
                <h4 className="font-medium text-on-surface-light dark:text-on-surface-dark">{item.title}</h4>
                <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">{item.description}</p>
                <button className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-lg mt-2">{item.buttonText}</button>
            </div>
        </div>
    );
};


const RightAside: React.FC = () => {
    return (
        <aside className="w-72 p-6 hidden xl:block">
            <div className="w-full h-full flex flex-col gap-8 sticky top-6">
                {INFO_ITEMS_DATA.map(item => <InfoItem key={item.id} item={item} />)}
            </div>
        </aside>
    );
};

export default RightAside;
