import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as fabric from 'fabric';
import { useAuth } from './context/AuthContext';
import Modal from './components/Modal';
import Toast from './components/Toast';
import PrintPreview from './components/PrintPreview';
import CalibrationMode from './components/CalibrationMode';
import PrintFeedback from './components/PrintFeedback';
import SaveProjectModal from './components/SaveProjectModal';
import { Calculator, Trash2 } from 'lucide-react';

const CanvasEditor = () => {
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [template, setTemplate] = useState('mug'); // 'mug' or 'a4'
    const [projects, setProjects] = useState([]);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [notification, setNotification] = useState(null);
    const [printOffset, setPrintOffset] = useState(-5);
    const [showPreview, setShowPreview] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showCalibration, setShowCalibration] = useState(false);
    const [userOffset, setUserOffset] = useState(0);
    const [currentProject, setCurrentProject] = useState(null); // Track loaded project
    const [showFeedback, setShowFeedback] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track if canvas has changes

    const showNotify = (message, type = 'info') => {
        setNotification({ message, type });
    };

    // Template dimensions in pixels (approx 300 DPI or scaled for screen, 1mm = 4px)
    const templates = {
        // Klassiker
        a4: { width: 840, height: 1188, label: 'Standardformat A4 (21x29,7cm)' },
        a3: { width: 1188, height: 1680, label: 'Großformat A3 (29,7x42cm)' },

        // Tassen
        mug: { width: 800, height: 380, label: 'Tasse Standard (200x95mm)' },
        mug_wrap: { width: 800, height: 360, label: 'Tassen-Wrap (200x90mm)' },
        mug_xl: { width: 880, height: 360, label: 'XL-Tassenformat (220x90mm)' },
        tumbler: { width: 1000, height: 400, label: 'Thermobecher (250x100mm)' },

        // Textil
        pocket: { width: 400, height: 400, label: 'Brustlogo (10x10cm)' },
        shirt_front: { width: 800, height: 1200, label: 'Frontprint Standard (20x30cm)' },
        shirt_back: { width: 1200, height: 1600, label: 'Rücken / Groß (30x40cm)' },

        // Deko
        photo_small: { width: 600, height: 800, label: 'Fotoformat klein (15x20cm)' },
        photo_medium: { width: 800, height: 1200, label: 'Fotoformat mittel (20x30cm)' },
        photo_large: { width: 1200, height: 1600, label: 'Wandbild groß (30x40cm)' },

        // Büro
        mousepad: { width: 920, height: 760, label: 'Mousepad (23x19cm)' },
        deskmat: { width: 1600, height: 1200, label: 'Desk-Mat (40x30cm)' }
    };

    const TEMPLATE_CATEGORIES = [
        { id: 'classic', label: '🖼️ Klassische Druckformate', items: ['a4', 'a3'] },
        { id: 'mugs', label: '☕ Tassen & Trinkgefäße', items: ['mug', 'mug_wrap', 'mug_xl', 'tumbler'] },
        { id: 'textile', label: '👕 Textilien', items: ['pocket', 'shirt_front', 'shirt_back'] },
        { id: 'deco', label: '🧩 Deko & Foto', items: ['photo_small', 'photo_medium', 'photo_large'] },
        { id: 'office', label: '🖱️ Büro & Werbeartikel', items: ['mousepad', 'deskmat'] }
    ];

    const [customTemplates, setCustomTemplates] = useState([]);

    // Form state for new profile
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [newProfile, setNewProfile] = useState({ name: '', width: '', height: '' });

    // Combine standard and custom templates
    const allTemplates = {
        ...templates,
        ...customTemplates.reduce((acc, t) => ({ ...acc, [t.key]: t }), {})
    };
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);


    // Load custom templates and projects from API
    useEffect(() => {
        if (token) {
            // Load templates
            fetch('/api/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        // Only show non-standard templates in "My Profiles"
                        // (Standard templates are handled by predefined list)
                        const normalized = data
                            .filter(t => t.is_standard === false && t.created_by !== null)
                            .map(t => ({
                                id: t.id,
                                key: `custom_${t.id}`,
                                name: t.name,
                                width: t.width,
                                height: t.height,
                                label: `${t.name} (${t.width / 4}x${t.height / 4}mm)`
                            }));
                        setCustomTemplates(normalized);
                    }
                })
                .catch(err => console.error("Failed to load templates", err));

            // Load projects list
            loadProjects();
        }
    }, [token]);

    // Load user's default offset on mount (ONLY ONCE - prevents re-triggering when user object updates)
    useEffect(() => {
        console.log('🔍 Offset Loading Effect Triggered', { token: !!token, user: user?.email });
        if (token && user) {
            console.log('📊 User Data:', {
                email: user.email,
                default_offset: user.default_offset,
                has_default_offset: user.default_offset !== undefined && user.default_offset !== null
            });

            // Try to load from user profile
            if (user.default_offset !== undefined && user.default_offset !== null) {
                setUserOffset(user.default_offset);
                console.log('✅ Loaded offset from user profile:', user.default_offset);
            } else {
                // Fallback to localStorage
                const savedOffset = localStorage.getItem('sublymaster_user_offset');
                console.log('🔄 User profile has no offset, checking localStorage:', savedOffset);
                if (savedOffset !== null) {
                    setUserOffset(parseFloat(savedOffset));
                    console.log('✅ Loaded offset from localStorage:', savedOffset);
                } else {
                    console.log('⚠️ No offset found in profile or localStorage, using default: 0');
                }
            }
        } else {
            console.log('⏸️ Offset loading skipped - missing token or user');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run ONLY on mount - prevents canvas reset when user object updates after saving offset

    const loadProjects = () => {
        fetch('/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProjects(data);
            })
            .catch(err => console.error("Failed to load projects", err));
    };


    // Load User Settings (Offset)
    useEffect(() => {
        if (token) {
            fetch('/api/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.offset_top) setUserOffset(data.offset_top);
                })
                .catch(err => console.error("Failed to load settings", err));
        }
    }, [token]);

    const handleSaveOffset = (offset) => {
        if (!token) {
            setUserOffset(offset);
            setShowCalibration(false);
            return;
        }

        fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ default_offset: offset })
        })
            .then(async res => {
                if (res.ok) {
                    setUserOffset(offset);
                    localStorage.setItem('sublymaster_user_offset', offset); // Backup to localStorage
                    setShowCalibration(false);
                    showNotify(`Offset von ${offset}mm gespeichert!`, 'success');
                } else {
                    const data = await res.json();
                    showNotify(`Fehler beim Speichern: ${data.error || 'Unbekannt'}`, 'error');
                }
            })
            .catch(err => {
                console.error("Save Offset Error:", err);
                showNotify('Netzwerkfehler beim Speichern', 'error');
            });
    };

    const saveProject = async (name) => {
        if (!name || !name.trim()) {
            showNotify('Bitte einen Namen eingeben', 'error');
            return;
        }

        setIsSavingProject(true);
        const canvas = fabricCanvasRef.current;
        const projectData = canvas.toJSON();
        const thumbnail = canvas.toDataURL({ format: 'jpeg', quality: 0.5, multiplier: 0.2 });

        console.log('💾 Saving Project:', {
            name: name.trim(),
            objectCount: canvas.getObjects().length,
            offset: userOffset
        });

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    data: projectData,
                    thumbnail: thumbnail,
                    template: template, // Save the current template key
                    offset_top: userOffset, // Save calibration offset
                    offset_left: 0 // Currently only top offset is used
                })
            });

            if (res.ok) {
                showNotify('Projekt gespeichert', 'success');
                setShowSaveModal(false);
                loadProjects(); // Reload project list
            } else {
                showNotify('Fehler beim Speichern (Datei eventuell zu groß)', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotify('Fehler beim Speichern', 'error');
        } finally {
            setIsSavingProject(false);
        }
    };

    // Handle "New Design" - Auto-save current and clear canvas
    const handleNewDesign = async () => {
        const canvas = fabricCanvasRef.current;
        const objectCount = canvas.getObjects().length;

        // If there are objects on canvas, auto-save first
        if (objectCount > 0 && hasUnsavedChanges) {
            console.log('🆕 New Design: Auto-saving current design before clearing...');

            // Generate auto-save name with timestamp
            const timestamp = new Date().toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/[,:\s]/g, '_');
            const autoSaveName = `Auto-Save_${timestamp}`;

            try {
                await saveProject(autoSaveName);
                showNotify('Aktuelles Design automatisch gespeichert', 'success');
            } catch (err) {
                console.error('Auto-save failed:', err);
                showNotify('Auto-Speichern fehlgeschlagen', 'error');
                return; // Don't clear if save failed
            }
        }

        // Clear canvas
        console.log('🆕 Clearing canvas for new design');
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();

        setCurrentProject(null);
        setProjectName('');
        setHasUnsavedChanges(false);
        showNotify('Neues Design gestartet', 'info');
    };

    const loadProject = async (projectId) => {
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const canvas = fabricCanvasRef.current;
                // console.log("Project Data retrieved:", data);
                setCurrentProject(data.id); // Set current project ID

                // 1. Restore template dimensions first
                if (data.template && allTemplates[data.template]) {
                    setTemplate(data.template);
                    const dims = allTemplates[data.template];
                    canvas.setDimensions({ width: dims.width, height: dims.height });
                }

                // 1.5 Restore calibration offset
                if (data.offset_top !== undefined) {
                    setUserOffset(data.offset_top);
                    console.log('✅ Restored offset from project:', data.offset_top);
                } else {
                    console.log('⚠️ No offset found in project data');
                }

                // 2. Prepare canvas
                canvas.clear();
                canvas.backgroundColor = '#ffffff';
                canvas.setZoom(1);
                canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

                let projectJson;
                try {
                    projectJson = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                    if (typeof projectJson === 'string') projectJson = JSON.parse(projectJson);
                } catch (e) {
                    projectJson = data.data;
                }

                // 3. Load Objects (Fabric v7/v6 uses promises for loadFromJSON)
                canvas.loadFromJSON(projectJson).then(() => {
                    console.log("loadFromJSON Promise resolved");

                    // 4. Re-add Watermark if Free Plan & NOT ADMIN (Ensure only ONE exists)
                    if (user && user.role !== 'admin' && user.plan_id === 1) {
                        const existingWM = canvas.getObjects().find(o => o.text === 'SUBLYMASTER');
                        if (!existingWM) {
                            const watermark = new fabric.Text('SUBLYMASTER', {
                                id: 'system-watermark',
                                fontSize: 60,
                                fill: 'rgba(200, 200, 200, 0.4)',
                                angle: -45,
                                originX: 'center',
                                originY: 'center',
                                selectable: false,
                                evented: false,
                                top: canvas.height / 2,
                                left: canvas.width / 2
                            });
                            canvas.add(watermark);
                            canvas.centerObject(watermark);
                        } else {
                            existingWM.set({
                                selectable: false,
                                evented: false,
                                opacity: 0.4,
                                id: 'system-watermark'
                            });
                        }
                    } else if (user?.role === 'admin') {
                        // Admins should not see any system watermark
                        const existingWM = canvas.getObjects().find(o => o.text === 'SUBLYMASTER');
                        if (existingWM) canvas.remove(existingWM);
                    }

                    canvas.renderAll();
                    setShowLoadModal(false);
                    showNotify('Layout erfolgreich geladen', 'success');

                    console.log("Load Sync - Canvas Objects count:", canvas.getObjects().length);
                    canvas.getObjects().forEach((obj, i) => {
                        console.log(`Obj ${i} (${obj.type}): left=${obj.left}, top=${obj.top}, width=${obj.width}, height=${obj.height}, scaleX=${obj.scaleX}, scaleY=${obj.scaleY}, visible=${obj.visible}, opacity=${obj.opacity}`);
                        if (obj.type === 'image' || obj.type === 'Image') {
                            console.log(`Image ${i} src:`, (obj.src || obj._element?.src || 'NO_SRC').substring(0, 100) + '...');
                        }
                    });
                }).catch(err => {
                    console.error("Fabric loadFromJSON error:", err);
                    showNotify('Fehler beim Rendern des Layouts', 'error');
                });
            }
        } catch (err) {
            console.error("Load Project Exception:", err);
            showNotify('Fehler beim Laden', 'error');
        }
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            const res = await fetch(`/api/projects/${projectToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setProjects(projects.filter(p => p.id !== projectToDelete));
                showNotify('Projekt gelöscht', 'success');
                setShowDeleteConfirm(false);
                setProjectToDelete(null);
            } else {
                showNotify('Fehler beim Löschen', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotify('Fehler beim Löschen', 'error');
        }
    };

    const requestDeleteProject = (e, id) => {
        e.stopPropagation();
        setProjectToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handlePrintRequest = () => {
        // Account Status Check
        if (user?.account_status === 'suspended') {
            showNotify("Dein Account ist gesperrt. Bitte prüfe deine Zahlungen.", 'error');
            return;
        }

        const canvas = fabricCanvasRef.current;
        const MULTIPLIER = 3;

        // Generate Image for Preview
        const dataUrl = canvas.toDataURL({
            format: 'png',
            multiplier: MULTIPLIER
        });

        setPreviewImage(dataUrl);
        setShowPreview(true);
    };

    const confirmPrint = () => {
        setShowPreview(false);
        const canvas = fabricCanvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        // Scale 1mm = 4px
        const PX_PER_MM = 4;

        let startW = width / PX_PER_MM;
        let startH = height / PX_PER_MM;

        const needsRotation = startW > startH;

        let finalPageW = startW;
        let finalPageH = startH;

        if (needsRotation) {
            finalPageW = startH;
            finalPageH = startW;
        }

        // Use the generated preview image or regen (regen is safer for closure context if needed, but we have dataUrl in args if passed? 
        // actually easier to Regen or use state. Let's regen to be safe/clean code, or just use state.)
        // We'll regen or pass it.
        const dataUrl = previewImage;

        const offsetTop = printOffset;

        // THE FINAL PRINT FIX ("Der Anker")
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <style>
                        @page { size: 95mm 200mm; margin: 0; }
                        body { 
                            margin: 0; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            height: 200mm; 
                            width: 95mm; 
                        }
                        img { 
                            width: 200mm; 
                            height: 95mm; 
                            transform: rotate(90deg); 
                            transform-origin: center; 
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" onload="window.print(); window.close();" />
                </body>
            </html>
        `);
        printWindow.document.close();

        // Log Print to Backend & Decrement Credit
        const logPrint = async () => {
            if (!token) return;
            try {
                await fetch('/api/print/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        fileName: projects.find(p => p.id === currentProject)?.name || 'Unbenanntes Design',
                        format: allTemplates[template]?.name || 'Format'
                    })
                });
            } catch (e) { console.error("Log failed", e); }
        };
        logPrint();

        // Redirect to Success Page after a short delay
        setTimeout(() => {
            const remainingCredits = user?.credits > 0 ? user.credits - 1 : 0; // Optimistic update
            navigate(`/print/success?credits=${remainingCredits}`);
        }, 3000);
    };

    // Save custom template
    const saveCustomProfile = async () => {
        if (!newProfile.name || !newProfile.width || !newProfile.height) {
            showNotify('Bitte alle Felder ausfüllen.', 'error');
            return;
        }

        const widthPx = parseInt(newProfile.width) * 4; // 1mm = 4px approx
        const heightPx = parseInt(newProfile.height) * 4;

        if (token) {
            try {
                const res = await fetch('/api/templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: newProfile.name,
                        width: widthPx,
                        height: heightPx
                    })
                });

                if (res.ok) {
                    const saved = await res.json();
                    const newTemplate = {
                        id: saved.id,
                        key: `custom_${saved.id}`,
                        name: saved.name,
                        width: saved.width,
                        height: saved.height,
                        label: `${saved.name}(${saved.width / 4}x${saved.height / 4}mm)`
                    };
                    setCustomTemplates([...customTemplates, newTemplate]);
                    setTemplate(newTemplate.key); // Select it using the new key
                    setIsCustomMode(false);
                    setNewProfile({ name: '', width: '', height: '' });
                    showNotify('Vorlage gespeichert', 'success');
                } else {
                    showNotify('Fehler beim Speichern der Vorlage', 'error');
                }
            } catch (err) {
                console.error(err);
                showNotify('Fehler beim Speichern', 'error');
            }
        } else {
            showNotify('Bitte einloggen um Vorlagen zu speichern.', 'info');
        }
    };

    const handleTemplateChange = (e) => {
        const val = e.target.value;
        if (val === 'new_custom') {
            setIsCustomMode(true);
        } else {
            setIsCustomMode(false);
            setTemplate(val);
        }
    };

    useEffect(() => {
        if (canvasRef.current && !fabricCanvasRef.current) {
            const canvas = new fabric.Canvas(canvasRef.current, {
                height: templates[template].height,
                width: templates[template].width,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
            });
            fabricCanvasRef.current = canvas;

            // Add Watermark (ONLY IF FREE PLAN)
            // Plan ID 1 = Free, Plan ID > 1 = Pro
            let watermark = null;
            if (!user || (user.role !== 'admin' && user.plan_id === 1)) {
                watermark = new fabric.Text('SUBLYMASTER', {
                    fontSize: 60,
                    fill: 'rgba(200, 200, 200, 0.4)',
                    angle: -45,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    evented: false,
                    top: 200,
                    left: 400
                });
                canvas.add(watermark);
                canvas.centerObject(watermark);

                // Re-render watermark on top after every render
                canvas.on('after:render', () => {
                    canvas.bringObjectToFront(watermark);
                });
            }

            // Smart Guides Implementation
            canvas.on('object:moving', (e) => {
                const obj = e.target;
                const canvasHeight = canvas.height;
                const canvasWidth = canvas.width;
                const snapDist = 10; // pixels

                // Clear existing guides
                canvas.getObjects().forEach((o) => {
                    if (o.id === 'guide') canvas.remove(o);
                });

                const guidelines = [];
                const gapLines = [];

                const objWidth = obj.getScaledWidth();
                const objHeight = obj.getScaledHeight();
                const objCenterY = obj.top + objHeight / 2;
                const objCenterX = obj.left + objWidth / 2;

                // 1. Center Snapping (Canvas)
                if (Math.abs(objCenterX - canvasWidth / 2) < snapDist) {
                    obj.set({ left: canvasWidth / 2 - objWidth / 2 });
                    guidelines.push({ type: 'vertical', x: canvasWidth / 2 });
                }
                if (Math.abs(objCenterY - canvasHeight / 2) < snapDist) {
                    obj.set({ top: canvasHeight / 2 - objHeight / 2 });
                    guidelines.push({ type: 'horizontal', y: canvasHeight / 2 });
                }

                // 2. Object Alignment & Symmetry
                canvas.getObjects().forEach((target) => {
                    if (target === obj || target.id === 'guide' || target instanceof fabric.Line || target.text === 'SUBLYMASTER') return;

                    const targetWidth = target.getScaledWidth();
                    const targetHeight = target.getScaledHeight();
                    const targetCenterY = target.top + targetHeight / 2;
                    const targetCenterX = target.left + targetWidth / 2;

                    // Horizontal Alignments (Top, Center, Bottom)
                    if (Math.abs(obj.top - target.top) < snapDist) { // Top-Top
                        obj.set({ top: target.top });
                        guidelines.push({ type: 'horizontal', y: target.top });
                    }
                    if (Math.abs(objCenterY - targetCenterY) < snapDist) { // Center-Center
                        obj.set({ top: targetCenterY - objHeight / 2 });
                        guidelines.push({ type: 'horizontal', y: targetCenterY });
                    }
                    if (Math.abs((obj.top + objHeight) - (target.top + targetHeight)) < snapDist) { // Bottom-Bottom
                        obj.set({ top: target.top + targetHeight - objHeight });
                        guidelines.push({ type: 'horizontal', y: target.top + targetHeight });
                    }

                    // Vertical Alignments (Left, Center, Right)
                    if (Math.abs(objCenterX - targetCenterX) < snapDist) { // Center-Center
                        obj.set({ left: targetCenterX - objWidth / 2 });
                        guidelines.push({ type: 'vertical', x: targetCenterX });
                    }

                    // 3. Symmetrical Spacing from Canvas Edges
                    // Case 1: Active Object (Left Side) matching Target (Right Side)
                    // Obj Left Gap vs Target Right Gap
                    const targetRightGap = canvasWidth - (target.left + targetWidth);
                    if (Math.abs(obj.left - targetRightGap) < snapDist) {
                        obj.set({ left: targetRightGap });
                        // Visualize the equal gaps
                        gapLines.push({ x1: 0, y1: objCenterY, x2: obj.left, y2: objCenterY });
                        gapLines.push({ x1: target.left + targetWidth, y1: targetCenterY, x2: canvasWidth, y2: targetCenterY });
                    }

                    // Case 2: Active Object (Right Side) matching Target (Left Side)
                    // Obj Right Gap vs Target Left Gap
                    const myRightGap = canvasWidth - (obj.left + objWidth);
                    const targetLeftGap = target.left; // Gap from 0 to left

                    if (Math.abs(myRightGap - targetLeftGap) < snapDist) {
                        const newLeft = canvasWidth - targetLeftGap - objWidth;
                        obj.set({ left: newLeft });

                        // Visualize the equal gaps
                        gapLines.push({ x1: newLeft + objWidth, y1: objCenterY, x2: canvasWidth, y2: objCenterY });
                        gapLines.push({ x1: 0, y1: targetCenterY, x2: target.left, y2: targetCenterY });
                    }
                });

                // Draw Guidelines (Alignment - Red Dashed)
                guidelines.forEach(guide => {
                    const line = guide.type === 'vertical'
                        ? new fabric.Line([guide.x, 0, guide.x, canvasHeight], { strokeDashArray: [5, 5] })
                        : new fabric.Line([0, guide.y, canvasWidth, guide.y], { strokeDashArray: [5, 5] });

                    line.set({
                        id: 'guide',
                        stroke: 'red',
                        strokeWidth: 1,
                        selectable: false,
                        evented: false,
                        opacity: 0.8
                    });
                    canvas.add(line);
                });

                // Draw Gap Lines (Symmetry - Blue Solid)
                gapLines.forEach(gap => {
                    const line = new fabric.Line([gap.x1, gap.y1, gap.x2, gap.y2], {
                        id: 'guide',
                        stroke: '#3b82f6', // Blue-500
                        strokeWidth: 2,
                        selectable: false,
                        evented: false
                    });
                    canvas.add(line);
                });

                canvas.requestRenderAll();
            });

            canvas.on('mouse:up', () => {
                canvas.getObjects().forEach((o) => {
                    if (o.id === 'guide') canvas.remove(o);
                });
                canvas.requestRenderAll();
            });

            // Draw safety lines (bleed)
            updateCanvasTemplate(template);
            drawRulers(canvas);

            canvas.on('after:render', () => {
                // Keep watermark on top
                canvas.bringObjectToFront(watermark);
            });
        }
    }, [user]);

    // Helper to draw rulers
    const drawRulers = (canvas) => {
        // This is a simplified ruler implementation using static HTML/CSS overlay or drawing on canvas
        // For better performance/interaction, drawing on a separate canvas is often used, 
        // but here we will try to calculate measuring lines on the main canvas or use a wrapper.

        // BETTER APPROACH: Fabric.js doesn't have built-in rulers. 
        // We will create a visual grid/ruler overlay.

        // Actually, for "Checking distance to edge", grid lines are most helpful.
        // Let's add a toggleable Grid/Ruler visual.
    };

    // ... we will actually implement this in the JSX return as a wrapper 
    // to avoid polluting the fabric canvas with non-interactive ruler elements that might get selected.
    // See returns below.


    // Update canvas size when template changes
    // Unified update logic in Effect
    useEffect(() => {
        if (fabricCanvasRef.current) {
            const allVars = {
                ...templates,
                ...customTemplates.reduce((acc, t) => ({ ...acc, [t.id]: t }), {})
            };

            if (allVars[template]) {
                const dims = allVars[template];
                fabricCanvasRef.current.setDimensions({ width: dims.width, height: dims.height });
            }
        }
    }, [template, customTemplates]);

    const updateCanvasTemplate = (type) => {
        const canvas = fabricCanvasRef.current;
        const dims = templates[type];
        canvas.setDimensions({ width: dims.width, height: dims.height });

        // Clear previous grid/guides (optional, simplistic approach)
        // In a real app we'd tag them to remove only guides
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (f) => {
            const imgElement = document.createElement('img');
            imgElement.src = f.target.result;
            imgElement.onload = () => {
                const imgInstance = new fabric.Image(imgElement);
                imgInstance.scaleToWidth(200); // Initial reasonable size
                fabricCanvasRef.current.add(imgInstance);
                fabricCanvasRef.current.setActiveObject(imgInstance);
            }
        };
        reader.readAsDataURL(file);
    };

    const snapToPosition = (position) => {
        const canvas = fabricCanvasRef.current;
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        const canvasWidth = canvas.width;
        // const canvasHeight = canvas.height;
        const objWidth = activeObj.getScaledWidth();

        if (position === 'left') {
            activeObj.set({ left: 0 });
        } else if (position === 'center') {
            activeObj.set({ left: (canvasWidth - objWidth) / 2 });
        } else if (position === 'right') {
            activeObj.set({ left: canvasWidth - objWidth });
        }

        activeObj.setCoords();
        canvas.requestRenderAll();
    };

    const toggleMirror = () => {
        const canvas = fabricCanvasRef.current;
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        activeObj.set('scaleX', -activeObj.scaleX);
        canvas.requestRenderAll();
    };

    const duplicateObject = () => {
        const canvas = fabricCanvasRef.current;
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        activeObj.clone().then((cloned) => {
            cloned.set({
                left: activeObj.left + 20,
                top: activeObj.top + 20,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
        });
    }

    const deleteObject = () => {
        const canvas = fabricCanvasRef.current;
        const activeObjects = canvas.getActiveObjects();

        if (activeObjects.length) {
            canvas.discardActiveObject();
            activeObjects.forEach((obj) => {
                canvas.remove(obj);
            });
            canvas.requestRenderAll();
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteObject();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);



    // ... (keep handleImageUpload, snapToPosition, etc. - ensure updateCanvasTemplate uses allTemplates) ...

    // Fix updateCanvasTemplate scope or use effect directly
    // Ideally we modify the useEffect above to handle dimension updates completely

    return (
        <div className="flex flex-col items-center p-4">
            <div className="mb-4 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg shadow-sm w-full max-w-4xl justify-center items-end border border-gray-200">

                <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 mb-1">Vorlage wählen</label>
                    <select
                        value={isCustomMode ? 'new_custom' : template}
                        onChange={handleTemplateChange}
                        className="p-2 border rounded-md shadow-sm bg-white"
                    >
                        {TEMPLATE_CATEGORIES.map(cat => (
                            <optgroup key={cat.id} label={cat.label}>
                                {cat.items.map(key => (
                                    <option key={key} value={key}>{templates[key].label}</option>
                                ))}
                            </optgroup>
                        ))}

                        {customTemplates.length > 0 && (
                            <optgroup label="👤 Meine Profile">
                                {customTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </optgroup>
                        )}
                        <option value="new_custom" className="text-indigo-600 font-bold">+ Neues Profil erstellen...</option>
                    </select>
                </div>

                {isCustomMode && (
                    <div className="flex items-end gap-2 bg-indigo-50 p-2 rounded-md border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex flex-col w-32">
                            <label className="text-xs text-indigo-800 font-medium">Name</label>
                            <input
                                type="text"
                                placeholder="z.B. iPhone Case"
                                className="p-1.5 border rounded text-sm"
                                value={newProfile.name}
                                onChange={e => setNewProfile({ ...newProfile, name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-20">
                            <label className="text-xs text-indigo-800 font-medium">Breite (mm)</label>
                            <input
                                type="number"
                                placeholder="200"
                                className="p-1.5 border rounded text-sm"
                                value={newProfile.width}
                                onChange={e => setNewProfile({ ...newProfile, width: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-20">
                            <label className="text-xs text-indigo-800 font-medium">Höhe (mm)</label>
                            <input
                                type="number"
                                placeholder="95"
                                className="p-1.5 border rounded text-sm"
                                value={newProfile.height}
                                onChange={e => setNewProfile({ ...newProfile, height: e.target.value })}
                            />
                        </div>
                        <button
                            onClick={saveCustomProfile}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-bold shadow hover:bg-indigo-500 h-[34px]"
                        >
                            Speichern
                        </button>
                    </div>
                )}

                <div className="h-10 w-px bg-gray-300 mx-2 hidden sm:block"></div>

                <div className="flex flex-col justify-end">
                    <label className="text-xs font-bold text-gray-500 mb-1">Bild hinzufügen</label>
                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 border border-indigo-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Datei auswählen
                        <input type="file" onChange={handleImageUpload} className="hidden" />
                    </label>
                </div>

                <div className="h-10 w-px bg-gray-300 mx-4 hidden sm:block"></div>

                <div className="flex gap-2 items-center">


                    <button
                        onClick={handlePrintRequest}
                        className="flex flex-col items-center justify-center p-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm border border-emerald-700"
                    >
                        <span className="text-xs font-bold uppercase tracking-tighter">Drucken</span>
                    </button>
                    <button
                        onClick={() => setShowCalibration(true)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 text-blue-700"
                        title="Drucker Kalibrieren"
                    >
                        <Calculator size={18} />
                    </button>
                    <button
                        onClick={() => setShowLoadModal(true)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
                    >
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-tighter">Design laden</span>
                    </button>
                    <button
                        onClick={handleNewDesign}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm border border-orange-600"
                        title="Aktuelles Design speichern und neues beginnen"
                    >
                        <span className="text-xs font-bold uppercase tracking-tighter">Neues Design</span>
                    </button>
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm border border-indigo-700"
                    >
                        <span className="text-xs font-bold uppercase tracking-tighter">Design speichern</span>
                    </button>
                </div>
            </div>

            {/* Calibration Modal */}
            <Modal isOpen={showCalibration} onClose={() => setShowCalibration(false)} title="Drucker Kalibrierung">
                <CalibrationMode onSaveOffset={handleSaveOffset} currentOffset={userOffset} />
            </Modal>

            {/* Save Project Modal - Enhanced with Project List */}
            {showSaveModal && (
                <SaveProjectModal
                    projects={projects}
                    currentProjectName={projectName}
                    onSave={(name) => {
                        saveProject(name);
                        setProjectName(''); // Clear after save
                    }}
                    onCancel={() => {
                        setShowSaveModal(false);
                        setProjectName(''); // Clear on cancel
                    }}
                />
            )}

            <Modal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} title="Eigene Designs">
                <div className="py-2">
                    {projects.length === 0 ? (
                        <p className="text-center py-10 text-gray-500 italic">Noch keine Projekte gespeichert.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                            {projects.map(p => (
                                <div key={p.id} onClick={() => loadProject(p.id)} className="border rounded-xl cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all p-2 group shadow-sm bg-gray-50 relative">
                                    <div className="aspect-video bg-white mb-2 rounded border overflow-hidden flex items-center justify-center relative">
                                        {p.thumbnail ? (
                                            <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-gray-300">No Preview</span>
                                        )}
                                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    </div>
                                    <p className="text-sm font-semibold truncate px-1">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 px-1">{new Date(p.created_at).toLocaleDateString()}</p>

                                    <button
                                        onClick={(e) => requestDeleteProject(e, p.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-md shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all z-10 hover:scale-110"
                                        title="Löschen"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Custom Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Design Löschen"
            >
                <div className="text-center p-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Möchtest du dieses Design wirklich unwiderruflich löschen?
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={confirmDeleteProject}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition-colors"
                        >
                            Ja, weg damit!
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="flex gap-4 mb-4">
                <button onClick={() => snapToPosition('left')} className="btn-tool">Links</button>
                <button onClick={() => snapToPosition('center')} className="btn-tool">Mitte</button>
                <button onClick={() => snapToPosition('right')} className="btn-tool">Rechts</button>
                <div className="w-px bg-gray-400 mx-2"></div>
                <button onClick={toggleMirror} className="btn-tool bg-blue-100">↔ Spiegeln</button>
                <button onClick={duplicateObject} className="btn-tool bg-green-100">+ Duplizieren</button>
                <button onClick={deleteObject} className="btn-tool bg-red-100 text-red-600">Entfernen</button>
            </div>

            <div className="relative flex items-start">
                {/* Left Ruler */}
                <div
                    className="relative border-r border-gray-300 mr-1 select-none text-[10px] text-gray-400"
                    style={{ height: allTemplates[template]?.height || 500, width: '30px' }}
                >
                    {allTemplates[template] && [...Array(Math.ceil((allTemplates[template].height / 4) / 5) + 1)].map((_, i) => {
                        const is10mm = i % 2 === 0; // Every 2nd tick is 10mm
                        const mmValue = i * 5;
                        const maxMm = allTemplates[template].height / 4;
                        if (mmValue > maxMm) return null; // Don't show ticks beyond template height

                        return (
                            <div
                                key={i}
                                className="absolute right-0 border-b border-gray-300"
                                style={{
                                    top: `${i * 20}px`,
                                    width: is10mm ? '8px' : '4px' // 10mm: longer, 5mm: shorter
                                }}
                            >
                                {is10mm && <span className="absolute right-3 -top-2">{mmValue}</span>}
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col">
                    {/* Top Ruler */}
                    <div
                        className="relative border-b border-gray-300 mb-1 select-none text-[10px] text-gray-400"
                        style={{ width: allTemplates[template]?.width || 800, height: '20px' }}
                    >
                        {[...Array(Math.ceil((allTemplates[template]?.width / 4) / 5) + 1)].map((_, i) => {
                            const is10mm = i % 2 === 0; // Every 2nd tick is 10mm
                            const mmValue = i * 5;
                            const maxMm = allTemplates[template]?.width / 4;
                            if (mmValue > maxMm) return null; // Don't show ticks beyond template width

                            return (
                                <div
                                    key={i}
                                    className="absolute bottom-0 border-l border-gray-300"
                                    style={{
                                        left: `${i * 20}px`,
                                        height: is10mm ? '8px' : '4px' // 10mm: longer, 5mm: shorter
                                    }}
                                >
                                    {is10mm && <span className="absolute top-[-15px] -left-2">{mmValue}</span>}
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className="border border-gray-300 shadow-xl relative bg-white overflow-auto"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80vh'
                        }}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 italic">
                    <span className="font-bold text-gray-700">Tipp:</span> Zum Spiegeln Objekt auswählen und "Spiegeln" klicken. Wichtig für Sublimation!
                </p>
                <div className="px-3 py-1 bg-white border rounded text-[11px] font-bold text-gray-400 shadow-sm">
                    Editor Maßstab: 1mm = 4px
                </div>
            </div>

            {/* Print Preview Modal */}
            {/* Print Preview Modal */}
            {showPreview && (
                <PrintPreview
                    image={previewImage}
                    template={allTemplates[template]}
                    settings={{ offsetTop: userOffset }}
                    onCancel={() => setShowPreview(false)}
                    onPrint={() => {
                        setShowPreview(false);
                        setShowFeedback(true);
                    }}
                />
            )}

            {/* Print Feedback Widget */}
            {showFeedback && (
                <PrintFeedback
                    printerModel={user?.printerModel || "Mein Drucker"}
                    onSuccess={() => {
                        setShowFeedback(false);
                        showNotify("Danke! Wir merken uns das.", "success");
                        // Log success to Community Database
                        if (token) {
                            fetch('/api/printer/feedback', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    printerModel: user?.printerModel || "Unbekannt",
                                    usedOffset: userOffset,
                                    status: 'success'
                                })
                            }).catch(console.error);
                        }
                    }}
                    onAdjustmentNeeded={() => {
                        setShowFeedback(false);
                        showNotify("Öffne Kalibrierung...", "info");
                        // Log failure/adjustment needed
                        if (token) {
                            fetch('/api/printer/feedback', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    printerModel: user?.printerModel || "Unbekannt",
                                    usedOffset: userOffset,
                                    status: 'failed'
                                })
                            }).catch(console.error);
                        }
                        setShowCalibration(true);
                    }}
                />
            )}

            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default CanvasEditor;
