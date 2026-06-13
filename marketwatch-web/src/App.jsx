import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, Mail, Bell, Home, BarChart2, List, TrendingUp, RefreshCw, CreditCard, Gift, Shield, Settings, HelpCircle, ArrowUpRight, ArrowDownRight, Download, Eye, ChevronDown, Lock, ChevronRight, CheckCircle2, XCircle, Sun, Moon, Activity, Database, Target } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
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
  // Theme state: light is the default to match the Bankio image
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userCompany, setUserCompany] = useState('');
  const [competitors, setCompetitors] = useState(['Blinkit', 'Zepto']);
  const [compInput, setCompInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

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

  const handleOnboard = (e) => {
    e.preventDefault();
    if (!userCompany.trim()) return;
    localStorage.setItem('marketwatch_userCompany', userCompany.trim());
    setIsOnboarded(true);
  };

  const handleDispatch = async () => {
    if (!userCompany) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_company: userCompany, competitors: competitors })
      });
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDataPoints = () => {
    if (!data) return "0";
    const contentSize = (data.strategy_data?.length || 0) + (data.marketing_data?.length || 0);
    const metric = Math.floor(contentSize * 4.2) + (competitors.length * 2500) + 1429;
    return metric.toLocaleString();
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
               <input autoFocus value={userCompany} onChange={e => setUserCompany(e.target.value)} placeholder="Company Name" className="finance-input" />
             )}
             <button type="submit" className="finance-btn">{isLoggedIn ? 'Initialize' : 'Sign In'} <ChevronRight size={18} /></button>
           </form>
        </div>
      </div>
    );
  }



  return (
    <div className={`dashboard-layout theme-${theme}`}>
      {/* Sidebar - EXACTLY matching Bankio */}
      <div className="sidebar">
        <div className="sidebar-logo">
           <Activity size={28} color="var(--accent-green)" />
           MarketWatch
        </div>

        <div className="sidebar-menu-title">Main Menu</div>
        <div className="sidebar-item"><Home size={18} /> Dashboard</div>
        <div className="sidebar-item active"><BarChart2 size={18} /> Analytics</div>
        <div className="sidebar-item"><List size={18} /> Transactions</div>
        <div className="sidebar-item"><TrendingUp size={18} /> Investments</div>
        <div className="sidebar-item"><RefreshCw size={18} /> Transfers</div>
        <div className="sidebar-item"><CreditCard size={18} /> Card</div>
        <div className="sidebar-item"><Gift size={18} /> Rewards</div>

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
             <div className="icon-btn"><Search size={18} /></div>
             <div className="icon-btn"><Mail size={18} /></div>
             <div className="icon-btn badge"><Bell size={18} /></div>
             <div className="avatar"></div>
           </div>
        </div>

        {/* Dashboard Title & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <h2 style={{ margin: 0, fontSize: '20px' }}>Intelligence Activity Overview</h2>
           <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                value={compInput} 
                onChange={e => setCompInput(e.target.value)} 
                placeholder="Find competitors..." 
                className="finance-input" 
                style={{ width: '250px', background: 'var(--panel-bg)', borderRadius: '20px', padding: '8px 16px' }}
              />
              <button onClick={() => { if(compInput) { setCompetitors([...competitors, compInput]); setCompInput(''); } }} className="finance-btn" style={{ borderRadius: '20px', padding: '8px 16px' }}>Add Target</button>
              <button onClick={handleDispatch} className="finance-btn" style={{ borderRadius: '20px', padding: '8px 16px', background: 'var(--text-main)', color: 'var(--panel-bg)' }}>{loading ? 'Scanning...' : 'Analyze'}</button>
           </div>
        </div>

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
                <span className="metric-value">{getDataPoints()}</span>
                <div className="pill green" style={{ marginLeft: 'auto' }}><Database size={12} /> Real-Time Volume</div>
              </div>
           </div>

           <div className="bankio-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                 <span className="metric-title">Threat Level</span>
                 <div className="metric-value-row">
                   <span className="metric-value" style={{ color: data?.threat_level === 'Critical' ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                     {data ? data.threat_level : 'Scanning...'}
                   </span>
                 </div>
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
                 </div>
                 {competitors.map((comp, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Target size={14} color="var(--accent-orange)" /> {comp}
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
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Intelligence Sources</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                 {['Google Search', 'X (Twitter)', 'LinkedIn Analytics', 'Exa Network', 'NewsAPI', 'Wikipedia Data', 'Crunchbase'].map((source, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Database size={14} color="var(--accent-green)" /> {source}
                    </div>
                 ))}
              </div>
           </div>
        </div>



      </div>
    </div>
  );
}

export default App;
