import { useState, useEffect } from "react";
import axios from "axios";

const url = import.meta.env.VITE_Backend_Url;
const useAdmin = () => {
    const [verreq, setVerreq] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVerreq = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${url}/users/allverificationreq`);
                setVerreq(response.data);
                // console.log(response.data[0].image[0].url);
            } catch (err) {
                setError(err.message || "An error occurred while fetching verification requests.");
            } finally {
                setLoading(false);
            }
        };

        fetchVerreq();
    }, []);

    return { verreq, loading, error };
};

export default useAdmin;