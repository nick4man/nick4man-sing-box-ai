import React, { useState, useRef } from 'react';
import { SingboxConfig, Inbound, Outbound, RouteRule } from '../types';
import { PlusIcon, TrashIcon, UploadIcon, DownloadIcon } from './icons';
import CodeBlock from './CodeBlock';

const DEFAULT_INBOUND: Inbound = { type: 'mixed', tag: 'mixed-in', listen: '127.0.0.1', listen_port: 1080 };
const DEFAULT_OUTBOUND: Outbound = { type: 'freedom', tag: 'freedom-out' };
const DEFAULT_ROUTE_RULE: RouteRule = { outbound: 'freedom-out' };

const DEFAULT_CONFIG: SingboxConfig = {
  log: { level: 'info', timestamp: true },
  dns: { servers: ['8.8.8.8'] },
  inbounds: [DEFAULT_INBOUND],
  outbounds: [DEFAULT_OUTBOUND, { type: 'block', tag: 'block-out' }],
  route: { rules: [DEFAULT_ROUTE_RULE] },
};

// Reusable UI Components
const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800/50 rounded-lg border border-gray-700">
    <h3 className="text-lg font-semibold text-cyan-400 p-4 border-b border-gray-700">{title}</h3>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
  </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500">
      {children}
    </select>
  </div>
);

const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" {...props} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 rounded text-cyan-600 focus:ring-cyan-500" />
        <span className="text-sm text-gray-300">{label}</span>
    </label>
);


