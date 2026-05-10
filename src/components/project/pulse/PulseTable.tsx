"use no memo";
import React, { useMemo, useRef } from 'react';
import { EnhancedPartida, EnhancedItem, EnhancedActivity, EditedValues, EditedValue } from './types';
import { PulseActivityRow } from './PulseActivityRow';
import { useVirtualizer } from '@tanstack/react-virtual';

type FlatRow = 
  | { type: 'partida'; id: string; data: EnhancedPartida }
  | { type: 'item'; id: string; data: EnhancedItem }
  | { type: 'activity'; id: string; data: EnhancedActivity };

interface PulseTableProps {
  activeActivitiesByPartida: EnhancedPartida[];
  expandedRows: Set<string>;
  onToggleRow: (id: string) => void;
  editedValues: EditedValues;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFieldChange: (activityId: string, field: keyof EditedValue, value: any) => void;
  onRemoveFile: (activityId: string, idx: number) => void;
}

export function PulseTable({
  activeActivitiesByPartida,
  expandedRows,
  onToggleRow,
  editedValues,
  onFieldChange,
  onRemoveFile
}: PulseTableProps) {


  const flatRows: FlatRow[] = useMemo(() => {
    const rows: FlatRow[] = [];
    activeActivitiesByPartida.forEach(partida => {
      rows.push({ type: 'partida', id: `p-${partida.id}`, data: partida });
      partida.items.forEach(item => {
        rows.push({ type: 'item', id: `i-${item.id}`, data: item });
        item.activities.forEach(activity => {
          rows.push({ type: 'activity', id: activity.id, data: activity });
        });
      });
    });
    return rows;
  }, [activeActivitiesByPartida]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = flatRows[index];
      if (row.type === 'partida') return 44;
      if (row.type === 'item') return 36;
      if (row.type === 'activity' && expandedRows.has(row.id)) return 360;
      return 68;
    },
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom = virtualItems.length > 0 
    ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0) 
    : 0;

  if (activeActivitiesByPartida.length === 0) {
    return (
      <div className="glass-card p-24 text-center border-dashed border-2 border-surface-800/10 shadow-inner">
        <div className="w-20 h-20 bg-surface-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-surface-800">
          <svg className="w-10 h-10 text-surface-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-surface-200 tracking-wider mb-2">SIN ACTIVIDADES PROGRAMADAS</h3>
        <p className="text-sm text-surface-400 max-w-sm mx-auto font-medium">No se encontraron tareas bajo contrato para esta fecha. Cambia de fecha o revisa tu cronograma base.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border border-surface-800/50 shadow-2xl rounded-2xl bg-surface-950/20 backdrop-blur-xl">
      <div ref={parentRef} className="w-full overflow-y-auto overflow-x-auto max-h-[650px] selection:bg-accent-500/30 custom-scrollbar">
        <table className="w-full text-left border-collapse md:table-fixed">
          <thead>
            <tr className="bg-surface-900/80 border-b-2 border-surface-800/50 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] shadow-sm">
              <th className="py-4 px-3 md:px-6 md:w-full md:min-w-[200px]">Actividad</th>
              <th className="py-4 px-2 md:px-4 md:w-36 border-l border-surface-800 text-center hidden md:table-cell">Acumulado</th>
              <th className="py-4 px-2 md:px-6 md:w-44 text-center bg-accent-500/5 text-accent-400 ring-inset ring-1 ring-accent-400/10 whitespace-nowrap">Avance Hoy</th>
              <th className="py-4 px-2 md:px-4 md:w-28 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/30">
            {paddingTop > 0 && <tr><td colSpan={4} style={{ height: `${paddingTop}px` }} /></tr>}
            {virtualItems.map((virtualRow) => {
              const row = flatRows[virtualRow.index];

              if (row.type === 'partida') {
                const partida = row.data as EnhancedPartida;
                return (
                  <tr key={virtualRow.key} className="sticky top-0 z-10">
                    <td colSpan={4} className="py-3 px-3 md:px-6 bg-gradient-to-r from-primary-700/80 to-primary-800/80 backdrop-blur-md border-y border-white/5">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] shrink-0"></div>
                        <span className="font-black text-white text-[10px] md:text-[11px] tracking-[0.15em] md:tracking-[0.25em] uppercase drop-shadow-md truncate">{partida.name}</span>
                      </div>
                    </td>
                  </tr>
                );
              }

              if (row.type === 'item') {
                const item = row.data as EnhancedItem;
                return (
                  <tr key={virtualRow.key}>
                     <td colSpan={4} className="py-2 px-3 md:px-6 bg-surface-900/60 md:pl-8 border-b border-surface-800/40">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-surface-600 shrink-0"></div>
                         <span className="font-bold text-surface-300 text-[10px] md:text-[11px] tracking-tight truncate">{item.name}</span>
                       </div>
                     </td>
                  </tr>
                );
              }

              const activity = row.data as EnhancedActivity;
              return (
                <PulseActivityRow
                  key={virtualRow.key}
                  activity={activity}
                  isExpanded={expandedRows.has(activity.id)}
                  onToggleExpand={onToggleRow}
                  editState={editedValues[activity.id]}
                  onFieldChange={onFieldChange}
                  onRemoveFile={onRemoveFile}
                />
              );
            })}
            {paddingBottom > 0 && <tr><td colSpan={4} style={{ height: `${paddingBottom}px` }} /></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
