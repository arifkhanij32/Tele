
// import React, { useState, useEffect } from 'react';
// import './statics/ServicePage.css';
// import axios from 'axios';
// import PatientDetailsPage from './PatientServicePage';
// import ServicePageEdit from './ServicePageEdit';

// function formatDateTime(date) {
//     const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
//     return date.toLocaleString('en-US', options).replace(',', '').replace(' AM', ' AM').replace(' PM', ' PM');
// }

// const ServicePage = ({ selectedOption, onClose, patientData, onSave }) => {
//     console.log("Rendering ServicePage with patientData:", patientData);
//     const [services, setServices] = useState([]);
//     const [selectedServices, setSelectedServices] = useState([]);
//     const [patientVisits, setPatientVisits] = useState([]);
//     const [showEditDialog, setShowEditDialog] = useState(false);
//     const [editData, setEditData] = useState(null);
//     const [showPatientServicePage, setShowPatientServicePage] = useState(false);
//     const [updatedPatientData, setUpdatedPatientData] = useState(patientData);

//     const formatDateOfBirth = (dateString) => {
//         if (!dateString) return '';
//         let date = new Date(dateString);
//         const day = ('0' + date.getDate()).slice(-2);
//         const month = date.toLocaleString('default', { month: 'short' });
//         const year = date.getFullYear();
//         return `${day} ${month} ${year}`;
//     };

//     const formatDateToInput = (dateString) => {
//         if (!dateString) return '';
//         let date = new Date(dateString);
//         const year = date.getFullYear();
//         const month = ('0' + (date.getMonth() + 1)).slice(-2);
//         const day = ('0' + date.getDate()).slice(-2);
//         return `${year}-${month}-${day}`;
//     };

//     useEffect(() => {
//         if (updatedPatientData) {
//             updatedPatientData.dobFormatted = formatDateOfBirth(updatedPatientData.dob);
//             updatedPatientData.dobInputFormat = formatDateToInput(updatedPatientData.dob);
//         }
//     }, [updatedPatientData]);

//     const saveSelectedServices = (option, services) => {
//         localStorage.setItem(`selectedServices-${option}-${patientData.patientId}`, JSON.stringify(services));
//     };

//     const loadSelectedServices = (option) => {
//         const savedServices = localStorage.getItem(`selectedServices-${option}-${patientData.patientId}`);
//         return savedServices ? JSON.parse(savedServices) : [];
//     };

//     const handleServicePost = (service, newVisitId) => {
//         const now = new Date().toISOString();

//         axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/service-descriptions/`, {
//             visit: updatedPatientData.id,
//             newVisitId: newVisitId,
//             date: now,
//             service_name: `${service.modality} ${service.service}`,
//             price: `${service.price}`,
//         })
//             .then(response => {
//                 console.log("Service posted successfully:", response.data);
//             })
//             .catch(error => {
//                 console.error("Error posting service:", error);
//             });
//     };

//     useEffect(() => {
//         setSelectedServices(loadSelectedServices(selectedOption));
//     }, [updatedPatientData.patientId, selectedOption]);

//     useEffect(() => {
//         let apiEndpoint = '';
//         if (selectedOption === 'General') {
//             apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/general-services/`;
//         } else if (selectedOption === 'Insurance') {
//             apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`;
//         } else if (selectedOption === 'Beneficiary') {
//             apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`;
//         }

//         if (apiEndpoint) {
//             axios.get(apiEndpoint)
//                 .then(response => {
//                     setServices(response.data || []);
//                 })
//                 .catch(error => console.error(`Error fetching ${selectedOption.toLowerCase()} services:`, error));
//         }
//     }, [selectedOption]);

//     // useEffect(() => {
//     //     if (updatedPatientData && updatedPatientData.patientId) {
//     //         axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/by-patient/?patientId=${updatedPatientData.patientId}`)
//     //             .then(response => {
//     //                 setPatientVisits(response.data || []);
//     //             })
//     //             .catch(error => console.error('Error fetching patient visits:', error));
//     //     }
//     // }, [updatedPatientData]);
//     useEffect(() => {
//         if (patientData && patientData.patientId) {
//             axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/by-patient/?patientId=${patientData.patientId}`)
//                 .then(response => {
//                     setPatientVisits(response.data || []);
//                 })
//                 .catch(error => console.error('Error fetching patient visits:', error));
//         }
//     }, [patientData]);
    

