import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Save, Settings, Users, LayoutGrid, RotateCcw, 
  ChevronRight, ChevronDown, Calculator, Armchair, FolderOpen, X, Calendar, 
  Check, FileBox, Download, Lock, Unlock, LogOut, Shield, 
  KeyRound, User, UserCog, Play, Power, Building2, Loader2, Wifi,
  UserPlus, ArrowLeft, MousePointerClick, Eye, List, PlusCircle, Pencil, XCircle,
  FileDown
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
// Ensure you have installed: npm install firebase
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  setDoc
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCI2WUsO5X5yPu80FCx6sY0bxEM9mwhyWs",
  authDomain: "auditoriumcounter.firebaseapp.com",
  projectId: "auditoriumcounter",
  storageBucket: "auditoriumcounter.firebasestorage.app",
  messagingSenderId: "520683229850",
  appId: "1:520683229850:web:9137ecbe5df093b85e4523"
};

// Initialize Firebase (Singleton pattern to prevent re-init)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPER HOOK FOR DEBOUNCING FIRESTORE WRITES ---
const useDebounceWrite = (fn, delay) => {
  const timeoutRef = useRef(null);
  return (...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// --- LOGIN VIEW ---
const LoginView = ({ 
  emailInput, setEmailInput, 
  passwordInput, setPasswordInput,
  orgInput, setOrgInput, 
  passcodeInput, setPasscodeInput,
  handleAdminLogin, handleAdminRegister, handleCounterLogin, 
  loading, error 
}) => {
  const [activeTab, setActiveTab] = useState('counter'); 
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calculator className="text-white" size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Auditorium Counter</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Cloud Sync Enabled <Wifi size={12} className="inline ml-1"/></p>
        </div>
        
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => { setActiveTab('counter'); }}
            className={`flex-1 py-4 text-xs sm:text-sm font-medium transition ${activeTab === 'counter' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Counter Login
          </button>
          <button 
            onClick={() => { setActiveTab('admin'); setIsRegistering(false); }}
            className={`flex-1 py-4 text-xs sm:text-sm font-medium transition ${activeTab === 'admin' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Admin Login
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center">
            {activeTab === 'counter' ? (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <User size={32} className="text-emerald-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                {isRegistering ? <UserPlus size={32} className="text-slate-700" /> : <UserCog size={32} className="text-slate-700" />}
              </div>
            )}
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === 'counter' ? 'Staff Entry' : (isRegistering ? 'Create Admin Account' : 'Administrator Entry')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'counter' ? 'Enter Event details' : (isRegistering ? 'Register to manage events' : 'Log in with your admin account')}
            </p>
          </div>

          <div className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
            
            {activeTab === 'counter' ? (
              <>
                <input 
                  type="text"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  placeholder="Organization Name"
                  value={orgInput}
                  onChange={(e) => setOrgInput(e.target.value)}
                />
                 <input 
                  type="text"
                  inputMode="numeric"
                  className="w-full text-center text-lg sm:text-xl tracking-widest py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="Passcode"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCounterLogin()}
                />
                 <button 
                  onClick={handleCounterLogin}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><KeyRound size={18} /> Join Event</>}
                </button>
              </>
            ) : (
              <>
                <input 
                  type="email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  placeholder="Admin Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <input 
                  type="password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (isRegistering ? handleAdminRegister() : handleAdminLogin())}
                />
                 <button 
                  onClick={isRegistering ? handleAdminRegister : handleAdminLogin}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? <><UserPlus size={18} /> Create Account</> : <><KeyRound size={18} /> Admin Login</>)}
                </button>
                
                <div className="text-center pt-2">
                  <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                  >
                    {isRegistering ? "Already have an account? Log in" : "Need an account? Create one"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // Auth State
  const [user, setUser] = useState(null); // Firebase User Object
  const [role, setRole] = useState(null); // 'admin' | 'counter'
  const [loading, setLoading] = useState(true);
  
  // App Data State (Synced from Firestore)
  const [adminSettings, setAdminSettings] = useState({ orgName: 'My Organization' });
  const [blocks, setBlocks] = useState([]);
  const [extras, setExtras] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  
  // Admin Dashboard State
  const [adminEvents, setAdminEvents] = useState([]); 
  const [adminView, setAdminView] = useState('list'); // 'list' | 'setup' | 'monitor'

  // Saved Lists
  const [savedLayouts, setSavedLayouts] = useState([]);

  // Template Editing State
  const [editingLayoutId, setEditingLayoutId] = useState(null);

  // Block Editing State (For Setup View)
  const [editingBlockId, setEditingBlockId] = useState(null);

  // Counter Flow State
  const [availableEvents, setAvailableEvents] = useState([]); 
  const [counterStep, setCounterStep] = useState('login'); 
  const [selectedBlockId, setSelectedBlockId] = useState(null); 

  // UI State: Expansion Logic
  const [expandedBlockIds, setExpandedBlockIds] = useState(new Set());

  // UI State: General
  const [loginError, setLoginError] = useState('');
  
  // Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginOrg, setLoginOrg] = useState('');
  const [loginCode, setLoginCode] = useState('');

  // Setup Inputs
  const [newBlock, setNewBlock] = useState({ name: '', rows: '', seatsPerRow: '' });
  const [newExtra, setNewExtra] = useState({ name: '' });
  
  // Admin Start Session Inputs
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [sessionPasscodeInput, setSessionPasscodeInput] = useState('');

  // Modals
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [layoutNameInput, setLayoutNameInput] = useState('');
  const [newOrgName, setNewOrgName] = useState('');

  // --- REUSABLE FETCH FUNCTION FOR COUNTERS ---
  const fetchCounterEvents = async (org, code) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'events'), 
        where('orgName', '==', org), 
        where('passcode', '==', code),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const foundEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableEvents(foundEvents);
        setCounterStep('select_event');
        // Reset specific selections to force fresh choice
        setActiveSession(null);
        setSelectedBlockId(null);
      } else {
        // If we can't find events, credentials might be stale or event ended.
        // Log them out to prevent stuck blank screen.
        await signOut(auth);
      }
    } catch (err) {
      console.error("Failed to fetch events on refresh:", err);
      // await signOut(auth); // Optional: stay logged in but show error? 
    }
    setLoading(false);
  };

  // --- PERSISTENCE & RESTORATION (Standard) ---
  useEffect(() => {
    // Restore persistent state on load (Only Admin/Setup related)
    const savedBlocks = localStorage.getItem('auditorium_blocks');
    const savedExtras = localStorage.getItem('auditorium_extras');
    const savedHistory = localStorage.getItem('auditorium_saves');
    const savedLayoutTemplates = localStorage.getItem('auditorium_layouts');
    
    // Auth Persistence (Admin only mostly, Counter handled via login flow)
    const savedAdminPin = localStorage.getItem('auditorium_admin_pin');

    if (savedBlocks) setBlocks(JSON.parse(savedBlocks));
    if (savedExtras) setExtras(JSON.parse(savedExtras));
    if (savedHistory) setSavedEvents(JSON.parse(savedHistory));
    if (savedLayoutTemplates) setSavedLayouts(JSON.parse(savedLayoutTemplates));
    
  }, []);

  // Save state on change (Admin/Setup Only)
  useEffect(() => {
    // We only persist these for the "Draft" setup view. 
    // Live data is in Firestore.
    localStorage.setItem('auditorium_blocks', JSON.stringify(blocks));
    localStorage.setItem('auditorium_extras', JSON.stringify(extras));
  }, [blocks, extras]);


  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        if (!currentUser.isAnonymous) {
          // ADMIN
          setRole('admin');
          setAdminView('list');
        } else {
          // COUNTER
          setRole('counter');
          
          // Check for saved credentials to restore session
          const savedCreds = localStorage.getItem('auditorium_counter_creds');
          if (savedCreds) {
            const { org, code } = JSON.parse(savedCreds);
            // Refresh: Re-fetch active events and go to list
            await fetchCounterEvents(org, code);
          } else {
            // No saved creds? Shouldn't happen if they logged in properly, 
            // but if so, logout to be safe.
            signOut(auth);
          }
        }
      } else {
        // LOGGED OUT
        setUser(null);
        setRole(null);
        setActiveSession(null);
        setBlocks([]);
        setExtras([]);
        setCounterStep('login');
        setAdminEvents([]);
        setAvailableEvents([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA LISTENERS ---
  useEffect(() => {
    if (role === 'admin' && user) {
      const qLayouts = query(collection(db, 'layouts'), where('adminId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubLayouts = onSnapshot(qLayouts, (snapshot) => {
        setSavedLayouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      const qEvents = query(collection(db, 'events'), where('adminId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubEvents = onSnapshot(qEvents, (snapshot) => {
        setAdminEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => { unsubLayouts(); unsubEvents(); };
    }
  }, [role, user]);

  useEffect(() => {
    if (role === 'admin' && user) {
      const unsub = onSnapshot(doc(db, 'settings', user.uid), (doc) => {
        if (doc.exists()) {
          setAdminSettings(doc.data());
        } else {
          setDoc(doc.ref, { orgName: 'My Organization' }, { merge: true }).catch(() => {});
        }
      });
      return () => unsub();
    }
  }, [role, user]);

  useEffect(() => {
    let unsub;
    const targetEventId = (role === 'counter' ? activeSession?.id : (adminView === 'monitor' ? activeSession?.id : null));

    if (targetEventId) {
      unsub = onSnapshot(doc(db, 'events', targetEventId), (doc) => {
        if (doc.exists()) {
          const event = { id: doc.id, ...doc.data() };
          setActiveSession(event);
          setBlocks(event.blocks || []);
          setExtras(event.extras || []);
          
          if (role === 'counter' && event.status !== 'active') {
            alert("The event has ended.");
            auth.signOut();
          }
        } else {
          if (role === 'counter') {
            alert("Event deleted.");
            auth.signOut();
          } else {
            setAdminView('list');
          }
        }
      });
    }

    return () => { if (unsub) unsub(); };
  }, [role, user, activeSession?.id, adminView]); 


  // --- ACTIONS: AUTH ---
  const handleAdminLogin = async () => {
    setLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
    } catch (err) {
      setLoginError("Login failed: " + err.message);
      setLoading(false);
    }
  };

  const handleAdminRegister = async () => {
    setLoading(true);
    setLoginError('');
    try {
      await createUserWithEmailAndPassword(auth, loginEmail, loginPass);
    } catch (err) {
      setLoginError("Registration failed: " + err.message);
      setLoading(false);
    }
  };

  const handleCounterLogin = async () => {
    setLoading(true);
    setLoginError('');
    try {
      // 1. Sign In
      await signInAnonymously(auth);
      
      // 2. Save Credentials for Refresh
      localStorage.setItem('auditorium_counter_creds', JSON.stringify({ org: loginOrg, code: loginCode }));

      // 3. Fetch Events
      await fetchCounterEvents(loginOrg, loginCode);

    } catch (err) {
      setLoginError(err.message);
      setLoading(false);
      if (auth.currentUser && !user) signOut(auth);
    }
  };

  const handleCounterSelectEvent = (event) => {
    setActiveSession(event); 
    setCounterStep('select_block');
  };

  const handleCounterSelectBlock = (blockId) => {
    setSelectedBlockId(blockId);
    setCounterStep('counting');
  };

  const handleLogout = () => {
    signOut(auth);
    setCounterStep('login');
    setActiveSession(null);
    setAdminView('list');
    setEditingLayoutId(null);
    setEditingBlockId(null);
    setAvailableEvents([]);
    // Clear counter creds on explicit logout
    localStorage.removeItem('auditorium_counter_creds');
  };

  // --- ACTIONS: ADMIN EVENTS LIST ---
  const handleAdminMonitorEvent = (event) => {
    setActiveSession(event);
    setAdminView('monitor');
  };

  const handleAdminToggleStatus = async (e, event) => {
    e.stopPropagation();
    const newStatus = event.status === 'active' ? 'completed' : 'active';
    const confirmMsg = event.status === 'active' 
      ? "End this event? Counters will be disconnected." 
      : "Re-activate this event?";
    
    if (window.confirm(confirmMsg)) {
      await updateDoc(doc(db, 'events', event.id), { status: newStatus });
    }
  };

  const handleAdminToggleLock = async (e, event) => {
    e.stopPropagation();
    await updateDoc(doc(db, 'events', event.id), { isLocked: !event.isLocked });
  };

  const handleAdminDeleteEvent = async (e, eventId) => {
    e.stopPropagation();
    if (window.confirm("Permanently delete this event record?")) {
      await deleteDoc(doc(db, 'events', eventId));
    }
  };

  const handleExportCSV = (e, event) => {
    e.stopPropagation();
    
    // Construct CSV Data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Metadata Header
    csvContent += `Event Name,${event.name}\n`;
    csvContent += `Date,${event.createdAt ? new Date(event.createdAt.seconds * 1000).toLocaleString() : 'N/A'}\n`;
    csvContent += `Organization,${event.orgName}\n\n`;
    
    // Table Headers
    csvContent += "Section Type,Block Name,Row/Area Name,Count,Capacity\n";
    
    // Blocks Data
    event.blocks.forEach(block => {
      block.counts.forEach((count, idx) => {
        csvContent += `Block,${block.name},Row ${idx + 1},${count},${block.seatsPerRow}\n`;
      });
    });
    
    // Extras Data
    event.extras.forEach(extra => {
      csvContent += `Extra Area,N/A,${extra.name},${extra.count || 0},N/A\n`;
    });
    
    // Total
    const totalCount = event.blocks.reduce((sum, b) => sum + (b.counts?.reduce((s, v) => s + (parseInt(v)||0), 0) || 0), 0) 
                     + (event.extras?.reduce((s, e) => s + (parseInt(e.count)||0), 0) || 0);
    const totalCap = event.blocks.reduce((sum, b) => sum + (b.rows * b.seatsPerRow), 0);
    
    csvContent += `\nTOTAL,,${totalCount},${totalCap}`;

    // Download Logic
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.name.replace(/\s+/g, '_')}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACTIONS: ADMIN SETUP & CREATE ---
  const addBlock = () => {
    if (!newBlock.name || !newBlock.rows || !newBlock.seatsPerRow) return;
    const rows = parseInt(newBlock.rows);
    const id = Date.now();
    setBlocks([...blocks, { 
      id, name: newBlock.name, rows, seatsPerRow: parseInt(newBlock.seatsPerRow),
      counts: Array(rows).fill(0) 
    }]);
    setNewBlock({ name: '', rows: '', seatsPerRow: '' });
  };

  const removeBlock = (id) => setBlocks(blocks.filter(b => b.id !== id));

  // Edit Block Actions
  const handleEditBlock = (block) => {
    setNewBlock({ name: block.name, rows: block.rows, seatsPerRow: block.seatsPerRow });
    setEditingBlockId(block.id);
  };

  const handleUpdateBlock = () => {
    if (!newBlock.name || !newBlock.rows || !newBlock.seatsPerRow) return;
    
    const updatedRows = parseInt(newBlock.rows);
    const updatedSeats = parseInt(newBlock.seatsPerRow);

    setBlocks(blocks.map(b => {
      if (b.id === editingBlockId) {
        // Resize counts array if rows changed, preserving existing counts where possible
        let newCounts = [...(b.counts || [])];
        if (updatedRows > b.rows) {
           // Add zeros for new rows
           const diff = updatedRows - b.rows;
           newCounts = [...newCounts, ...Array(diff).fill(0)];
        } else if (updatedRows < b.rows) {
           // Trim extra rows
           newCounts = newCounts.slice(0, updatedRows);
        }
        
        return {
          ...b,
          name: newBlock.name,
          rows: updatedRows,
          seatsPerRow: updatedSeats,
          counts: newCounts
        };
      }
      return b;
    }));

    setEditingBlockId(null);
    setNewBlock({ name: '', rows: '', seatsPerRow: '' });
  };

  const handleCancelBlockEdit = () => {
    setEditingBlockId(null);
    setNewBlock({ name: '', rows: '', seatsPerRow: '' });
  };
  
  const addExtra = () => {
    if (!newExtra.name) return;
    setExtras([...extras, { id: Date.now(), name: newExtra.name, count: 0 }]);
    setNewExtra({ name: '' });
  };

  const removeExtra = (id) => setExtras(extras.filter(e => e.id !== id));

  const handleCreateEvent = async () => {
    if (!sessionNameInput || !sessionPasscodeInput) return;
    
    try {
      const newEvent = {
        adminId: user.uid,
        orgName: adminSettings.orgName,
        name: sessionNameInput,
        passcode: sessionPasscodeInput,
        status: 'active',
        isLocked: false,
        createdAt: serverTimestamp(),
        blocks: blocks, 
        extras: extras
      };

      await addDoc(collection(db, 'events'), newEvent);
      setIsStartSessionModalOpen(false);
      setSessionNameInput('');
      setSessionPasscodeInput('');
      setAdminView('list');
      
    } catch (e) {
      alert("Error starting event: " + e.message);
    }
  };

  // --- ACTIONS: COUNTING ---
  const debouncedUpdateBlock = useDebounceWrite(async (eventId, newBlocks) => {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, { blocks: newBlocks });
  }, 500);

  const updateBlockCount = (blockId, rowIndex, value) => {
    if (activeSession?.isLocked) return;
    
    const val = value === '' ? 0 : parseInt(value);
    const newBlocks = blocks.map(b => {
      if (b.id === blockId) {
        const newCounts = [...b.counts];
        newCounts[rowIndex] = Math.max(0, val);
        return { ...b, counts: newCounts };
      }
      return b;
    });
    setBlocks(newBlocks);

    if (activeSession) {
      debouncedUpdateBlock(activeSession.id, newBlocks);
    }
  };

  const debouncedUpdateExtras = useDebounceWrite(async (eventId, newExtras) => {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, { extras: newExtras });
  }, 500);

  const updateExtraCount = (extraId, value) => {
    if (activeSession?.isLocked) return;

    const val = value === '' ? 0 : parseInt(value);
    const newExtras = extras.map(e => {
      if (e.id === extraId) {
        return { ...e, count: Math.max(0, val) };
      }
      return e;
    });
    setExtras(newExtras);

    if (activeSession) {
      debouncedUpdateExtras(activeSession.id, newExtras);
    }
  };

  // --- ACTIONS: EXPANSION TOGGLE ---
  const toggleBlockExpansion = (blockId) => {
    const newSet = new Set(expandedBlockIds);
    if (newSet.has(blockId)) newSet.delete(blockId);
    else newSet.add(blockId);
    setExpandedBlockIds(newSet);
  };

  // --- ACTIONS: TEMPLATES & EDITING ---
  
  // Create New
  const handleSaveLayout = async () => {
    if (!layoutNameInput.trim()) return;
    const cleanBlocks = blocks.map(({ id, name, rows, seatsPerRow }) => ({ id, name, rows, seatsPerRow }));
    const cleanExtras = extras.map(({ id, name }) => ({ id, name }));
    
    try {
      await addDoc(collection(db, 'layouts'), {
        adminId: user.uid,
        name: layoutNameInput,
        createdAt: serverTimestamp(),
        blocks: cleanBlocks,
        extras: cleanExtras
      });
      setLayoutNameInput('');
      alert("Template saved.");
    } catch (e) {
      alert("Error saving template: " + e.message);
    }
  };

  // Update Existing
  const handleUpdateLayout = async () => {
    if (!editingLayoutId || !layoutNameInput.trim()) return;
    
    const cleanBlocks = blocks.map(({ id, name, rows, seatsPerRow }) => ({ id, name, rows, seatsPerRow }));
    const cleanExtras = extras.map(({ id, name }) => ({ id, name }));

    try {
      await setDoc(doc(db, 'layouts', editingLayoutId), {
        adminId: user.uid,
        name: layoutNameInput,
        updatedAt: serverTimestamp(),
        blocks: cleanBlocks,
        extras: cleanExtras
      }, { merge: true });
      
      alert("Template updated.");
      setEditingLayoutId(null);
      setLayoutNameInput('');
    } catch (e) {
      alert("Error updating: " + e.message);
    }
  };

  const handleEditLayout = (layout) => {
    setBlocks(layout.blocks);
    setExtras(layout.extras || []); // Ensure extras is array
    setLayoutNameInput(layout.name);
    setEditingLayoutId(layout.id);
    setIsLayoutModalOpen(false); // Close modal to start editing in Setup View
  };

  const handleCancelEdit = () => {
    if (window.confirm("Stop editing? Unsaved changes will be lost.")) {
      setEditingLayoutId(null);
      setLayoutNameInput('');
      setBlocks([]);
      setExtras([]);
    }
  };

  const handleLoadLayout = (layout) => {
    const newBlocks = layout.blocks.map(b => ({
      ...b, id: Date.now() + Math.random(), counts: Array(b.rows).fill(0)
    }));
    const newExtras = (layout.extras || []).map(e => ({
      ...e, id: Date.now() + Math.random(), count: 0
    }));
    setBlocks(newBlocks);
    setExtras(newExtras);
    setIsLayoutModalOpen(false);
  };

  const handleDeleteLayout = async (id) => {
    if (window.confirm("Delete this template?")) {
      await deleteDoc(doc(db, 'layouts', id));
    }
  };

  const handleUpdateSecurity = async () => {
    if (newOrgName.trim()) {
      try {
        const settingsRef = doc(db, 'settings', user.uid);
        await updateDoc(settingsRef, { orgName: newOrgName });
        alert("Organization Name updated.");
        setIsSecurityModalOpen(false);
      } catch (e) {
        alert("Failed to update: " + e.message);
      }
    }
  };

  // --- HELPERS ---
  const getBlockTotal = (block) => block.counts?.reduce((sum, val) => sum + (parseInt(val) || 0), 0) || 0;
  const getBlockCapacity = (block) => block.rows * block.seatsPerRow;
  const getExtrasTotal = () => extras.reduce((sum, extra) => sum + (parseInt(extra.count) || 0), 0);
  const getGrandTotal = () => blocks.reduce((sum, block) => sum + getBlockTotal(block), 0) + getExtrasTotal();
  const getTotalCapacity = () => blocks.reduce((sum, block) => sum + getBlockCapacity(block), 0);

  // New Helper for Health Colors
  const getHealthColor = (total, capacity) => {
    if (capacity === 0) return 'border-slate-200 shadow-sm hover:border-indigo-500'; // Default if no capacity
    
    const percent = (total / capacity) * 100;
    
    if (percent < 25) return 'border-red-400 bg-red-50 text-red-900 shadow-sm';
    if (percent <= 50) return 'border-yellow-400 bg-yellow-50 text-yellow-900 shadow-sm';
    if (percent <= 80) return 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm';
    return 'border-green-600 bg-green-100 text-green-900 shadow-md ring-1 ring-green-500'; // Deep green > 80
  };

  // --- VIEW RENDERING ---

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-indigo-600"><Loader2 className="animate-spin" size={48} /></div>;
  }

  // --- 1. ADMIN: EVENTS LIST VIEW ---
  const renderAdminEventsList = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Manage Events</h2>
          <p className="text-xs sm:text-sm text-slate-500">View and control all your counting sessions.</p>
        </div>
        <button 
          onClick={() => { setAdminView('setup'); setBlocks([]); setExtras([]); setEditingLayoutId(null); setLayoutNameInput(''); }} 
          className="bg-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium shadow-sm text-sm sm:text-base"
        >
          <PlusCircle size={20} /> <span className="hidden sm:inline">Create New Event</span><span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {adminEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-20" />
            <p>No events found. Create your first event to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {adminEvents.map(event => {
              const rowTotal = event.blocks.reduce((sum, b) => sum + (b.counts?.reduce((s, v) => s + (parseInt(v)||0), 0) || 0), 0) 
                             + (event.extras?.reduce((s, e) => s + (parseInt(e.count)||0), 0) || 0);
              
              return (
                <div 
                  key={event.id} 
                  onClick={() => handleAdminMonitorEvent(event)}
                  className="p-6 hover:bg-slate-50 transition cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-indigo-600 transition">{event.name}</h3>
                      {event.status === 'active' ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Completed</span>
                      )}
                      {event.isLocked && <Lock size={14} className="text-red-400" />}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span>Code: <span className="bg-slate-100 px-1 rounded text-slate-700 font-bold">{event.passcode}</span></span>
                      <span>•</span>
                      <span>Created: {event.createdAt ? new Date(event.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right block">
                      <div className="text-xl sm:text-2xl font-mono font-bold text-slate-700">{rowTotal}</div>
                      <div className="text-xs text-slate-400">Total Count</div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => handleExportCSV(e, event)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Export to CSV"
                      >
                        <FileDown size={18} />
                      </button>

                      <button 
                        onClick={(e) => handleAdminToggleLock(e, event)}
                        className={`p-2 rounded-lg border transition ${event.isLocked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
                        title={event.isLocked ? "Unlock Event" : "Lock Event"}
                      >
                        {event.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      
                      <button 
                        onClick={(e) => handleAdminToggleStatus(e, event)}
                        className={`p-2 rounded-lg border transition ${event.status === 'active' ? 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50' : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600'}`}
                        title={event.status === 'active' ? "End Event" : "Re-activate Event"}
                      >
                        {event.status === 'active' ? <Power size={18} /> : <Play size={18} />}
                      </button>

                      <button 
                        onClick={(e) => handleAdminDeleteEvent(e, event.id)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Event"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <button 
                        onClick={() => handleAdminMonitorEvent(event)}
                        className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg font-medium text-sm hover:bg-indigo-100 transition flex items-center gap-2"
                      >
                        <Eye size={18} /> <span className="hidden sm:inline">Open</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // --- 2. ADMIN: SETUP VIEW (Create New) ---
  const renderSetupView = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Header: Edit Mode vs Create Mode */}
      {editingLayoutId ? (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Pencil className="text-amber-600" size={24} />
            <div>
              <h2 className="text-lg font-bold text-amber-900">Editing Template: {layoutNameInput}</h2>
              <p className="text-sm text-amber-700">Modify blocks below and save updates.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleCancelEdit} 
              className="flex-1 sm:flex-none justify-center bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium shadow-sm flex items-center gap-2"
            >
              <XCircle size={18} /> Cancel
            </button>
            <button 
              onClick={() => setIsLayoutModalOpen(true)} // Open modal to confirm/save
              className="flex-1 sm:flex-none justify-center bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition font-medium shadow-sm flex items-center gap-2"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAdminView('list')} 
              className="p-2 bg-white rounded-lg text-indigo-600 hover:bg-indigo-50"
            >
              <ArrowLeft size={20}/>
            </button>
            <div>
              <h2 className="text-lg font-bold text-indigo-900">New Event Layout</h2>
              <p className="text-sm text-indigo-600">Design the seating structure.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsLayoutModalOpen(true)} 
              className="bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-100 transition flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              <FileBox size={18}/> Templates
            </button>
            <button 
              onClick={() => setIsStartSessionModalOpen(true)} 
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              <Play size={18} fill="currentColor" /> Start Event
            </button>
          </div>
        </div>
      )}

      {/* Block Setup Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 flex items-center"><LayoutGrid className="w-5 h-5 mr-2 text-indigo-600" /> Define Seating Blocks</h2>
        
        {/* Dynamic Input Form (Add vs Update) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Block Name" 
            className={`border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 ${editingBlockId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-300'}`} 
            value={newBlock.name} 
            onChange={(e) => setNewBlock({...newBlock, name: e.target.value})} 
          />
          <input 
            type="number" 
            placeholder="Rows" 
            className={`border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 ${editingBlockId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-300'}`}
            value={newBlock.rows} 
            onChange={(e) => setNewBlock({...newBlock, rows: e.target.value})} 
          />
          <input 
            type="number" 
            placeholder="Seats per Row" 
            className={`border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 ${editingBlockId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-300'}`}
            value={newBlock.seatsPerRow} 
            onChange={(e) => setNewBlock({...newBlock, seatsPerRow: e.target.value})} 
          />
          
          {editingBlockId ? (
            <div className="flex gap-2">
              <button onClick={handleUpdateBlock} className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center justify-center gap-2">Update</button>
              <button onClick={handleCancelBlockEdit} className="bg-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-300 transition"><X size={18}/></button>
            </div>
          ) : (
            <button onClick={addBlock} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"><Plus size={18} /> Add</button>
          )}
        </div>

        {blocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{blocks.map(b => (
            <div key={b.id} className={`bg-white p-4 rounded-lg border flex justify-between items-center ${editingBlockId === b.id ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  {b.name}
                  {editingBlockId === b.id && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Editing</span>}
                </h3>
                <p className="text-sm text-slate-500">{b.rows}x{b.seatsPerRow}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditBlock(b)} disabled={!!editingBlockId && editingBlockId !== b.id} className="text-slate-400 hover:text-amber-600 disabled:opacity-30"><Pencil size={18} /></button>
                <button onClick={() => removeBlock(b.id)} disabled={!!editingBlockId} className="text-slate-400 hover:text-red-500 disabled:opacity-30"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}</div>
        ) : <div className="text-center py-8 text-slate-400 border border-dashed rounded-lg">No blocks defined.</div>}
      </div>

      {/* Extras Setup Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 w-full">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-emerald-600" /> Define Other Areas
        </h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Area Name"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            value={newExtra.name}
            onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
          />
          <button
            onClick={addExtra}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 md:w-auto w-full"
          >
            <Plus size={18} /> Add
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {extras.map(e => (
            <div key={e.id} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between">
              <span className="font-medium text-emerald-900">{e.name}</span>
              <button onClick={() => removeExtra(e.id)} className="text-emerald-400 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- 3. ADMIN: COUNTING/MONITOR VIEW ---
  const renderCountingView = () => {
    const totalCount = getGrandTotal();
    const capacity = getTotalCapacity();
    const percentage = capacity > 0 ? Math.round((totalCount / capacity) * 100) : 0;
    const isLocked = activeSession?.isLocked;

    return (
      <div className="space-y-6 animate-fade-in">
        {role === 'admin' && (
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setAdminView('list')} className="p-2 bg-white rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"><ArrowLeft size={20}/></button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">{activeSession?.name}</h2>
              <p className="text-xs text-slate-500">Monitoring Mode</p>
            </div>
          </div>
        )}

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">Total Attendance {isLocked && <Lock size={14} className="text-red-400" />}</h2>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight">{totalCount.toLocaleString()}</div>
            {capacity > 0 && <div className="text-slate-400 text-xs sm:text-sm mt-2">Capacity: {capacity.toLocaleString()} ({percentage}% full)</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {blocks.map(block => {
            const isExpanded = expandedBlockIds.has(block.id);
            const bTotal = getBlockTotal(block);
            const bCap = getBlockCapacity(block);
            const statusColor = getHealthColor(bTotal, bCap);

            return (
              <div key={block.id} className={`rounded-xl border-2 overflow-hidden flex flex-col ${statusColor} ${statusColor.includes('bg-') ? '' : 'bg-white'}`}>
                <div 
                  className="px-6 py-4 border-b border-black/5 flex justify-between items-center cursor-pointer transition hover:brightness-95"
                  onClick={() => toggleBlockExpansion(block.id)}
                >
                  <div><h3 className="font-bold text-slate-800 flex items-center gap-2 text-base sm:text-lg"><Armchair size={18} className="text-indigo-600" />{block.name}</h3></div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg sm:text-xl font-mono font-bold text-slate-700">{bTotal} <span className="text-xs text-slate-400">/ {bCap}</span></div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4 overflow-y-auto max-h-[400px] flex-1 border-t border-black/5 animate-fade-in bg-white/50">
                    <div className="space-y-3">
                      {block.counts && block.counts.map((count, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-16 text-xs sm:text-sm font-bold text-slate-400 uppercase">Row {idx + 1}</span>
                          <input 
                            type="number" min="0" disabled={isLocked}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-base sm:text-lg"
                            value={count || ''} placeholder="0"
                            onChange={(e) => updateBlockCount(block.id, idx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {extras.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
              <div 
                className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center cursor-pointer hover:bg-emerald-100 transition"
                onClick={() => toggleBlockExpansion('extras')}
              >
                <h3 className="font-bold text-emerald-900 flex gap-2 text-base sm:text-lg"><Users size={18}/>Other Areas</h3>
                <div className="flex items-center gap-3">
                  <div className="text-lg sm:text-xl font-mono font-bold text-emerald-800">{getExtrasTotal()}</div>
                  <ChevronDown size={20} className={`text-emerald-700/50 transition-transform duration-200 ${expandedBlockIds.has('extras') ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {expandedBlockIds.has('extras') && (
                <div className="p-6 space-y-4 animate-fade-in">
                  {extras.map(e => (
                    <div key={e.id} className="flex justify-between gap-4 items-center">
                      <label className="text-sm font-medium text-slate-600 flex-1">{e.name}</label>
                      <input type="number" min="0" disabled={isLocked} className="w-24 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono text-right outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 text-base sm:text-lg" value={e.count || ''} placeholder="0" onChange={(evt) => updateExtraCount(e.id, evt.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- COUNTER VIEWS (UNCHANGED) ---
  const renderCounterEventSelect = () => (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Select Event</h2>
        <p className="text-sm text-slate-500">Found {availableEvents.length} active event(s)</p>
      </div>
      <div className="space-y-3">
        {availableEvents.map(event => (
          <button 
            key={event.id}
            onClick={() => handleCounterSelectEvent(event)}
            className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition flex items-center justify-between group"
          >
            <div className="text-left">
              <h3 className="font-bold text-slate-800">{event.name}</h3>
              <p className="text-xs text-slate-500">{new Date(event.createdAt?.seconds * 1000).toLocaleDateString()}</p>
            </div>
            <ChevronRight className="text-slate-400 group-hover:text-indigo-500" />
          </button>
        ))}
      </div>
      <button onClick={handleLogout} className="w-full py-3 text-slate-500 hover:text-slate-800 text-sm">Back to Login</button>
    </div>
  );

  const renderCounterBlockSelect = () => (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in p-4">
      {/* Total Count Header Added */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
            Total Attendance {activeSession?.isLocked && <Lock size={14} className="text-red-400" />}
          </h2>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight">{getGrandTotal().toLocaleString()}</div>
          {getTotalCapacity() > 0 && <div className="text-slate-400 text-xs sm:text-sm mt-2">Capacity: {getTotalCapacity().toLocaleString()} ({Math.round((getGrandTotal() / getTotalCapacity()) * 100)}% full)</div>}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setCounterStep('select_event')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Choose Section</h2>
          <p className="text-xs text-slate-500">{activeSession?.name}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {blocks.map(block => (
          <button 
            key={block.id}
            onClick={() => handleCounterSelectBlock(block.id)}
            className={`w-full bg-white p-4 rounded-xl border border-2 shadow-sm transition flex items-center justify-between group ${getHealthColor(getBlockTotal(block), getBlockCapacity(block))}`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/50 p-2 rounded-lg"><Armchair size={20} className="text-slate-700" /></div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800">{block.name}</h3>
                <p className="text-xs font-medium opacity-80">{getBlockTotal(block)} / {getBlockCapacity(block)} counted</p>
              </div>
            </div>
            <MousePointerClick className="text-slate-400 group-hover:text-slate-800" />
          </button>
        ))}

        {extras.length > 0 && (
          <button 
            onClick={() => handleCounterSelectBlock('extras')}
            className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><Users size={20} /></div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800">Other Areas</h3>
                <p className="text-xs text-slate-500">{getExtrasTotal()} counted</p>
              </div>
            </div>
            <MousePointerClick className="text-slate-300 group-hover:text-emerald-500" />
          </button>
        )}
      </div>
    </div>
  );

  const renderCounterFocusedView = () => {
    const isExtras = selectedBlockId === 'extras';
    const targetBlock = !isExtras ? blocks.find(b => b.id === selectedBlockId) : null;
    const isLocked = activeSession?.isLocked;

    if (!targetBlock && !isExtras) return <div>Block not found</div>;

    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCounterStep('select_block')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800"><ArrowLeft size={20} /></button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                {isExtras ? 'Other Areas' : targetBlock.name}
                {isLocked && <Lock size={16} className="text-red-500" />}
              </h2>
              <p className="text-xs text-slate-500">{activeSession?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800">
              {isExtras ? getExtrasTotal() : getBlockTotal(targetBlock)}
              {!isExtras && <span className="text-sm text-slate-400 font-normal ml-1">/ {getBlockCapacity(targetBlock)}</span>}
            </div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 space-y-4">
            {isExtras ? (
              extras.map(e => (
                <div key={e.id} className="flex justify-between gap-4 items-center">
                  <label className="text-base sm:text-lg font-medium text-slate-700 flex-1">{e.name}</label>
                  <input 
                    type="number" min="0" disabled={isLocked}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-lg sm:text-xl text-right outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" 
                    value={e.count || ''} placeholder="0" 
                    onChange={(evt) => updateExtraCount(e.id, evt.target.value)} 
                  />
                </div>
              ))
            ) : (
              targetBlock.counts.map((count, idx) => (
                <div key={idx} className="flex items-center gap-4 border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                  <span className="w-16 sm:w-20 text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wide">Row {idx + 1}</span>
                  <div className="flex-1 relative">
                    <input 
                      type="number" min="0" disabled={isLocked}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-lg sm:text-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 pr-16"
                      value={count || ''} placeholder="0"
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                        if (val <= targetBlock.seatsPerRow) {
                          updateBlockCount(targetBlock.id, idx, e.target.value);
                        }
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                      Max: {targetBlock.seatsPerRow}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ROUTER ---
  const renderContent = () => {
    if (role === 'admin') {
      if (adminView === 'setup') return renderSetupView();
      if (adminView === 'monitor') return renderCountingView();
      return renderAdminEventsList();
    }
    
    // Counter Flow
    if (counterStep === 'select_event') return renderCounterEventSelect();
    if (counterStep === 'select_block') return renderCounterBlockSelect();
    if (counterStep === 'counting') return renderCounterFocusedView();
    
    return null; 
  };

  // --- LOGIN CHECK ---
  if (!user && counterStep === 'login') {
    return (
      <LoginView 
        emailInput={loginEmail} setEmailInput={setLoginEmail}
        passwordInput={loginPass} setPasswordInput={setLoginPass}
        orgInput={loginOrg} setOrgInput={setLoginOrg}
        passcodeInput={loginCode} setPasscodeInput={setLoginCode}
        handleAdminLogin={handleAdminLogin}
        handleAdminRegister={handleAdminRegister} 
        handleCounterLogin={handleCounterLogin}
        loading={loading} error={loginError}
      />
    );
  }

  // --- HEADER & NAVIGATION ---
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Calculator size={20} /></div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 hidden sm:block">Auditorium Counter</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 font-medium">{role === 'admin' ? 'Administrator' : 'Counter Staff'}</p>
                {activeSession && role === 'counter' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{activeSession.name} ({activeSession.orgName})</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <>
                <button onClick={() => setAdminView('list')} className={`px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium shadow-sm ${adminView === 'list' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  <List size={18} /> <span className="hidden sm:inline">Events</span>
                </button>
                <button onClick={() => setIsSecurityModalOpen(true)} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium shadow-sm"><Shield size={18} /></button>
              </>
            )}
            
            <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-red-500 transition"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {renderContent()}
      </main>

      {/* --- MODALS --- */}
      
      {/* Start Session Modal */}
      {isStartSessionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50"><h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><Play size={20}/> Start Live Event</h3><button onClick={() => setIsStartSessionModalOpen(false)}><X size={20}/></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Name</label><input type="text" className="w-full border rounded-lg px-4 py-2" value={sessionNameInput} onChange={(e) => setSessionNameInput(e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Passcode</label><input type="text" className="w-full border rounded-lg px-4 py-2 font-mono" value={sessionPasscodeInput} onChange={(e) => setSessionPasscodeInput(e.target.value)} /></div>
              <button onClick={handleCreateEvent} className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700">Create & Start</button>
            </div>
          </div>
        </div>
      )}

      {/* Security/Org Settings Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Shield size={20} /> Settings</h3><button onClick={() => setIsSecurityModalOpen(false)}><X size={20} /></button></div>
             <div className="p-6 space-y-4">
               <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Organization Name</label><input type="text" className="w-full border rounded-lg px-4 py-2" placeholder={adminSettings.orgName} value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} /></div>
               <button onClick={handleUpdateSecurity} className="w-full py-3 rounded-lg bg-slate-900 text-white font-medium">Update</button>
             </div>
          </div>
        </div>
      )}

       {/* Layouts Modal (Template System) */}
       {isLayoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><FileBox size={20} /> Templates</h3><button onClick={() => setIsLayoutModalOpen(false)}><X size={20} /></button>
            </div>
            
            {/* Header / Save Area */}
            <div className="p-6 border-b border-slate-100 bg-white">
              {editingLayoutId ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Template Name" 
                    className="flex-1 border border-amber-300 ring-2 ring-amber-100 rounded-lg px-4 py-2" 
                    value={layoutNameInput} 
                    onChange={(e) => setLayoutNameInput(e.target.value)} 
                  />
                  <button onClick={handleUpdateLayout} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium">Update</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Template Name" 
                    className="flex-1 border rounded-lg px-4 py-2" 
                    value={layoutNameInput} 
                    onChange={(e) => setLayoutNameInput(e.target.value)} 
                  />
                  <button onClick={handleSaveLayout} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium">Save New</button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-3">
               {savedLayouts.length === 0 ? <div className="text-center py-8 text-slate-400">No templates found.</div> : savedLayouts.map(l => (
                 <div key={l.id} className={`bg-white p-4 rounded-xl border flex justify-between items-center ${editingLayoutId === l.id ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200'}`}>
                   <div>
                     <h5 className="font-bold flex items-center gap-2">
                       {l.name}
                       {editingLayoutId === l.id && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Editing</span>}
                     </h5>
                     <p className="text-xs text-slate-500">{l.blocks.length} Blocks</p>
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleLoadLayout(l)} 
                       className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium flex gap-1 hover:bg-indigo-100"
                       disabled={!!editingLayoutId}
                     >
                       <Download size={14}/> Load
                     </button>
                     <button 
                       onClick={() => handleEditLayout(l)} 
                       className="text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium flex gap-1 hover:bg-amber-100"
                     >
                       <Pencil size={14}/> Edit
                     </button>
                     <button 
                       onClick={() => handleDeleteLayout(l.id)} 
                       className="text-red-400 p-2 hover:bg-red-50 rounded-lg"
                     >
                       <Trash2 size={16}/>
                     </button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}