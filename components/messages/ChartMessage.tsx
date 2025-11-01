import React from 'react';
import { ChatMessage } from '../../types';

interface ChartMessageProps {
  message: ChatMessage;
}

export const ChartMessage: React.FC<ChartMessageProps> = ({ message }) => {
  const chartData = message.metadata?.chartData;

  if (!chartData) {
    return (
      <div className="text-message">
        <p className="whitespace-pre-wrap">{message.message}</p>
      </div>
    );
  }

  const { type, data, labels, title } = chartData;

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map((d: any) => typeof d === 'number' ? d : d.value || 0));
    
    return (
      <div className="space-y-2">
        {data.map((item: any, index: number) => {
          const value = typeof item === 'number' ? item : item.value || 0;
          const label = typeof item === 'object' && item.label ? item.label : (labels?.[index] || `Item ${index + 1}`);
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum: number, item: any) => 
      sum + (typeof item === 'number' ? item : item.value || 0), 0
    );

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
      <div className="space-y-3">
        {data.map((item: any, index: number) => {
          const value = typeof item === 'number' ? item : item.value || 0;
          const label = typeof item === 'object' && item.label ? item.label : (labels?.[index] || `Item ${index + 1}`);
          const percentage = ((value / total) * 100).toFixed(1);
          const color = colors[index % colors.length];
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.map((d: any) => typeof d === 'number' ? d : d.value || 0));
    const minValue = Math.min(...data.map((d: any) => typeof d === 'number' ? d : d.value || 0));
    const range = maxValue - minValue || 1;

    return (
      <div className="relative h-48 flex items-end justify-between gap-1 px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        {data.map((item: any, index: number) => {
          const value = typeof item === 'number' ? item : item.value || 0;
          const label = typeof item === 'object' && item.label ? item.label : (labels?.[index] || `${index + 1}`);
          const height = ((value - minValue) / range) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full relative group">
              <div 
                className="w-full bg-blue-500 dark:bg-blue-400 rounded-t transition-all duration-300"
                style={{ height: `${height}%` }}
              />
              <div className="absolute -bottom-6 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {label}
              </div>
              <div className="absolute top-0 -translate-y-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                {value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="chart-message bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {message.message && (
        <p className="text-gray-900 dark:text-white mb-4">{message.message}</p>
      )}
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h4>
      )}
      <div className="mt-4">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
        {type === 'area' && renderLineChart()}
        {type === 'scatter' && renderLineChart()}
      </div>
    </div>
  );
};
