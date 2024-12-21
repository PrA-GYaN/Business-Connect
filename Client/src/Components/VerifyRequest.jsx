import React, { useState, useEffect } from "react";
import useAdmin from '../Hooks/useadmin';
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";

const VerifyRequest = () => {
    const { verreq, loading, error } = useAdmin();
    const [selectedReq, setSelectedReq] = useState(null);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                setSelectedReq(null);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleOpenModal = (req) => {
        setSelectedReq(req);
    };

    const handleCloseModal = () => {
        setSelectedReq(null);
    };

    const handleAccept = () => {
        console.log("Accepted", selectedReq.Id);
        // Add logic to handle accept
        setSelectedReq(null);
    };

    const handleReject = () => {
        console.log("Rejected", selectedReq);
        // Add logic to handle reject
        setSelectedReq(null);
    };

    return (
        <div>
            <h1>Verification Requests</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Full Name</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Business Type</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Business Title</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Industry</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Image</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {verreq.map((req, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{req.Id.fullName}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{req.Id.businessType}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{req.Id.businessTitle}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{req.Id.industry}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                <img 
                                    src={req.image[0].url} 
                                    alt={`${req.Id.fullName}'s business`} 
                                    style={{ maxWidth: '50px', height: 'auto', borderRadius: '5px' }} 
                                />
                            </td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                <button onClick={() => handleOpenModal(req)} style={{ padding: '5px 10px' }}>
                                    Click to open
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedReq && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'auto',
                    }}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            width: '90%',
                            maxWidth: '700px',
                            maxHeight: '90%',
                            overflowY: 'auto',
                        }}
                    >
                        <h2>Details</h2>
                        <p><strong>Full Name:</strong> {selectedReq.Id.fullName}</p>
                        <p><strong>Business Type:</strong> {selectedReq.Id.businessType}</p>
                        <p><strong>Business Title:</strong> {selectedReq.Id.businessTitle}</p>
                        <p><strong>Industry:</strong> {selectedReq.Id.industry}</p>
                        <img 
                            src={selectedReq.image[0].url} 
                            alt={`${selectedReq.Id.fullName}'s business`} 
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '5px' }} 
                        />
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <button onClick={handleAccept} style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                <TiTick size={20} /> Accept
                            </button>
                            <button onClick={handleReject} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                <RxCross2 size={20} /> Reject
                            </button>
                        </div>
                        <button onClick={handleCloseModal} style={{ marginTop: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyRequest;