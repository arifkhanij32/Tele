import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientViewer.css';
import PhysicianDetailsDialog from './PhysicianDetailsDialog';
import ShareWithPhysicianDialog from './ShareWithPhysicianDialog';
import AWS from 'aws-sdk';

// Configure AWS SDK for `PatientViewer`
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: 'eu-west-1',
});

const s3 = new AWS.S3();

const fetchDicomFromS3 = async (bucketName, folderName) => {
  const params = { Bucket: bucketName, Prefix: folderName };
  try {
    const data = await s3.listObjectsV2(params).promise();
    const filePromises = data.Contents.map((file) =>
      s3.getObject({ Bucket: bucketName, Key: file.Key }).promise()
    );
    const fileDataArray = await Promise.all(filePromises);
    return fileDataArray.map((fileData) => new Blob([fileData.Body], { type: 'application/dicom' }));
  } catch (error) {
    console.error('Error fetching DICOM files from S3 folder:', error);
    alert(`Error fetching DICOM files: ${error.message}`);
  }
};
const getSignedUrlForImage = async (bucketName, imageKey) => {
    const params = {
      Bucket: bucketName,
      Key: imageKey,
      Expires: 60 * 60, // URL valid for 1 hour
    };
    try {
      const signedUrl = await s3.getSignedUrlPromise('getObject', params);
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }
  };
  


const PatientViewer = () => {
    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        status: 'All Orders',
        date: 'All Dates',
        modality: 'All Modalities',
        location: 'All Locations',
    });
    const [showMergeDialog, setShowMergeDialog] = useState(false);
    const [mergeData, setMergeData] = useState([]);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [showPhysicianDialog, setShowPhysicianDialog] = useState(false); // State for showing Physician Dialog
    const [showShareWithPhysicianDialog, setShowShareWithPhysicianDialog] = useState(false);
    const [physicianDetails, setPhysicianDetails] = useState(null); // To store the details of the physician being edited

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        fetchData();
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearchChange = (e) => {
        setFilters({
            ...filters,
            search: e.target.value,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            status: 'All Orders',
            date: 'All Dates',
            modality: 'All Modalities',
            location: 'All Locations',
        });
    };

    const handleRowSelect = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    const handleRowDoubleClick = (id) => {
        navigate(`/image-viewer/${id}`);
    };

    const updateIconStatus = async (iconType) => {
        const updatedData = [...data];
        for (const entry of updatedData) {
            if (selectedRows.includes(entry.id) && !entry[iconType]) {
                try {
                    const response = await axios.patch(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/${entry.id}/update_${iconType}/`, {
                        [iconType]: true
                    });
                    entry[iconType] = response.data[iconType];
                } catch (error) {
                    console.error(`Error updating ${iconType} status:`, error);
                }
            }
        }
        setData(updatedData);
        setSelectedRows([]);
    };

    const handleSetEmergency = () => {
        updateIconStatus('emg');
    };

    const handleSetMLC = () => {
        updateIconStatus('mlc');
    };

    const handleMergeRequest = () => {
        if (selectedRows.length === 2) {
            const selectedData = data.filter(entry => selectedRows.includes(entry.id));
            setMergeData(selectedData);
            setShowMergeDialog(true);
        } else {
            setWarningMessage("Please select exactly two rows to merge.");
            setShowWarningDialog(true);
        }
    };

    const handlePhysicianDetails = () => {
        setShowPhysicianDialog(true);
    };

    const handleSavePhysicianDetails = (physicianData) => {
        console.log('Physician Details:', physicianData);
        // Optionally save physician data to backend or state management
    };

    const handleShareWithPhysician = () => {
        setShowShareWithPhysicianDialog(true);
    };
    const handleAddNewPhysician = () => {
        setPhysicianDetails(null); // Clear any existing details
        // You can set up the logic to open an add new physician form here
        console.log("Add New Physician");
    };
    
    const handleEditPhysician = (physician) => {
        setPhysicianDetails(physician);
        // You can set up the logic to open an edit physician form here
        console.log("Edit Physician", physician);
    };
    
    const handleDeletePhysician = (physicianId) => {
        // Logic for deleting a physician can be handled within ShareWithPhysicianDialog
        console.log("Delete Physician", physicianId);
    };
    

    const handleMergeConfirm = async (mergeTargetId) => {
        try {
            const deleteId = selectedRows.find(id => id !== mergeTargetId);
            await axios.delete(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/${deleteId}/`);
            setData(prevData => prevData.filter(entry => entry.id !== deleteId));
            setShowMergeDialog(false);
            setSelectedRows([]);
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };
    const formatDateOfBirth = (dob) => {
        // Assuming dob is in the format 'yyyy-mm-dd'
        const [year, month, day] = dob.split('-');
    
        // Create a new Date object
        const date = new Date(year, month - 1, day);
    
        // Format the date to '01 July 2000'
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };
    const handleViewImages = () => {
        if (selectedRows.length === 1) {
            const selectedPatientId = selectedRows[0]; // Assume only one selected row for image viewing
            navigate(`/image-viewer/${selectedPatientId}`);
        } else {
            setWarningMessage("Please select exactly one row to view images.");
            setShowWarningDialog(true);
        }
    };
    
    

    const applyDateFilter = (entry) => {
        const now = new Date();
        const acquiredDate = new Date(entry.acquired);

        switch (filters.date) {
            case 'Today':
                return acquiredDate.toDateString() === now.toDateString();
            case 'Yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                return acquiredDate.toDateString() === yesterday.toDateString();
            case 'Last Week':
                const lastWeek = new Date(now);
                lastWeek.setDate(now.getDate() - 7);
                return acquiredDate >= lastWeek && acquiredDate <= now;
            case 'Last Month':
                const lastMonth = new Date(now);
                lastMonth.setMonth(now.getMonth() - 1);
                return acquiredDate >= lastMonth && acquiredDate <= now;
            case 'Last Year':
                const lastYear = new Date(now);
                lastYear.setFullYear(now.getFullYear() - 1);
                return acquiredDate >= lastYear && acquiredDate <= now;
            default:
                return true;
        }
    };

    const filteredData = data
    .filter(entry => {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = entry.name.toLowerCase().includes(searchLower) ||
                              entry.patientId.toString().toLowerCase().includes(searchLower) ||
                              entry.service.toLowerCase().includes(searchLower);

        const matchesStatus = filters.status === 'All Orders' || entry.status === filters.status;
        const matchesModality = filters.modality === 'All Modalities' || entry.modality === filters.modality;
        const matchesLocation = filters.location === 'All Locations' || entry.location === filters.location;
        const matchesDate = applyDateFilter(entry);

        return matchesSearch && matchesStatus && matchesModality && matchesLocation && matchesDate;
    })
    .sort((a, b) => b.id - a.id); // Sort by id in descending order


    return (
        <div className="patient-viewer">
            <div className="header">
                <div className="search-container1">
                    <input
                        type="text"
                        placeholder="Search here for services, name and ID"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="filters">
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option>All Orders</option>
                        <option>Draft</option>
                        <option>Ordered</option>
                        <option>Scheduled</option>
                        <option>Patient Waiting</option>
                        <option>In Progress</option>
                        <option>Reporting</option>
                        <option>Reported</option>
                        <option>Un Reported</option>
                        <option>Non Reported</option>
                        <option>Dictated</option>
                        <option>Preliminary</option>
                        <option>Cancelled</option>
                    </select>
                    <select name="date" value={filters.date} onChange={handleFilterChange}>
                        <option>All Dates</option>
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>Last Week</option>
                        <option>Last Month</option>
                        <option>Last Year</option>
                    </select>
                    <select name="modality" value={filters.modality} onChange={handleFilterChange}>
                        <option>All Modalities</option>
                        <option>XRay</option>
                        <option>MRI</option>
                        <option>US</option>
                        <option>PX</option>
                        <option>MG</option>
                    </select>
                    <select name="location" value={filters.location} onChange={handleFilterChange}>
                        <option>All Locations</option>
                    </select>
                    <button onClick={handleClearFilters}>Clear</button>
                </div>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {/* <th></th> */}
                            <th>Emg</th>
                            <th>Name</th>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Services</th>
                            <th>Modality</th>
                            <th>Acquired</th>
                            <th>Received</th>
                            <th>Reported</th>
                            <th>Reporter</th>
                            <th>Referrer</th>
                            <th>Age</th>
                            <th>DOB</th>
                            <th>Gender</th>
                            <th>Availability</th>
                            <th>MLC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((entry, index) => (
                            <tr
                                key={index}
                                className={selectedRows.includes(entry.id) ? 'selected' : ''}
                                onClick={() => handleRowSelect(entry.id)}
                                onDoubleClick={() => handleRowDoubleClick(entry.id)}
                            >
                                {/* <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(entry.id)}
                                        onChange={() => handleRowSelect(entry.id)}
                                    />
                                </td> */}
                                {/* <td>{entry.emg ? <i className="fas fa-exclamation-triangle" style={{ color: 'red' }}></i> : ''}</td> */}
                                                                <td>
                                {entry.emg === true && (
                                    <i className="fas fa-exclamation-triangle" style={{ color: 'red' }}></i>
                                )}
                                </td>

                                <td>{entry.name}</td>
                                <td>{entry.patientId}</td>
                                <td>{entry.status}</td>
                                <td>{entry.service}</td>
                                <td>{entry.modality}</td>
                                <td>{entry.acquired}</td>
                                <td>{entry.received}</td>
                                <td>{entry.reported}</td>
                                <td>{entry.reporter}</td>
                                <td>{entry.referrer}</td>
                                <td>{entry.age}</td>
                                {/* <td>{entry.dob}</td> */}
                                <td>{formatDateOfBirth(entry.dob)}</td>
                                <td>{entry.gender}</td>
                                <td>{entry.availability}</td>
                                <td>{entry.mlc ? <i className="fas fa-balance-scale" style={{ color: 'black' }}></i> : ''}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
            <div className="footer">
                <button className="footer-button" onClick={handleSetEmergency}>Set Emergency</button>
                <button className="footer-button" onClick={handleSetMLC}>Set MLC</button>
                <button className="footer-button" onClick={handleMergeRequest}>Merge Request</button>
                <button className="footer-button" onClick={handlePhysicianDetails}>Physician Details</button>
                <button className="footer-button" onClick={handleShareWithPhysician}>Share with Physician</button>
                {/* <button className="footer-button">View Images</button> */}
                <button className="footer-button" onClick={handleViewImages}>View Images</button>
                <button className="footer-button">View Pdf</button>
                <button className="footer-button">Upload Dicom</button>
            </div>
            {showPhysicianDialog && (
                <PhysicianDetailsDialog
                PhysicianDetailsDialog
                onSave={handleSavePhysicianDetails}
                onClose={() => setShowPhysicianDialog(false)}
            
                />
            )}
            {showShareWithPhysicianDialog && (
                <ShareWithPhysicianDialog
                    onClose={() => setShowShareWithPhysicianDialog(false)}
                    onAddNew={handleAddNewPhysician}
                    onEdit={handleEditPhysician}
                    onDelete={handleDeletePhysician}
                />
            )}

            {showMergeDialog && (
                <MergeDialog
                    mergeData={mergeData}
                    onClose={() => setShowMergeDialog(false)}
                    onShowWarning={(message) => {
                        setWarningMessage(message);
                        setShowWarningDialog(true);
                    }}
                    onConfirm={handleMergeConfirm}
                />
            )}

            {showWarningDialog && (
                <div className="overlay">
                    <WarningDialog
                        message={warningMessage}
                        onClose={() => setShowWarningDialog(false)}
                    />
                </div>
            )}

        </div>
    );
};

const MergeDialog = ({ mergeData, onClose, onShowWarning, onConfirm }) => {
    const [selectedMergeTarget, setSelectedMergeTarget] = useState(null);

    const handleMerge = () => {
        if (!selectedMergeTarget) {
            onShowWarning("No merge target was chosen. Please select the order that you want to keep.");
        } else {
            onConfirm(selectedMergeTarget);
        }
    };

    return (
        <div className="merge-dialog-overlay">
            <div className="merge-dialog">
                <h2>Merge Exams</h2>
                <p>Please select the exam you would like the other exam to be part of.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Service</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergeData.map((entry, index) => (
                            <tr key={index}>
                                <td>{`${entry.name}, ${entry.patientId}, ${entry.dob}`}</td>
                                <td>{entry.service}</td>
                                <td>
                                    <input
                                        type="radio"
                                        name="mergeTarget"
                                        onChange={() => setSelectedMergeTarget(entry.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <label>
                    <input type="checkbox" /> Include Preliminary and Signed off Reports
                </label>
                <div className="dialog-footer">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleMerge}>Merge</button>
                </div>
            </div>
        </div>
    );
};


const WarningDialog = ({ message, onClose }) => {
    return (
        <div className="warning-dialog-overlay">
            <div className="warning-dialog">
                <h2>Information</h2>
                <p>{message}</p>
                <button onClick={onClose}>Ok</button>
            </div>
        </div>
    );
};


export default PatientViewer;