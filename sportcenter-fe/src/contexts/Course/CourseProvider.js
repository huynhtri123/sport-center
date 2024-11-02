// src/contexts/Course/CourseProvider.js
import { useState } from 'react';
import CourseContext from './CourseContext';

function CourseProvider({ children }) {
    const [courses, setCourses] = useState([]);

    return (
        <CourseContext.Provider value={[courses, setCourses]}>
            {children}
        </CourseContext.Provider>
    );
}

export default CourseProvider;
