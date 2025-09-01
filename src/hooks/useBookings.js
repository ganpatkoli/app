import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

export function useMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    axios.get('/bookings/my')
      .then(res => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBookings, []);

  return { bookings, loading, refresh: fetchBookings };
}
