import React from 'react';

const CourseCard = ({ course, onUnenroll }) => {
    return (
        <div className="card m-2" style={{ width: '18rem' }}>
            <div className="card-body">
                <h5 className="card-title">{course.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{course.department}</h6>
                <p className="card-text">{course.course_code}</p>
                <button className="btn btn-danger" onClick={() => onUnenroll(course._id)}>Unenroll</button>
            </div>
        </div>
    );
};

export default CourseCard;




