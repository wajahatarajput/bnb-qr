import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../providers';
import { server } from '../../helpers';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(null);
  const [sessions, setSessions] = useState([]);
  const { user, cookies } = useAuth(); // Assuming useAuth provides user info

  useEffect(() => {
    if (user && user.role === 'teacher') {
      const teacherId = user._id || cookies.get('id');
      if (teacherId) {
        // Fetch all courses by teacher ID
        server.get('/teachers/courses?teacherId=${teacherId')
       
      


          .then(response => {
            setCourses(response.data);
          })
          .catch(error => {
            console.error("There was an error fetching the courses!", error);
          });
      }
    }
  }, [user, cookies]);

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    setSelectedCourse(courseId);

    // Fetch sessions for the selected course
    server.get(/courses/${courseId}/sessions)
      .then(response => {
        setSessions(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the sessions!", error);
      });
  };

  return (
    <div className="container">
      <h1 className="my-4">Teacher's Courses</h1>
      {user && user.role === 'teacher' ? (
        <>
          <div className="form-group">
            <label htmlFor="courseSelect">Select a Course</label>
            <select className="form-control" id="courseSelect" onChange={handleCourseChange}>
              <option value="">-- Select a Course --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <div className="mt-4">
              <h2>Sessions</h2>
              {sessions.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Room Number</th>
                      <th>Session Time</th>
                      <th>Geo Locations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(session => (
                      <tr key={session._id}>
                        <td>{session.roomNumber}</td>
                        <td>{new Date(session.sessionTime).toLocaleString()}</td>
                        <td>{session.geoLocations.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No sessions available for this course.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TeacherCourses;