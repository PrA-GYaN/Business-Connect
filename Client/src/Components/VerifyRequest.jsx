import React, { useState, useEffect } from "react";
import useAdmin from '../Hooks/useadmin';
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { toast } from "react-toastify";
import styles from '../Styles/VerifyRequest.module.css';

const VerifyRequest = () => {
    const { verreq, loading, error } = useAdmin();
    const [selectedReq, setSelectedReq] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);  // State to show reject modal
    const [rejectReason, setRejectReason] = useState("");  // State to store the reject reason

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                setSelectedReq(null);
                setShowRejectModal(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const handleRequest = async (action) => {
        try {
            const userId = selectedReq.Id._id;
            const verificationId = selectedReq.Id._id;

            if (action === "accept") {
                await axios.post("http://localhost:5000/users/accept", { userId });
                toast.success("User verified successfully");
            } else {
                await axios.post("http://localhost:5000/users/decline", { userId });
                toast.success("User verification declined");
            }
            await axios.post("http://localhost:5000/users/delete", { verificationId });
        } catch (error) {
            toast.error(`Failed to ${action} user`);
        }
        setSelectedReq(null);
    };

    const handleReject = async () => {
        try {
            const userId = selectedReq.Id._id;
            const rejectDetails = { userId, reason: rejectReason };

            await axios.post("http://localhost:5000/users/decline", rejectDetails);
            toast.success("User rejected successfully");
            await axios.post("http://localhost:5000/users/delete", { verificationId: selectedReq.Id._id });
            setShowRejectModal(false);
            setSelectedReq(null);  // Close modal after action
        } catch (error) {
            toast.error("Failed to reject user");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            {verreq.length === 0 ? (
                <p>No verification requests</p>
            ) : (
                <>
                    <h1>Verification Requests</h1>
                    <table className={styles.verifyTable}>
                        <thead>
                            <tr>
                                {["Full Name", "Business Type", "Business Title", "Industry", "Image", "Action"].map((heading) => (
                                    <th key={heading}>{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {verreq.map((req, index) => (
                                <tr key={index}>
                                    <td>{req.Id.fullName}</td>
                                    <td>{req.Id.businessType}</td>
                                    <td>{req.Id.businessTitle}</td>
                                    <td>{req.Id.industry}</td>
                                    <td>
                                        <img 
                                            src={req.image[0].url} 
                                            alt={`${req.Id.fullName}'s business`} 
                                            className={styles.imageThumbnail} 
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => setSelectedReq(req)}>Click to open</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {selectedReq && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Details</h2>
                        <p><strong>Full Name:</strong> {selectedReq.Id.fullName}</p>
                        <p><strong>Business Type:</strong> {selectedReq.Id.businessType}</p>
                        <p><strong>Business Title:</strong> {selectedReq.Id.businessTitle}</p>
                        <p><strong>Industry:</strong> {selectedReq.Id.industry}</p>
                        <img 
                            src={selectedReq.image[0].url} 
                            alt={`${selectedReq.Id.fullName}'s business`} 
                            className={styles.modalImage} 
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => handleRequest("accept")} className={styles.acceptBtn}>
                                <TiTick size={20} /> Accept
                            </button>
                            <button onClick={() => setShowRejectModal(true)} className={styles.rejectBtn}>
                                <RxCross2 size={20} /> Reject
                            </button>
                        </div>
                        <button onClick={() => setSelectedReq(null)} className={styles.closeBtn}>Close</button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Reject Reason</h2>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className={styles.rejectTextArea}
                            placeholder="Enter reason for rejection"
                        />
                        <div className={styles.modalActions}>
                            <button onClick={handleReject} className={styles.acceptBtn}>
                                Submit
                            </button>
                            <button onClick={() => setShowRejectModal(false)} className={styles.rejectBtn}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyRequest;