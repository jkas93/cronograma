import React from 'react';
import { EnhancedActivity, EditedValue } from './types';

interface PulseActivityRowProps {
  activity: EnhancedActivity;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  editState?: EditedValue;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFieldChange: (id: string, field: keyof EditedValue, value: any) => void;
  onRemoveFile: (id: string, idx: number) => void;
}

export const PulseActivityRow = React.memo(function PulseActivityRow({
  activity,
  isExpanded,
  onToggleExpand,
  editState,
  onFieldChange,
  onRemoveFile
}: PulseActivityRowProps) {
  // Local state for debounced input handling
  const [localPercent, setLocalPercent] = React.useState<string>(
    editState?.percent !== undefined ? editState.percent : (activity.existingTodayPercent !== null ? activity.existingTodayPercent.toString() : '')
  );
  const [localNotes, setLocalNotes] = React.useState<string>(
    editState?.notes !== undefined ? editState.notes : (activity.existingTodayNotes || '')
  );
  const [localRestrictionReason, setLocalRestrictionReason] = React.useState<string>(
    editState?.restrictionReason !== undefined ? editState.restrictionReason : (activity.existingTodayRestrictionReason || '')
  );

  // Sync local state if parent changes (e.g. after successful save)
  React.useEffect(() => {
    setLocalPercent(editState?.percent !== undefined ? editState.percent : (activity.existingTodayPercent !== null ? activity.existingTodayPercent.toString() : ''));
    setLocalNotes(editState?.notes !== undefined ? editState.notes : (activity.existingTodayNotes || ''));
    setLocalRestrictionReason(editState?.restrictionReason !== undefined ? editState.restrictionReason : (activity.existingTodayRestrictionReason || ''));
  }, [editState?.percent, editState?.notes, editState?.restrictionReason, activity.existingTodayPercent, activity.existingTodayNotes, activity.existingTodayRestrictionReason]);

  const handlePercentBlur = () => {
    if (localPercent !== editState?.percent) {
      onFieldChange(activity.id, 'percent', localPercent);
    }
  };

  const handleNotesBlur = () => {
    if (localNotes !== editState?.notes) {
      onFieldChange(activity.id, 'notes', localNotes);
    }
  };

  const handleRestrictionReasonBlur = () => {
    if (localRestrictionReason !== editState?.restrictionReason) {
      onFieldChange(activity.id, 'restrictionReason', localRestrictionReason);
    }
  };

  const hasUnsavedChanges = !!(editState?.percent || editState?.notes || (editState?.files && editState.files.length > 0));
  
  const displayPercent = localPercent;

  const isRestricted = editState?.hasRestriction !== undefined 
    ? editState.hasRestriction 
    : activity.existingTodayRestriction;

  const restrictionReason = localRestrictionReason;

  const currentNotes = localNotes;

  const trClass = isRestricted 
    ? 'bg-danger-500/5 hover:bg-danger-500/10 border-l-4 border-l-danger-500 border-b border-surface-700/50 transition-colors group/row'
    : `hover:bg-surface-800/30 transition-colors border-b border-l-4 border-l-transparent border-surface-700/50 ${hasUnsavedChanges ? 'bg-accent-400/5' : ''} group/row`;

  return (
    <>
      <tr className={trClass}>
        {/* Actividad + Acumulado inline en móvil */}
        <td className="py-3 px-3 md:py-4 md:px-4 md:pl-6">
          <div className="flex items-start gap-2 md:gap-3">
            {isRestricted && (
              <span title="Con Restricción" className="text-danger-400 animate-pulse shrink-0 mt-0.5">
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-surface-100 font-bold group-hover/row:text-accent-400 transition-colors leading-tight text-xs md:text-sm break-words">{activity.name}</span>
              {hasUnsavedChanges && <span className="text-[9px] md:text-[10px] text-accent-400 font-black uppercase tracking-widest mt-0.5">Pendiente de guardar</span>}
              {/* Acumulado visible solo en móvil (inline) */}
              <div className="flex items-center gap-1.5 mt-1 md:hidden">
                <span className="text-[9px] font-bold text-surface-400 uppercase">Acum:</span>
                <span className="text-[11px] font-black text-primary-400">{activity.totalProgress.toFixed(1)}%</span>
                <div className="w-8 h-1 bg-surface-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${Math.min(activity.totalProgress, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </td>

        {/* Acumulado - solo visible en desktop */}
        <td className="py-4 px-4 text-center border-l border-surface-800/50 hidden md:table-cell">
          <div className="flex flex-col items-center">
            <span className="text-sm font-black text-primary-400">{activity.totalProgress.toFixed(1)}%</span>
            <div className="w-12 h-1 bg-surface-800 rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-primary-500" style={{ width: `${activity.totalProgress}%` }}></div>
            </div>
          </div>
        </td>

        {/* Avance Hoy */}
        <td className="py-2 px-2 md:py-3 md:px-4 bg-accent-400/5">
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <div className="relative">
              <input 
                type="number" 
                min="0" max="100" step="0.5"
                placeholder="0"
                value={displayPercent}
                onChange={(e) => setLocalPercent(e.target.value)}
                onBlur={handlePercentBlur}
                className="w-16 h-9 md:w-20 md:h-10 text-center text-sm md:text-base font-black rounded-lg bg-white border border-surface-600 focus:border-accent-400 focus:ring-4 focus:ring-accent-400/20 outline-none transition-all text-surface-100 shadow-sm"
              />
              <span className="absolute -top-2 -right-1 text-[9px] md:text-[10px] bg-accent-500 text-primary-900 px-1 rounded font-black border border-surface-700 shadow-sm">%</span>
            </div>
          </div>
        </td>

        {/* Gestión */}
        <td className="py-3 px-2 md:py-4 md:px-4 text-center">
          <button 
            onClick={() => onToggleExpand(activity.id)}
            className={`p-2 md:p-2.5 rounded-xl transition-all duration-300 relative group/btn ${
              isExpanded 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                : 'text-surface-400 hover:bg-surface-700/50 hover:text-surface-100 hover:scale-110 active:scale-90 border border-transparent hover:border-surface-600'
            }`}
            title="Añadir notas o fotos"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {(activity.existingTodayNotes || activity.existingTodayPhotos.length > 0 || editState?.notes || (editState?.files && editState.files.length > 0)) && (
               <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-surface-900 shadow-[0_0_8px_rgba(247,194,14,0.5)]"></span>
            )}
          </button>
        </td>
      </tr>
      
      {isExpanded && (
        <tr className="bg-surface-900/40 border-b border-surface-800">
          <td colSpan={4} className="py-4 px-3 md:py-6 md:px-12 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-surface-900/80 border border-surface-700/50 shadow-2xl backdrop-blur-sm">
              
              {/* Restricción */}
              <div className={`col-span-1 md:col-span-2 p-4 md:p-5 rounded-xl border transition-all duration-300 ${isRestricted ? 'bg-danger-500/10 border-danger-500/30 ring-1 ring-danger-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'bg-surface-800/80 border-surface-700 hover:border-surface-600'}`}>
                <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
                  <label className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-black text-surface-100 cursor-pointer select-none">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={isRestricted}
                        onChange={() => onFieldChange(activity.id, 'hasRestriction', !isRestricted)}
                        className="w-4 h-4 md:w-5 md:h-5 accent-danger-500 rounded-lg bg-surface-700 border-surface-600 cursor-pointer"
                      />
                    </div>
                    <span className="leading-tight">¿EXISTE ALGUNA RESTRICCIÓN?</span>
                  </label>
                  {isRestricted && <span className="text-[9px] md:text-[10px] font-black bg-danger-500 text-white px-1.5 md:px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">Acción requerida</span>}
                </div>
                {isRestricted && (
                  <div className="pl-6 md:pl-8 animate-fade-in">
                    <label className="block text-[9px] md:text-[10px] font-black text-danger-400 uppercase tracking-[0.2em] mb-2 leading-none">Detalles del impedimento</label>
                    <textarea
                      value={restrictionReason}
                      onChange={(e) => setLocalRestrictionReason(e.target.value)}
                      onBlur={handleRestrictionReasonBlur}
                      placeholder="Indica el motivo: falta de material, clima, permisos, etc..."
                      className="w-full text-xs md:text-sm bg-surface-900/50 border border-danger-500/30 rounded-xl p-3 md:p-4 outline-none focus:border-danger-400 focus:ring-4 focus:ring-danger-500/10 text-surface-100 resize-none h-20 md:h-24 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="block text-[9px] md:text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-1">Observaciones del día</label>
                <div className="relative">
                  <textarea
                    value={currentNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Escribe comentarios relevantes sobre el avance..."
                    className="w-full text-xs md:text-sm bg-surface-800 border border-surface-700 rounded-xl p-3 md:p-4 outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-400/5 text-surface-100 resize-none h-28 md:h-32 transition-all"
                  />
                  <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 text-[9px] md:text-[10px] text-surface-500 font-bold uppercase tracking-widest">{currentNotes?.length || 0} caract.</div>
                </div>
              </div>
              
              {/* Fotos */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1 gap-2">
                  <label className="text-[9px] md:text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Evidencia fotográfica</label>
                  <label className="cursor-pointer group flex items-center gap-1.5 transition-all shrink-0">
                    <div className="text-accent-500 group-hover:text-accent-400 text-[9px] md:text-[10px] font-black bg-accent-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-accent-500/20 group-hover:bg-accent-500/20 shadow-sm">
                      + SUBIR FOTO
                    </div>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files) {
                        onFieldChange(activity.id, 'files', Array.from(e.target.files));
                      }
                    }} />
                  </label>
                </div>
                
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 md:pb-4 scrollbar-hide min-h-[100px] md:min-h-[128px] p-3 md:p-4 bg-surface-950/50 rounded-2xl border-2 border-surface-800 border-dashed group-hover:border-surface-700 transition-colors">
                   {activity.existingTodayPhotos.map((url, idx) => (
                      <div key={`old-${idx}`} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border border-surface-700 shadow-md group/img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Evidencia Guardada" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-2">
                           <span className="text-[8px] text-white font-bold uppercase">Guardada</span>
                        </div>
                      </div>
                   ))}
                   {editState?.files?.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border-2 border-accent-500 shadow-lg group/img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="Nueva" className="w-full h-full object-cover opacity-80" />
                        <button 
                          onClick={() => onRemoveFile(activity.id, idx)} 
                          className="absolute inset-0 m-auto w-7 h-7 md:w-8 md:h-8 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110 active:scale-90 shadow-lg"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute top-1 right-1 bg-accent-500 w-2 h-2 rounded-full border border-surface-900 shadow-[0_0_5px_rgba(247,194,14,1)]"></div>
                      </div>
                   ))}
                   {activity.existingTodayPhotos.length === 0 && (!editState?.files || editState.files.length === 0) && (
                      <div className="flex flex-col flex-1 items-center justify-center text-xs text-surface-500 font-bold uppercase gap-2 opacity-30 select-none">
                        <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        <span className="text-[10px]">Sin registros</span>
                      </div>
                   )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});
