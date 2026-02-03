import { useState, useEffect } from 'react';
import { X, Clock, Image as ImageIcon } from 'lucide-react';

const SaveProjectModal = ({
    projects = [],
    currentProjectName = '',
    onSave,
    onCancel
}) => {
    const [projectName, setProjectName] = useState(currentProjectName);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);

    // Check if name is duplicate
    useEffect(() => {
        if (projectName.trim()) {
            const exists = projects.some(p => p.name.toLowerCase() === projectName.trim().toLowerCase());
            setIsDuplicate(exists);
        } else {
            setIsDuplicate(false);
        }
    }, [projectName, projects]);

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setProjectName(project.name);
    };

    const handleSaveClick = () => {
        if (!projectName.trim()) {
            return; // Don't save empty names
        }

        // If duplicate, show confirmation
        if (isDuplicate) {
            setShowOverwriteConfirm(true);
        } else {
            onSave(projectName.trim());
        }
    };

    const handleConfirmOverwrite = () => {
        setShowOverwriteConfirm(false);
        onSave(projectName.trim());
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Design/Layout speichern</h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Project List */}
                    <div className="w-2/5 border-r border-gray-200 flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                Gespeicherte Designs ({projects.length})
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {projects.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Noch keine Designs gespeichert</p>
                                </div>
                            ) : (
                                projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => handleProjectClick(project)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${selectedProject?.id === project.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                                            {project.thumbnail ? (
                                                <img
                                                    src={project.thumbnail}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon size={24} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">
                                                {project.name}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock size={12} />
                                                {formatDate(project.updated_at || project.created_at)}
                                            </p>
                                            {project.template && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {project.template}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Save Form */}
                    <div className="w-3/5 p-6 flex flex-col">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Projekt Name
                            </label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="w-full border-2 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="z.B. Mein cooles iPhone Design"
                                autoFocus
                            />

                            {/* Duplicate Warning */}
                            {isDuplicate && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                    <span className="text-amber-600 font-bold">⚠️</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-amber-800">
                                            Name bereits vergeben
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Ein Projekt mit diesem Namen existiert bereits.
                                            Beim Speichern wird es überschrieben.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-bold">💡 Tipp:</span> Klicken Sie auf ein Design in der Liste,
                                    um den Namen zu übernehmen und es zu aktualisieren.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSaveClick}
                                disabled={!projectName.trim()}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${projectName.trim()
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isDuplicate ? 'Überschreiben' : 'Projekt speichern'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overwrite Confirmation Dialog */}
            {showOverwriteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            Projekt überschreiben?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Ein Projekt mit dem Namen <span className="font-bold">"{projectName}"</span> existiert bereits.
                            Möchten Sie es wirklich überschreiben?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowOverwriteConfirm(false)}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleConfirmOverwrite}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-lg"
                            >
                                Ja, überschreiben
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaveProjectModal;
