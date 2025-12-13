import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Assignment } from '@/types';

interface AssignmentContextType {
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => Assignment;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignment: (id: string) => Assignment | undefined;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: ReactNode }) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const fetchAssignments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  // Initial fetch
  React.useEffect(() => {
    fetchAssignments();
  }, []);

  const addAssignment = async (data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      const newAssignment = await response.json();
      setAssignments(prev => [newAssignment, ...prev]);
      return newAssignment;
    } catch (error) {
      console.error('Error adding assignment:', error);
      throw error;
    }
  };

  const updateAssignment = async (id: string, data: Partial<Assignment>) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updated = await response.json();
        setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const deleteAssignment = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/assignments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (response.ok) {
        setAssignments(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const getAssignment = (id: string) => {
    return assignments.find(a => a.id === id);
  };

  return (
    <AssignmentContext.Provider value={{
      assignments,
      addAssignment: addAssignment as any, // Cast to any to avoid interface mismatch during migration
      updateAssignment,
      deleteAssignment,
      getAssignment
    }}>
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignments() {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignments must be used within an AssignmentProvider');
  }
  return context;
}
