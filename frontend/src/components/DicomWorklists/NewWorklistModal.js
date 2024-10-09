import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './NewWorklistModal.css';

Modal.setAppElement('#root');

const NewWorklistModal = ({ isOpen, onRequestClose, onSubmit, worklist, dicomNodes }) => {
    const [location, setLocation] = useState('');
    const [modality, setModality] = useState('');
    const [selectedNodes, setSelectedNodes] = useState({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (worklist) {
            setLocation(worklist.location);
            setModality(worklist.modality || '');
            const nodes = worklist.dicomNode ? worklist.dicomNode.split(',').reduce((acc, node) => {
                acc[node] = true;
                return acc;
            }, {}) : {};
            setSelectedNodes(nodes);
        } else {
            setLocation('');
            setModality('');
            setSelectedNodes({});
        }
    }, [worklist]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLocationChange = (e) => setLocation(e.target.value);
    const handleModalityChange = (e) => setModality(e.target.value);
    const handleNodeChange = (node) => {
        setSelectedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
    };

    const handleSubmit = async () => {
        if (!location) {
            setFormError('Location is required.');
            return;
        }

        const dicomNode = Object.keys(selectedNodes)
            .filter(node => selectedNodes[node])
            .join(',');

        const newWorklist = { 
            ...worklist, 
            location, 
            modality: modality || null, // Handle empty modality
            dicomNode: dicomNode || null // Handle empty dicomNode
        };

        console.log('Submitting worklist:', newWorklist);

        try {
            if (worklist) {
                await axios.put(`${process.env.REACT_APP_LOCALHOST}/dicomWorklists/dicomWorklists/${worklist.id}/`, newWorklist);
            } else {
                await axios.post(`${process.env.REACT_APP_LOCALHOST}/dicomWorklists/dicomWorklists/`, newWorklist);
            }
            onSubmit();
            onRequestClose();
        } catch (error) {
            console.error('Error saving worklist:', error);
            if (error.response && error.response.data) {
                setFormError(error.response.data.message || 'An error occurred while saving the worklist.');
            } else if (error.response) {
                setFormError(`An error occurred: ${error.response.status} - ${error.response.statusText}`);
            } else {
                setFormError('An error occurred while saving the worklist.');
            }
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onRequestClose} 
            className="new-worklist-modal" 
            overlayClassName="new-worklist-modal-overlay"
            shouldCloseOnOverlayClick={false} // Prevents the modal from closing when clicking outside
        >
            <h2>{worklist ? 'Edit Dicom Modality Worklist' : 'New Dicom Modality Worklist'}</h2>
            <div className="modal-content">
                <label>Location</label>
                <input 
                    type="text" 
                    value={location} 
                    onChange={handleLocationChange} 
                    placeholder="Enter location"
                />
                <label>Modality</label>
                <input 
                    type="text" 
                    value={modality} 
                    onChange={handleModalityChange} 
                    placeholder="Enter modality"
                />
                <label>Dicom Nodes </label>
                <div className="dropdown" ref={dropdownRef}>
                    <div className="dropdown-header" onClick={toggleDropdown}>
                        {Object.keys(selectedNodes).filter(node => selectedNodes[node]).length > 0 ? `Dicom Nodes (${Object.keys(selectedNodes).filter(node => selectedNodes[node]).length})` : 'None Selected'}
                        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▲</span>
                    </div>
                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            {dicomNodes.map((node, index) => (
                                <label key={index} className="checkbox-container">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedNodes[node.name] || false}
                                        onChange={() => handleNodeChange(node.name)}
                                    />
                                    <span className="custom-checkbox"></span>
                                    {node.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                {formError && <p className="error">{formError}</p>}
                <div className="modal-buttons">
                    <button onClick={handleSubmit}>OK</button>
                    <button onClick={onRequestClose}>Cancel</button>
                </div>
            </div>
        </Modal>
    );
};

export default NewWorklistModal;