import React, { useState, useEffect } from 'react'
import { LayoutDashboard, MessageSquare, PieChart, Upload, Info, Filter } from 'lucide-react'

const API_URL = 'http://localhost:8000'

const Dashboard = ({ stats }) => (
    <div className="container">
        <h1 style={{ marginBottom: '1.5rem' }}>Community Pulse Overview</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="card glass">
                <p className="text-muted">Total Feedback</p>
                <h2>{stats.total || 0}</h2>
            </div>
            <div className="card glass">
                <p className="text-muted">Overall Sentiment</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2>{stats.sentiment || 'None'}</h2>
                    <span className={`badge badge-${(stats.sentiment || 'neutral').toLowerCase()}`}>
                        {stats.sentiment === 'Positive' ? '😊' : stats.sentiment === 'Negative' ? '😟' : '😐'}
                    </span>
                </div>
            </div>
            <div className="card glass">
                <p className="text-muted">Most Common Issue</p>
                <h2>{stats.top_issue || 'None'}</h2>
            </div>
        </div>

        <div className="card glass" style={{ marginTop: '2rem' }}>
            <h3>Top Community Issues</h3>
            <div style={{ marginTop: '1rem' }}>
                {(stats.top_issues_list || []).map(item => (
                    <div key={item.name} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span>{item.name}</span>
                            <span>{item.val}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.val}%`, height: '100%', background: 'var(--secondary-teal)' }}></div>
                        </div>
                    </div>
                ))}
                {(!stats.top_issues_list || stats.top_issues_list.length === 0) && <p className="text-muted">No data available yet.</p>}
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
        <div className="container">
            <h1>Share Your Feedback</h1>
            <div className="card glass" style={{ marginTop: '1.5rem' }}>
                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem' }}>✅</div>
                        <h2 style={{ color: 'var(--success)' }}>Thank You!</h2>
                        <p>Your feedback has been received and is being analyzed.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tell us what's on your mind</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Describe the issue or suggestion..."
                                style={{ width: '100%', height: '150px', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', outline: 'none' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1' }}
                            >
                                <option>Transport</option>
                                <option>Safety</option>
                                <option>Jobs</option>
                                <option>Education</option>
                                <option>Events</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Submit Feedback'}
                        </button>

                        <div style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
                            <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0' }} />
                            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
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
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Feedback Analysis</h1>
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
        <div className="card glass" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <h3>Voice Feedback</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Speak your mind, we'll transcribe it for you.</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {!recording ? (
                    <button
                        className="btn-primary"
                        onClick={startRecording}
                        disabled={loading}
                        style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'var(--secondary-teal)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <MessageSquare size={32} />
                    </button>
                ) : (
                    <button
                        className="btn-primary"
                        onClick={stopRecording}
                        style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'var(--danger)', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'pulse 1.5s infinite' }}
                    >
                        <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '4px' }}></div>
                    </button>
                )}

                {msg && <p style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>{msg}</p>}
            </div>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
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
        <div style={{ paddingBottom: '6rem' }}>
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
