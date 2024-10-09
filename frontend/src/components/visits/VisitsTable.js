import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dialog from './NewVisitForm';
import ServicePage from './ServicePage';
import PatientDetailsPage from './PatientServicePage';
import SelectOptionDialog from './SelectOptionDialog';
import './statics/VisitsTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt, faEye, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'; // Importing EMG icon


function VisitsTable() {
    const [visits, setVisits] = useState([]);
    const [patientData, setPatientData] = useState(null); // Initialize with null or an appropriate initial value
    const [balance, setBalance] = useState(0);
    // const [status, setStatus] = useState('unpaid');

    const [filteredVisits, setFilteredVisits] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [showDetailsPage, setShowDetailsPage] = useState(false);
    const [showServicePage, setShowServicePage] = useState(false);
    const [showOptionDialog, setShowOptionDialog] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('All Dates');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [refundStatus, setRefundStatus] = useState({});
    const [selectedOption, setSelectedOption] = useState(''); // Default to an empty string or "General"

    const [counts, setCounts] = useState({
        created: 0,
        inProgress: 0,
        reporting: 0,
        reported: 0,
        paid: 0,
        unpaid: 0,
    });

    useEffect(() => {
        fetchVisits();

    }, []);

    useEffect(() => {
        filterVisits();
    }, [searchTerm, dateFilter, statusFilter, paymentFilter, visits]);

    useEffect(() => {
        calculateCounts();
    }, [filteredVisits]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Initiated':
                return '#f7c37e';
            case 'Approved':
                return '#a8e0aa';
            case 'Rejected':
                return '#fc9088';
            case 'Refunded':
                return '#5f9e6d';
            // default:
            //     return 'white';
        }
    };

    // const fetchVisits = () => {
    //     axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`)
    //         .then(response => {
    //             const initialRefundStatus = response.data.reduce((acc, visit) => {
    //                 acc[visit.id] = visit.refund_status;
    //                 return acc;
    //             }, {});
    //             setRefundStatus(initialRefundStatus);

    //             let fetchedVisits = response.data;

    //             const sortedVisits = fetchedVisits.sort((a, b) => new Date(b.date) - new Date(a.date));

    //             setVisits(sortedVisits);
    //             setFilteredVisits(sortedVisits);
    //         })
    //         .catch(error => {
    //             console.error('There was an error fetching the visits!', error);
    //         });
    // };
    // const fetchVisits = async () => {
    //     try {
    //         // Fetch the visits data
    //         const visitsResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`);
    //         const validVisits = visitsResponse.data.filter(visit => visit.service && visit.service.length > 0);
            
    //         // Fetch the EMG data from the patientViewer API
    //         const patientViewerResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`);
    //         const patientViewerData = patientViewerResponse.data;
            
    //         // Combine visits data with EMG data based on common attributes (e.g., name, age, DOB, service)
    //         const combinedData = validVisits.map(visit => {
    //             const matchingViewer = patientViewerData.find(viewer => 
    //                 viewer.name === visit.name &&
    //                 viewer.age === visit.age &&
    //                 viewer.gender === visit.gender &&
    //                 // viewer.services && viewer.modality  === visit.service &&
    //                 viewer.patientId === visit.patientId
    //             );
                
    //             return {
    //                 ...visit,
    //                 emg: matchingViewer ? matchingViewer.emg : false, // Add EMG field to each visit
    //             };
    //         });
    
    //         // Sort the combined data by date
    //         const sortedVisits = combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            
    //         // Set the state with the sorted valid visits including EMG data
    //         setVisits(sortedVisits);
    //         setFilteredVisits(sortedVisits);
            
    //         // Initialize refund status for valid visits
    //         const initialRefundStatus = sortedVisits.reduce((acc, visit) => {
    //             acc[visit.id] = visit.refund_status;
    //             return acc;
    //         }, {});
    //         setRefundStatus(initialRefundStatus);
    //     } catch (error) {
    //         console.error('There was an error fetching the visits or EMG data!', error);
    //     }
    // };

    const fetchVisits = async ( fetchVisits) => {
        try {
            const visitsResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`);
            const sortedVisits = visitsResponse.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setVisits(sortedVisits);
            setFilteredVisits(sortedVisits);
            fetchVisits();
        } catch (error) {
            console.error('There was an error fetching the visits!', error);
        }
        try {
            // Fetch the visits data
            const visitsResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`);
            const validVisits = visitsResponse.data.filter(visit => visit.service && visit.service.length > 0);
            
            // Fetch the EMG data from the patientViewer API
            const patientViewerResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`);
            const patientViewerData = patientViewerResponse.data;
            
            // Combine visits data with EMG data based on common attributes (e.g., patientId, name)
            const combinedData = validVisits.map(visit => {
                const matchingViewer = patientViewerData.find(viewer => 
                    viewer.patientId === visit.patientId &&
                    viewer.name === visit.name &&  // Ensure correct matching
                    viewer.age === visit.age &&
                    viewer.gender === visit.gender
                );
                
                // If matchingViewer is found, set emg to its value, else keep it as false
                return {
                    ...visit,
                    emg: matchingViewer ? matchingViewer.emg : false,
                };
            });
    
            // Sort the combined data by date
            const sortedVisits = combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Set the state with the sorted valid visits including EMG data
            setVisits(sortedVisits);
            setFilteredVisits(sortedVisits);
            
            // Initialize refund status for valid visits
            const initialRefundStatus = sortedVisits.reduce((acc, visit) => {
                acc[visit.id] = visit.refund_status;
                return acc;
            }, {});
            setRefundStatus(initialRefundStatus);
        } catch (error) {
            console.error('There was an error fetching the visits or EMG data!', error);
        }
    };
    
    const handleNewVisitClick = () => {
        setShowDialog(true);
    };

    const handleAddVisit = (visit,fetchedVisits) => {
        setSelectedVisit(visit);
        setShowOptionDialog(true);
        fetchedVisits();
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
    };

    const handleCloseServicePage = () => {
        setShowServicePage(false);
    };

    const handleCloseOptionDialog = (fetchVisits) => {
        setShowOptionDialog(false);
        fetchVisits();
    };

    // const handleDeleteVisit = () => {
    //     if (selectedVisit) {
    //         axios.delete(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/${selectedVisit.id}/`)
    //             .then(() => {
    //                 fetchVisits();
    //                 setSelectedVisit(null);
    //             })
    //             .catch(error => {
    //                 console.error('There was an error deleting the visit!', error);
    //             });
    //     } else {
    //         alert('Please select a visit to delete.');
    //     }
    // };
    // const handleDeleteVisit = async () => {
    //     if (selectedVisit) {
    //         try {
    //             // Fetch PatientViewer entries that match patientName, patientId, and service
    //             const patientViewerResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`, {
    //                 params: {
    //                     patientId: selectedVisit.patientId,
    //                     service: selectedVisit.service,
    //                     name: selectedVisit.name,
    //                     age: selectedVisit.age
    //                 }
    //             });
    
    //             const patientViewerEntries = patientViewerResponse.data;
    
    //             // Prepare deletion requests for all matched PatientViewer entries
    //             const deletePatientViewerRequests = patientViewerEntries.map(entry =>
    //                 axios.delete(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/${entry.id}/`)
    //             );
    
    //             // Delete the selected visit and matched PatientViewer entries in parallel
    //             const deleteVisitRequest = axios.delete(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/${selectedVisit.id}/`);
    
    //             await Promise.all([deleteVisitRequest, ...deletePatientViewerRequests]);
    
    //             console.log('Visit and corresponding PatientViewer entries deleted successfully');
    
    //             // Remove the deleted entry from the table
    //             const updatedVisits = visits.filter(visit => visit.id !== selectedVisit.id);
    //             setVisits(updatedVisits);
    //             setFilteredVisits(updatedVisits);
    //             setSelectedVisit(null);
    
    //         } catch (error) {
    //             console.error('Error details:', error);
    //             const errorMessage = error.response ?
    //                 `Error: ${error.response.status} ${error.response.statusText}. ${error.response.data?.detail || error.message}` :
    //                 `Error: ${error.message}`;
    //             alert(`There was an error deleting the visit or associated entry. ${errorMessage}`);
    //         }
    //     } else {
    //         alert('Please select a visit to delete.');
    //     }
    // };
    const handleDeleteVisit = async () => {
        if (selectedVisit) {
            try {
                // Fetch the PatientViewer entry that matches the selected visit's patientId
                const patientViewerResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`, {
                    params: {
                        patientId: selectedVisit.patientId, // Using patientId to match the entry
                    }
                });
    
                // Find the exact PatientViewer entry with the matching patientId
                const patientViewerEntry = patientViewerResponse.data.find(entry =>
                    entry.patientId === selectedVisit.patientId
                );
    
                if (patientViewerEntry) {
                    // Delete the specific PatientViewer entry
                    await axios.delete(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/${patientViewerEntry.id}/`);
                    console.log('PatientViewer entry deleted successfully');
                } else {
                    console.log('No matching PatientViewer entry found');
                }
    
                // Delete the selected visit entry from the Visits table
                await axios.delete(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/${selectedVisit.id}/`);
                console.log('Visit entry deleted successfully');
    
                // Update the state to remove the deleted visit from the table
                const updatedVisits = visits.filter(visit => visit.id !== selectedVisit.id);
                setVisits(updatedVisits);
                setFilteredVisits(updatedVisits);
                setSelectedVisit(null);
    
            } catch (error) {
                console.error('Error details:', error);
                const errorMessage = error.response ?
                    `Error: ${error.response.status} ${error.response.statusText}. ${error.response.data?.detail || error.message}` :
                    `Error: ${error.message}`;
                alert(`There was an error deleting the visit or associated entry. ${errorMessage}`);
            }
        } else {
            alert('Please select a visit to delete.');
        }
    };
    

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDateFilterChange = (event) => {
        setDateFilter(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handlePaymentFilterChange = (event) => {
        setPaymentFilter(event.target.value);
    };

    const handleViewVisitDetails = () => {
        if (selectedVisit) {
            setShowDetailsPage(true);
        } else {
            alert('Please select a visit to view details.');
        }
    };
    // const handleViewVisitDetails = () => {
    //     if (selectedVisit) {
    //         setShowDetailsPage(true);
    //         setSelectedOption('General'); // You can set this based on the desired default value
    //     } else {
    //         alert('Please select a visit to view details.');
    //     }
    // };
    
    

    const handleCloseDetailsPage = (fetchedVisits) => {
        setShowDetailsPage(false);
        fetchVisits();
    };

    const handleRowDoubleClick = (visit) => {
        setSelectedVisit(visit);
        setSelectedOption('General')
        console.log(visit);
        setShowDetailsPage(true);
    };

    const handleRowSelect = (visit) => {
        setSelectedVisit(visit);
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(visit.id)
                ? prevSelectedRows.filter((rowId) => rowId !== visit.id)
                : [...prevSelectedRows, visit.id]
        );
    };

    const filterVisits = () => {
        let filtered = visits;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(visit =>
                (visit.name && visit.name.toLowerCase().includes(search)) ||
                (visit.phone && visit.phone.includes(search)) ||
                (visit.patientId && visit.patientId.toString().toLowerCase().includes(search))
            );
        }

        if (dateFilter !== 'All Dates') {
            const now = new Date();
            filtered = filtered.filter(visit => {
                const visitDate = new Date(visit.date);
                switch (dateFilter) {
                    case 'Today':
                        return visitDate.toDateString() === now.toDateString();
                    case 'Yesterday':
                        const yesterday = new Date(now);
                        yesterday.setDate(now.getDate() - 1);
                        return visitDate.toDateString() === yesterday.toDateString();
                    case 'Last Week':
                        const lastWeek = new Date(now);
                        lastWeek.setDate(now.getDate() - 7);
                        return visitDate >= lastWeek;
                    case 'Last Month':
                        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                        return visitDate >= lastMonthStart && visitDate <= lastMonthEnd;
                    case 'Last Year':
                        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
                        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
                        return visitDate >= lastYearStart && visitDate <= lastYearEnd;
                    default:
                        return true;
                }
            });
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(visit => visit.status === statusFilter);
        }

        if (paymentFilter !== 'All') {
            filtered = filtered.filter(visit => visit.pay === paymentFilter.toLowerCase());
        }

        setFilteredVisits(filtered);
    };

    const calculateCounts = () => {
        const now = new Date();
        const today = now.toDateString();
        const counts = {
            created: 0,
            inProgress: 0,
            reporting: 0,
            reported: 0,
            paid: 0,
            unpaid: 0,
        };

        filteredVisits.forEach(visit => {
            const visitDate = new Date(visit.date).toDateString();
            if (visitDate === today) {
                switch (visit.status) {
                    case 'Created':
                        counts.created++;
                        break;
                    case 'In Progress':
                        counts.inProgress++;
                        break;
                    case 'Reporting':
                        counts.reporting++;
                        break;
                    case 'Reported':
                        counts.reported++;
                        break;
                    default:
                        break;
                }
                if (visit.pay === 'paid') {
                    counts.paid++;
                } else {
                    counts.unpaid++;
                }
            }
        });

        setCounts(counts);
    };
    
    // useEffect(() => {
    //     if (patientData && patientData.id) {
    //         axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/visit-details/${patientData.id}`)
    //             .then(response => {
    //                 const visitDetails = response.data;
    //                 setPatientData(visitDetails);
    //                 setBalance(visitDetails.balance);
    //                 setStatus(visitDetails.payment_status);  // Ensure payment status is fetched and set
    //             })
    //             .catch(error => console.error('Error fetching visit details:', error));
    //     }
    // }, [patientData]);
    

    const handleServiceSelect = (fetchedVisits) => {
        setShowDetailsPage(true);
    };

    const handleRefundSuccess = (updatedVisit) => {
        const updatedVisits = visits.map(visit =>
            visit.id === updatedVisit.id ? { ...visit, refund_status: 'Initiated' } : visit
        );
        setVisits(updatedVisits);
        setFilteredVisits(updatedVisits);
        setRefundStatus(prevStatus => ({
            ...prevStatus,
            [updatedVisit.id]: 'Initiated'
        }));
        if (selectedVisit?.id === updatedVisit.id) {
            setSelectedVisit({ ...selectedVisit, refund_status: 'Initiated' });
        }
    };

    const updateRefundStatus = (visitId, newStatus,fetchVisits) => {
        axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_refund_status/`, {
            params: {
                visit_id: visitId,
                refund_status: newStatus
            }
        })
        .then(response => {
            if (response.data.status === 'success') {
                fetchVisits();
                alert('Refund status updated successfully');
            } else {
                alert('Failed to update refund status');
            }
        })
        .catch(error => {
            console.error('Error updating refund status:', error.response || error.message);
            alert('An error occurred while updating the refund status');
        });
    };

    const handleSendClick = () => {
        if (selectedVisit) {
            updateRefundStatus(selectedVisit.id, 'Initiated');
        } else {
            alert('Please select a visit to send.');
        }
    };

    const handleApproveClick = () => {
        if (selectedVisit) {
            updateRefundStatus(selectedVisit.id, 'Approved');
        } else {
            alert('Please select a visit to approve.');
        }
    };

    const handleRejectClick = () => {
        if (selectedVisit) {
            updateRefundStatus(selectedVisit.id, 'Rejected');
        } else {
            alert('Please select a visit to reject.');
        }
    };

    const handleRefundClick = () => {
        if (selectedVisit) {
            updateRefundStatus(selectedVisit.id, 'Refunded');
        } else {
            alert('Please select a visit to refund.');
        }
    };

    return (
        <div className={`VisitsPage ${showDetailsPage || showServicePage || showOptionDialog ? 'overlay' : ''}`}>
            {showDetailsPage && (
                <PatientDetailsPage
                    onClose={handleCloseDetailsPage}
                    patientData={selectedVisit}
                    selectedOption={selectedOption}
                    selectedServices={selectedVisit?.services || []}
                    fetchVisits={fetchVisits}
                    onRefundSuccess={handleRefundSuccess}
                    handleSendClick={handleSendClick}
                    handleApproveClick={handleApproveClick}
                    handleRejectClick={handleRejectClick}
                    handleRefundClick={handleRefundClick}
                />
            )}
            {showServicePage && (
                <ServicePage
                    selectedOption="Default"
                    onClose={handleCloseServicePage}
                    patientData={selectedVisit}
                    onServiceSelect={handleServiceSelect}
                    fetchVisits={fetchVisits}
                />
            )}
            {showOptionDialog && (
                <SelectOptionDialog
                    show={showOptionDialog}
                    onClose={handleCloseOptionDialog}
                    patientData={selectedVisit}
                    fetchVisits={fetchVisits}
                />
            )}
            {!showDetailsPage && !showServicePage && !showOptionDialog && (
                <>
                    <div className="header">
                        <br />
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search here for visit, name, mobile and patient ID..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="filters">
                            <select value={dateFilter} onChange={handleDateFilterChange}>
                                <option>All Dates</option>
                                <option>Today</option>
                                <option>Yesterday</option>
                                <option>Last Week</option>
                                <option>Last Month</option>
                                <option>Last Year</option>
                            </select>
                            <select>
                                <option>All Locations</option>
                                <option>Zambia</option>
                            </select>
                            <select value={statusFilter} onChange={handleStatusFilterChange}>
                                <option value="All">All</option>
                                <option value="Draft">Draft</option>
                                <option value="Created">Created</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Reporting">Reporting</option>
                                <option value="Reported">Reported</option>
                            </select>
                            <select value={paymentFilter} onChange={handlePaymentFilterChange}>
                                <option value="All">All</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                            </select>
                            <button class="clear-button"
                             onClick={() => {
                                setDateFilter('All Dates');
                                setStatusFilter('All');
                                setPaymentFilter('All');
                                setSearchTerm('');
                                setFilteredVisits(visits);
                            }}>Clear</button>
                        </div>
                    </div>
                    <div className="visits-table-container">
                        <table className="visits-table">
                            <thead>
                                <tr>
                                    {/* <th></th> */}
                                    <th>Name</th>
                                    <th>Patient ID</th>
                                    <th>Date</th>
                                    <th>Age</th>
                                    <th>DOB</th>
                                    <th>Gender</th>
                                    <th>Service</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Pay</th>
                                    <th>Refund Status</th>
                                    <th>Emg</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filteredVisits.map((visit) => (
                                    <tr
                                        key={visit.id} // Use visit.id instead of uniqueId
                                        className={selectedRows.includes(visit.id) ? 'selected' : ''}
                                        onClick={() => handleRowSelect(visit)}
                                        onDoubleClick={() => handleRowDoubleClick(visit)}
                                    >
                                        {/* <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(visit.id)}
                                                onChange={() => handleRowSelect(visit)}
                                            />
                                        </td> */}

                                        <td>{visit.name}</td>
                                        <td>{visit.patientId}</td>
                                        <td>
                                            {visit.date.split(', ')[0]}<br />
                                            {visit.date.split(', ')[1]}
                                        </td>
                                        <td>{visit.age}</td>
                                        <td>{visit.dob}</td>
                                        <td>{visit.gender}</td>
                                        <td>{visit.service}</td>
                                        <td>{visit.phone}</td>
                                        <td>{visit.status}</td>
                                        <td>{visit.pay}</td>
                                        <td style={{ backgroundColor: getStatusColor(refundStatus[visit.id] || visit.refund_status) }}>
                                            {refundStatus[visit.id] || visit.refund_status}
                                        </td>
                                        {/* <td>{visit.emg ? 'true' : 'No'}</td> */}
                                        <td>
                                            {visit.emg ? (
                                                <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: 'red' }} />
                                            ) : (
                                                ''
                                            )}
                                        </td>
                                        <td>
                                        <button class="add-visit-button" onClick={() => handleAddVisit(visit)}>Add Visit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="footer">
                        <button className="footer-button" onClick={handleViewVisitDetails}>
                            <FontAwesomeIcon icon={faEye} className="footer-icon" />
                            <span>View Visit Details</span>
                        </button>
                        <button className="footer-button" onClick={handleNewVisitClick}>
                            <FontAwesomeIcon icon={faPlus} className="footer-icon" />
                            <span>New Visit</span>
                        </button>
                        <button className="footer-button" onClick={handleDeleteVisit}>
                            <FontAwesomeIcon icon={faTrashAlt} className="footer-icon" />
                            <span>Delete Visit</span>
                        </button>

                        <div className="counts">
                            <div>Created: {counts.created}</div>
                            <div>In Progress: {counts.inProgress}</div>
                            <div>Reporting: {counts.reporting}</div>
                            <div>Reported: {counts.reported}</div>
                            <div>Paid: {counts.paid}</div>
                            <div>Unpaid: {counts.unpaid}</div>
                        </div>
                    </div>
                    <Dialog show={showDialog} onClose={handleCloseDialog}
                    fetchVisits={fetchVisits}
                    />
                   
                </>
            )}
        </div>
    );
}

export default VisitsTable;