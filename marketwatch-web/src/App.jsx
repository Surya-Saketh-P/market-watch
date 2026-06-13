import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Activity, BrainCircuit, Globe, Loader2, Database, TrendingUp, Users, Target, Briefcase, Plus, X, Command, AlertTriangle, ShieldCheck, Download, Terminal, BarChart2, Lock, User, Key, ChevronRight, Home, Settings, Search, LogOut, ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import './index.css';

const CompanyLogo = ({ name, size = 24 }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!name) return;
    let isMounted = true;
    
    fetch(`http://localhost:8000/logo?name=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.url) setSrc(data.url);
      })
      .catch(() => {
        if (isMounted) {
          const normalized = name.toLowerCase().replace(/\s+/g, '') + '.com';
          setSrc(`https://logo.clearbit.com/${normalized}`);
        }
      });

    return () => { isMounted = false; };
  }, [name]);

  if (!src) return <div style={{width: size, height: size, borderRadius: '6px', border: '1px solid var(--panel-border)', backgroundColor: 'var(--panel-bg)'}} />;

  return (
    <img 
      src={src} 
      alt={name} 
      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=13151b&color=00e676&bold=true`}}
      style={{ width: size, height: size, borderRadius: '6px', border: '1px solid var(--panel-border)', objectFit: 'contain', backgroundColor: 'var(--panel-bg)' }}
    />
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [userCompany, setUserCompany] = useState('');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [welcomeInput, setWelcomeInput] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [compInput, setCompInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('strategy');
  
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem('marketwatch_isLoggedIn');
    if (savedAuth) setIsLoggedIn(true);

    const saved = localStorage.getItem('marketwatch_userCompany');
    if (saved) {
      setUserCompany(saved);
      setIsOnboarded(true);
    }
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!authEmail || !authPass) return;
    setAuthLoading(true);
    setTimeout(() => {
      localStorage.setItem('marketwatch_isLoggedIn', 'true');
      setIsLoggedIn(true);
      setAuthLoading(false);
    }, 1200);
  };

  const handleOnboard = (e) => {
    e.preventDefault();
    if (!welcomeInput.trim()) return;
    localStorage.setItem('marketwatch_userCompany', welcomeInput.trim());
    setUserCompany(welcomeInput.trim());
    setIsOnboarded(true);
  }

  const handleAddCompetitor = (e) => {
    e.preventDefault();
    if (!compInput.trim()) return;
    if (!competitors.includes(compInput.trim())) {
      setCompetitors([...competitors, compInput.trim()]);
    }
    setCompInput('');
  };

  const removeCompetitor = (comp) => {
    setCompetitors(competitors.filter(c => c !== comp));
  };

  const simulateLogs = () => {
    setLogs([]);
    const actions = [
      "INIT: Connecting to Live Search and REST APIs...",
      `API HIT: QuickCommerce API -> Fetching live ETA/Stock for ${competitors.join(', ')}...`,
      "DATABASE: Cross-referencing QuickCommerceMap (4,081 Dark Stores)...",
      "API HIT: QuickCompare.ai -> Monitoring live competitor inventory...",
      `ANALYSIS: Parsing Twitter & YouTube sentiment for ${competitors[0] || 'competitor'}...`,
      "DATABASE: Injecting Statista Market Forecast ($5.38B by 2025)...",
      "SCRAPE: ProductDataScrape pulling hourly pincode pricing metrics...",
      "SYNTHESIS: Strategy AI compiling Executive Brief...",
      "EXTRACT: Data Analyst extracting numerical matrices for Radar & Agent Charts..."
    ];
    
    actions.forEach((action, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: action }]);
      }, index * 2500 + Math.random() * 1000);
    });
  };

  const handleDispatch = async () => {
    if (!userCompany || competitors.length === 0) return;
    
    setLoading(true);
    setError('');
    setData(null);
    simulateLogs();

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_company: userCompany,
          competitors: competitors
        })
      });

      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      
      const responseData = await res.json();
      setData(responseData);
      setActiveTab('strategy');
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: "COMPLETE: Data successfully extracted and rendered." }]);
    } catch (err) {
      setError(`Connection Failed: ${err.message}`);
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: `ERROR: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!data) return;
    const reportText = `# MARKETWATCH EXECUTIVE BRIEF\n\nTarget: ${userCompany}\nCompetitors: ${competitors.join(', ')}\nThreat Level: ${data.threat_level}\n\n## Strategy Synthesis\n${data.strategy_data}\n\n## Marketing Intelligence\n${data.marketing_data}\n\n## Product Intelligence\n${data.product_data}\n\n## Sales Intelligence\n${data.sales_data}`;
    
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarketWatch_${userCompany}_Report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActiveData = () => {
    if (!data) return '';
    switch(activeTab) {
      case 'marketing': return data.marketing_data;
      case 'product': return data.product_data;
      case 'sales': return data.sales_data;
      case 'strategy': return data.strategy_data;
      default: return '';
    }
  };

  const getActiveGraph = () => {
    if (!data) return null;
    let graphData = null;
    let title = "";
    let isOrange = false;
    
    if (activeTab === 'marketing' && data.marketing_graph) {
      graphData = data.marketing_graph;
      title = "Ad Spend Efficiency Tracker";
      isOrange = true;
    } else if (activeTab === 'product' && data.product_graph) {
      graphData = data.product_graph;
      title = "Feature Sentiment Trajectory";
    } else if (activeTab === 'sales' && data.sales_graph) {
      graphData = data.sales_graph;
      title = "Lead Conversion Velocity";
      isOrange = true;
    }

    if (!graphData || graphData.length === 0) return null;

    return (
      <div className="chart-panel animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
           <div>
             <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               {title}
             </div>
             <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Chart of metric scores across tracked targets • 14 days</div>
           </div>
           <div style={{ color: isOrange ? 'var(--accent-orange)' : 'var(--accent-green)', fontSize: '13px', fontWeight: 'bold' }}>
              AVG +5.29%
           </div>
        </div>
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScoreGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorScoreOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
              <XAxis dataKey="name" tick={{fill: 'var(--text-muted)', fontSize: 11}} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{fill: 'var(--text-muted)', fontSize: 11}} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)'}} itemStyle={{color: isOrange ? 'var(--accent-orange)' : 'var(--accent-green)'}} />
              <Area type="monotone" dataKey="score" stroke={isOrange ? 'var(--accent-orange)' : 'var(--accent-green)'} strokeWidth={3} fillOpacity={1} fill={isOrange ? "url(#colorScoreOrange)" : "url(#colorScoreGreen)"} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-slide-up finance-panel" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
              <Lock color="var(--accent-green)" size={40} />
            </div>
          </div>
          <h1 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '24px', color: 'var(--text-main)', fontWeight: '800', letterSpacing: '1px' }}>RESTRICTED ACCESS</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>Authenticate to access MarketWatch Swarm Intelligence.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                autoFocus
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Agent Email ID"
                className="finance-input"
                style={{ paddingLeft: '45px' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                placeholder="Passcode"
                className="finance-input"
                style={{ paddingLeft: '45px' }}
              />
            </div>
            <button type="submit" disabled={!authEmail || !authPass || authLoading} className="finance-btn primary" style={{ padding: '14px', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {authLoading ? <Loader2 className="animate-spin" size={18} /> : <><ShieldCheck size={18} /> AUTHENTICATE</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-slide-up finance-panel" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
              <Activity color="var(--accent-green)" size={40} />
            </div>
          </div>
          <h1 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '24px', color: 'var(--text-main)', fontWeight: '800' }}>MARKETWATCH NODE</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>Initialize global analytics core.</p>
          
          <form onSubmit={handleOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              autoFocus
              value={welcomeInput}
              onChange={(e) => setWelcomeInput(e.target.value)}
              placeholder="Enter Target Company (e.g. Blinkit)"
              className="finance-input"
            />
            <button type="submit" disabled={!welcomeInput.trim()} className="finance-btn primary" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              INITIALIZE <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <Command size={24} color="var(--accent-green)" /> MarketWatch
        </div>
        
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search style={{ position: 'absolute', left: 10, top: 10 }} size={14} color="var(--text-muted)" />
          <input placeholder="Search" className="finance-input" style={{ paddingLeft: '32px' }} />
        </div>

        <div className="sidebar-menu-title">General</div>
        <div className="sidebar-item"><Home size={16} /> Home Page</div>
        <div className="sidebar-item active">
          <Activity size={16} /> Dashboard 
          <span style={{ marginLeft: 'auto', background: 'var(--accent-green)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>• 3</span>
        </div>
        <div className="sidebar-item"><Database size={16} /> Database</div>
        <div className="sidebar-item"><Briefcase size={16} /> Files</div>
        
        <div className="sidebar-menu-title" style={{ marginTop: '30px' }}>Account</div>
        <div className="sidebar-item"><Users size={16} /> Messages</div>
        <div className="sidebar-item"><Settings size={16} /> Settings</div>
        
        <div style={{ marginTop: 'auto' }}>
           <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0, 230, 118, 0.2)', fontSize: '12px' }}>
              <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '4px' }}>Pro License</div>
              <div style={{ color: 'var(--text-muted)' }}>Unlimited live scraping credits</div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="header">
           <div className="header-title">
              <CompanyLogo name={userCompany} size={42} />
              <div>
                 <h1>Overview</h1>
                 <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Track and Learn about your targets</span>
              </div>
           </div>
           <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { localStorage.removeItem('marketwatch_userCompany'); setIsOnboarded(false); }} className="finance-btn">
                Reset Target
              </button>
              {data && (
                 <button onClick={downloadReport} className="finance-btn"><Download size={14} /> Export Report</button>
              )}
              <button onClick={() => { localStorage.removeItem('marketwatch_isLoggedIn'); setIsLoggedIn(false); setAuthEmail(''); setAuthPass(''); }} className="finance-btn danger">
                 <LogOut size={14} /> Disconnect
              </button>
           </div>
        </div>

        <div className="metrics-grid">
           <div className="metric-card glowing-bottom green">
              <div className="metric-card-title">Threat Level</div>
              <div className="metric-card-value" style={{ color: data ? (data.threat_level === 'Critical' ? '#ef4444' : 'var(--accent-green)') : 'var(--text-main)' }}>
                 {data ? data.threat_level : 'Scanning'}
              </div>
              <div className="metric-card-delta green"><ArrowUp size={12} /> Live API Status</div>
           </div>
           <div className="metric-card glowing-bottom orange">
              <div className="metric-card-title">Tracked Targets</div>
              <div className="metric-card-value">{competitors.length + 1}</div>
              <div className="metric-card-delta orange"><Activity size={12} /> Active nodes</div>
           </div>
           <div className="metric-card glowing-bottom green">
              <div className="metric-card-title">Data Points (24h)</div>
              <div className="metric-card-value">14,290</div>
              <div className="metric-card-delta green"><ArrowUp size={12} /> +12.5% From yesterday</div>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px', marginBottom: '25px' }}>
          {/* Main Charts & Tabs */}
          <div>
             <div className="finance-panel" style={{ marginBottom: '25px', padding: '15px 24px' }}>
                 <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--panel-border)' }}>
                   {['strategy', 'marketing', 'product', 'sales'].map(tab => (
                     <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       style={{ 
                         background: 'none', border: 'none', padding: '12px 10px', 
                         color: activeTab === tab ? 'var(--accent-green)' : 'var(--text-muted)',
                         borderBottom: activeTab === tab ? '2px solid var(--accent-green)' : '2px solid transparent',
                         fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize',
                         transition: 'all 0.2s', fontSize: '13px'
                       }}
                     >
                       {tab} Intel
                     </button>
                   ))}
                 </div>

                 {/* Targeting & Inputs Matrix */}
                 <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span className="target-tag" style={{ background: 'rgba(0,230,118,0.1)', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
                        <Target size={12} /> {userCompany}
                      </span>
                      {competitors.map(c => (
                        <span key={c} className="target-tag">
                          {c} <X size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => removeCompetitor(c)} />
                        </span>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <input 
                         value={compInput}
                         onChange={(e) => setCompInput(e.target.value)}
                         placeholder="Add Competitor (e.g. Zepto)"
                         className="finance-input"
                         onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor(e)}
                       />
                       <button onClick={handleAddCompetitor} className="finance-btn"><Plus size={16} /> Add</button>
                       <button onClick={handleDispatch} disabled={loading} className="finance-btn primary" style={{ width: '180px' }}>
                         {loading ? <Loader2 className="animate-spin" size={16} /> : <><BrainCircuit size={16} /> Run Analysis</>}
                       </button>
                    </div>
                 </div>
             </div>

             {/* Dynamic Content */}
             {data ? (
                <>
                  {getActiveGraph()}
                  <div className="finance-panel animate-slide-up" style={{ minHeight: '300px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} color="var(--accent-green)" /> Detailed Brief
                    </h3>
                    <div style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '14px' }}>
                      <ReactMarkdown>{getActiveData()}</ReactMarkdown>
                    </div>
                  </div>
                </>
             ) : (
                <div className="finance-panel" style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>
                   <Database size={48} color="var(--panel-border)" style={{ marginBottom: '15px' }} />
                   <div style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Awaiting Swarm Dispatch...</div>
                </div>
             )}
          </div>

          {/* Right Panel: Radar & Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
             {/* Radar Chart */}
             <div className="finance-panel">
               <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Swarm Radar</h3>
               <div style={{ height: '220px', position: 'relative' }}>
                 {!data && (
                   <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No Data</div>
                 )}
                 {data && data.radar_data && (
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart data={data.radar_data}>
                       <PolarGrid stroke="var(--panel-border)" />
                       <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <RechartsTooltip contentStyle={{backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px'}} />
                       <Radar name={userCompany} dataKey={userCompany} stroke="var(--accent-green)" fill="var(--accent-green)" fillOpacity={0.4} />
                       {competitors.map((comp, idx) => (
                         <Radar key={comp} name={comp} dataKey={comp} stroke="var(--accent-orange)" fill="var(--accent-orange)" fillOpacity={0.3} />
                       ))}
                     </RadarChart>
                   </ResponsiveContainer>
                 )}
               </div>
             </div>

             {/* Terminal Logs */}
             <div className="terminal-panel">
               <div style={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <Terminal size={12} color="var(--accent-green)" /> Activity Logs
               </div>
               {logs.length === 0 ? (
                 <div style={{ opacity: 0.5 }}>No active processes. Standing by.</div>
               ) : (
                 logs.map((log, i) => {
                   const isError = log.text.includes('ERROR');
                   const isComplete = log.text.includes('COMPLETE');
                   const isApi = log.text.includes('API HIT');
                   return (
                     <div key={i} className="terminal-line animate-slide-up" style={{ 
                       borderLeftColor: isError ? '#ef4444' : (isComplete ? 'var(--accent-green)' : (isApi ? 'var(--accent-orange)' : 'var(--panel-border)')),
                       color: isError ? '#ef4444' : (isComplete ? 'var(--accent-green)' : 'var(--text-muted)')
                     }}>
                       <span style={{ color: '#475569', marginRight: '8px' }}>[{log.time}]</span>
                       {log.text}
                     </div>
                   );
                 })
               )}
               <div ref={logsEndRef} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
