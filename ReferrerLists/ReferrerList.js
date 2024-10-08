
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faFileExport } from '@fortawesome/free-solid-svg-icons'; 
import './ReferrerList.css';
import AddReferrerForm from './AddReferrerForm';
import EditReferrerForm from './EditReferrerForm';
import ReferrerBarChart from './ReferrerBarChart'; // Import the bar chart component
import './ReferrerBarChart.css';


const ReferrerList = () => {
    const [referrers, setReferrers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedReferrer, setSelectedReferrer] = useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

    const [totalRevenue, setTotalRevenue] = useState(0); 
    const [totalReferral, setTotalReferral] = useState(0); 

    const fetchData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LOCALHOST || 'http://localhost:8000'}/referrer/list-referrers/`);
            const fetchedReferrers = response.data;
            setReferrers(fetchedReferrers);
            
            // Calculate total revenue and total referrals
            const totalRev = fetchedReferrers.reduce((acc, referrer) => acc + (parseFloat(referrer.totalRevenue) || 0), 0);
            const totalRef = fetchedReferrers.reduce((acc, referrer) => acc + (referrer.totalReferral || 0), 0);
            
            setTotalRevenue(totalRev);
            setTotalReferral(totalRef);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 10000); 
        return () => clearInterval(intervalId);
    }, []);

    const filteredReferrers = referrers.filter(referrer =>
        referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referrer.phone.includes(searchTerm) ||
        referrer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowClick = (referrer, index) => {
        setSelectedReferrer(referrer);
        setSelectedRowIndex(index);
    };

    const handleAddClose = () => setShowAddForm(false);
    const handleEditClose = () => {
        setShowEditForm(false);
        setSelectedRowIndex(null);
    };

    const handleAddSave = newReferrer => {
        setReferrers([...referrers, newReferrer]);
    };

    const handleEditSave = updatedReferrer => {
        const updatedReferrers = referrers.map((referrer, index) =>
            index === selectedRowIndex ? updatedReferrer : referrer
        );
        setReferrers(updatedReferrers);
    };

    const handleDelete = async () => {
        if (selectedReferrer && selectedReferrer.id) {
            try {
                await axios.delete(`${process.env.REACT_APP_LOCALHOST || 'http://localhost:8000'}/referrer/delete-referrer/${selectedReferrer.id}/`);
                setReferrers(referrers.filter(referrer => referrer.id !== selectedReferrer.id));
                setSelectedReferrer(null);
                setSelectedRowIndex(null);
            } catch (error) {
                console.error('Error deleting referrer:', error);
            }
        }
    };

    return (
        <div className="referrer-page">
            <div className="referrer-search-bar">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone number."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={() => window.location.reload()}>Refresh</button>
            </div>

            <div className="referrer-table-wrapper">
                <table className="referrer-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Total Referral</th>
                            <th>Total Revenue</th>
                            <th>Statistical Revenue & Referral</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReferrers.map((referrer, index) => (
                            <tr
                                key={referrer.id}
                                className={index === selectedRowIndex ? 'selected-row' : ''}
                                onClick={() => handleRowClick(referrer, index)}
                            >
                                <td>{referrer.name}</td>
                                <td>{referrer.phone}</td>
                                <td>{referrer.email}</td>
                                <td>{referrer.totalReferral ?? 0}</td>
                                <td>{parseFloat(referrer.totalRevenue) ? parseFloat(referrer.totalRevenue).toFixed(2) : '0.00'}</td>
                                <td>{ <div className="bar-chart-container">
                <ReferrerBarChart referrers={referrers} />
            </div>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="totals">
                    <p><strong>Total Referral:</strong> {totalReferral}</p>
                    <p><strong>Total Revenue:</strong> ${totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            <div className="referrer-footer-buttons">
                <button className="referrer-footer-button" onClick={() => setShowAddForm(true)}>
                    <FontAwesomeIcon icon={faPlus} className="referrer-footer-icon" />
                    New Referrer
                </button>
                <button className="referrer-footer-button" onClick={() => setShowEditForm(true)} disabled={!selectedReferrer}>
                    <FontAwesomeIcon icon={faEdit} className="referrer-footer-icon" />
                    Edit Referrer
                </button>
                <button className="referrer-footer-button" onClick={handleDelete} disabled={!selectedReferrer}>
                    <FontAwesomeIcon icon={faTrashAlt} className="referrer-footer-icon" />
                    Delete Referrer
                </button>
                <button className="referrer-footer-button">
                    <FontAwesomeIcon icon={faFileExport} className="referrer-footer-icon" />
                    Export Excel
                </button>
                <button className="referrer-footer-button">
                    <FontAwesomeIcon icon={faFileExport} className="referrer-footer-icon" />
                    Export All To Excel
                </button>
            </div>

            {showAddForm && (
                <AddReferrerForm
                    onClose={handleAddClose}
                    onSave={handleAddSave}
                />
            )}

            {showEditForm && (
                <EditReferrerForm
                    initialData={selectedReferrer}
                    onClose={handleEditClose}
                    onSave={handleEditSave}
                />
            )}

            {/* Render the bar chart for referrer revenue and referral */}
           
        </div>
    );
};

export default ReferrerList;