//     const patientViewerDataPost = (patientData, selectedService, modality) => {
//         const now = new Date().toISOString().split('T')[0];
//         axios.post(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`, {
//             emg: false,
//             status: "Scheduled",
//             acquired: now,
//             received: now,
//             reported: now,
//             reporter: "Reporter Name",
//             service: selectedService,
//             name: patientData.name,
//             patientId: patientData.patientId,
//             age: patientData.age,
//             dob: formatDateToInput(patientData.dob),
//             gender: updatedPatientData.gender,
//             modality: modality,
//             referrer: "Referrer Name",
//             availability: "Available",
//             mlc: false
//         })
//         .then(response => {
//             console.log('Data posted successfully:', response.data);
//         })
//         .catch(error => {
//             console.error('Error posting data:', error.response?.data || error.message);
//         });
//     };

//     const handleVisitPost = async (formData, service) => {
//         try {
//             const currentDateTime = formatDateTime(new Date());
//             const response = await axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`, {
//                 id: formData.id,
//                 Emg: false,
//                 pay: 'unpaid',
//                 status: 'Created',
//                 date: currentDateTime,
//                 service: service,
//                 name: formData.name,
//                 dob: formData.dob,
//                 age: formData.age,
//                 gender: formData.gender,
//                 phone: formData.phone,
//                 patientId: formData.patientId,
//             });
        
//             console.log('Patient created:', response.data);
//             return response.data;
//         } catch (error) {
//             console.error('There was an error creating the patient!', error);
//             console.log('Error details:', error.response?.data);  // Log detailed error information
//             throw error;
//         }
//     };
    
//     const handleServiceClick = (service) => {
//         console.log("handleServiceClick called with service:", service);
//         const now = new Date();
//         const timestamp = now.toLocaleString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//             hour12: true
//         });
//         const selectedServiceWithTime = {
//             ...service,
//             timestamp,
//             quantity: 1,
//             price: service.price || 0
//         };
//         const updatedSelectedServices = [...selectedServices, selectedServiceWithTime];
//         setSelectedServices(updatedSelectedServices);
//         saveSelectedServices(selectedOption, updatedSelectedServices);
//         onSave(selectedOption, updatedSelectedServices);

//         axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/create_visit/`, {
//             visit: updatedPatientData.patientId,
//             date: now,
//             notes: `${service.modality} ${service.service}`,
//             price: `${service.price}`,
//         })
//         .then(response => {
//             console.log('Visit saved:', response.data);
//             const responseData = response.data;
//             handleServicePost(service, responseData.id);
//             const newVisit = {
//                 date: now.toISOString(),
//                 notes: `${service.modality} ${service.service}`,
//             };
//             setPatientVisits(prevVisits => [...prevVisits, newVisit]);

//             patientViewerDataPost(updatedPatientData, `${service.service}`, `${service.modality}`);
//             handleVisitPost(updatedPatientData, `${service.service} ${service.modality}`);
//         })
//         .catch(error => {
//             console.error('Error saving visit:', error);
//         });

//         setShowPatientServicePage(true);
//     };

//     const handleEdit = (data) => {
//         console.log("handleEdit called with data:", data);
//         const editData = {
//             id : data.id,
//             patientId: data.patientId,
//             firstName: data.firstName || data.name.split(' ')[0],
//             middleName: data.middleName || data.name.split(' ')[1],
//             lastName: data.lastName || data.name.split(' ')[2],
//             gender: data.gender,
//             dob: data.dob,
//             age: data.age,
//             phone: data.phone,
//         };
//         setEditData(editData);
//         setShowEditDialog(true);
//     };

//     const handleCloseEditDialog = () => {
//         setShowEditDialog(false);
//         setEditData(null);
//     };

//     const handleSaveEditData = (newData) => {
//         setUpdatedPatientData(newData);
//     };

//     if (showPatientServicePage) {
//         return <PatientDetailsPage onClose={onClose} patientData={updatedPatientData} selectedServices={selectedServices} selectedOption={selectedOption} />;
//     }

