

// import React, { useState, useEffect } from 'react';
// import './statics/EditServiceDialog.css';

// const EditServiceDialog = ({ service, onClose, onEdit }) => {
//     const [serviceName, setServiceName] = useState('');
//     const [modality, setModality] = useState('');
//     const [price, setPrice] = useState('');
//     const [currency, setCurrency] = useState('');

//     useEffect(() => {
//         if (service) {
//             setServiceName(service.service);
//             setModality(service.modality);
//             setPrice(service.price);
//             setCurrency(service.currency);
//         }
//     }, [service]);

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onEdit({ service: serviceName, modality, price, currency });
//         onClose(); // Close the dialog after editing
//     };

//     return (
//         <div className='edit-service-form-overlay'>
//         <div className="edit-service-dialog">
//             <form onSubmit={handleSubmit}>
//                 <label>
//                     Service:
//                     <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
//                 </label>
//                 <label>
//                     Modality:
//                     <input type="text" value={modality} onChange={(e) => setModality(e.target.value)} />
//                 </label>
//                 <div className="inline-label">
//                     <label style={{flex: '1'}}>
//                         Price:
//                     </label>
//                     <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{flex: '0 0 80px'}}>
//                         <option value="INR">INR</option>
//                         <option value="USD">USD</option>
//                         <option value="ZMW">ZMW</option>
//                         <option value="RUB">RUB</option>
//                         <option value="ZAR">ZAR</option>
//                     </select>
//                     <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{flex: '1'}} />
//                 </div>
//                 <div className="button-group">
//                     <button type="button" onClick={onClose}>Cancel</button>
//                     <button type="submit">Save</button>
//                 </div>
//             </form>
//         </div>
//         </div>
//     );
// };

// export default EditServiceDialog;
import React, { useState, useEffect } from 'react';
import './statics/EditServiceDialog.css';

const EditServiceDialog = ({ service, onClose, onEdit }) => {
    const [serviceName, setServiceName] = useState('');
    const [modality, setModality] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('INR'); // Default to INR
    const [taxType, setTaxType] = useState('GST'); // Default tax type to GST
    const [percentage, setPercentage] = useState(0); // Tax Percentage, default to 0
    const [servicePrice, setServicePrice] = useState(''); // Final service price after applying tax

    // Load the existing service data into the form
    useEffect(() => {
        if (service) {
            setServiceName(service.service);
            setModality(service.modality);
            setPrice(service.price);
            setCurrency(service.currency);
            setTaxType(service.taxType || 'GST');
            setPercentage(service.tax_percentage || 0);
            setServicePrice(service.service_price || service.price);
        }
    }, [service]);

    // Calculate the service price when price or percentage changes
    useEffect(() => {
        if (price && percentage !== undefined) {
            const parsedPrice = parseFloat(price);
            const parsedPercentage = parseFloat(percentage);

            if (!isNaN(parsedPrice) && !isNaN(parsedPercentage)) {
                const calculatedPrice = parsedPrice + (parsedPrice * parsedPercentage / 100);
                setServicePrice(calculatedPrice.toFixed(2)); // Set the final price with tax
            } else {
                setServicePrice(''); // Reset if the inputs are not valid
            }
        } else {
            setServicePrice(price); // If no percentage, just show the base price
        }
    }, [price, percentage]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!price || isNaN(parseFloat(price))) {
            alert("Please enter a valid price.");
            return;
        }

        // Send the updated service data to the parent component
        onEdit({
            service: serviceName,
            modality,
            price,
            currency,
            taxType,
            tax_percentage: percentage,
            service_price: servicePrice
        });

        onClose(); // Close the dialog after editing
    };

    return (
        <div className='edit-service-form-overlay'>
            <div className="edit-service-dialog">
                <form onSubmit={handleSubmit}>
                    <label>
                        Service:
                        <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
                    </label>
                    <label>
                        Modality:
                        <input type="text" value={modality} onChange={(e) => setModality(e.target.value)} />
                    </label>

                    {/* Price and Currency */}
                    <div className="inline-label">
                        <label style={{ flex: '1' }}>Price:</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ flex: '0 0 80px' }}>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="ZMW">ZMW</option>
                            <option value="RUB">RUB</option>
                            <option value="ZAR">ZAR</option>
                        </select>
                        <input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)} 
                            style={{ flex: '1' }} 
                            step="0.01" // Allows decimal input
                        />
                    </div>

                    {/* Tax Type Dropdown */}
                    <div className="inline-label">
                        <label style={{ flex: '1' }}>Tax Type:</label>
                        <select value={taxType} onChange={(e) => setTaxType(e.target.value)} style={{ flex: '1' }}>
                            <option value="GST">GST</option>
                            <option value="VAT">VAT</option>
                        </select>
                    </div>

                    {/* Tax Percentage Field */}
                    <div className="inline-label">
                        <label style={{ flex: '1' }}>Tax Percentage:</label>
                        <input
                            type="number"
                            value={percentage}
                            onChange={(e) => setPercentage(parseFloat(e.target.value))}
                            min="0"
                            max="100"
                            step="1"
                            style={{ flex: '1' }}
                        />
                    </div>

                    {/* Calculated Service Price */}
                    <div className="inline-label">
                        <label style={{ flex: '1' }}>Service Price (with tax):</label>
                        <input type="text" value={servicePrice || ''} readOnly style={{ flex: '1' }} />
                    </div>

                    {/* Buttons */}
                    <div className="button-group">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditServiceDialog;