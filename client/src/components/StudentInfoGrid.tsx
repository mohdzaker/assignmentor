import { Assignment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface StudentInfoGridProps {
    assignment: Assignment;
}

export function StudentInfoGrid({ assignment }: StudentInfoGridProps) {
    const { user } = useAuth();

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-lg font-bold mb-1">Department of Management</h2>
                <h3 className="text-lg font-bold">Internal Assessment Sheet</h3>
            </div>

            {/* Two-column layout matching the reference image */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-8 text-base">
                {/* Left Column */}
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[110px]">Student Name:</span>
                        <span className="font-normal">{user?.name || ''}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="font-bold min-w-[110px]">Roll No:</span>
                        <span className="font-normal">{user?.rollNumber || ''}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="font-bold min-w-[110px]">Section:</span>
                        <span className="font-normal">{user?.section || ''}</span>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[80px]">Subject:</span>
                        <span className="font-normal">{assignment.subject}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="font-bold min-w-[80px]">Assessment:</span>
                        <span className="font-normal"></span>
                    </div>

                    <div className="flex gap-2">
                        <span className="font-bold min-w-[80px]">Module:</span>
                        <span className="font-normal">{assignment.module || 'I'}</span>
                    </div>
                </div>
            </div>

            {(assignment.module || assignment.topic) && (
                <div className="mb-4 font-bold text-base">
                    Module {assignment.module || '1'}: {assignment.topic || ''}
                </div>
            )}
        </>
    );
}
