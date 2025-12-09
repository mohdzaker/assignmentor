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
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('assignments');
    return saved ? JSON.parse(saved) : [];
  });

  const saveToStorage = (newAssignments: Assignment[]) => {
    localStorage.setItem('assignments', JSON.stringify(newAssignments));
  };

  const addAssignment = (data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAssignment: Assignment = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    saveToStorage(updated);
    return newAssignment;
  };

  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    const updated = assignments.map(a => 
      a.id === id ? { ...a, ...data, updatedAt: new Date() } : a
    );
    setAssignments(updated);
    saveToStorage(updated);
  };

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    saveToStorage(updated);
  };

  const getAssignment = (id: string) => {
    return assignments.find(a => a.id === id);
  };

  return (
    <AssignmentContext.Provider value={{ 
      assignments, 
      addAssignment, 
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
