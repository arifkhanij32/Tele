import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DicomWorklists.css';
import NewWorklistModal from './NewWorklistModal';

const DicomWorklists = () => {
    const [worklists, setWorklists] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorklist, setSelectedWorklist] = useState(null);
    const [dicomNodes, setDicomNodes] = useState([]);

    useEffect(() => {
        fetchWorklists();
        fetchDicomNodes();
    }, []);

    const fetchWorklists = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/dicomWorklists/dicomWorklists/`);
            setWorklists(response.data);
        } catch (error) {
            console.error('Error fetching worklists:', error);
        }
    };

    const fetchDicomNodes = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/dicomNodes/dicomnodes/`);
            setDicomNodes(response.data);
        } catch (error) {
            console.error('Error fetching dicom nodes:', error);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredWorklists = worklists.filter(worklist =>
        (worklist.modality && worklist.modality.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (worklist.location && worklist.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const addOrUpdateWorklist = async () => {
        fetchWorklists(); // Fetch updated data from backend
        setSelectedWorklist(null); // Reset selected worklist after adding/updating
        setIsModalOpen(false);
    };

    const handleEditClick = () => {
        if (selectedWorklist !== null) {
            setIsModalOpen(true);
        } else {
            alert('Please select a worklist to edit.');
        }
    };

    const handleRefreshClick = () => {
        window.location.reload(); // Refresh the page
    };

    const handleDeleteClick = async () => {
        if (selectedWorklist !== null) {
            try {
                await axios.delete(`${process.env.REACT_APP_LOCALHOST}/dicomWorklists/dicomWorklists/${worklists[selectedWorklist].id}/`);
                fetchWorklists(); // Fetch updated data from backend
                setSelectedWorklist(null); // Reset selected worklist after deletion
            } catch (error) {
                console.error('Error deleting worklist:', error);
            }
        } else {
            alert('Please select a worklist to delete.');
        }
    };

    const handleRowClick = (index) => {
        setSelectedWorklist(index === selectedWorklist ? null : index); // Toggle selection
    };

    return (
        <div className="parent-container">
            {isModalOpen && <div className="modal-overlay"></div>}
            <div className="search-container1">
                <input
                    type="text"
                    placeholder="Search here for Location and Modality."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button onClick={handleRefreshClick}>Refresh</button>
            </div>
            <div className={`dicom-worklists ${isModalOpen ? 'hidden' : ''}`}>
                <div className="table-container1">
                    <table>
                        <thead>
                            <tr>
                                <th>Location</th>
                                <th>Modality</th>
                                <th>Dicom Nodes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorklists.map((worklist, index) => (
                                <tr
                                    key={index}
                                    className={index === selectedWorklist ? 'selected' : ''}
                                    onClick={() => handleRowClick(index)}
                                >
                                    <td>{worklist.location}</td>
                                    <td>{worklist.modality}</td>
                                    <td>{worklist.dicomNode ? worklist.dicomNode.split(',').length : 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="footer">
                    <button className="footer-button" onClick={() => { setSelectedWorklist(null); setIsModalOpen(true); }}>
                        <span className="footer-icon"></span>New Dicom Worklist
                    </button>
                    <button className="footer-button" onClick={handleEditClick}>
                        <span className="footer-icon"></span>Edit Dicom Worklist
                    </button>
                    <button className="footer-button" onClick={handleDeleteClick}>
                        <span className="footer-icon"></span>Delete Dicom Worklist
                    </button>
                </div>
                <NewWorklistModal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    onSubmit={addOrUpdateWorklist}
                    worklist={selectedWorklist !== null ? worklists[selectedWorklist] : null}
                    dicomNodes={dicomNodes}
                />
            </div>
        </div>
    );
};

export default DicomWorklists;