const ConfigBuilder: React.FC = () => {
  const [config, setConfig] = useState<SingboxConfig>(DEFAULT_CONFIG);
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const updateConfig = <K extends keyof SingboxConfig>(key: K, value: SingboxConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  
  const handleGenerate = () => {
    const jsonString = JSON.stringify(config, null, 2);
    setGeneratedJson(jsonString);
    setFeedback(null);
  };
  
  const handleReset = () => {
      setConfig(DEFAULT_CONFIG);
      setGeneratedJson('');
      setFeedback(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedConfig = JSON.parse(text);
        
        // Basic validation
        if (parsedConfig.log && parsedConfig.dns && parsedConfig.inbounds && parsedConfig.outbounds && parsedConfig.route) {
          // Deep merge with default config to ensure all fields are present
          const newConfig: SingboxConfig = {
            ...DEFAULT_CONFIG,
            ...parsedConfig,
            log: { ...DEFAULT_CONFIG.log, ...parsedConfig.log },
            dns: { ...DEFAULT_CONFIG.dns, ...parsedConfig.dns },
            route: { ...DEFAULT_CONFIG.route, ...parsedConfig.route },
          };
          setConfig(newConfig);
          setGeneratedJson('');
          setFeedback({ type: 'success', message: 'Конфигурация успешно загружена и применена!' });
        } else {
          throw new Error('Отсутствуют необходимые разделы конфигурации.');
        }

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
        setFeedback({ type: 'error', message: `Ошибка при чтении файла: ${message}` });
      }
    };

    reader.onerror = () => {
        setFeedback({ type: 'error', message: 'Не удалось прочитать файл.' });
    };

    reader.readAsText(file);
  };
  
  const handleDownload = () => {
    if (!generatedJson) return;

    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sing-box-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  // Generic handler for list updates
  const handleListChange = <T,>(list: T[], index: number, field: keyof T, value: any, setter: (list: T[]) => void) => {
    const newList = [...list];
    newList[index] = { ...newList[index], [field]: value };
    setter(newList);
  };

  const addListItem = <T,>(list: T[], defaultValue: T, setter: (list: T[]) => void) => {
      setter([...list, defaultValue]);
  };
  
  const removeListItem = <T,>(list: T[], index: number, setter: (list: T[]) => void) => {
    setter(list.filter((_, i) => i !== index));
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <FormSection title="Логирование (Log)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect label="Уровень" value={config.log.level} onChange={e => updateConfig('log', { ...config.log, level: e.target.value as any })}>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
                <option value="none">None</option>
            </FormSelect>
            <FormCheckbox label="Временная метка" checked={config.log.timestamp} onChange={e => updateConfig('log', { ...config.log, timestamp: e.target.checked })} />
        </div>
      </FormSection>

      <FormSection title="DNS">
          {config.dns.servers.map((server, index) => (
              <div key={index} className="flex items-center gap-2">
                  <FormInput label={`Сервер ${index + 1}`} type="text" value={server} onChange={e => {
                      const newServers = [...config.dns.servers];
                      newServers[index] = e.target.value;
                      updateConfig('dns', { servers: newServers });
                  }} />
                  <button onClick={() => removeListItem(config.dns.servers, index, (newList) => updateConfig('dns', { servers: newList }))} className="p-2 mt-6 bg-red-600/50 hover:bg-red-500/50 text-white rounded-md transition-colors"><TrashIcon/></button>
              </div>
          ))}
          <button onClick={() => addListItem(config.dns.servers, '1.1.1.1', (newList) => updateConfig('dns', { servers: newList }))} className="flex items-center gap-2 text-sm bg-cyan-600/50 hover:bg-cyan-500/50 text-white py-2 px-3 rounded-md transition-colors"><PlusIcon/> Добавить сервер</button>
      </FormSection>
      
      <FormSection title="Входящие (Inbounds)">
        {config.inbounds.map((inbound, index) => (
          <div key={index} className="p-4 border border-gray-600 rounded-lg space-y-3 relative">
              <button onClick={() => removeListItem(config.inbounds, index, (newList) => updateConfig('inbounds', newList))} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Тег" value={inbound.tag} onChange={e => handleListChange(config.inbounds, index, 'tag', e.target.value, (newList) => updateConfig('inbounds', newList))} />
                <FormSelect label="Тип" value={inbound.type} onChange={e => handleListChange(config.inbounds, index, 'type', e.target.value, (newList) => updateConfig('inbounds', newList))}>
                    <option value="direct">direct</option>
                    <option value="http">http</option>
                    <option value="socks">socks</option>
                    <option value="mixed">mixed</option>
                </FormSelect>
                <FormInput label="Адрес" value={inbound.listen} onChange={e => handleListChange(config.inbounds, index, 'listen', e.target.value, (newList) => updateConfig('inbounds', newList))} />
                <FormInput label="Порт" type="number" value={inbound.listen_port} onChange={e => handleListChange(config.inbounds, index, 'listen_port', parseInt(e.target.value) || 0, (newList) => updateConfig('inbounds', newList))} />
            </div>
          </div>
        ))}
         <button onClick={() => addListItem(config.inbounds, { ...DEFAULT_INBOUND, tag: `mixed-in-${config.inbounds.length}` }, (newList) => updateConfig('inbounds', newList))} className="flex items-center gap-2 text-sm bg-cyan-600/50 hover:bg-cyan-500/50 text-white py-2 px-3 rounded-md transition-colors"><PlusIcon/> Добавить входящее</button>
      </FormSection>

      <FormSection title="Исходящие (Outbounds)">
        {config.outbounds.map((outbound, index) => (
            <div key={index} className="p-4 border border-gray-600 rounded-lg space-y-3 relative">
                <button onClick={() => removeListItem(config.outbounds, index, (newList) => updateConfig('outbounds', newList))} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Тег" value={outbound.tag} onChange={e => handleListChange(config.outbounds, index, 'tag', e.target.value, (newList) => updateConfig('outbounds', newList))} />
                    <FormSelect label="Тип" value={outbound.type} onChange={e => handleListChange(config.outbounds, index, 'type', e.target.value, (newList) => updateConfig('outbounds', newList))}>
                        <option value="freedom">freedom</option>
                        <option value="block">block</option>
                        <option value="dns">dns</option>
                    </FormSelect>
                </div>
            </div>
        ))}
        <button onClick={() => addListItem(config.outbounds, { ...DEFAULT_OUTBOUND, tag: `freedom-out-${config.outbounds.length}`}, (newList) => updateConfig('outbounds', newList))} className="flex items-center gap-2 text-sm bg-cyan-600/50 hover:bg-cyan-500/50 text-white py-2 px-3 rounded-md transition-colors"><PlusIcon/> Добавить исходящее</button>
      </FormSection>
      
      {/* Action Buttons */}
       <div className="flex flex-wrap items-center gap-4 pt-4">
           <button onClick={handleGenerate} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200">
               Сгенерировать конфигурацию
           </button>
           <button onClick={handleReset} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200">
               Сбросить
           </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept=".json"
                className="hidden" 
            />
            <button 
                onClick={handleFileUploadClick} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
            >
               <UploadIcon />
               Загрузить для проверки
           </button>
           {generatedJson && (
             <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200">
                <DownloadIcon />
                Скачать .json
             </button>
           )}
       </div>

       {feedback && (
         <div className={`mt-4 p-3 rounded-md text-sm ${
           feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
         }`}>
           {feedback.message}
         </div>
       )}

      {generatedJson && (
        <div className="mt-6">
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">Сгенерированная конфигурация</h3>
            <CodeBlock code={generatedJson} />
        </div>
      )}
    </div>
  );
};

export default ConfigBuilder;