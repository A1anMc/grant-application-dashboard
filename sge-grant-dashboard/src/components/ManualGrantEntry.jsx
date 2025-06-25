import React, { useState } from 'react';
import './ManualGrantEntry.css';

const ManualGrantEntry = ({ onGrantAdded, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        funder: '',
        description: '',
        amount: '',
        deadline: '',
        source_url: '',
        status: 'potential',
        added_by: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Grant name is required';
        }
        
        if (!formData.funder.trim()) {
            newErrors.funder = 'Funder/Organization is required';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.deadline && formData.deadline !== 'Ongoing') {
            const date = new Date(formData.deadline);
            if (isNaN(date.getTime())) {
                newErrors.deadline = 'Invalid date format';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted!', formData);
        
        if (!validateForm()) {
            console.log('Validation failed');
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        console.log('Submitting to API...');

        try {
            const submitData = {
                ...formData,
                amount: formData.amount || 'Contact for details',
                deadline: formData.deadline || 'Ongoing',
                added_by: formData.added_by || 'Dashboard User'
            };

            const response = await fetch('/api/grants/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add grant');
            }

            const newGrant = await response.json();
            console.log('Grant added successfully:', newGrant);
            
            setSuccessMessage(`Grant "${newGrant.name}" added successfully! Eligibility: ${newGrant.eligibility.category}`);
            
            // Reset form
            setFormData({
                name: '',
                funder: '',
                description: '',
                amount: '',
                deadline: '',
                source_url: '',
                status: 'potential',
                added_by: ''
            });

            // Notify parent component
            if (onGrantAdded) {
                onGrantAdded(newGrant);
            }

        } catch (error) {
            console.error('Error adding grant:', error);
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="manual-grant-entry">
            <div className="entry-header">
                <h2>Add Grant Manually</h2>
                <button className="close-btn" onClick={onClose} type="button">
                    ✕
                </button>
            </div>

            {successMessage && (
                <div className="success-message">
                    ✅ {successMessage}
                </div>
            )}

            {errors.submit && (
                <div className="error-message">
                    ❌ {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grant-form">
                <div className="form-group">
                    <label htmlFor="name">Grant Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? 'error' : ''}
                        placeholder="e.g., Documentary Production Grant"
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="funder">Funder/Organization *</label>
                    <input
                        type="text"
                        id="funder"
                        name="funder"
                        value={formData.funder}
                        onChange={handleInputChange}
                        className={errors.funder ? 'error' : ''}
                        placeholder="e.g., Screen Australia"
                    />
                    {errors.funder && <span className="error-text">{errors.funder}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={errors.description ? 'error' : ''}
                        placeholder="Describe what this grant funds and any key requirements..."
                        rows="4"
                    />
                    {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="amount">Amount</label>
                        <input
                            type="text"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="e.g., $50,000 - $150,000"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="deadline">Deadline</label>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className={errors.deadline ? 'error' : ''}
                        />
                        {errors.deadline && <span className="error-text">{errors.deadline}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="source_url">Source URL</label>
                    <input
                        type="url"
                        id="source_url"
                        name="source_url"
                        value={formData.source_url}
                        onChange={handleInputChange}
                        placeholder="https://..."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="potential">Potential</option>
                            <option value="drafting">Drafting</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="added_by">Added By</label>
                        <input
                            type="text"
                            id="added_by"
                            name="added_by"
                            value={formData.added_by}
                            onChange={handleInputChange}
                            placeholder="Your name"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding Grant...' : 'Add Grant'}
                    </button>
                </div>
            </form>

            <div className="help-text">
                <p><strong>Tips:</strong></p>
                <ul>
                    <li>The system will automatically assess eligibility based on keywords</li>
                    <li>Tags will be generated automatically from the description</li>
                    <li>Leave amount blank for "Contact for details"</li>
                    <li>Leave deadline blank for "Ongoing"</li>
                </ul>
            </div>
        </div>
    );
};

export default ManualGrantEntry; 