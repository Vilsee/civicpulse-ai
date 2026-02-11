import React, { useState, useEffect, Suspense } from 'react'
import { LayoutDashboard, MessageSquare, PieChart, Upload, Info, Filter } from 'lucide-react'
import Spline from '@splinetool/react-spline'

const API_URL = 'http://localhost:8000'

const Dashboard = ({ stats }) => (
    <div className="container">
        <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, var(--secondary-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Community Pulse
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card glass">
                <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Engagement</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <h2 style={{ fontSize: '3rem' }}>{stats.total || 0}</h2>
                    <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 700 }}>↑ 12%</span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Total feedback entries</p>
            </div>
            <div className="card glass">
                <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Sentiment</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>{stats.sentiment || 'None'}</h2>
                    <span className={`badge badge-${(stats.sentiment || 'neutral').toLowerCase()}`} style={{ fontSize: '1.2rem', padding: '0.5rem' }}>
                        {stats.sentiment === 'Positive' ? '😊' : stats.sentiment === 'Negative' ? '😟' : '😐'}
                    </span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Automated AI detection</p>
            </div>
            <div className="card glass">
                <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Hot Topic</p>
                <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem', color: 'var(--secondary-teal)' }}>{stats.top_issue || 'None'}</h2>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Most discussed category</p>
            </div>
        </div>

        <div className="card glass" style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Community Issues Tracker</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(stats.top_issues_list || []).map(item => (
                    <div key={item.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                            <span>{item.name}</span>
                            <span style={{ color: 'var(--secondary-teal)' }}>{item.val}%</span>
                        </div>
                        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${item.val}%`,
                                    height: '100%',
                                    background: 'linear-gradient(to right, var(--primary-blue), var(--secondary-teal))',
                                    boxShadow: '0 0 10px var(--secondary-teal)'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

const FeedbackSubmission = ({ onSubmitted }) => {
    const [text, setText] = useState('')
    const [category, setCategory] = useState('Transport')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async () => {
        if (!text) return
        setLoading(true)
        try {
            const resp = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, category })
            })
            if (resp.ok) {
                setSuccess(true)
                setText('')
                setTimeout(() => {
                    setSuccess(false)
                    onSubmitted()
                }, 2000)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Voice Your Opinion</h1>
            <div className="card glass" style={{ padding: '3rem' }}>
                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
                        <h2 style={{ color: 'var(--success)', fontSize: '2rem' }}>Feedback Captured</h2>
                        <p className="text-muted">Directly contributing to community intelligence.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--secondary-teal)' }}>Message</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="What's happening in your neighborhood?"
                                style={{ fontSize: '1rem' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--secondary-teal)' }}>Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
                                    <option>Transport</option>
                                    <option>Safety</option>
                                    <option>Jobs</option>
                                    <option>Education</option>
                                    <option>Events</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', height: '3.2rem' }}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </div>

                        <div style={{ margin: '2rem 0', textAlign: 'center', position: 'relative' }}>
                            <hr />
                            <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-deep)', padding: '0 1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>POWERED BY WHISPER AI</span>
                        </div>

                        <VoiceRecorder onSubmitted={onSubmitted} />
                    </>
                )}
            </div>
        </div>
    )
}

const AnalysisScreen = ({ feedbackList }) => {
    const [filter, setFilter] = useState('All')
    const filtered = filter === 'All' ? feedbackList : feedbackList.filter(f => f.sentiment === filter)

    return (
        <div className="container stagger-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="glow-text">Analysis Engine</h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Filter size={18} />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option>All</option>
                        <option>Positive</option>
                        <option>Neutral</option>
                        <option>Negative</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.map(f => (
                    <div key={f.id} className="card glass" style={{ borderLeft: `6px solid ${f.sentiment === 'Positive' ? 'var(--success)' : f.sentiment === 'Negative' ? 'var(--danger)' : '#CBD5E1'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className={`badge badge-${f.sentiment.toLowerCase()}`}>{f.sentiment}</span>
                            <span className="badge" style={{ background: '#E2E8F0' }}>{f.category}</span>
                        </div>
                        <p>{f.text}</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(f.timestamp).toLocaleString()}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-muted">No feedback matches your filter.</p>}
            </div>
        </div>
    )
}

const InsightsScreen = ({ stats }) => (
    <div className="container">
        <h1>Community Insights</h1>

        <div className="card glass" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={20} className="text-secondary-teal" />
                Overall Summary
            </h3>
            <p style={{ marginTop: '1rem', color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                The community currently shows a <strong>{stats.sentiment || 'mixed'}</strong> sentiment.
                Most feedback revolves around <strong>{stats.top_issue || 'varied'}</strong> issues.
                Leaders should prioritize addressing concerns in the {stats.top_issue} sector to improve overall community satisfaction.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="card glass">
                <h3>Key Themes Identified</h3>
                <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Reliability of public transport services</li>
                    <li style={{ marginBottom: '0.5rem' }}>Infrastructure safety and maintenance</li>
                    <li style={{ marginBottom: '0.5rem' }}>Youth employment opportunities</li>
                </ul>
            </div>
            <div className="card glass">
                <h3>Suggested Actions</h3>
                <div style={{ marginTop: '1rem' }}>
                    {[
                        'Organize a town hall meeting for transport operators',
                        'Conduct a safety audit of local bus stops',
                        'Launch a community job board or skills workshop'
                    ].map((action, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--primary-blue)', color: 'white', minWidth: '24px', height: '24px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem' }}>{idx + 1}</div>
                            <span>{action}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
            "AI-generated insights are advisory and for community planning only."
        </p>
    </div>
)

const VoiceRecorder = ({ onSubmitted }) => {
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [audioChunks, setAudioChunks] = useState([])
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            setMediaRecorder(recorder)

            const chunks = []
            recorder.ondataavailable = (e) => chunks.push(e.data)
            recorder.onstop = () => setAudioChunks(chunks)

            recorder.start()
            setRecording(true)
            setMsg('Recording...')
        } catch (e) {
            console.error(e)
            setMsg('Microphone access denied')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop()
            setRecording(false)
            setMsg('Processing audio...')
        }
    }

    useEffect(() => {
        if (audioChunks.length > 0 && !recording) {
            uploadAudio()
        }
    }, [audioChunks, recording])

    const uploadAudio = async () => {
        setLoading(true)
        const blob = new Blob(audioChunks, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('file', blob, 'feedback.webm')

        try {
            const resp = await fetch(`${API_URL}/upload-audio`, {
                method: 'POST',
                body: formData
            })
            const result = await resp.json()
            if (resp.ok) {
                setMsg(`Success: "${result.transcription}"`)
                setTimeout(() => {
                    setMsg('')
                    onSubmitted()
                }, 3000)
            } else {
                setMsg('Transcription failed')
            }
        } catch (e) {
            console.error(e)
            setMsg('Error uploading audio')
        } finally {
            setLoading(false)
            setAudioChunks([])
        }
    }

    return (
        <div className="card glass hover-glow" style={{ marginTop: '1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="shimmer" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Voice Insights</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Share your thoughts audibly.</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                {recording && (
                    <div className="wave-animation">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="wave-bar"></div>)}
                    </div>
                )}

                {!recording ? (
                    <button
                        className="btn-primary hover-glow"
                        onClick={startRecording}
                        disabled={loading}
                        style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary-teal), #2DD4BF)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px rgba(45, 212, 191, 0.4)' }}
                    >
                        <MessageSquare size={36} style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }} />
                    </button>
                ) : (
                    <button
                        className="btn-primary"
                        onClick={stopRecording}
                        style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--danger)', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'pulse 1.5s infinite', border: '4px solid rgba(255,255,255,0.2)' }}
                    >
                        <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '6px' }}></div>
                    </button>
                )}

                {msg && <p style={{ fontWeight: 700, color: 'var(--secondary-teal)', textShadow: '0 0 10px rgba(13, 148, 136, 0.3)' }}>{msg}</p>}
            </div>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
        </div>
    )
}

