import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import type { Surgery } from '../types/surgery';
import toast from 'react-hot-toast';

export function useSurgeries() {
    const api = 'http://localhost:8000/api/v1/surgeries'
    const { data: surgeries, loading, error, refetch, mutate } = useApi<Surgery[]>(api);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const createSurgery = useCallback(async (surgeryData: Omit<Surgery, '_id'>) => {
        setCreating(true);
        try {
            const response = await fetch(api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surgeryData),
            });

            if (!response.ok) throw new Error('Failed to create surgery');

            const newSurgery = await response.json();
            mutate([...(surgeries || []), newSurgery]);
            toast.success('Surgery scheduled successfully');
            return newSurgery;
        } catch (error) {
            toast.error('Failed to create surgery');
            throw error;
        } finally {
            setCreating(false);
        }
    }, [surgeries, mutate]);

    const updateSurgery = useCallback(async (id: string, updates: Partial<Surgery>) => {
        setUpdating(true);
        try {
            const response = await fetch(`${api}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update surgery');

            const updatedSurgery = await response.json();
            mutate(
                (surgeries || []).map(surgery =>
                    surgery._id === id ? updatedSurgery : surgery
                )
            );
            toast.success('Surgery updated successfully');
            return updatedSurgery;
        } catch (error) {
            toast.error('Failed to update surgery');
            throw error;
        } finally {
            setUpdating(false);
        }
    }, [surgeries, mutate]);

    const deleteSurgery = useCallback(async (id: string) => {
        setDeleting(true);
        try {
            const response = await fetch(`${api}/${id}`, { method: 'DELETE' });

            if (!response.ok) throw new Error('Failed to delete surgery');

            mutate((surgeries || []).filter(surgery => surgery._id !== id));
            toast.success('Surgery cancelled successfully');
        } catch (error) {
            toast.error('Failed to cancel surgery');
            throw error;
        } finally {
            setDeleting(false);
        }
    }, [surgeries, mutate]);

    return {
        surgeries: surgeries || [],
        loading,
        error,
        refetch,
        operations: {
            create: createSurgery,
            update: updateSurgery,
            delete: deleteSurgery,
        },
        operationStates: {
            creating,
            updating,
            deleting,
        },
    };
}