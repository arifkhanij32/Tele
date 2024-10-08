import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './statics/ServiceModal.css';

const ServiceModal = ({ show, selectedReferrer, handleClose, services, selectedOption, serviceID, patientData, onServiceRowSelect, fetchServiceDescriptions }) => {
    const [search, setSearch] = useState('');
    const [filteredServices, setFilteredServices] = useState([]);
    const [selectedServiceIndex, setSelectedServiceIndex] = useState(null); // State to track the selected row

    useEffect(() => {
        let apiEndpoint = '';
        if (selectedOption === 'General') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/general-services/`;
        } else if (selectedOption === 'Insurance') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`;
        } else if (selectedOption === 'Beneficiary') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`;
        }

        if (apiEndpoint) {
            axios.get(apiEndpoint)
                .then(response => {
                    setFilteredServices(response.data || []);
                })
                .catch(error => console.error(`Error fetching ${selectedOption} services:`, error));
        }
    }, [selectedOption]);
    useEffect(() => {
        let apiEndpoint = '';
        if (selectedOption === 'General') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/general-services/`;
        } else if (selectedOption === 'Insurance') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`;
        } else if (selectedOption === 'Beneficiary') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`;
        }

        if (apiEndpoint) {
            axios.get(apiEndpoint)
                .then(response => {
                    setFilteredServices(response.data || []);
                })
                .catch(error => console.error(`Error fetching ${selectedOption} services:`, error));
        }
    },services);

    // Format date utility
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    // Post the patient viewer data
    const patientViewerDataPost = (patientData, selectedService, modality) => {
        const now = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`, {
            emg: false,
            status: "Scheduled",
            acquired: now,
            received: now,
            reported: now,
            reporter: "Reporter Name",
            service: selectedService,
            name: patientData.name,
            patientId: patientData.patientId,
            age: patientData.age,
            dob: formatDate(patientData.dob),
            gender: patientData.gender,
            modality: modality,
            referrer: selectedReferrer || "No Referrer",
            availability: "Available",
            mlc: false
        })
        .then(response => {
            console.log('PatientViewer data posted successfully:', response.data);
        })
        .catch(error => {
            console.error('Error posting PatientViewer data:', error.response?.data || error.message);
        });
    };

    // Post the service data when a row is clicked
    // const handleServicePost = (service) => {
    //     const now = new Date().toISOString();

    //     axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/service-descriptions/`, {
    //         visit: serviceID[0],
    //         newVisitId: serviceID[1],
    //         date: now,
    //         service_name: `${service.modality} ${service.service}`,
    //         price: `${service.price}`,
    //     })
    //     .then(response => {
    //         console.log("Service data posted successfully:", response.data);
    //         handleClose(); // Close the modal on success
    //         fetchServiceDescriptions(); // Fetch the latest service descriptions
    //         patientViewerDataPost(patientData, `${service.service}`, `${service.modality}`);

    //         // Update the service in the visit table
    //         axios.patch(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/${patientData.id}/`, {
    //             service: `${service.modality} ${service.service}`
    //         })
    //         .then(() => {
    //             fetchServiceDescriptions(); // Fetch the updated service descriptions
    //         });
    //     })
    //     .catch(error => {
    //         console.error("Error posting service:", error);
    //     });
    // };

    // Handle row selection
    const handleServiceRowClick = (service, index) => {
        patientViewerDataPost(patientData, `${service.service}`, `${service.modality}`);
        onServiceRowSelect(service); // Call parent handler to update selected service
        setSelectedServiceIndex(index); // Highlight the selected row
        // handleServicePost(service); // Post the selected service data
    };

    if (!show) return null;

    return (
        <div className="custom-modal-overlay" onClick={handleClose}>
            <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="custom-modal-header">
                    <h2>Select the service to add for {selectedOption}</h2>
                    <button className="close-button1" onClick={handleClose}>&times;</button>
                </div>

                <div className="custom-modal-body">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search here for service or modality."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Modality</th>
                                <th>Service</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service, index) => (
                                <tr 
                                    key={index} 
                                    onClick={() => handleServiceRowClick(service, index)} 
                                    style={{ backgroundColor: selectedServiceIndex === index ? 'lightblue' : 'white' }}
                                >
                                    <td>{service.modality}</td>
                                    <td>{service.service}</td>
                                    <td>{service.currency} {service.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="custom-modal-footer">
                    <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;