const AdminUploadScreen = ({ onUploaded }) => {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            const resp = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            })
            const result = await resp.json()
            setMsg(result.message)
            setFile(null)
            setTimeout(() => {
                setMsg('')
                onUploaded()
            }, 2000)
        } catch (e) {
            console.error(e)
            setMsg('Error uploading file')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>Upload Feedback Data</h1>
            <div className="card glass" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '3rem' }}>
                <div style={{ border: '2px dashed #CBD5E1', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <Upload size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
                    <p className="text-muted">Select a CSV file to batch upload feedback items</p>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ marginTop: '1rem' }}
                    />
                </div>
                {msg && <p style={{ color: msg.includes('Error') ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem', fontWeight: 600 }}>{msg}</p>}
                <button
                    className="btn-primary"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    style={{ width: '100%', maxWidth: '300px' }}
                >
                    {loading ? 'Uploading...' : 'Upload CSV'}
                </button>
            </div>
        </div>
    )
}

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [stats, setStats] = useState({})
    const [feedbackList, setFeedbackList] = useState([])

    const fetchData = async () => {
        try {
            const [sResp, fResp] = await Promise.all([
                fetch(`${API_URL}/stats`),
                fetch(`${API_URL}/feedback`)
            ])
            if (sResp.ok) setStats(await sResp.json())
            if (fResp.ok) setFeedbackList(await fResp.json())
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
                <Suspense fallback={<div className="gradient-bg" style={{ width: '100%', height: '100%' }} />}>
                    <Spline scene="https://prod.spline.design/rilDewud8EsZCP7d/scene.splinecode" />
                </Suspense>
            </div>

            <div style={{ paddingBottom: '6rem', position: 'relative', zIndex: 1 }}>
                <nav className="gradient-bg" style={{ padding: '1rem 0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-blue)', fontWeight: 800 }}>CP</div>
                            <span className="logo-text" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>CivicPulse AI</span>
                        </div>
                        <button onClick={() => setActiveTab('admin')} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                            Admin
                        </button>
                    </div>
                </nav>

                <main style={{ paddingTop: '1.5rem' }}>
                    {activeTab === 'dashboard' && <Dashboard stats={stats} />}
                    {activeTab === 'feedback' && <FeedbackSubmission onSubmitted={() => { fetchData(); setActiveTab('dashboard'); }} />}
                    {activeTab === 'analysis' && <AnalysisScreen feedbackList={feedbackList} />}
                    {activeTab === 'insights' && <InsightsScreen stats={stats} />}
                    {activeTab === 'admin' && <AdminUploadScreen onUploaded={() => { fetchData(); setActiveTab('dashboard'); }} />}
                </main>

                <div className="bottom-nav glass">
                    <button onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', color: activeTab === 'dashboard' ? 'var(--primary-blue)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <LayoutDashboard size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                        <div style={{ fontSize: '0.65rem', fontWeight: activeTab === 'dashboard' ? 700 : 500 }}>Overview</div>
                    </button>
                    <button onClick={() => setActiveTab('feedback')} style={{ background: 'none', border: 'none', color: activeTab === 'feedback' ? 'var(--primary-blue)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={22} strokeWidth={activeTab === 'feedback' ? 2.5 : 2} />
                        <div style={{ fontSize: '0.65rem', fontWeight: activeTab === 'feedback' ? 700 : 500 }}>Feedback</div>
                    </button>
                    <button onClick={() => setActiveTab('analysis')} style={{ background: 'none', border: 'none', color: activeTab === 'analysis' ? 'var(--primary-blue)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <PieChart size={22} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
                        <div style={{ fontSize: '0.65rem', fontWeight: activeTab === 'analysis' ? 700 : 500 }}>Analysis</div>
                    </button>
                    <button onClick={() => setActiveTab('insights')} style={{ background: 'none', border: 'none', color: activeTab === 'insights' ? 'var(--primary-blue)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <Info size={22} strokeWidth={activeTab === 'insights' ? 2.5 : 2} />
                        <div style={{ fontSize: '0.65rem', fontWeight: activeTab === 'insights' ? 700 : 500 }}>Insights</div>
                    </button>
                </div>
            </div>
            )
}
