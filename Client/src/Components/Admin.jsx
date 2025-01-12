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
    const [userChartData, setUserChartData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: [],
            },
        ],
    });
    const [meetingChartData, setMeetingChartData] = useState({
        labels: ["Pending", "Accepted"],
        datasets: [
            {
                data: [0, 0],
                backgroundColor: ["#FF6384", "#36A2EB"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB"],
            },
        ],
    });
    const [userChartOption, setUserChartOption] = useState("businessType");
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedData, setSelectedData] = useState([]);

    const colors = ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]; // Predefined colors

    const fetchData = async () => {
        try {
            const userData = await getAllUsers();
            const meetingData = await getAllMeetingsAdmin();

            if (userData && Array.isArray(userData)) {
                setProfiles(userData);
                updateUserChartData(userData, userChartOption);
            }

            if (meetingData && Array.isArray(meetingData)) {
                setMeetings(meetingData);
                updateMeetingChartData(meetingData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const updateUserChartData = (data, option) => {
        let labels = [];
        let counts = {};

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
                break;
        }

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

        const dataValues = Object.values(counts);
        const chartColors = colors.slice(0, labels.length);

        setUserChartData({
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

    const updateMeetingChartData = (data) => {
        const counts = { pending: 0, accepted: 0 };

        data.forEach((meeting) => {
            meeting.participants.forEach((participant) => {
                if (participant.status === "pending") counts.pending++;
                if (participant.status === "accepted") counts.accepted++;
            });
        });

        setMeetingChartData({
            labels: ["Pending", "Accepted"],
            datasets: [
                {
                    data: [counts.pending, counts.accepted],
                    backgroundColor: ["#FF6384", "#36A2EB"],
                    hoverBackgroundColor: ["#FF6384", "#36A2EB"],
                },
            ],
        });
    };

    const handlePieClick = (event, elements, chartType) => {
        if (elements.length > 0) {
            const index = elements[0].index;
            const label = chartType === "user" ? userChartData.labels[index] : meetingChartData.labels[index];

            if (chartType === "user") {
                const filteredData = profiles.filter((profile) => {
                    switch (userChartOption) {
                        case "businessType":
                            return profile.businessType?.trim().toLowerCase() === label;
                        case "industry":
                            return profile.industry?.trim().toLowerCase() === label;
                        case "verified":
                            return (profile.verified ? "Verified" : "Not Verified") === label;
                        default:
                            return false;
                    }
                });
                setSelectedData(filteredData);
            } else if (chartType === "meeting") {
                const filteredData = meetings.filter((meeting) =>
                    meeting.participants.some((participant) => participant.status === label.toLowerCase())
                );
                setSelectedData(filteredData);
            }

            setSelectedSection(label);
        }
    };

    const handleUserChartOptionChange = (event) => {
        const selectedOption = event.target.value;
        setUserChartOption(selectedOption);
        updateUserChartData(profiles, selectedOption);
        setSelectedSection(null);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <h1>Manage Users and Meetings</h1>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                {/* User Distribution Pie Chart */}
                <div style={{ width: "40%" }}>
                    <h2>User Distribution</h2>
                    <label htmlFor="userChartOption">View by:</label>
                    <select
                        id="userChartOption"
                        value={userChartOption}
                        onChange={handleUserChartOptionChange}
                        className={styles.selectDropdown}
                    >
                        <option value="businessType">Business Type</option>
                        <option value="industry">Industry</option>
                        <option value="verified">Verified</option>
                    </select>
                    <Pie
                        data={userChartData}
                        options={{
                            onClick: (event, elements) => handlePieClick(event, elements, "user"),
                            plugins: {
                                legend: {
                                    position: "right",
                                },
                            },
                        }}
                    />
                </div>

                {/* Meeting Status Pie Chart */}
                <div style={{ width: "40%" }}>
                    <h2>Meeting Status</h2>
                    <Pie
                        data={meetingChartData}
                        options={{
                            onClick: (event, elements) => handlePieClick(event, elements, "meeting"),
                            plugins: {
                                legend: {
                                    position: "right",
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Display Table Based on Selected Section */}
            {selectedSection && (
                <div>
                    <h2>Details for: {selectedSection}</h2>
                    {selectedData.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {selectedSection === "Pending" || selectedSection === "Accepted" ? (
                                        <>
                                            <th>Title</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Participants</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Business Type</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSection === "Pending" || selectedSection === "Accepted"
                                    ? selectedData.map((meeting) => (
                                          <tr key={meeting._id}>
                                              <td>{meeting.title}</td>
                                              <td>{new Date(meeting.startTime).toLocaleString()}</td>
                                              <td>{new Date(meeting.endTime).toLocaleString()}</td>
                                              <td>{meeting.participants.length}</td>
                                          </tr>
                                      ))
                                    : selectedData.map((profile) => (
                                          <tr key={profile.id}>
                                              <td>{profile.fullName}</td>
                                              <td>{profile.email}</td>
                                              <td>{profile.businessType}</td>
                                          </tr>
                                      ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No data found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;