//     if (!updatedPatientData) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <>
//             <div className={`servicePage ${showEditDialog ? 'hide-overlay' : ''}`}>
//                 <div className="servicePage-header">
//                     <button onClick={onClose} className="servicePage-closeButton">X</button>
//                 </div>
//                 <div className="servicePage-content">
//                     <div className="patient-details">
//                         <h3>Patient Info</h3>
//                         <div>
//                             <p>Patient ID: {updatedPatientData.patientId}</p>
//                             <p>Name: {updatedPatientData.name}</p>
//                             <p>Date of Birth: {updatedPatientData.dobFormatted}</p>
//                             <p>Age: {updatedPatientData.age} Yr</p>
//                             <p>Phone: {updatedPatientData.phone}</p>
//                             <p>Gender: {updatedPatientData.gender}</p>
//                             <button className="edit-button" onClick={() => handleEdit(updatedPatientData)}>Edit</button>
//                         </div>
//                         <div className="other-visits1">
//                             <h4>Other Visits:</h4>
//                         </div>
//                         <div className="other-visits">
//                             <ul>
//                                 {patientVisits.length > 0 ? (
//                                     patientVisits.map((visit, index) => (
//                                         <li key={index}>{new Date(visit.date).toLocaleString()} - {visit.notes}</li>
//                                     ))
//                                 ) : (
//                                     <li>No previous visits</li>
//                                 )}
//                             </ul>
//                         </div>
//                     </div>
//                     <div className="service-list">
//                         <h3>Services</h3>
//                         <input type="text" className="service-search" placeholder="Search for services..." />
//                         <div className="service-items">
//                             <ul>
//                                 {services.length === 0 ? (
//                                     <li>No services found</li>
//                                 ) : (
//                                     services.map((service, index) => (
//                                         <li key={index} onClick={() => handleServiceClick(service)}>
//                                             {service.modality} {service.service}
//                                         </li>
//                                     ))
//                                 )}
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {showEditDialog &&
//                 <div className="modal-wrapper">
//                     <ServicePageEdit
//                         show={showEditDialog}
//                         onClose={handleCloseEditDialog}
//                         initialData={editData}
//                         onSave={handleSaveEditData}
//                     />
//                 </div>
//             }
//         </>
//     );
// };

// export default ServicePage;

import React, { useState, useEffect } from 'react';
import './statics/ServicePage.css';
import axios from 'axios';
import PatientDetailsPage from './PatientServicePage';
import ServicePageEdit from './ServicePageEdit';

function formatDateTime(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleString('en-US', options).replace(',', '').replace(' AM', ' AM').replace(' PM', ' PM');
}

const ServicePage = ({ selectedOption, onClose, patientData, onSave }) => {
    console.log("Rendering ServicePage with patientData:", patientData);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [patientVisits, setPatientVisits] = useState([]);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editData, setEditData] = useState(null);
    const [showPatientServicePage, setShowPatientServicePage] = useState(false);
    const [updatedPatientData, setUpdatedPatientData] = useState(patientData);

    const formatDateOfBirth = (dateString) => {
        if (!dateString) return '';
        let date = new Date(dateString);
        const day = ('0' + date.getDate()).slice(-2);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const formatDateToInput = (dateString) => {
        if (!dateString) return '';
        let date = new Date(dateString);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (updatedPatientData) {
            updatedPatientData.dobFormatted = formatDateOfBirth(updatedPatientData.dob);
            updatedPatientData.dobInputFormat = formatDateToInput(updatedPatientData.dob);
        }
    }, [updatedPatientData]);

    const saveSelectedServices = (option, services) => {
        localStorage.setItem(`selectedServices-${option}-${patientData.patientId}`, JSON.stringify(services));
    };

    const loadSelectedServices = (option) => {
        const savedServices = localStorage.getItem(`selectedServices-${option}-${patientData.patientId}`);
        return savedServices ? JSON.parse(savedServices) : [];
    };

    const handleServicePost = (service, newVisitId) => {
        const now = new Date().toISOString();

        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/service-descriptions/`, {
            visit: updatedPatientData.id,
            newVisitId: newVisitId,
            date: now,
            service_name: `${service.modality} ${service.service}`,
            price: `${service.price}`,
        })
            .then(response => {
                console.log("Service posted successfully:", response.data);
            })
            .catch(error => {
                console.error("Error posting service:", error);
            });
    };

    useEffect(() => {
        setSelectedServices(loadSelectedServices(selectedOption));
    }, [updatedPatientData.patientId, selectedOption]);

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
                    setServices(response.data || []);
                })
                .catch(error => console.error(`Error fetching ${selectedOption.toLowerCase()} services:`, error));
        }
    }, [selectedOption]);

    // useEffect(() => {
    //     if (updatedPatientData && updatedPatientData.patientId) {
    //         axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/by-patient/?patientId=${updatedPatientData.patientId}`)
    //             .then(response => {
    //                 setPatientVisits(response.data || []);
    //             })
    //             .catch(error => console.error('Error fetching patient visits:', error));
    //     }
    // }, [updatedPatientData]);
    useEffect(() => {
        if (patientData && patientData.patientId) {
            axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/by-patient/?patientId=${patientData.patientId}`)
                .then(response => {
                    setPatientVisits(response.data || []);
                })
                .catch(error => console.error('Error fetching patient visits:', error));
        }
    }, [patientData]);
    

    const patientViewerDataPost = (patientData, selectedService, modality) => {
        const now = new Date().toISOString().split('T')[0];
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
            dob: formatDateToInput(patientData.dob),
            gender: updatedPatientData.gender,
            modality: modality,
            referrer: "Referrer Name",
            availability: "Available",
            mlc: false
        })
        .then(response => {
            console.log('Data posted successfully:', response.data);
        })
        .catch(error => {
            console.error('Error posting data:', error.response?.data || error.message);
        });
    };

    // const handleVisitPost = async (formData, service) => {
    //     try {
    //         const currentDateTime = formatDateTime(new Date());
    //         const response = await axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`, {
    //             id: formData.id,
    //             Emg: false,
    //             pay: 'unpaid',
    //             status: 'Created',
    //             date: currentDateTime,
    //             service: service,
    //             name: formData.name,
    //             dob: formData.dob,
    //             age: formData.age,
    //             gender: formData.gender,
    //             phone: formData.phone,
    //             patientId: formData.patientId,
    //         });
        
    //         console.log('Patient created:', response.data);
    //         return response.data;
    //     } catch (error) {
    //         console.error('There was an error creating the patient!', error);
    //         console.log('Error details:', error.response?.data);  // Log detailed error information
    //         throw error;
    //     }
    // };
    const handleVisitPost = async (formData, service) => {
        try {
            const currentDateTime = formatDateTime(new Date());
    
            // Assuming you have the visit ID in formData.id, which you want to patch
            if (!formData.id) {
                throw new Error('Visit ID is required for patching.');
            }
    
            const response = await axios.patch(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/${formData.id}/`, {
                Emg: false,
                pay: 'unpaid',
                status: 'Created',
                date: currentDateTime,
                service: service, // Update the service data
                name: formData.name,
                dob: formData.dob,
                age: formData.age,
                gender: formData.gender,
                phone: formData.phone,
                patientId: formData.patientId,
            });
    
            console.log('Visit updated:', response.data);
            return response.data;  // Return updated visit data
        } catch (error) {
            console.error('There was an error updating the visit!', error);
            console.log('Error details:', error.response?.data);  // Log detailed error information
            throw error;  // Handle error as needed
        }
    };
    // const handleVisitPost = async (formData, service) => {
    //     try {
    //         const currentDateTime = formatDateTime(new Date());
    
    //         // Step 1: Post data to the PatientViewer API
    //         const patientViewerResponse = await axios.post(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`, {
    //             emg: false,
    //             status: "Scheduled",
    //             acquired: currentDateTime,
    //             received: currentDateTime,
    //             reported: currentDateTime,
    //             reporter: "Reporter Name",
    //             service: service,
    //             name: formData.name,
    //             patientId: formData.patientId,
    //             age: formData.age,
    //             dob: formatDateToInput(formData.dob),
    //             gender: formData.gender,
    //             modality: service.modality, // Assuming `service` has `modality`
    //             referrer: "Referrer Name",
    //             availability: "Available",
    //             mlc: false
    //         });
    
    //         // Step 2: Extract necessary data from the PatientViewer response
    //         const patientViewerData = patientViewerResponse.data; // Extract the response data
    //         console.log('PatientViewer data:', patientViewerData); // Log data for debugging
            
    //         // Step 3: Use extracted common data from PatientViewer and combine it with other details for Visits API
    //         const visitResponse = await axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`, {
    //             Emg: false,
    //             pay: 'unpaid',
    //             status: 'Created',
    //             date: currentDateTime,
    //             service: service.service, // Use service data
    //             name: formData.name,
    //             dob: formData.dob,
    //             age: formData.age,
    //             gender: formData.gender,
    //             phone: formData.phone,
    //             patientId: formData.patientId,
    //             balance: patientViewerData.balance || 0, // Use balance from PatientViewer or default to 0
    //         });
    
    //         console.log('Visit created:', visitResponse.data);
    //         return visitResponse.data;  // Return Visit API response
    //     } catch (error) {
    //         console.error('Error creating visit:', error);
    //         throw error;
    //     }
    // };
    
    
    
    const handleServiceClick = (service) => {
        console.log("handleServiceClick called with service:", service);
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const selectedServiceWithTime = {
            ...service,
            timestamp,
            quantity: 1,
            price: service.price || 0
        };
        const updatedSelectedServices = [...selectedServices, selectedServiceWithTime];
        setSelectedServices(updatedSelectedServices);
        saveSelectedServices(selectedOption, updatedSelectedServices);
        onSave(selectedOption, updatedSelectedServices);

        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/create_visit/`, {
            visit: updatedPatientData.patientId,
            date: now,
            notes: `${service.modality} ${service.service}`,
            price: `${service.price}`,
        })
        .then(response => {
            console.log('Visit saved:', response.data);
            const responseData = response.data;
            handleServicePost(service, responseData.id);
            const newVisit = {
                date: now.toISOString(),
                notes: `${service.modality} ${service.service}`,
            };
            setPatientVisits(prevVisits => [...prevVisits, newVisit]);

            patientViewerDataPost(updatedPatientData, `${service.service}`, `${service.modality}`);
            handleVisitPost(updatedPatientData, `${service.service} ${service.modality}`);
        })
        .catch(error => {
            console.error('Error saving visit:', error);
        });

        setShowPatientServicePage(true);
    };

    const handleEdit = (data) => {
        console.log("handleEdit called with data:", data);
        const editData = {
            id : data.id,
            patientId: data.patientId,
            firstName: data.firstName || data.name.split(' ')[0],
            middleName: data.middleName || data.name.split(' ')[1],
            lastName: data.lastName || data.name.split(' ')[2],
            gender: data.gender,
            dob: data.dob,
            age: data.age,
            phone: data.phone,
        };
        setEditData(editData);
        setShowEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setEditData(null);
    };

    const handleSaveEditData = (newData) => {
        setUpdatedPatientData(newData);
    };

    if (showPatientServicePage) {
        return <PatientDetailsPage onClose={onClose} patientData={updatedPatientData} selectedServices={selectedServices} selectedOption={selectedOption} />;
    }

    if (!updatedPatientData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className={`servicePage ${showEditDialog ? 'hide-overlay' : ''}`}>
                <div className="servicePage-header">
                    <button onClick={onClose} className="servicePage-closeButton">X</button>
                </div>
                <div className="servicePage-content">
                    <div className="patient-details">
                        <h3>Patient Info</h3>
                        <div>
                            <p>Patient ID: {updatedPatientData.patientId}</p>
                            <p>Name: {updatedPatientData.name}</p>
                            <p>Date of Birth: {updatedPatientData.dobFormatted}</p>
                            <p>Age: {updatedPatientData.age} Yr</p>
                            <p>Phone: {updatedPatientData.phone}</p>
                            <p>Gender: {updatedPatientData.gender}</p>
                            <button className="edit-button" onClick={() => handleEdit(updatedPatientData)}>Edit</button>
                        </div>
                        <div className="other-visits1">
                            <h4>Other Visits:</h4>
                        </div>
                        <div className="other-visits">
                            <ul>
                                {patientVisits.length > 0 ? (
                                    patientVisits.map((visit, index) => (
                                        <li key={index}>{new Date(visit.date).toLocaleString()} - {visit.notes}</li>
                                    ))
                                ) : (
                                    <li>No previous visits</li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="service-list">
                        <h3>Services</h3>
                        <input type="text" className="service-search" placeholder="Search for services..." />
                        <div className="service-items">
                            <ul>
                                {services.length === 0 ? (
                                    <li>No services found</li>
                                ) : (
                                    services.map((service, index) => (
                                        <li key={index} onClick={() => handleServiceClick(service)}>
                                            {service.modality} {service.service}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {showEditDialog &&
                <div className="modal-wrapper">
                    <ServicePageEdit
                        show={showEditDialog}
                        onClose={handleCloseEditDialog}
                        initialData={editData}
                        onSave={handleSaveEditData}
                    />
                </div>
            }
        </>
    );
};

export default ServicePage;