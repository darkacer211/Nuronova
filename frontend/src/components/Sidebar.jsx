import React from 'react';

export default function Sidebar({
  activeModule = 'begin-assessment',
  onSelectModule,
}) {
  const navItems = [
    {
      id: 'begin-assessment',
      label: 'Begin Assessment',
      icon: 'vital_signs',
    },
    {
      id: 'diagnostic-neuro-reports',
      label: 'Neuro Reports',
      icon: 'assignment',
    },
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-r border-surface-container-high/60 z-40 flex flex-col justify-between py-4 transition-colors">
      <div className="flex flex-col gap-2 px-2">
        <div className="px-3 py-1">
          <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Clinical Modules
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule && onSelectModule(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-colors w-full ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="font-body-md text-[14px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
