import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, Mail, Bell, Home, BarChart2, List, TrendingUp, RefreshCw, CreditCard, Gift, Shield, Settings, HelpCircle, ArrowUpRight, ArrowDownRight, Download, Eye, ChevronDown, Lock, ChevronRight, CheckCircle2, XCircle, Sun, Moon, Activity, Database, Target, BrainCircuit } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import './index.css';

const CompanyLogo = ({ name, size = 32 }) => {
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

  if (!src) return <div style={{width: size, height: size, borderRadius: '50%', backgroundColor: 'var(--panel-border)'}} />;

  return (
    <img 
      src={src} 
      alt={name} 
      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff', border: '1px solid var(--panel-border)' }}
    />
  );
};

function App() {
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userCompany, setUserCompany] = useState('');
  const [competitors, setCompetitors] = useState(['Blinkit', 'Zepto']);
  const [compInput, setCompInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  
  const [agentStatus, setAgentStatus] = useState('');
  const [showAllSources, setShowAllSources] = useState(false);

  // New state to manage the active sidebar view
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    const savedTheme = localStorage.getItem('marketwatch_theme');
    if (savedTheme) setTheme(savedTheme);

    const savedAuth = localStorage.getItem('marketwatch_isLoggedIn');
    if (savedAuth) setIsLoggedIn(true);

    const savedCompany = localStorage.getItem('marketwatch_userCompany');
    if (savedCompany) {
      setUserCompany(savedCompany);
      setIsOnboarded(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('marketwatch_theme', newTheme);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setTimeout(() => {
      localStorage.setItem('marketwatch_isLoggedIn', 'true');
      setIsLoggedIn(true);
    }, 800);
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    if (!userCompany.trim()) return;
    
    setErrorMsg('Validating company...');
    try {
        const res = await fetch(`http://localhost:8000/validate?name=${encodeURIComponent(userCompany)}`);
        const data = await res.json();
        if (!data.valid) {
            setErrorMsg('Fake or Unrecognized Company. Please enter a real company.');
            return;
        }
    } catch (err) {
        // Fall open if backend is unreachable
    }
    
    setErrorMsg('');
    localStorage.setItem('marketwatch_userCompany', userCompany.trim());
    setIsOnboarded(true);
  };

  const handleDispatch = async () => {
    if (!userCompany) return;
    setLoading(true);
    setData(null);
    setShowAllSources(false);
    
    const statuses = [
      'Initializing Swarm Protocol...',
      'Marketing Agent scanning web for competitor ad campaigns...',
      'Product Agent fetching live dark store inventory nodes...',
      'Sales Agent analyzing B2B buying signal velocity...',
      'Data Scientist AI cross-referencing json intelligence...',
      'Chief Strategic Advisor AI synthesizing final executive brief...'
    ];
    let step = 0;
    setAgentStatus(statuses[0]);
    const statusInterval = setInterval(() => {
       step++;
       if (step < statuses.length) setAgentStatus(statuses[step]);
    }, 3000);

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_company: userCompany, competitors: competitors })
      });
      if (res.ok) {
         setData(await res.json());
         setLastScanned(new Date().toLocaleString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(statusInterval);
      setLoading(false);
      setAgentStatus('');
    }
  };

  const getDataPoints = () => {
    if (!data) return "0";
    return data.data_points ? data.data_points.toLocaleString() : "0";
  };

  if (!isLoggedIn || !isOnboarded) {
    return (
      <div className={`theme-${theme}`} style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="bankio-panel animate-slide-up" style={{ width: '400px', textAlign: 'center' }}>
           <div style={{ background: 'var(--accent-green)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff' }}>
             {isLoggedIn ? <Target size={28} /> : <Lock size={28} />}
           </div>
           <h2 style={{ margin: '0 0 10px 0' }}>{isLoggedIn ? 'Target Setup' : 'MarketWatch Intelligence'}</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px' }}>
             {isLoggedIn ? 'Enter your primary company to begin.' : 'Authenticate to access the dashboard.'}
           </p>
           
           <form onSubmit={isLoggedIn ? handleOnboard : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             {!isLoggedIn ? (
               <>
                 <input autoFocus placeholder="Email Address" className="finance-input" />
                 <input type="password" placeholder="Password" className="finance-input" />
               </>
             ) : (
               <>
                 <input autoFocus value={userCompany} onChange={e => setUserCompany(e.target.value)} placeholder="Company Name" className="finance-input" />
                 {errorMsg && <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '-10px', paddingLeft: '5px' }}>{errorMsg}</div>}
               </>
             )}
             <button type="submit" className="finance-btn">{isLoggedIn ? 'Initialize' : 'Sign In'} <ChevronRight size={18} /></button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-layout theme-${theme}`}>
      {/* Sidebar - Dynamically routing to agents */}
      <div className="sidebar">
        <div className="sidebar-logo">
           <Activity size={28} color="var(--accent-green)" />
           MarketWatch
        </div>

        <div className="sidebar-menu-title">Main Menu</div>
        <div className={`sidebar-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
          <Home size={18} /> Dashboard Overview
        </div>
        
        <div className="sidebar-menu-title" style={{ marginTop: '20px' }}>AI Agents</div>
        <div className={`sidebar-item ${activeView === 'strategy' ? 'active' : ''}`} onClick={() => setActiveView('strategy')}>
          <BrainCircuit size={18} /> Strategy Agent
        </div>
        <div className={`sidebar-item ${activeView === 'marketing' ? 'active' : ''}`} onClick={() => setActiveView('marketing')}>
          <TrendingUp size={18} /> Marketing Agent
        </div>
        <div className={`sidebar-item ${activeView === 'product' ? 'active' : ''}`} onClick={() => setActiveView('product')}>
          <Target size={18} /> Product Agent
        </div>
        <div className={`sidebar-item ${activeView === 'sales' ? 'active' : ''}`} onClick={() => setActiveView('sales')}>
          <CreditCard size={18} /> Sales Agent
        </div>

        <div className="sidebar-menu-title" style={{ marginTop: '20px' }}>Others</div>
        <div className="sidebar-item"><Shield size={18} /> Security</div>
        <div className="sidebar-item"><Settings size={18} /> Settings</div>
        <div className="sidebar-item"><HelpCircle size={18} /> Support</div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        
        {/* Top Header */}
        <div className="top-header">
           <div className="header-text">
             <h1>Welcome, Agent!</h1>
             <p>Effortlessly manage your intelligence targets with real-time insights</p>
           </div>
           <div className="header-actions">
             <div className="icon-btn" onClick={toggleTheme} title="Toggle Theme" style={{ cursor: 'pointer', background: theme === 'dark' ? 'rgba(255,145,0,0.1)' : '#f1f5f9', border: theme === 'dark' ? '1px solid var(--accent-orange)' : '1px solid #cbd5e1' }}>
                {theme === 'dark' ? <Sun size={18} color="var(--accent-orange)" /> : <Moon size={18} color="#0f172a" />}
             </div>
             <div className="icon-btn badge"><Bell size={18} /></div>
             <div className="avatar"></div>
           </div>
        </div>

        {/* Dashboard Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <h2 style={{ margin: 0, fontSize: '20px' }}>
             {activeView === 'dashboard' ? 'Intelligence Activity Overview' : `${activeView.charAt(0).toUpperCase() + activeView.slice(1)} Agent`}
           </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
               <input 
                 value={compInput} 
                 onChange={e => setCompInput(e.target.value)} 
                 placeholder="Find competitors..." 
                 className="finance-input" 
                 style={{ width: '250px', background: 'var(--panel-bg)', borderRadius: '20px', padding: '8px 16px' }}
               />
               <button onClick={async () => { 
                 if(compInput) { 
                   setIsValidating(true);
                   try {
                       const res = await fetch(`http://localhost:8000/validate?name=${encodeURIComponent(compInput)}`);
                       const data = await res.json();
                       if (!data.valid) {
                          alert("Fake or Unrecognized Company! Please enter a real company.");
                          setIsValidating(false);
                          return;
                       }
                   } catch (err) {}
                   setCompetitors([...competitors, compInput]); 
                   setCompInput(''); 
                   setIsValidating(false);
                 } 
               }} className="finance-btn" style={{ borderRadius: '20px', padding: '8px 16px', opacity: isValidating ? 0.7 : 1 }}>{isValidating ? 'Verifying...' : 'Add Target'}</button>
               <button onClick={handleDispatch} className="finance-btn" style={{ borderRadius: '20px', padding: '8px 16px', background: 'var(--text-main)', color: 'var(--panel-bg)' }}>{loading ? 'Scanning...' : 'Analyze'}</button>
            </div>
        </div>

        {/* --- ROUTER RENDER LOGIC --- */}

        {activeView === 'dashboard' && (
          <>
            {/* Metric Cards Row */}
            <div className="metrics-row">
               <div className="bankio-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                  <span className="metric-title">Tracked Targets</span>
                  <div className="metric-value-row">
                    <span className="metric-value">{competitors.length}</span>
                    <div className="pill green" style={{ marginLeft: 'auto' }}><Activity size={12} /> Live Nodes</div>
                  </div>
               </div>

               <div className="bankio-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                  <span className="metric-title">Data Points Processed</span>
                  <div className="metric-value-row">
                    <span className="metric-value">{loading ? '...' : getDataPoints()}</span>
                    <div className="pill green" style={{ marginLeft: 'auto' }}><Database size={12} /> Real-Time Volume</div>
                  </div>
               </div>

               <div className="bankio-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                     <span className="metric-title">Threat Level</span>
                     <div className="metric-value-row">
                       <span className="metric-value" style={{ color: data?.threat_level === 'Critical' ? 'var(--accent-red)' : (data ? 'var(--accent-green)' : 'var(--text-muted)') }}>
                         {loading ? 'Scanning...' : (data ? data.threat_level : 'Idle')}
                       </span>
                     </div>
                     {lastScanned && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Last Scan: {lastScanned}</div>}
                  </div>
                  {data?.marketing_graph && (
                    <div style={{ height: '60px', width: '120px' }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={data.marketing_graph}>
                           <Area type="monotone" dataKey="score" stroke="var(--accent-green)" fill="var(--accent-green-light)" strokeWidth={2} />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  )}
               </div>
            </div>

            {/* Targets & Sources Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
               <div className="bankio-panel">
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Selected Targets</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                     <div style={{ padding: '8px 12px', background: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-text)', border: '1px solid var(--panel-border)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                        <Target size={14} /> {userCompany} (Primary)
                        {data?.sector_analysis?.[userCompany] && !data.sector_analysis[userCompany].toLowerCase().includes('commerce') && <span style={{ color: 'var(--accent-orange)', fontSize: '11px', marginLeft: '4px' }}>[{data.sector_analysis[userCompany]}]</span>}
                     </div>
                     {competitors.map((comp, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Target size={14} color="var(--accent-orange)" /> {comp}
                           {data?.sector_analysis?.[comp] && !data.sector_analysis[comp].toLowerCase().includes('commerce') && <span style={{ color: 'var(--accent-orange)', fontSize: '11px', marginLeft: '4px' }}>[{data.sector_analysis[comp]}]</span>}
                           <XCircle 
                              size={14} 
                              color="var(--accent-red)" 
                              style={{ cursor: 'pointer', marginLeft: '4px' }}
                              onClick={() => {
                                 if(window.confirm(`Are you sure you want to stop tracking ${comp}?`)) {
                                    setCompetitors(competitors.filter((_, i) => i !== idx));
                                 }
                              }}
                           />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bankio-panel">
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     Intelligence Sources
                     {data?.sources?.length > 3 && (
                        <span onClick={() => setShowAllSources(!showAllSources)} style={{ fontSize: '12px', color: 'var(--accent-green)', cursor: 'pointer', fontWeight: 'normal' }}>
                           {showAllSources ? 'Show Less' : `+${data.sources.length - 3} More`}
                        </span>
                     )}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                     {loading && <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>Establishing uplinks...</div>}
                     
                     {!loading && data?.sources && (showAllSources ? data.sources : data.sources.slice(0, 3)).map((source, idx) => (
                        <div key={idx} className="animate-slide-up" style={{ padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Database size={14} color="var(--accent-green)" /> {source}
                        </div>
                     ))}
                     {!loading && !data && <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>Run analysis to discover sources</div>}
                  </div>
               </div>
            </div>

            {/* Live Agent Terminal / Executive Brief */}
            {loading && (
              <div className="bankio-panel animate-slide-up" style={{ padding: '30px', border: '1px solid var(--accent-green)', background: 'var(--sidebar-active-bg)' }}>
                 <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-green)' }}>
                   <RefreshCw size={20} className="spin-anim" /> Swarm Execution in Progress
                 </h3>
                 <p style={{ color: 'var(--sidebar-active-text)', fontSize: '15px', margin: '0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Activity size={16} /> {agentStatus}
                 </p>
                 <style dangerouslySetInnerHTML={{__html: `
                    .spin-anim { animation: spin 2s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                 `}} />
              </div>
            )}
            
            {!loading && data && (
              <div className="bankio-panel animate-slide-up" style={{ padding: '30px' }}>
                 <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <BrainCircuit size={20} color="var(--accent-green)" /> Executive Strategy Brief
                 </h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 20px 0' }}>
                   Synthesized high-level overview generated by the Chief Strategic Advisor AI.
                 </p>
                 <div className="markdown-body" style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '14px' }}>
                    <ReactMarkdown>{data.strategy_data}</ReactMarkdown>
                 </div>
              </div>
            )}
          </>
        )}

        {/* AGENT VIEWS */}
        {activeView !== 'dashboard' && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Agent Graph Panel */}
            <div className="bankio-panel" style={{ height: '350px', padding: '30px' }}>
               <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-main)' }}>Interactive Metric Analysis</h3>
               {data ? (
                 <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                   {activeView === 'strategy' ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar_data}>
                          <PolarGrid stroke="var(--panel-border)" />
                          <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                          <PolarRadiusAxis stroke="var(--text-muted)" />
                          <Radar name={userCompany} dataKey="A" stroke="var(--accent-green)" fill="var(--accent-green)" fillOpacity={0.5} />
                          <Radar name="Competitor Avg" dataKey="B" stroke="var(--accent-orange)" fill="var(--accent-orange)" fillOpacity={0.5} />
                          <Legend wrapperStyle={{ color: 'var(--text-main)' }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }} />
                        </RadarChart>
                     </ResponsiveContainer>
                   ) : (
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={data[`${activeView}_graph`]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
                         <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                         <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                         <RechartsTooltip cursor={{fill: 'var(--sidebar-hover)'}} contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                         <Bar dataKey="score" fill="var(--accent-green)" radius={[4,4,0,0]} barSize={40} />
                       </BarChart>
                     </ResponsiveContainer>
                   )}
                 </div>
               ) : (
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                   Please click 'Analyze' to generate data for this agent.
                 </div>
               )}
            </div>

            {/* Agent Text Report Panel */}
            <div className="bankio-panel" style={{ padding: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Intelligence Feed</h3>
              {data ? (
                 <div className="markdown-body" style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '14px' }}>
                    <ReactMarkdown>{data[`${activeView}_data`]}</ReactMarkdown>
                 </div>
              ) : (
                 <div style={{ color: 'var(--text-muted)' }}>Waiting for swarm intelligence...</div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
