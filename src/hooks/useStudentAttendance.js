import { useQuery } from "@tanstack/react-query";
import { getStudentAttendance } from "../api/classSessionApi";

/**
 * Get logged-in student's attendance history
 */
export const useStudentAttendance = () => {
    return useQuery({
        queryKey: ["studentAttendance"],
        queryFn: () => getStudentAttendance(),
    });
};
