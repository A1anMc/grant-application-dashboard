import React, { useState, useEffect } from 'react';
import './StickyNoteModal.css';

const StickyNoteModal = ({ 
  isOpen, 
  onClose, 
  grantId, 
  initialNote = '', 
  onSaveNote,
  grantTitle = 'Grant'
}) => {
  const [note, setNote] = useState(initialNote);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, grantId]);

  const handleSave = async () => {
    if (!note.trim()) return;
    
    setIsSaving(true);
    try {
      await onSaveNote(grantId, note);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (note !== initialNote) {
      const shouldSave = window.confirm('Save your changes before closing?');
      if (shouldSave) {
        handleSave();
      } else {
        setNote(initialNote);
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sticky-note-modal-overlay" onClick={handleClose}>
      <div className="sticky-note-modal" onClick={(e) => e.stopPropagation()}>
        {/* Decorative elements */}
        <div className="note-tape note-tape-1"></div>
        <div className="note-tape note-tape-2"></div>
        <div className="note-paperclip"></div>
        
        <div className="note-header">
          <h3>📝 Quick Note</h3>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className="note-grant-info">
          <span className="grant-title">{grantTitle}</span>
        </div>
        
        <div className="note-content">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your notes here... (ideas, reminders, questions, etc.)"
            className="note-textarea"
            rows={8}
            autoFocus
          />
        </div>
        
        <div className="note-footer">
          <div className="note-actions">
            <button 
              className="btn-secondary"
              onClick={() => setNote('')}
              disabled={!note.trim()}
            >
              Clear
            </button>
            <button 
              className="btn-primary"
              onClick={handleSave}
              disabled={!note.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
          
          <div className="note-tips">
            <small>💡 Tip: Use this space for quick thoughts, reminders, or questions about this grant.</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyNoteModal; 