import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  Users, 
  LayoutGrid, 
  RotateCcw,
  ChevronRight,
  Calculator,
  Armchair
} from 'lucide-react';

export default function App() {
  // --- State Management ---
  const [mode, setMode] = useState('setup'); // 'setup' or 'counting'
  
  // Blocks structure: { id, name, rows, seatsPerRow, counts: [0, 0, ...] }
  const [blocks, setBlocks] = useState([]);
  
  // Extra areas structure: { id, name, count }
  const [extras, setExtras] = useState([]);
  
  // Temporary inputs for setup forms
  const [newBlock, setNewBlock] = useState({ name: '', rows: '', seatsPerRow: '' });
  const [newExtra, setNewExtra] = useState({ name: '' });

  // --- Persistence Logic ---
  useEffect(() => {
    const savedBlocks = localStorage.getItem('auditorium_blocks');
    const savedExtras = localStorage.getItem('auditorium_extras');
    const savedMode = localStorage.getItem('auditorium_mode');

    if (savedBlocks) setBlocks(JSON.parse(savedBlocks));
    if (savedExtras) setExtras(JSON.parse(savedExtras));
    if (savedMode) setMode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('auditorium_blocks', JSON.stringify(blocks));
    localStorage.setItem('auditorium_extras', JSON.stringify(extras));
    localStorage.setItem('auditorium_mode', mode);
  }, [blocks, extras, mode]);

  // --- Calculations ---
  const getBlockTotal = (block) => {
    return block.counts.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  const getBlockCapacity = (block) => {
    return block.rows * block.seatsPerRow;
  };

  const getExtrasTotal = () => {
    return extras.reduce((sum, extra) => sum + (parseInt(extra.count) || 0), 0);
  };

  const getGrandTotal = () => {
    const blocksTotal = blocks.reduce((sum, block) => sum + getBlockTotal(block), 0);
    return blocksTotal + getExtrasTotal();
  };

  const getTotalCapacity = () => {
    return blocks.reduce((sum, block) => sum + getBlockCapacity(block), 0);
  };

  // --- Handlers: Setup ---
  const addBlock = () => {
    if (!newBlock.name || !newBlock.rows || !newBlock.seatsPerRow) return;
    
    const rows = parseInt(newBlock.rows);
    const id = Date.now();
    
    setBlocks([
      ...blocks, 
      { 
        id, 
        name: newBlock.name, 
        rows: rows, 
        seatsPerRow: parseInt(newBlock.seatsPerRow),
        // Initialize counts array with 0s
        counts: Array(rows).fill(0) 
      }
    ]);
    setNewBlock({ name: '', rows: '', seatsPerRow: '' });
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const addExtra = () => {
    if (!newExtra.name) return;
    setExtras([...extras, { id: Date.now(), name: newExtra.name, count: 0 }]);
    setNewExtra({ name: '' });
  };

  const removeExtra = (id) => {
    setExtras(extras.filter(e => e.id !== id));
  };

  const clearAllCounts = () => {
    if (window.confirm("Are you sure you want to reset all counts to zero? Setup will remain.")) {
      const resetBlocks = blocks.map(b => ({ ...b, counts: Array(b.rows).fill(0) }));
      const resetExtras = extras.map(e => ({ ...e, count: 0 }));
      setBlocks(resetBlocks);
      setExtras(resetExtras);
    }
  };

  const resetEntireApp = () => {
    if (window.confirm("This will delete all configurations and data. Continue?")) {
      setBlocks([]);
      setExtras([]);
      setMode('setup');
      localStorage.clear();
    }
  };

  // --- Handlers: Counting ---
  const updateBlockCount = (blockId, rowIndex, value) => {
    const val = value === '' ? 0 : parseInt(value);
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        const newCounts = [...b.counts];
        newCounts[rowIndex] = Math.max(0, val); // Prevent negative
        return { ...b, counts: newCounts };
      }
      return b;
    }));
  };

  const updateExtraCount = (extraId, value) => {
    const val = value === '' ? 0 : parseInt(value);
    setExtras(extras.map(e => {
      if (e.id === extraId) {
        return { ...e, count: Math.max(0, val) };
      }
      return e;
    }));
  };

  // --- Render Functions ---

  const renderSetupView = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <LayoutGrid className="w-5 h-5 mr-2 text-indigo-600" />
          Define Seating Blocks
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Block Name (e.g., Balcony Left)"
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newBlock.name}
            onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
          />
          <input
            type="number"
            placeholder="Rows"
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newBlock.rows}
            onChange={(e) => setNewBlock({...newBlock, rows: e.target.value})}
          />
          <input
            type="number"
            placeholder="Seats per Row"
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newBlock.seatsPerRow}
            onChange={(e) => setNewBlock({...newBlock, seatsPerRow: e.target.value})}
          />
          <button 
            onClick={addBlock}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} /> Add Block
          </button>
        </div>

        {blocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map(block => (
              <div key={block.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center group">
                <div>
                  <h3 className="font-bold text-slate-700">{block.name}</h3>
                  <p className="text-sm text-slate-500">{block.rows} rows × {block.seatsPerRow} seats</p>
                  <p className="text-xs text-indigo-500 mt-1 font-medium">Capacity: {getBlockCapacity(block)}</p>
                </div>
                <button 
                  onClick={() => removeBlock(block.id)}
                  className="text-slate-400 hover:text-red-500 transition p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
            No blocks defined yet.
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-emerald-600" />
          Define Other Areas
        </h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Area Name (e.g., Stage, Sound Booth)"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={newExtra.name}
            onChange={(e) => setNewExtra({...newExtra, name: e.target.value})}
          />
          <button 
            onClick={addExtra}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-medium"
          >
            <Plus size={18} /> Add Area
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {extras.map(extra => (
            <div key={extra.id} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between items-center">
              <span className="font-medium text-emerald-900">{extra.name}</span>
              <button 
                onClick={() => removeExtra(extra.id)}
                className="text-emerald-400 hover:text-red-500 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={() => setMode('counting')}
          disabled={blocks.length === 0 && extras.length === 0}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition shadow-lg flex items-center gap-2 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Counting <ChevronRight />
        </button>
      </div>
    </div>
  );

  const renderCountingView = () => {
    const totalCount = getGrandTotal();
    const capacity = getTotalCapacity();
    const percentage = capacity > 0 ? Math.round((totalCount / capacity) * 100) : 0;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Dashboard Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Attendance</h2>
            <div className="text-5xl font-bold font-mono tracking-tight">{totalCount.toLocaleString()}</div>
            {capacity > 0 && (
              <div className="text-slate-400 text-sm mt-2">
                Capacity: {capacity.toLocaleString()} ({percentage}% full)
              </div>
            )}
          </div>
          <div className="flex gap-3">
             <button 
              onClick={clearAllCounts}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset Counts
            </button>
            <button 
              onClick={() => setMode('setup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <Settings size={16} /> Edit Setup
            </button>
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {blocks.map(block => {
            const blockTotal = getBlockTotal(block);
            const blockCap = getBlockCapacity(block);
            const isFull = blockTotal >= blockCap;

            return (
              <div key={block.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Armchair size={18} className="text-indigo-600" />
                      {block.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                       {block.rows} Rows • Max {block.seatsPerRow}/row
                    </div>
                  </div>
                  <div className={`text-xl font-mono font-bold ${isFull ? 'text-red-600' : 'text-slate-700'}`}>
                    {blockTotal}
                    <span className="text-xs text-slate-400 ml-1 font-sans">/ {blockCap}</span>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto max-h-[400px] flex-1 custom-scrollbar">
                  <div className="space-y-3">
                    {block.counts.map((count, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-slate-400 uppercase tracking-wide">Row {idx + 1}</span>
                        <div className="flex-1 relative">
                          <input 
                            type="number" 
                            min="0"
                            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={count || ''} // Show empty string if 0 for cleaner UI, or keep 0
                            placeholder="0"
                            onChange={(e) => updateBlockCount(block.id, idx, e.target.value)}
                          />
                          {parseInt(count) > block.seatsPerRow && (
                            <span className="absolute right-3 top-2.5 text-xs text-amber-500 font-bold">Overcap</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Extra Areas Card */}
          {extras.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit">
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <Users size={18} className="text-emerald-600" />
                  Other Areas
                </h3>
                <div className="text-xl font-mono font-bold text-emerald-800">
                  {getExtrasTotal()}
                </div>
              </div>
              <div className="p-6 space-y-4">
                {extras.map(extra => (
                  <div key={extra.id} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-slate-600 flex-1">{extra.name}</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-24 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-right"
                      value={extra.count || ''}
                      placeholder="0"
                      onChange={(e) => updateExtraCount(extra.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* App Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Calculator size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Auditorium Counter</h1>
          </div>
          
          {mode === 'setup' && (
             <button 
             onClick={resetEntireApp}
             className="text-xs text-red-400 hover:text-red-600 font-medium underline px-2"
           >
             Clear All Data
           </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {mode === 'setup' ? renderSetupView() : renderCountingView()}
      </main>
    </div>
  );
}