import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Activity, BrainCircuit, Globe, Loader2, Database, TrendingUp, Users, Target, Briefcase, Plus, X, Command, AlertTriangle, ShieldCheck, Download, Terminal, BarChart2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import './index.css';

const CompanyLogo = ({ name, size = 24 }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!name) return;
    let isMounted = true;
    
    // Check our new Universal Logo Fetcher endpoint!
    fetch(`http://localhost:8000/logo?name=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.url) {
          setSrc(data.url);
        }
      })
      .catch(() => {
        if (isMounted) {
          const normalized = name.toLowerCase().replace(/\s+/g, '') + '.com';
          setSrc(`https://logo.clearbit.com/${normalized}`);
        }
      });

    return () => { isMounted = false; };
  }, [name]);

  if (!src) return <div style={{width: size, height: size, borderRadius: '4px', border: '1px solid #1e293b', backgroundColor: '#0f172a'}} />;

  return (
    <img 
      src={src} 
      alt={name} 
      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=38bdf8&bold=true`}}
      style={{ width: size, height: size, borderRadius: '4px', border: '1px solid #1e293b', objectFit: 'contain', backgroundColor: '#0f172a' }}
    />
  );
};

function App() {
  const [userCompany, setUserCompany] = useState('');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [welcomeInput, setWelcomeInput] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [compInput, setCompInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('strategy');
  
  // Terminal Logs State
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
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
    
    if (activeTab === 'marketing' && data.marketing_graph) {
      graphData = data.marketing_graph;
      title = "Ad Spend Efficiency";
    } else if (activeTab === 'product' && data.product_graph) {
      graphData = data.product_graph;
      title = "Feature Sentiment Score";
    } else if (activeTab === 'sales' && data.sales_graph) {
      graphData = data.sales_graph;
      title = "Lead Conversion Probability";
    }

    if (!graphData || graphData.length === 0) return null;

    return (
      <div className="animate-slide-up" style={{ marginBottom: '30px', background: 'rgba(15, 23, 42, 0.4)', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={16} /> {title}
        </h3>
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{fill: '#e2e8f0', fontSize: 11, fontWeight: 600}} axisLine={false} tickLine={false} width={80} />
              <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff'}} itemStyle={{color: '#38bdf8'}} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                {graphData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === userCompany ? '#38bdf8' : '#a855f7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (!isOnboarded) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-slide-up cyber-panel" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Activity color="#38bdf8" size={40} />
            </div>
          </div>
          <h1 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '24px', color: '#f8fafc', fontWeight: '800' }}>MARKETWATCH NODE</h1>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '30px' }}>Initialize global analytics core.</p>
          
          <form onSubmit={handleOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              autoFocus
              value={welcomeInput}
              onChange={(e) => setWelcomeInput(e.target.value)}
              placeholder="Enter Company Name"
              className="cyber-input"
            />
            <button type="submit" disabled={!welcomeInput.trim()} className="cyber-btn primary" style={{ padding: '14px' }}>
              Initialize Database
            </button>
          </form>
        </div>
      </div>
    );
  }

  const ThreatWidget = ({ level }) => {
    const isCritical = level === 'Critical';
    const isMod = level === 'Moderate';
    const color = isCritical ? '#ef4444' : (isMod ? '#eab308' : '#22c55e');
    const Icon = isCritical ? AlertTriangle : (isMod ? Activity : ShieldCheck);
    
    return (
      <div style={{ background: `rgba(${isCritical ? '239,68,68' : (isMod ? '234,179,8' : '34,197,94')}, 0.1)`, border: `1px solid ${color}`, borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon color={color} size={20} />
          <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Detected Threat</span>
        </div>
        <div style={{ color: color, fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', textShadow: `0 0 10px ${color}` }}>
          {level}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <Activity color="#38bdf8" size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#f8fafc', letterSpacing: '1px' }}>MARKETWATCH</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span className="cyber-badge">Core Active</span>
              <CompanyLogo name={userCompany} size={14} />
              <span style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '13px' }}>{userCompany}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          {data && (
            <button onClick={downloadReport} className="cyber-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#d8b4fe' }}>
              <Download size={14} /> Export Report
            </button>
          )}
          <button onClick={() => { localStorage.removeItem('marketwatch_userCompany'); setIsOnboarded(false); }} className="cyber-btn">
            Reset Target
          </button>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '25px', alignItems: 'start' }}>
        
        {/* LEFT PANEL - COMMAND CENTER */}
        <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#38bdf8', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
            <Command size={16} /> Targeting Matrix
          </h2>
          
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
              {competitors.map(comp => (
                <div key={comp} className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                  <CompanyLogo name={comp} size={14} />
                  {comp}
                  <X size={14} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => removeCompetitor(comp)} />
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCompetitor} style={{ display: 'flex', gap: '8px' }}>
              <input 
                value={compInput}
                onChange={(e) => setCompInput(e.target.value)}
                placeholder="Add competitor..."
                className="cyber-input"
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={!compInput.trim()} className="cyber-btn primary" style={{ padding: '0 12px' }}>
                <Plus size={16} color="#020617"/>
              </button>
            </form>
          </div>
          
          <button 
            className="cyber-btn primary glow-btn"
            onClick={handleDispatch}
            disabled={loading || competitors.length === 0}
            style={{ 
              width: '100%', padding: '14px', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
              opacity: (loading || competitors.length === 0) ? 0.5 : 1, marginTop: '5px'
            }}
          >
            {loading ? <><Loader2 className="animate-spin" size={16} /> Deploying Swarm...</> : <><Send size={16} /> Execute Hack</>}
          </button>

          {/* DYNAMIC RADAR CHART */}
          {data && data.radar_data && data.radar_data.length > 0 && (
            <div className="animate-slide-up" style={{ marginTop: '10px', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
              <ThreatWidget level={data.threat_level || 'Moderate'} />
              
              <h3 style={{ fontSize: '13px', color: '#94a3b8', margin: '20px 0 10px 0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={14} /> Global Footprint
              </h3>
              <div style={{ height: '260px', width: '100%', margin: '0 -10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radar_data}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff'}} itemStyle={{color: '#38bdf8'}} />
                    <Radar name={userCompany} dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                    <Radar name="Competitors" dataKey="B" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                    <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - AGENT TABS & RESULTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TABS */}
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #1e293b', overflow: 'hidden' }}>
            <button className={`cyber-tab ${activeTab === 'strategy' ? 'active' : ''}`} onClick={() => setActiveTab('strategy')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Target size={14} /> Strategy
            </button>
            <button className={`cyber-tab ${activeTab === 'marketing' ? 'active' : ''}`} onClick={() => setActiveTab('marketing')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Globe size={14} /> Marketing
            </button>
            <button className={`cyber-tab ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Users size={14} /> Product
            </button>
            <button className={`cyber-tab ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <TrendingUp size={14} /> Sales
            </button>
          </div>

          {/* RESULTS DISPLAY OR LIVE TERMINAL */}
          <div className="cyber-panel" style={{ minHeight: '550px', position: 'relative' }}>
            
            {loading && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '15px', marginBottom: '15px' }}>
                  <Terminal size={18} color="#a855f7" />
                  <span style={{ color: '#a855f7', fontWeight: '700', fontSize: '14px', letterSpacing: '1px' }}>LIVE SWARM TELEMETRY</span>
                  <Loader2 size={16} color="#a855f7" className="animate-spin" style={{ marginLeft: 'auto' }} />
                </div>
                
                {/* Scrolling Terminal */}
                <div style={{ flex: 1, background: '#020617', borderRadius: '6px', padding: '15px', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto', border: '1px solid #1e293b', maxHeight: '400px' }}>
                  {logs.map((log, idx) => (
                    <div key={idx} className="animate-terminal" style={{ marginBottom: '8px', color: log.text.includes('ERROR') ? '#ef4444' : (log.text.includes('COMPLETE') ? '#22c55e' : '#38bdf8') }}>
                      <span style={{ color: '#64748b', marginRight: '10px' }}>[{log.time}]</span>
                      {log.text}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                <AlertTriangle size={20} /> System Failure: {error}
              </div>
            )}

            {!loading && !error && data && (
              <div className="animate-slide-up">
                {/* RENDER THE AGENT SPECIFIC GRAPH */}
                {getActiveGraph()}

                {/* RENDER THE AGENT MARKDOWN TEXT */}
                <div className="prose">
                  <ReactMarkdown>{getActiveData()}</ReactMarkdown>
                </div>
              </div>
            )}

            {!loading && !error && !data && (
              <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#475569', gap: '15px' }}>
                <Briefcase size={50} strokeWidth={1} />
                <div style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>System Ready. Awaiting Execution.</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default App;
