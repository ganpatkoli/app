import React, { createContext, useState, useEffect } from "react";
import instance from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";

export const TripsContext = createContext();

export const TripsProvider = ({ children }) => {

    const { getId } = useContext(AuthContext);



    const [tripsData, setTripsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const response = await instance.get(`/trips/agent/${getId}`);


            // console.log("Fetched tripsData:", response.data.trips);

            setTripsData(response.data.trips);
        } catch (error) {
            console.error("Failed to fetch tripsData", error);
        } finally {
            setLoading(false);
        }
    };

    const updateTripInState = (updatedTrip) => {
        setTripsData((prevTrips) =>
            prevTrips.map((trip) =>
                trip._id === updatedTrip._id ? updatedTrip : trip
            )
        );
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    return (
        <TripsContext.Provider
            value={{ tripsData, loading, fetchTrips, updateTripInState }}
        >
            {children}
        </TripsContext.Provider>
    );
};
