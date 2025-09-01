import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import axios from "axios";
import instance from "../../api/axiosInstance";

export default function AdminTripsBookings() {
    const [trips, setTrips] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const limit = 5;

    const fetchTrips = async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await instance.get(
                `trips/trips-booking-users?page=${pageNum}&limit=${limit}`
            );

            if (pageNum === 1) {
                setTrips(response.data.trips);
            } else {
                setTrips((prev) => [...prev, ...response.data.trips]);
            }
            setPage(response.data.page);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips(1);
    }, []);

    const loadMore = () => {
        if (page < totalPages && !loading) {
            fetchTrips(page + 1);
        }
    };

    const renderUser = (user) => (
        <View key={user.userId} style={styles.userRow}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
        </View>
    );

    const renderTrip = ({ item }) => (
        <View style={styles.tripCard}>
            <Text style={styles.tripTitle}>{item.title}</Text>
            <Text>Total Bookings: {item.totalBookings}</Text>
            <Text>Total Seats Booked: {item.totalSeatsBooked}</Text>
            <Text style={{ marginTop: 8, fontWeight: "600" }}>Users who booked:</Text>
            <ScrollView style={styles.usersList}>
                {item.users.length > 0 ? (
                    item.users.map(renderUser)
                ) : (
                    <Text style={{ fontStyle: "italic" }}>No users booked yet</Text>
                )}
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Admin Trips & Bookings</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            <FlatList
                data={trips}
                keyExtractor={(item) => item.tripId.toString()}
                renderItem={renderTrip}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                    loading ? <ActivityIndicator size="large" /> : null
                }
            />
            {page < totalPages && !loading && (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                    <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f0f4f8" },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#333" },
    tripCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
    },
    tripTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
    usersList: {
        maxHeight: 120,
        marginTop: 8,
    },
    userRow: {
        borderBottomColor: "#ddd",
        borderBottomWidth: 1,
        paddingVertical: 6,
    },
    userName: { fontWeight: "600", color: "#444" },
    userEmail: { color: "#666", fontSize: 12 },
    loadMoreBtn: {
        alignSelf: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#2563eb",
        borderRadius: 24,
        marginVertical: 16,
    },
    loadMoreText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    error: { color: "red", textAlign: "center", marginBottom: 12 },
});
