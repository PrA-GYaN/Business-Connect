import React, { useState, useEffect } from "react";
import useProfile from "../Hooks/useProfile";
import styles from "../Styles/Admin.module.css";
import { IoTrashBinSharp } from "react-icons/io5";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Admin = () => {
    const { getAllUsers, getAllMeetingsAdmin } = useProfile();
    const [profiles, setProfiles] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: [],
            },
        ],
    });
    const [chartOption, setChartOption] = useState("businessType");
    const [selectedChartLabel, setSelectedChartLabel] = useState(null);

    const colors = ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]; // Predefined colors

    // Fetch profiles and meetings, and update chart data
    const fetchData = async () => {
        try {
            const userData = await getAllUsers();
            const meetingData = await getAllMeetingsAdmin();

            console.log("Fetched Profiles:", userData);
            console.log("Fetched Meetings:", meetingData);

            if (userData && Array.isArray(userData)) {
                setProfiles(userData);
                updateChartData(userData, chartOption);
            } else {
                console.error("Invalid user data format:", userData);
            }

            if (meetingData && Array.isArray(meetingData)) {
                setMeetings(meetingData);
            } else {
                console.error("Invalid meeting data format:", meetingData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Update chart data dynamically based on the selected option
    const updateChartData = (data, option) => {
        let labels = [];
        let counts = {};

        // Categorize data based on the selected option
        switch (option) {
            case "businessType":
                labels = [...new Set(data.map((profile) => profile.businessType?.trim().toLowerCase()))];
                break;

            case "industry":
                labels = [...new Set(data.map((profile) => profile.industry?.trim().toLowerCase()))];
                break;

            case "verified":
                labels = ["Verified", "Not Verified"];
                break;

            default:
                console.error("Invalid chart option:", option);
                return;
        }

        // Count occurrences of each label
        labels.forEach((label) => {
            counts[label] = 0;
        });

        data.forEach((profile) => {
            switch (option) {
                case "businessType":
                    const type = profile.businessType?.trim().toLowerCase();
                    if (counts[type] !== undefined) counts[type]++;
                    break;

                case "industry":
                    const industry = profile.industry?.trim().toLowerCase();
                    if (counts[industry] !== undefined) counts[industry]++;
                    break;

                case "verified":
                    const verified = profile.verified ? "Verified" : "Not Verified";
                    counts[verified]++;
                    break;

                default:
                    break;
            }
        });

        // Update chart data
        const dataValues = Object.values(counts);
        const chartColors = colors.slice(0, labels.length);

        setChartData({
            labels,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: chartColors,
                    hoverBackgroundColor: chartColors,
                },
            ],
        });
    };

    // Handle deletion of a user
    const handleDeleteUser = async (userId) => {
        try {
            console.log("Deleting user with ID:", userId);
            const updatedProfiles = profiles.filter((profile) => profile.id !== userId);
            setProfiles(updatedProfiles);
            updateChartData(updatedProfiles, chartOption);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    // Handle chart click to show table
    const handleChartClick = (event, elements) => {
        if (elements.length > 0) {
            const index = elements[0].index;
            const label = chartData.labels[index];
            setSelectedChartLabel(label);
        }
    };

    // Update chart data when the selected option changes
    const handleChartOptionChange = (event) => {
        const selectedOption = event.target.value;
        setChartOption(selectedOption);
        updateChartData(profiles, selectedOption);
        setSelectedChartLabel(null); // Reset selected label
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <h1>Manage Users and Meetings</h1>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                {/* Pie Chart */}
                <div style={{ width: "40%" }}>
                    <h2>User Distribution</h2>
                    <label htmlFor="chartOption">View by:</label>
                    <select
                        id="chartOption"
                        value={chartOption}
                        onChange={handleChartOptionChange}
                        className={styles.selectDropdown}
                    >
                        <option value="businessType">Business Type</option>
                        <option value="industry">Industry</option>
                        <option value="verified">Verified</option>
                    </select>

                    {chartData.labels.length > 0 ? (
                        <Pie
                            data={chartData}
                            options={{
                                onClick: handleChartClick,
                                plugins: {
                                    legend: {
                                        position: "right",
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p>No data available for the selected option</p>
                    )}
                </div>

                {/* Meetings Section */}
                <div style={{ width: "50%" }}>
                    <h2>Meetings</h2>
                    {meetings.length > 0 ? (
                        <ul>
                            {meetings.map((meeting) => (
                                <li key={meeting.id}>
                                    {meeting.title} - {meeting.date}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No meetings</p>
                    )}
                </div>
            </div>

            {/* User Profile Table (shown on chart click) */}
            {selectedChartLabel && (
                <div>
                    <h2>{selectedChartLabel} Profiles</h2>
                    {profiles.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Business Type</th>
                                    <th>Business Title</th>
                                    <th>Industry</th>
                                    <th>Verified</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles
                                    .filter((profile) => {
                                        switch (chartOption) {
                                            case "businessType":
                                                return profile.businessType?.trim().toLowerCase() === selectedChartLabel;
                                            case "industry":
                                                return profile.industry?.trim().toLowerCase() === selectedChartLabel;
                                            case "verified":
                                                return (profile.verified ? "Verified" : "Not Verified") === selectedChartLabel;
                                            default:
                                                return false;
                                        }
                                    })
                                    .map((profile) => (
                                        <tr key={profile.id}>
                                            <td>{profile.fullName}</td>
                                            <td>{profile.email}</td>
                                            <td>{profile.businessType}</td>
                                            <td>{profile.businessTitle}</td>
                                            <td>{profile.industry}</td>
                                            <td>{profile.verified ? "Yes" : "No"}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteUser(profile.id)}
                                                    className={styles.buttonDelete}
                                                >
                                                    <IoTrashBinSharp />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No profiles found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;