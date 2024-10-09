// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './ShareWithPhysicianDialog.css';
// import { getSignedUrlForImage } from '../../utils/awsHelper';

// const ShareWithPhysicianDialog = ({ onClose }) => {
//     const [physicians, setPhysicians] = useState([]);
//     const [selectedPhysician, setSelectedPhysician] = useState(null);
//     const [showOptions, setShowOptions] = useState(false);

//     useEffect(() => {
//         fetchPhysicians();
//     }, []);

//     const fetchPhysicians = async () => {
//         try {
//             const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/physician/`);
//             setPhysicians(response.data);
//         } catch (error) {
//             console.error('Error fetching physician data:', error);
//         }
//     };

//     const handleRowClick = (physician) => {
//         setSelectedPhysician(physician);
//         setShowOptions(true);
//     };

//     const handleOptionClick = async (option) => {
//         if (option === 'whatsapp_number' && selectedPhysician) {
//           try {
//             // Ensure you provide the correct full image key (path to the file in S3)
//             const imageUrl = await getSignedUrlForImage('dev-dicom-input', 'ASRAF ALI_52_M/dicom-image-file.dcm');
//             console.log("Generated Signed URL:", imageUrl); // Log to check the signed URL
      
//             if (imageUrl) {
//               const whatsappLink = `https://wa.me/${selectedPhysician.whatsapp_number}?text=View the DICOM image here: ${imageUrl}`;
//               console.log("WhatsApp link:", whatsappLink); // Log to verify WhatsApp link
//               window.open(whatsappLink, '_blank'); // Opens WhatsApp link in a new tab
//             } else {
//               console.error("Failed to generate the signed URL.");
//             }
//           } catch (error) {
//             console.error("Error generating signed URL:", error);
//           }
//         }
//       };
      
//     return (
//         <div className="overlay">
//             <div className="share-with-physician-dialog">
//                 <button className="close-button" onClick={onClose}>×</button> {/* Close Button */}
//                 <h2>Physician List</h2>
//                 <table className="physician-table">
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {physicians.map((physician) => (
//                             <tr
//                                 key={physician.id}
//                                 onClick={() => handleRowClick(physician)}
//                                 className={selectedPhysician && selectedPhysician.id === physician.id ? 'selected' : ''}
//                             >
//                                 <td>{physician.name}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 {showOptions && selectedPhysician && (
//                     <div className="sharing-options">
//                         <h3>Share via:</h3>
//                         <button onClick={() => handleOptionClick('whatsapp_number')}><i className="fab fa-whatsapp" style={{ color: 'darkgreen' }}></i></button>
//                         <button onClick={() => handleOptionClick('phone_number')}><i className="fas fa-phone-alt fa-rotate-90" style={{ color: 'black' }}></i></button>
//                         <button onClick={() => handleOptionClick('email')}><i className="fas fa-envelope-open" style={{ color: 'blue' }}></i></button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ShareWithPhysicianDialog;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShareWithPhysicianDialog.css';

const ShareWithPhysicianDialog = ({ onClose }) => {
    const [physicians, setPhysicians] = useState([]);
    const [selectedPhysician, setSelectedPhysician] = useState(null);

    useEffect(() => {
        fetchPhysicians();
    }, []);

    const fetchPhysicians = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/physician/`);
            setPhysicians(response.data);
        } catch (error) {
            console.error('Error fetching physician data:', error);
        }
    };

    const handleRowClick = async (physician) => {
        setSelectedPhysician(physician);

        // Automatically send a WhatsApp message to the selected physician
        const message = `Hi ${physician.name}`;
        const whatsappLink = `https://wa.me/${physician.whatsapp_number}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank'); // Open WhatsApp link in a new tab
    };

    return (
        <div className="overlay">
            <div className="share-with-physician-dialog">
                <button className="close-button" onClick={onClose}>×</button> {/* Close Button */}
                <h2>Physician List</h2>
                <table className="physician-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {physicians.map((physician) => (
                            <tr
                                key={physician.id}
                                onClick={() => handleRowClick(physician)}  // Automatically send WhatsApp message on row click
                                className={selectedPhysician && selectedPhysician.id === physician.id ? 'selected' : ''}
                            >
                                <td>{physician.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShareWithPhysicianDialog;