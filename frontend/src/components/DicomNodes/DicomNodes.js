import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewDicomNodeDialog from './NewDicomNodeDialog';
import EditDicomNode from './EditDicomNode'; // Ensure the correct import
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Import the icons
import './DicomNodes.css';

function DicomNodes() {
    const [nodes, setNodes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [showDialog, setShowDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null); // State for selected row
    const [selectedNode, setSelectedNode] = useState(null); // State for selected node
    
    useEffect(() => {
        fetchNodes();
    }, []);

    const fetchNodes = () => {
        axios.get(`${process.env.REACT_APP_LOCALHOST}/dicomNodes/dicomnodes/`)
            .then(response => setNodes(response.data))
            .catch(error => console.error('Error fetching data:', error));
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const sortedNodes = [...nodes].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const filteredNodes = sortedNodes.filter(node =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleNewNodes = () => {
        setShowDialog(true);
    };

    const handleEditNodes = () => {
        if (selectedRowIndex !== null) {
            setSelectedNode(nodes[selectedRowIndex]);
            setShowEditDialog(true);
        } else {
            alert('Please select a Dicom Node to edit.');
        }
    };

    const handleDeleteNodes = () => {
        if (selectedRowIndex !== null) {
            const nodeToDelete = nodes[selectedRowIndex];
            axios.delete(`${process.env.REACT_APP_LOCALHOST}/dicomNodes/dicomnodes/${nodeToDelete.id}/`)
                .then(response => {
                    // Remove the deleted node from the state
                    const updatedNodes = nodes.filter((_, index) => index !== selectedRowIndex);
                    setNodes(updatedNodes);
                    setSelectedRowIndex(null); // Clear the selection
                })
                .catch(error => {
                    console.error('There was an error deleting the dicom node!', error);
                });
        } else {
            alert('Please select a node to delete.');
        }
    };

    const handleFormSubmit = (newNode) => {
        // Add new node to the nodes list
        setNodes([...nodes, newNode]);
        setShowDialog(false);
        fetchNodes();  // Fetch latest nodes
    };

    const handleEditFormSubmit = (updatedNode) => {
        // Update node in the nodes list
        const updatedNodes = nodes.map(node =>
            node.id === updatedNode.id ? updatedNode : node
        );
        setNodes(updatedNodes);
        setShowEditDialog(false);
    };

    const handleRowClick = (index) => {
        setSelectedRowIndex(index);
    };

    return (
        <div className="dicom-nodes">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search here for name, IP address."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button onClick={fetchNodes}>Refresh</button>
            </div>
            
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('location')}>Location</th>
                            <th onClick={() => requestSort('name')}>Name</th>
                            <th onClick={() => requestSort('manufacturer')}>Manufacturer</th>
                            <th onClick={() => requestSort('model')}>Model</th>
                            <th onClick={() => requestSort('deviceSerialNumber')}>Device Serial Number</th>
                            <th onClick={() => requestSort('softwareVersion')}>Software Versions</th>
                            <th onClick={() => requestSort('stationName')}>Station Name</th>
                            <th onClick={() => requestSort('ipAddress')}>IP Address</th>
                            <th onClick={() => requestSort('mwlAet')}>AE Title</th>
                            {/* <th onClick={() => requestSort('latin')}>Latin</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNodes.map((node, index) => (
                            <tr
                                key={index}
                                onClick={() => handleRowClick(index)}
                                className={index === selectedRowIndex ? 'selected' : ''}
                            >
                                <td>{node.location}</td>
                                <td>{node.name}</td>
                                <td>{node.manufacturer}</td>
                                <td>{node.model}</td>
                                <td>{node.deviceSerialNumber}</td>
                                <td>{node.softwareVersions}</td>
                                <td>{node.stationName}</td>
                                <td>{node.ipAddress}</td>
                                <td>{node.aeTitle}</td>
                                {/* <td>{node.useLatinOnly.toString()}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="footer-buttons">
                    <button className="footer-button" onClick={handleNewNodes}>
                        <FontAwesomeIcon icon={faPlus} className="footer-icon" />
                        New Dicom Node
                    </button>
                    <button className="footer-button" onClick={handleEditNodes}>
                        <FontAwesomeIcon icon={faEdit} className="footer-icon" />
                        Edit Dicom Node
                    </button>
                    <button className="footer-button" onClick={handleDeleteNodes}>
                        <FontAwesomeIcon icon={faTrashAlt} className="footer-icon" />
                        Delete Dicom Node
                    </button>
                </div>
            </div>

            <NewDicomNodeDialog
                show={showDialog}
                onClose={() => setShowDialog(false)}
                onSubmit={handleFormSubmit}
            />
            {showDialog && <div className="overlay"></div>}

            <EditDicomNode
                show={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                nodeData={selectedNode}
                onSubmit={handleEditFormSubmit}
            />
            {showEditDialog && <div className="overlay"></div>}
        </div>
    );
}

export default DicomNodes;
