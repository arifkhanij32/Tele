import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './statics/PatientServicePage.css';
import AddDiscount from './AddDiscount';
import AddPayment from './AddPayment';
import AddRefund from './AddRefund';
import AdminRefund from './AdminRefund';
import PaymentSelectOption from './PaymentSelectOption';
import ServicePageEdit from './ServicePageEdit'; // Import ServicePageEdit
import AddReferrerDialog from './AddReferrerDialog';
import ServiceModal from './ServiceModal';

Modal.setAppElement('#root');

const formatDateOfBirth = (dateString) => {
    if (!dateString) return '';

    let year = dateString.slice(0, 4);
    let month = dateString.slice(5, 7);
    let day = dateString.slice(8, 10);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(month, 10) - 1;

    if (monthIndex < 0 || monthIndex > 11) {
        return `${day} Invalid ${year}`;
    }

    const monthName = monthNames[monthIndex];

    return `${day} ${monthName} ${year}`;
};

function formatDate(isoString) {
    if (!isoString) return 'Unknown Date';  // Handle case where isoString is not provided

    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';  // Handle invalid date
    }

    const day = date.getDate();
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}


const PatientDetailsPage = ({visitId, selectedOption, onClose, patientData: initialPatientData, selectedServices = [], fetchVisits, onRefundSuccess, handleSendClick, handleApproveClick, handleRejectClick, handleRefundClick }) => {
    
    const [modalShow, setModalShow] = useState(false); // Add state to show ServiceModal

    const [displayedServices, setDisplayedServices] = useState([]);
    const [showServicesTable, setShowServicesTable] = useState(false); 
    const [patientData, setPatientData] = useState(initialPatientData); // Initialize state with initialPatientData
    const [maximizedSection, setMaximizedSection] = useState(null);
    const [services, setServices] = useState(selectedServices);
    const [patientVisits, setPatientVisits] = useState([]);
    const [taxType, setTaxType] = useState('VAT');
    const [taxPercentage, setTaxPercentage] = useState(15);
    const [isAddReferrerDialogOpen, setAddReferrerDialogOpen] = useState(false);
    const [selectedReferrer, setSelectedReferrer] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [notesModalIsOpen, setNotesModalIsOpen] = useState(false);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [discountModalIsOpen, setDiscountModalIsOpen] = useState(false);
    const [paymentModalIsOpen, setPaymentModalIsOpen] = useState(false);
    const [refundModalIsOpen, setRefundModalIsOpen] = useState(false);
    const [adminRefundModalIsOpen, setAdminRefundModalIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isClinical, setIsClinical] = useState(false);
    const [warning, setWarning] = useState('');
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [confirmDeleteService, setConfirmDeleteService] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [status, setStatus] = useState('Unpaid');
    const [refundReason, setRefundReason] = useState('');
    const [refundData, setRefundData] = useState(null);
    const [payments, setPayments] = useState([]);
    const [isRefundApproved, setIsRefundApproved] = useState(false);
    const [refundStatus, setRefundStatus] = useState([]);
    const [refundStatusModalIsOpen, setRefundStatusModalIsOpen] = useState(false);
    const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
    const [documentType, setDocumentType] = useState('General Document');
    const [isRefundButtonVisible, setIsRefundButtonVisible] = useState(false);
    const [refundDetails, setRefundDetails] = useState(null);
    const [latestvisitID, setLatestVisitID] = useState([]);
    const [totalRefund, setTotalRefund] = useState(0);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [selectOptionIsOpen, setSelectOptionIsOpen] = useState(false); // Initially set to false
    const [serviceDescription, setServiceDescription] = useState([]);
    const [getServiceDescriptionID, setGetServiceDescriptionID] = useState();
    const [serviceIDs, setserviceIDs] = useState([]);
    const [showEditDialog, setShowEditDialog] = useState(false); // State to control the edit dialog visibility
    const [editData, setEditData] = useState(null);
    const [visitNotesId, setVisitNotesId] = useState(null);
    const [adminRefundButtonVisible, setAdminRefundButtonVisible] = useState(false);
    
    

    const handleAddReferrerClick = () => {
        setAddReferrerDialogOpen(true);
    };

    const handleCloseReferrerDialog = () => {
        setAddReferrerDialogOpen(false);
    };

    const handleReferrerAdded = (referrerData) => {
        setSelectedReferrer(referrerData);
        setAddReferrerDialogOpen(false);
        
        // If you have a VisitNotes ID, update the referrer
        if (visitNotesId) {
            const updateData = {
                referrer: referrerData.id, // Referrer ID
            };
    
            axios.patch(`${process.env.REACT_APP_LOCALHOST}/patients/visit-notes/${visitNotesId}/`, updateData)
                .then(response => {
                    console.log("Referrer updated successfully in VisitNotes:", response.data);
                })
                .catch(error => {
                    console.error("Error updating referrer in VisitNotes:", error);
                });
        } else {
            console.error("VisitNotes ID is not available for updating referrer.");
        }
    };

    useEffect(() => {
        // Inside the useEffect, define and invoke the async function
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/referrer/referrals/${latestvisitID[1]}/`);
                console.log("Fetched referral data:", response.data);
                
                const referrerName = response.data.referrer;
                console.log("referrername:",response.data.referrer)
                setSelectedReferrer(referrerName); // Set referrer to state

            } catch (error) {
                console.error("Error fetching referral data:", error.response ? error.response.data : error.message);
            }
        };

        // Call the fetchData function
        fetchData();
    }, [latestvisitID]); // Add latestvisitID as a dependency
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/visit-notes/?visit=${patientData.id}`)
            .then(response => {
                if (response.data.length > 0) {
                    setVisitNotesId(response.data[0].id); // Assuming you're working with the first VisitNote
                }
            })
            .catch(error => console.error('Error fetching VisitNotes:', error));
    }, [patientData]);
    
    
    // useEffect(() => {
    //     if (patientData) {
    //         const { patientId, name, dob, gender, services, date } = patientData;
    
    //         setServices(services || []);  // Make sure services are set
    //         setLatestVisitID([patientId, date ? formatDate(date) : 'Unknown Date']);
    //     }
    // }, [patientData]);
    
    // useEffect(() => {
    //     if (services.length > 0) {
    //         const totalAmount = calculateTotal();
    //         setBalance(totalAmount);
    //         setStatus(totalAmount <= 0 ? 'Paid' : 'Unpaid');
    //     } else {
    //         setBalance(0);
    //         setStatus('Unpaid');
    //     }
    // }, [services, discountPercentage, discountAmount, taxPercentage, totalRefund]);



    useEffect(() => {
        // Calculate the initial balance based on services, discounts, etc.
        const initialBalance = calculateTotal();
    
        // If the balance is already zero and the status is 'Paid', don't recalculate
        if (balance === 0 && status === 'Paid') {
            return;
        }
    
        // If the initial balance is zero, set status to 'Paid'
        if (initialBalance <= 0) {
            setBalance(0);
            setStatus('Paid');
        } else {
            // Otherwise, update balance and set status to 'Unpaid'
            setBalance(initialBalance);
            setStatus('Unpaid');
        }
    }, [services, discountPercentage, discountAmount, taxPercentage, totalRefund, serviceDescription, balance, status]);
    
    useEffect(() => {
        let patientId = '';
        if (patientData.patientId) {
            patientId = patientData.patientId;
        } else {
            patientId = patientData.patientId;
        }

        if (patientData && patientId) {
            axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/by-patient/?patientId=${patientId}`)
                .then(response => {
                    setPatientVisits(response.data || []);
                })
                .catch(error => console.error('Error fetching patient visits:', error));
        }
    }, [patientData]);

    useEffect(() => {
        let patientId = '';
        if (patientData.patientId) {
            patientId = patientData.patientId;
        } else {
            patientId = patientData.patientId;
        }

        if (patientData && patientId) {
            axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/patient-visits/by-patient/?patientId=${patientId}`)
                .then(response => {
                    const patientVisits = response.data || [];
                    if (patientVisits.length > 0) {
                        const latestService = patientVisits[patientVisits.length - 1].notes;
                        const latestVisitDate = patientVisits[patientVisits.length - 1].date;
                        let latest = ''
                        latest = formatDate(latestVisitDate)
                        
                        const latestPrice = patientVisits[patientVisits.length - 1].price;
                        const latestVisitID = patientVisits[patientVisits.length - 1].newVisitId;
                        const ID = patientVisits[patientVisits.length - 1].id;
                        setServices([{ modality: '', service: latestService, price: latestPrice, quantity: 1 }]);
                        setLatestVisitID([latestVisitID, ID, latest]);
                        setGetServiceDescriptionID(ID);
                    } else {
                        setServices([]);
                    }
                })
                .catch(error => console.error('Error fetching patient visits:', error));
        }
    }, [selectedServices]);

    useEffect(() => {
        const fetchServiceDescriptions = async () => {
            if (getServiceDescriptionID) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/service-descriptions-list/?visit=${patientData.id}&patientVisit=${getServiceDescriptionID}`);
                    const servicesWithQuantity = response.data.map(service => ({ ...service, quantity: 1 }));
                    setServiceDescription(response.data || []);
                    setServiceDescription(servicesWithQuantity);
    
                    console.log("setServiceDescription", response.data);
                } catch (error) {
                    console.error('Error fetching service descriptions:', error);
                }
            }
        };
        fetchServiceDescriptions();
    }, [patientData, getServiceDescriptionID]);
    
    useEffect(() => {
        if (getServiceDescriptionID) {
            console.log("Fetching service descriptions for ID:", getServiceDescriptionID); // Debugging
            fetchServiceDescriptions();
        } else {
            console.log("getServiceDescriptionID is undefined"); // Debugging
        }
    }, [patientData, getServiceDescriptionID]);
    

    useEffect(() => {
        // Logic to handle services based on the selected option
        if (selectedOption === 'General') {
            setDisplayedServices(selectedServices.filter(service => service.category === 'General'));
        } else if (selectedOption === 'Insurance') {
            setDisplayedServices(selectedServices.filter(service => service.category === 'Insurance'));
        } else if (selectedOption === 'Beneficiary') {
            setDisplayedServices(selectedServices.filter(service => service.category === 'Beneficiary'));
        }
    }, [selectedOption, selectedServices]); 
    
    
    const fetchServiceDescriptions = async () => {
        if (getServiceDescriptionID) {
            try {
                const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/service-descriptions-list/?visit=${patientData.id}&patientVisit=${getServiceDescriptionID}`);
                const servicesWithQuantity = response.data.map(service => ({ ...service, quantity: 1 }));
                setServiceDescription(response.data || []);
                setServiceDescription(servicesWithQuantity);

                console.log("setServiceDescription", response.data);
            } catch (error) {
                console.error('Error fetching service descriptions:', error);
            }
        }
    };

    // const calculateTotal = () => {
    //     const netPrice = serviceDescription.reduce((total, service) => total + service.quantity * service.price, 0) || 0;
    //     const discount = discountAmount || (netPrice * discountPercentage) / 100;
    //     const discountedPrice = netPrice - discount;
    //     const taxAmount = (discountedPrice * taxPercentage) / 100;
    //     return discountedPrice + taxAmount - (totalRefund || 0);
    // };
    // const calculateTotal = () => {
    //     const netPrice = serviceDescription.reduce((total, service) => total + service.quantity * service.price, 0) || 0;
    //     const discount = discountAmount || (netPrice * discountPercentage) / 100;
    //     const discountedPrice = netPrice - discount;
    //     const taxAmount = (discountedPrice * taxPercentage) / 100;
    
    //     const totalAmount = discountedPrice + taxAmount - (totalRefund || 0);
        
    //     // Calculate remaining balance by subtracting total payments from the total amount
    //     const totalPayments = payments.reduce((total, payment) => total + payment.amount, 0);
        
    //     return totalAmount - totalPayments;
    // };

    const calculateTotal = () => {
        const netPrice = serviceDescription.reduce((total, service) => total + service.quantity * service.price, 0) || 0;
        const discount = discountAmount || (netPrice * discountPercentage) / 100;
        const discountedPrice = netPrice - discount;
        const taxAmount = (discountedPrice * taxPercentage) / 100;
   
        return discountedPrice + taxAmount - (totalRefund || 0);
    };
   
    

    const calculateTotalDisplay = () => {
        return (calculateTotal() || 0).toFixed(2);
    };

    const calculateSubTotal = () => {
        return serviceDescription.reduce((total, service) => total + service.quantity * service.price, 0) || 0;
    };

    const calculateDiscount = () => {
        const netPrice = serviceDescription.reduce((total, service) => total + service.quantity * service.price, 0) || 0;
        return discountAmount || (netPrice * discountPercentage) / 100;
    };

    const calculateTax = () => {
        const netPrice = serviceDescription.reduce((total, service) => total + service.quantity * service.price, 0) || 0;
        const discount = discountAmount || (netPrice * discountPercentage) / 100;
        const discountedPrice = netPrice - discount;
        return (discountedPrice * taxPercentage) / 100;
    };

    const toggleMaximize = (section) => {
        if (maximizedSection === section) {
            setMaximizedSection(null);
        } else {
            setMaximizedSection(section);
        }
    };

    const handleQuantityChange = (index, newQuantity) => {
        if (newQuantity < 1) {
            setServiceToDelete(index);
            setConfirmDeleteService(true);
            return;
        }
        const updatedServices = [...serviceDescription];
        updatedServices[index].quantity = newQuantity;
        setServiceDescription(updatedServices);
        const updatedBalance = calculateTotal();
        setBalance(updatedBalance);
        setStatus(updatedBalance <= 0 ? 'Paid' : 'Unpaid');
    };
    const handleServiceRemove = async (serviceId) => {
        try {
            const updatedServices = serviceDescription.filter((service) => service.id !== serviceId);
            setServiceDescription(updatedServices);
           
            const response = await axios.delete(`${process.env.REACT_APP_LOCALHOST}/patients/service-descriptions/${serviceId}/`);
            if (response.status === 204) {
                setConfirmDeleteService(false);
            } else {
                console.error('Failed to delete service description:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting service description:', error);
        } finally {
            setConfirmDeleteService(false);
        }
    };
   
    const handleServiceAdd = () => {
        // setSelectOptionIsOpen(true);
        
        setModalShow(true); // Set modal visibility state
        setserviceIDs([patientData.id, getServiceDescriptionID])
    };
    const closeServiceModal = () => {
        setModalShow(false); // Close ServiceModal when done
    };
    

    const closePaymentSelectOption = () => {
        setSelectOptionIsOpen(false);
        fetchServiceDescriptions(); // Fetch the latest service descriptions
    };

    const handleTaxTypeChange = (e) => {
        setTaxType(e.target.value);
    };

    const handleTaxPercentageChange = (e) => {
        setTaxPercentage(parseFloat(e.target.value));
    };

    const openModal = () => {
        setModalIsOpen(true);
        setIsAnyModalOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setIsAnyModalOpen(false);
    };

    const openNotesModal = () => {
        setNotesModalIsOpen(true);
        setIsAnyModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalIsOpen(false);
        setIsAnyModalOpen(false);
    };

    const openDeleteModal = (index) => {
        setNoteToDelete(index);
        setDeleteModalIsOpen(true);
        setIsAnyModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setNoteToDelete(null);
        setIsAnyModalOpen(false);
    };

    const openDiscountModal = () => {
        setDiscountModalIsOpen(true);
        setIsChildModalOpen(true);
    };

    const closeDiscountModal = () => {
        setDiscountModalIsOpen(false);
        setIsChildModalOpen(false);
    };

    const openPaymentModal = () => {
        setPaymentModalIsOpen(true);
        setIsChildModalOpen(true);
    };

    const closePaymentModal = () => {
        setPaymentModalIsOpen(false);
        setIsChildModalOpen(false);
    };

    const openRefundModal = () => {
        setRefundModalIsOpen(true);
        setIsChildModalOpen(true);
    };

    const closeRefundModal = () => {
        setRefundModalIsOpen(false);
        setIsChildModalOpen(false);
    };

    const openAdminRefundModal = () => {
        setAdminRefundModalIsOpen(true);
        setIsChildModalOpen(true);
    };

    const closeAdminRefundModal = () => {
        setAdminRefundModalIsOpen(false);
        setIsChildModalOpen(false);
    };

    const openRefundStatusModal = () => {
        setRefundStatusModalIsOpen(true);
    };

    const closeRefundStatusModal = () => {
        setRefundStatusModalIsOpen(false);
    };

    const handleAddDiscount = ({ discountPercentage, discountAmount, reason }) => {
        setDiscountPercentage(discountPercentage);
        setDiscountAmount(discountAmount);
    };

    // const handleAddPayment = (paymentData) => {
    //     const newBalance = balance - paymentData.amount;
    //     setBalance(newBalance);
    //     setStatus(newBalance <= 0 ? 'Paid' : 'Unpaid');
    //     setPayments([...payments, paymentData]);
    //     handleSaveTotals()
    // };
// Add payment logic ensuring the balance doesn't revert once paid
const handleAddPayment = (paymentData) => {
    // Calculate the new balance after applying the payment
    const newBalance = balance - paymentData.amount;

    // Ensure the balance never goes below zero and set the correct status
    const finalBalance = newBalance < 0 ? 0 : newBalance;
    const updatedStatus = finalBalance === 0 ? 'Paid' : 'Unpaid';

    // Update balance and status
    setBalance(finalBalance);
    setStatus(updatedStatus);

    // Add the payment to the list of payments
    setPayments([...payments, paymentData]);

    // Save the updated totals (balance, tax, refund, etc.) to the backend
    handleSaveTotals(finalBalance, updatedStatus);
};

    const handleAddRefund = (refundDetails) => {
        setRefundDetails(refundDetails);
        setAdminRefundModalIsOpen(true);
    };

    const handleSendRefundReason = (refundDetails) => {
        setRefundData(refundDetails);
        setAdminRefundModalIsOpen(true);
    };

    const handleUploadClick = () => {
        document.getElementById('file-input').click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        handleFileUpload();
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            console.error('No file selected for upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            console.log("inside try");

            const response = await axios.post('${process.env.REACT_APP_LOCALHOST}/patients/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("inside try 1");

            if (response.status === 201 || response.status === 200) {
                console.log("inside try2");

                console.log('File uploaded successfully:', response.data);
                setUploadResult(response.data.file_url);
                alert('File uploaded successfully.');
            } else {
                console.error('File upload failed:', response.data);
                alert('File upload failed.');
            }
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            console.error('Error uploading file:', error);
            alert(`Error uploading file: ${error.message}`);
        }
    };

    const handleNoteSave = async () => {
        if (newNote.trim() === '') {
            setWarning('Note cannot be empty');
            return;
        }

        const notePayload = {
            date: new Date().toISOString().slice(0, 10),
            referrer: selectedReferrer ? selectedReferrer.name : '',
            notes: newNote
        };

        try {
            const response = await axios.post('${process.env.REACT_APP_LOCALHOST}/patients/visitsNotes/', notePayload);
            if (response.status === 201 || response.status === 200) {
                setNotes([...notes, { text: newNote, isClinical, timestamp: new Date() }]);
                setNewNote('');
                setIsClinical(false);
                setWarning('');
                closeNotesModal();
            } else {
                setWarning('Failed to save note. Please try again.');
            }
        } catch (error) {
            setWarning('Failed to save note. Please try again.');
            console.error('There was an error saving the note!', error);
        }
    };
    

    const handleNoteDeleteConfirm = () => {
        setNotes(notes.filter((_, i) => i !== noteToDelete));
        closeDeleteModal();
    };

    const confirmDeleteServiceAction = () => {
        handleServiceRemove(serviceToDelete);
        setServiceToDelete(null);
        setConfirmDeleteService(false);
    };

    const handleReceiptClick = () => {
        const doc = new jsPDF();
    
        const generateInvoice = (offsetY) => {
            // Set font size for header
            doc.setFontSize(10);
    
            // Center the invoice title
            doc.text('Invoice', doc.internal.pageSize.width / 2, offsetY + 10, { align: 'center' });
    
            // Set font size for body text
            doc.setFontSize(8);
    
            // Set text color to black
            doc.setTextColor(0, 0, 0);
    
            // Add text elements for hospital, patient, and date on the right side
            const hospitalName = "Hospital Name: XYZ";
            const patientName = `Patient: ${patientData ? patientData.name : 'N/A'}`;
            const date = `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}`;
    
            // Position these elements on the right
            const marginRight = 20;
            doc.text(hospitalName, doc.internal.pageSize.width - marginRight, offsetY + 20, { align: 'right' });
            doc.text(patientName, doc.internal.pageSize.width - marginRight, offsetY + 30, { align: 'right' });
            doc.text(date, doc.internal.pageSize.width - marginRight, offsetY + 40, { align: 'right' });
    
            const tableColumn = ["Service Description", "Price", "No.", "Total"];
            const tableRows = [];
    
            serviceDescription.forEach(service => {
                const serviceData = [
                    service.description,
                    service.price.toFixed(2),
                    service.quantity,
                    (service.price * service.quantity).toFixed(2),
                ];
                tableRows.push(serviceData);
            });
            
    
            // Generate service details table
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: offsetY + 50, // Adjusted to allow space for the header text
                styles: {
                    fillColor: [255, 255, 255], // White background
                    textColor: [0, 0, 0], // Black text
                    lineWidth: 0.2, // Thinner lines
                },
                headStyles: {
                    fillColor: [220, 220, 220], // Light gray header background
                    textColor: [0, 0, 0], // Black text in headers
                },
                theme: 'grid', // Grid theme for table lines
                margin: { top: 5, right: 5, bottom: 5, left: 5 }, // Reduced margin
            });
    
            // Prepare totals and tax data
            const totalAmount = calculateTotal();
            const taxAmount = (totalAmount * (taxPercentage / 100));
    
            // Generate totals and tax table
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 5,
                head: [['Description', 'Amount']],
                body: [
                    ['Total Amount', totalAmount.toFixed(2)],
                    ['Net Amount', totalAmount.toFixed(2)],
                    [`Tax (${taxType} ${taxPercentage}%)`, taxAmount.toFixed(2)],
                    ['Total Amount', (totalAmount + taxAmount).toFixed(2)],
                ],
                styles: {
                    fillColor: [255, 255, 255], // White background
                    textColor: [0, 0, 0], // Black text
                    lineWidth: 0.2, // Thinner lines
                },
                headStyles: {
                    fillColor: [220, 220, 220], // Light gray header background
                    textColor: [0, 0, 0], // Black text in headers
                },
                theme: 'grid', // Grid theme for table lines
                margin: { top: 5, right: 5, bottom: 5, left: 5 }, // Reduced margin
            });
        };
    
        // Calculate partition height to fit three invoices on one page
        const pageHeight = doc.internal.pageSize.height;
        const partitionHeight = (pageHeight - 10) / 3; // Account for some top and bottom padding
    
        for (let i = 0; i < 3; i++) {
            generateInvoice(i * partitionHeight);
        }
    
        doc.save('receipt.pdf');
    };

    const handleApprove = () => {
        setIsRefundApproved(true);
        setIsRefundButtonVisible(true);
        setAdminRefundButtonVisible(false);
        closeAdminRefundModal();
    };

    const handleReject = () => {
        setIsRefundApproved(false);
        setAdminRefundButtonVisible(false);
        closeAdminRefundModal();
    };

    // const handleSaveTotals = () => {
    //     const totalsData = {
    //         subtotal: calculateSubTotal(),
    //         balance: balance,
    //         tax: calculateTax(),
    //         refund: totalRefund,
    //         discountdata: calculateDiscount(),
    //         total: calculateTotal()
    //     };

    //     axios.post('${process.env.REACT_APP_LOCALHOST}/bills/', totalsData)
    //         .then(response => {
    //             console.log('Totals saved successfully:', response.data);
    //         })
    //         .catch(error => {
    //             console.error('There was an error saving the totals!', error);
    //             let errorMessage = 'There was an error saving the totals. Please try again.';
    //             if (error.response) {
    //                 errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
    //             } else if (error.request) {
    //                 errorMessage = 'Error: No response received from the server.';
    //             } else {
    //                 errorMessage = `Error: ${error.message}`;
    //             }
    //             alert(errorMessage);
    //         });
    // };
    // const handleSaveTotals = () => {
    //     const totalsData = {
    //         visit: patientData.id,      // Using visitId from patientData
    //         sub_total: calculateSubTotal(),
    //         balance: balance,
    //         tax: calculateTax(),
    //         refund: totalRefund,
    //         discount: calculateDiscount(),
    //         total: calculateTotal(),
    //         payment_status: status,  // Paid/Unpaid status
    //     };
    
    //     axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/bills/`, totalsData)
    //         .then(response => {
    //             console.log('Bill posted successfully:', response.data);
    //         })
    //         .catch(error => {
    //             console.error('Error posting bill:', error);
    //         });
    // };
    // useEffect(() => {
    //     if (patientData && patientData.id) {
    //         axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/payments/?visitId=${patientData.id}`)
    //             .then(response => {
    //                 setPayments(response.data || []);  // Populate the payments state
    //             })
    //             .catch(error => console.error('Error fetching payments:', error));
    //     }
    // }, [patientData]);
    // const handleSaveTotals = () => {
    //     const totalsData = {
    //         visit: patientData.id,  // Ensure `patientData.id` is correct
    //         sub_total: calculateSubTotal(),
    //         balance: balance,  // Ensure `balance` is correctly calculated
    //         tax: calculateTax(),
    //         refund: totalRefund,
    //         discount: calculateDiscount(),
    //         total: calculateTotal(),
    //         payment_status: status,  // Ensure `status` is updated correctly
    //     };
    
    //     console.log("Posting data:", totalsData);  // Log the data before posting
    
    //     axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/bills/`, totalsData)
    //         .then(response => {
    //             console.log('Bill posted successfully:', response.data);
    //         })
    //         .catch(error => {
    //             console.error('Error posting bill:', error);
    //         });
    // };
    const  handleSaveTotals = (newBalance, updatedStatus) => {
        const totalsData = {
            visit: patientData.id, // Ensure `patientData.id` is correct
            sub_total: calculateSubTotal(),
            balance: newBalance, // Ensure `balance` is correctly calculated
            tax: calculateTax(),
            refund: totalRefund,
            discount: calculateDiscount(),
            total: calculateTotal(),
            payment_status: updatedStatus, // Ensure `status` is updated correctly
        };
    
        console.log("Posting data:", totalsData); // Log the data before posting
    
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/bills/`, totalsData)
            .then(response => {
                console.log('Bill posted successfully:', response.data);
            })
            .catch(error => {
                console.error('Error posting bill:', error);
            });
    };
    
    
    

    const handleUpdateVisitStatus = (newStatus) => {
        setStatus(newStatus);
    };

    let patientId = '';
    let dob = '';
    if (patientData) {
        if (patientData.patientId) {
            patientId = patientData.patientId;
            dob = patientData.dob;
        } else if (patientData.patientId) {
            patientId = patientData.patientId;
            dob = formatDateOfBirth(patientData.dob);
        } else {
            patientId = 'Unknown ID';
        }
    }

   const handleEdit = () => {
        const editData = {
            id: patientData.id,
            patientId: patientData.patientId,
            firstName: patientData.name.split(' ')[0],
            middleName: patientData.name.split(' ')[1],
            lastName: patientData.name.split(' ')[2],
            gender: patientData.gender,
            dob:patientData.dob,
            age: patientData.age,
            phone: patientData.phone,
        };
        setEditData(editData);
        setShowEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setEditData(null);
    };
    // const handleServiceRowSelect = (selectedService) => {
    //     // Add selected service to the serviceDescription array
    //     setServiceDescription((prevServices) => [
    //         ...prevServices,
    //         { ...selectedService, quantity: 1 }
            
    //     ]);
    // };

    useEffect(() => {
        if (patientData && patientData.id) {
            axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/payments/?visitId=${patientData.id}`)
                .then(response => {
                    const filteredPayments = response.data.filter(payment => payment.visit === patientData.id); // Ensure only related payments are fetched
                    setPayments(filteredPayments || []);  // Populate the payments state
                })
                .catch(error => console.error('Error fetching payments:', error));
        }
    }, [patientData]);

    useEffect(() => {
        if (balance !== null && status !== null) {
            handleSaveTotals(); // Ensure the correct state values before calling the function
        }
    }, [balance, status]);
    
    const handleServiceRowSelect = (selectedService) => {
        const now = new Date().toISOString().split('T')[0]; // Get current date
    
        // Post the selected service to service description
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/service-descriptions/`, {
            visit: serviceIDs[0],       // Ensure serviceIDs are correctly set in your component
            newVisitId: serviceIDs[1],  // Ensure newVisitId is correctly passed
            date: now,
            service_name: `${selectedService.modality} ${selectedService.service}`,
            price: `${selectedService.price}`,
        })
        .then(response => {
            console.log("Service description posted successfully:", response.data);
    
            // Post the selected service to patientViewer
            postPatientViewerData(patientData, selectedService, selectedService.modality);
    
            // Add the selected service to the local state
            setServiceDescription((prevServices) => [
                ...prevServices,
                { ...selectedService, quantity: 1 }  // You can adjust the quantity field as necessary
            ]);
    
            // Close the modal after successful post
            setModalShow(false);
    
            // Fetch the updated service descriptions
            fetchServiceDescriptions();
        })
        .catch(error => {
            console.error("Error posting service description:", error);
        });
    };
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
    
    const postPatientViewerData = (patientData, selectedService, modality) => {
        const now = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patientViewer/patient-viewer/`, {
            emg: false, // Default value
            status: "Scheduled",
            acquired: now,
            received: now,
            reported: now,
            reporter: "Reporter Name", // Placeholder for reporter name
            service: selectedService.service,
            name: patientData.name,
            patientId: patientData.patientId,
            age: patientData.age,
            dob:formatDate (patientData.dob), // Ensure this is correctly formatted
            gender: patientData.gender,
            modality: modality,
            referrer: selectedReferrer ? selectedReferrer.name : "No Referrer",
            availability: "Available",
            mlc: false, // Default value
        })
        .then(response => {
            console.log("PatientViewer data posted successfully:", response.data);
        })
        .catch(error => {
            console.error("Error posting patientViewer data:", error);
        });
    };
    

    const handleSaveEditData = (updatedData) => {
        // Update the patientData with the new values
        setPatientData((prevData) => ({
            ...prevData,
            ...updatedData,
            name: updatedData.name,
            dob: formatDateOfBirth(updatedData.dob),
            age: updatedData.age,
            phone: updatedData.phone,
            gender: updatedData.gender,
        }));
        setShowEditDialog(false); // Close the edit dialog
    };

    if (!patientData || Object.keys(patientData).length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`patient-details-page ${isAnyModalOpen ? 'background-overlay' : ''}`}>
            <button onClick={onClose} className="closeButton">X</button>
            {!isChildModalOpen && (
                <>
                    {(!maximizedSection || maximizedSection === 'patient-info') && (
                        <div className={`patient-info ${maximizedSection === 'patient-info' ? 'maximized' : ''}`}>
                            <div className="patient-details">
                                <h3>Patient Info</h3>
                                <p>ID: {patientId}</p>
                                <p>Name: {patientData.name || 'N/A'}</p>
                                <p>Date of Birth: {patientData.dob}</p>
                                <p>Age: {patientData.age || 'N/A'} Yr</p>
                                <p>Phone: {patientData.phone || 'N/A'}</p>
                                <p>Gender: {patientData.gender || 'N/A'}</p>
                                <button onClick={() => toggleMaximize('patient-info')} className="maximize-button">🗖</button>
                                <button className="edit-button" onClick={handleEdit}>Edit</button>
                            </div>
                            <div className="other-visits1">
                                <h4>Other Visits:</h4>
                            </div>
                            <div className="other-visits">
                                <ul>
                                    {Array.isArray(patientVisits) && patientVisits.length > 0 ? (
                                        patientVisits.map((visit, index) => (
                                            <li key={index}>{new Date(visit.date).toLocaleString()} - {visit.notes}</li>
                                        ))
                                    ) : (
                                        <li>No other visits available.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                    {(!maximizedSection || maximizedSection === 'visit-details') && (
                        <div className={`visit-details ${maximizedSection === 'visit-details' ? 'maximized' : ''}`}>
                            <div className="patient-details">
                                <h4>Visit ID: {latestvisitID[0]}</h4>
                                <button onClick={() => toggleMaximize('visit-details')} className="maximize-button">🗖</button>
                                <p>Payment Status : {status} |  Date: {latestvisitID[2] ? latestvisitID[2] : latestvisitID[1]}</p>
                                <hr />
                                <div className="referrer">
                                    <h3>Referrer:</h3>
                                    <p>{selectedReferrer ? selectedReferrer : 'No Referrer Added'}</p>
                                    <button onClick={handleAddReferrerClick}>Add Referrer</button>
                                {isAddReferrerDialogOpen && (
                                    <AddReferrerDialog
                                        isOpen={isAddReferrerDialogOpen}
                                        onRequestClose={handleCloseReferrerDialog}
                                        onAddReferrer={handleReferrerAdded}
                                        visit={latestvisitID[1]}
                                        revenue ={balance}
                                    />
                                )}
                                    <hr />
                                </div>
                            </div>
                            <div className="notes-documents">
                                <div className="notes">
                                    <h3>Notes:</h3>
                                    {notes.length === 0 ? (
                                        <p>No notes are available for this patient.</p>
                                    ) : (
                                        <div className="notes-container">
                                            {notes.map((note, index) => (
                                                <div className="note-item" key={index}>
                                                    <div className="note-header">
                                                        <span>{note.timestamp.toLocaleDateString()} {note.timestamp.toLocaleTimeString()}</span>
                                                        <button className="note-delete-button" onClick={() => openDeleteModal(index)}>X</button>
                                                    </div>
                                                    <p>{note.text} (Clinical: {note.isClinical ? 'Yes' : 'No'})</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button onClick={openNotesModal}>Add Notes</button>
                                    <br />
                                    <hr />
                                </div>
                                <div className="documents">
                                    <h3>Documents:</h3>
                                    {selectedFile ? (
                                        <p>Uploading document please wait.</p>
                                    ) : (
                                        <p>No documents are available for this patient.</p>
                                    )}
                                    {uploadResult && (
                                        <p>Uploaded File Location: {uploadResult}</p>
                                    )}
                                    <button onClick={openModal}>Add Documents</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {(!maximizedSection || maximizedSection === 'billing-details') && (
                        <div className={`billing-details ${maximizedSection === 'billing-details' ? 'maximized' : ''}`}>
                            <div className="bill-section-header">
                                <h3>Services:</h3>
                                <button onClick={() => toggleMaximize('billing-details')} className="maximize-button">🗖</button>
                            </div>
                            <div className="bill-section-header1">
                                <h4>service-description:</h4>
                            </div>
                            {serviceDescription.length > 0 ? (
                                <div className="service-description-list">
                                    {/* <ul> */}
                                        {/* {serviceDescription.slice().reverse().map((service, index) => (
                                            <li key={index} className="service-item">
                                                <div className="service-header">
                                                    <span className="service-name">{service.modality || ''}  {service.service || service.name || service.service_name || 'Unnamed Service'}</span>
                                                    <button className="remove-button" onClick={() => handleServiceRemove(index)}>X</button>
                                                </div>
                                                <div className="service-description-container">
                                                    <span className="service-description">{service.description}</span>
                                                </div>
                                                <div className="quantity-controls fixed-quantity-controls">
                                                    <button onClick={() => handleQuantityChange(index, service.quantity - 1)}>-</button>
                                                    <input
                                                        type="number"
                                                        value={service.quantity}
                                                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                                                        min="1"
                                                    />
                                                    <button onClick={() => handleQuantityChange(index, service.quantity + 1)}>+</button>
                                                </div>
                                                <span className="service-price">{(service.price * service.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul> */}

                                    <ul>
                                        {serviceDescription.map((service, index) => (
                                            <li key={service.id} className="service-item">
                                                <div className="service-header">
                                                    <span className="service-name">{service.modality || ''} {service.service || service.name || service.service_name || 'Unnamed Service'}</span>
                                                    <button className="remove-button" onClick={() => handleServiceRemove(service.id)}>X</button>
                                                </div>
                                                <div className="service-description-container">
                                                    <span className="service-description">{service.description}</span>
                                                </div>
                                                <div className="quantity-controls fixed-quantity-controls">
                                                    <button onClick={() => handleQuantityChange(index, service.quantity - 1)}>-</button>
                                                    <input
                                                        type="number"
                                                        value={service.quantity}
                                                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                                                        min="1"
                                                    />
                                                    <button onClick={() => handleQuantityChange(index, service.quantity + 1)}>+</button>
                                                </div>
                                                <span className="service-price">{(service.price * service.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                </div>
                            ) : (
                                <p>No services available</p>
                            )}

                            <div className="net-amount1">
                                <button onClick={handleServiceAdd}>Add Services</button>
                            </div>
                            <hr />
                            <div className="net-amount">
                                <h3>Sub Total:</h3>
                                <p>{calculateSubTotal().toFixed(2)}</p>
                            </div>
                            <div className="net-amount1">
                                <button onClick={openDiscountModal}>Add Discount</button>
                            </div>
                            <hr />

                            <div className="totals">
                                <h4>Taxes {taxType} : {calculateTax().toFixed(2)}</h4>
                                <h4>Discount:-{calculateDiscount().toFixed(2)}</h4>
                                <h4>Refund : -{(totalRefund || 0).toFixed(2)}</h4>
                                <h4>TOTAL: {calculateTotalDisplay()}</h4>
                                <hr />
                            </div>

                            <div className="payments">
                                <h3>Payments:</h3>
                                {payments.length === 0 ? (
                                    <p>No payments for this visit.</p>
                                ) : (
                                    <div className="payments-container">
                                        {payments.map((payment, index) => (
                                            <div className="payment-item" key={index}>
                                                <span>
                                                    Payment of {payment.amount} made using {payment.paymentMode}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="net-amount3">
                                <button onClick={openPaymentModal}>Add Payment</button>
                                <button onClick={openRefundModal} disabled={payments.length === 0}>Add Refund</button>
                                <h3>Balance:</h3>
                                <p>{(balance || 0).toFixed(2)}</p>
                            </div>
                            <div className="balance">
                                {/* <button onClick={openAdminRefundModal}>Admin Refund</button> */}
                                <button onClick={openAdminRefundModal} disabled={!adminRefundButtonVisible}>Admin Refund</button>
                                <button onClick={handleReceiptClick}>Receipt</button>
                                <hr />
                            </div>

                        </div>
                    )}
                </>
            )}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="overlay"
            >
                <h3>Upload Patient Document</h3>
                <div>
                    <label>Select the type of content for the Document:</label>
                    <select onChange={(e) => setDocumentType(e.target.value)} value={documentType}>
                        <option value="General Document">General Document</option>
                        <option value="Clinical History">Clinical History</option>
                    </select>
                </div>
                <div>
                    <button onClick={handleUploadClick}>Upload File</button>
                    <button onClick={closeModal}>Cancel</button>
                    <input
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
            </Modal>

            <Modal
                isOpen={notesModalIsOpen}
                onRequestClose={closeNotesModal}
                className="notes-modal"
                overlayClassName="overlay"
            >
                <h3>Add Note</h3>
                {warning && <div className="warning">{warning}</div>}
                <div>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={isClinical}
                            onChange={(e) => setIsClinical(e.target.checked)}
                        />
                        Is Clinical
                    </label>
                </div>
                <div className="button-container">
                    <button onClick={handleNoteSave}>Save</button>
                    <button onClick={closeNotesModal}>Cancel</button>
                </div>
            </Modal>
            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={closeDeleteModal}
                className="confirm-delete-modal"
                overlayClassName="overlay"
            >
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this note?</p>
                <div className="button-container">
                    <button onClick={handleNoteDeleteConfirm}>Yes</button>
                    <button onClick={closeDeleteModal}>No</button>
                </div>
            </Modal>
            <Modal
                isOpen={confirmDeleteService}
                onRequestClose={() => setConfirmDeleteService(false)}
                className="confirm-delete-modal1"
                overlayClassName="overlay"
            >
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this service?</p>
                <div className="button-container">
                    <button onClick={confirmDeleteServiceAction}>Yes</button>
                    <button onClick={() => setConfirmDeleteService(false)}>No</button>
                </div>
            </Modal>
            <AddDiscount
                isOpen={discountModalIsOpen}
                onRequestClose={closeDiscountModal}
                onAddDiscount={handleAddDiscount}
                netPrice={calculateSubTotal()}
                overlayClassName="no-overlay"
            />

            <AddPayment
                isOpen={paymentModalIsOpen}
                onRequestClose={closePaymentModal}
                onAddPayment={handleAddPayment}
                defaultAmount={balance.toFixed(2)}
                calculateSubTotal={calculateSubTotal}
                calculateTax={calculateTax}
                calculateDiscount={calculateDiscount}
                totalRefund={totalRefund}
                calculateTotal={calculateTotal}
                balance={balance}
                visitId={patientData?.id} // Pass visit ID here
                onUpdateVisitStatus={handleUpdateVisitStatus} // Pass the update status function
                overlayClassName="no-overlay"
            />

            <AddRefund
                isOpen={refundModalIsOpen}
                onRequestClose={closeRefundModal}
                visitId={patientData?.id}
                onRefundSuccess={onRefundSuccess}
                onAddRefund={handleAddRefund}
                isRefundButtonVisible={isRefundButtonVisible}
                setIsRefundButtonVisible={setIsRefundButtonVisible}
                setTotalRefund={setTotalRefund}
                setAdminRefundButtonVisible={setAdminRefundButtonVisible}
                overlayClassName="no-overlay"
            />

            <AdminRefund
                isOpen={adminRefundModalIsOpen}
                onRequestClose={closeAdminRefundModal}
                refundData={refundDetails}
                onApprove={handleApprove}
                onReject={handleReject}
                visitId={patientData?.id} // Ensure visitId is passed here
                setAdminRefundButtonVisible={setAdminRefundButtonVisible}
                overlayClassName="no-overlay"
            />

            <Modal
                isOpen={refundStatusModalIsOpen}
                onRequestClose={closeRefundStatusModal}
                className="modal"
                overlayClassName="overlay"
            >
                <h3>Refund Status</h3>
                {refundStatus.length > 0 ? (
                    refundStatus.map((refund, index) => (
                        <div key={index}>
                            <p>Date and Time: {refund.dateTime}</p>
                            <p>Refund Mode: {refund.refundMode}</p>
                            <p>Amount: {refund.amount.toFixed(2)}</p>
                            <p>Reason: {refund.reason}</p>
                            <hr />
                        </div>
                    ))
                ) : (
                    <p>No refund has been processed.</p>
                )}
                <button onClick={closeRefundStatusModal}>Close</button>
            </Modal>

            {selectOptionIsOpen && (
                <PaymentSelectOption
                    closePaymentSelectOption={closePaymentSelectOption}
                    serviceID={serviceIDs}
                    patientData={patientData}
                    fetchServiceDescriptions={fetchServiceDescriptions} // Pass the fetch function
                />
            )}

            <ServicePageEdit
                show={showEditDialog}
                onClose={handleCloseEditDialog}
                initialData={editData}
                onSave={handleSaveEditData} // Pass the handleSaveEditData function
            />
            

        
            {modalShow && (
                <ServiceModal
                    show={modalShow}
                    handleClose={closeServiceModal}
                    services={serviceDescription}
                    selectedOption={selectedOption} // Use selectedOption passed from ServicePage
                    serviceID={serviceIDs}
                    patientData={patientData}
                    onServiceRowSelect={handleServiceRowSelect}  // Pass row select handler
                    fetchServiceDescriptions={fetchVisits}
                />
            )}
        </div>
    );
};

export default PatientDetailsPage;