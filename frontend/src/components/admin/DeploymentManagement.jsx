import React, { useState, useEffect } from 'react';

export default function DeploymentManagement() {
    const [deployments, setDeployments] = useState([]);
    const [deploying, setDeploying] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadDeployments();
        // Poll for updates every 10 seconds
        const interval = setInterval(loadDeployments, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadDeployments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/deployments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setDeployments(data);
        } catch (err) {
            console.error('Failed to load deployments:', err);
        }
    };

    const handleDeploy = async () => {
        if (!confirm('Möchten Sie wirklich ein Deployment starten?')) {
            return;
        }

        setDeploying(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/deploy', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setMessage('✅ ' + data.message);
                loadDeployments();
            } else {
                setMessage('❌ Deployment fehlgeschlagen: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (err) {
            setMessage('❌ Fehler: ' + err.message);
        } finally {
            setDeploying(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return '✅';
            case 'failure': return '❌';
            case 'running': return '🔄';
            default: return '⏳';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('de-DE');
    };

    return (
        <div className="deployment-management">
            <div className="card">
                <h2>🚀 Deployment Management</h2>

                <div className="deploy-section">
                    <button
                        onClick={handleDeploy}
                        disabled={deploying}
                        className="btn btn-primary"
                    >
                        {deploying ? '⏳ Deploying...' : '🚀 Deploy Now'}
                    </button>

                    {message && (
                        <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="deployment-history">
                    <h3>📊 Deployment History</h3>

                    {deployments.length === 0 ? (
                        <p className="no-data">Keine Deployments vorhanden</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Branch</th>
                                    <th>Gestartet</th>
                                    <th>Abgeschlossen</th>
                                    <th>Ausgelöst von</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deployments.map(d => (
                                    <tr key={d.id}>
                                        <td>
                                            <span className={`status-badge status-${d.status}`}>
                                                {getStatusIcon(d.status)} {d.status}
                                            </span>
                                        </td>
                                        <td>{d.branch}</td>
                                        <td>{formatDate(d.started_at)}</td>
                                        <td>{formatDate(d.completed_at)}</td>
                                        <td>{d.triggered_by_email || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <style jsx>{`
                .deployment-management {
                    padding: 20px;
                }

                .card {
                    background: white;
                    border-radius: 8px;
                    padding: 24px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .deploy-section {
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #ff7a1a;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #ea6f00;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(255, 122, 26, 0.3);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .message {
                    margin-top: 12px;
                    padding: 12px;
                    border-radius: 6px;
                    font-weight: 500;
                }

                .message.success {
                    background: #d4edda;
                    color: #155724;
                }

                .message.error {
                    background: #f8d7da;
                    color: #721c24;
                }

                .deployment-history {
                    margin-top: 32px;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 16px;
                }

                .data-table th,
                .data-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e9ecef;
                }

                .data-table th {
                    background: #f8f9fa;
                    font-weight: 600;
                    color: #495057;
                }

                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .status-success {
                    background: #d4edda;
                    color: #155724;
                }

                .status-failure {
                    background: #f8d7da;
                    color: #721c24;
                }

                .status-running {
                    background: #fff3cd;
                    color: #856404;
                }

                .no-data {
                    text-align: center;
                    color: #6c757d;
                    padding: 32px;
                }
            `}</style>
        </div>
    );
}
