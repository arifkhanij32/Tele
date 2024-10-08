// import React, { useState, useEffect } from 'react';
// import DefaultServiceTable from './GeneralServiceTable';
// import InsuranceServiceTable from './InsuranceServiceTable';
// import BeneficiaryServiceTable from './BeneficiaryServiceTable';
// import axios from 'axios';
// import './statics/ServiceTable.css';

// const ServiceTable = () => {
//     const [insuranceServices, setInsuranceServices] = useState([]);
//     const [generalServices, setGeneralServices] = useState([]);
//     const [beneficiaryServices, setBeneficiaryServices] = useState([]);
//     const [currentService, setCurrentService] = useState(null);

//     useEffect(() => {
//         const fetchServices = async () => {
//             try {
//                 const insuranceResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`);
//                 setInsuranceServices(insuranceResponse.data);

//                 const generalResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/services/general-services/`);
//                 setGeneralServices(generalResponse.data);

//                 const beneficiaryResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`);
//                 setBeneficiaryServices(beneficiaryResponse.data);
//             } catch (error) {
//                 console.error('Error fetching services:', error.response ? error.response.data : error.message);
//             }
//         };

//         fetchServices();
//     }, []);

//     const addService = async (newService, url, setServices, services) => {
//         try {
//             const response = await axios.post(url, newService, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });
//             setServices([...services, response.data]);
//         } catch (error) {
//             console.error('Error adding service:', error);
//         }
//     };

//     const editService = async (updatedService, url, setServices, services) => {
//         try {
//             const response = await axios.put(`${url}${updatedService.service}/`, updatedService, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });
//             setServices(services.map(service => service.service === response.data.service ? response.data : service));
//         } catch (error) {
//             console.error('Error editing service:', error);
//         }
//     };

//     const deleteService = async (serviceToDelete, url, setServices, services) => {
//         try {
//             await axios.delete(`${url}${serviceToDelete.service}/`);
//             setServices(services.filter(service => service.service !== serviceToDelete.service));
//         } catch (error) {
//             console.error('Error deleting service:', error);
//         }
//     };

//     return (
//         <div className="service-tables">
//             <DefaultServiceTable
//                 services={generalServices}
//                 onAdd={(service) => addService(service, `${process.env.REACT_APP_LOCALHOST}/services/general-services/`, setGeneralServices, generalServices)}
//                 onEdit={(service) => editService(service, `${process.env.REACT_APP_LOCALHOST}/services/general-services/`, setGeneralServices, generalServices)}
//                 onDelete={(service) => deleteService(service, `${process.env.REACT_APP_LOCALHOST}/services/general-services/`, setGeneralServices, generalServices)}
//                 currentService={currentService} // Pass current service
//                 setCurrentService={setCurrentService} // Function to update current service
//             />
//             <InsuranceServiceTable
//                 services={insuranceServices}
//                 onAdd={(service) => addService(service, `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`, setInsuranceServices, insuranceServices)}
//                 onEdit={(service) => editService(service, `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`, setInsuranceServices, insuranceServices)}
//                 onDelete={(service) => deleteService(service, `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`, setInsuranceServices, insuranceServices)}
//                 currentService={currentService} // Pass current service
//                 setCurrentService={setCurrentService} // Function to update current service
//             />
//             <BeneficiaryServiceTable
//                 services={beneficiaryServices}
//                 onAdd={(service) => addService(service, `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`, setBeneficiaryServices, beneficiaryServices)}
//                 onEdit={(service) => editService(service, `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`, setBeneficiaryServices, beneficiaryServices)}
//                 onDelete={(service) => deleteService(service, `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`, setBeneficiaryServices, beneficiaryServices)}
//                 currentService={currentService} // Pass current service
//                 setCurrentService={setCurrentService} // Function to update current service
//             />
//         </div>
//     );
// };

// export default ServiceTable;


import React, { useState, useEffect } from 'react';
import DefaultServiceTable from './GeneralServiceTable';
import InsuranceServiceTable from './InsuranceServiceTable';
import BeneficiaryServiceTable from './BeneficiaryServiceTable';
import axios from 'axios';
import './statics/ServiceTable.css';

const ServiceTable = () => {
    const [insuranceServices, setInsuranceServices] = useState([]);
    const [generalServices, setGeneralServices] = useState([]);
    const [beneficiaryServices, setBeneficiaryServices] = useState([]);
    const [currentService, setCurrentService] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const insuranceResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`);
                setInsuranceServices(insuranceResponse.data);

                const generalResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/services/general-services/`);
                setGeneralServices(generalResponse.data);

                const beneficiaryResponse = await axios.get(`${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`);
                setBeneficiaryServices(beneficiaryResponse.data);
            } catch (error) {
                console.error('Error fetching services:', error.response ? error.response.data : error.message);
            }
        };

        fetchServices();
    }, []);

    const addService = async (newService, url, setServices, services) => {
        try {
            const response = await axios.post(url, newService, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setServices([...services, response.data]);
        } catch (error) {
            console.error('Error adding service:', error);
        }
    };

    const editService = async (updatedService, url, setServices, services) => {
        try {
            const response = await axios.put(`${url}${updatedService.service}/`, updatedService, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setServices(services.map(service => service.service === response.data.service ? response.data : service));
        } catch (error) {
            console.error('Error editing service:', error);
        }
    };

    const deleteService = async (serviceToDelete, url, setServices, services) => {
        try {
            await axios.delete(`${url}${serviceToDelete.service}/`);
            setServices(services.filter(service => service.service !== serviceToDelete.service));
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    return (
        <div className="service-tables">
            <DefaultServiceTable
                services={generalServices}
                onAdd={(service) => addService(service, `${process.env.REACT_APP_LOCALHOST}/services/general-services/`, setGeneralServices, generalServices)}
                onEdit={(service) => editService(service, `${process.env.REACT_APP_LOCALHOST}/services/general-services/`, setGeneralServices, generalServices)}
                onDelete={(service) => deleteService(service, `${process.env.REACT_APP_LOCALHOST}/services/general-services/`, setGeneralServices, generalServices)}
                currentService={currentService} // Pass current service
                setCurrentService={setCurrentService} // Function to update current service
            />
            <InsuranceServiceTable
                services={insuranceServices}
                onAdd={(service) => addService(service, `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`, setInsuranceServices, insuranceServices)}
                onEdit={(service) => editService(service, `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`, setInsuranceServices, insuranceServices)}
                onDelete={(service) => deleteService(service, `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`, setInsuranceServices, insuranceServices)}
                currentService={currentService} // Pass current service
                setCurrentService={setCurrentService} // Function to update current service
            />
            <BeneficiaryServiceTable
                services={beneficiaryServices}
                onAdd={(service) => addService(service, `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`, setBeneficiaryServices, beneficiaryServices)}
                onEdit={(service) => editService(service, `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`, setBeneficiaryServices, beneficiaryServices)}
                onDelete={(service) => deleteService(service, `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`, setBeneficiaryServices, beneficiaryServices)}
                currentService={currentService} // Pass current service
                setCurrentService={setCurrentService} // Function to update current service
            />
        </div>
    );
};

export default ServiceTable;