import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AuthContext from '../contexts/Auth/AuthContext';
import GetFieldsContext from '../contexts/Field/GetFieldsContext';
import SportContext from '../contexts/Sport/SportContext';
import CourseContext from '../contexts/Course/CourseContext';
import TournamentContext from '../contexts/Tournament/TournamentContext';
import UserContext from '../contexts/UserContext/UserContext';

export const useCheckSignedIn = () => {
    const [isSignedIn, setIsSignedIn] = useContext(AuthContext);
    return [isSignedIn, setIsSignedIn];
};

export const useGetFields = () => {
    const [fields, setFields] = useContext(GetFieldsContext); // Chỉ lấy `fields` và `setFields`
    return [fields, setFields];
};

export const useGetField = () => {
    const [, , field, setField] = useContext(GetFieldsContext); // Chỉ lấy `field` và `setField`
    return [field, setField];
};

export const useGetSports = () => {
    const [sports, setSports] = useContext(SportContext);
    return [sports, setSports];
};

export const useCleanupStorage = () => {
    const location = useLocation();
    useEffect(() => {
        // xóa 'selectedField' khi người dùng điều hướng khỏi '/booking'
        if (location.pathname !== '/booking' && location.pathname !== '/sport/fields') {
            localStorage.removeItem('selectedField');
            localStorage.removeItem('selectedFields');
        }
        // tournament
        if (
            location.pathname !== '/tournaments' &&
            location.pathname !== '/tournament/detail' &&
            location.pathname !== '/tournament/register'
        ) {
            localStorage.removeItem('selectedTournament');
            localStorage.removeItem('selectedTournament');
        }
    }, [location.pathname]);
};

export const useGetCourses = () => {
    const [courses, setCourses] = useContext(CourseContext);
    return [courses, setCourses];
};

export const useTournament = () => {
    const [tournament, setTournament] = useContext(TournamentContext);
    return [tournament, setTournament];
};

export const useUser = () => {
    const [user, setUser] = useContext(UserContext);
    return [user, setUser];
};
