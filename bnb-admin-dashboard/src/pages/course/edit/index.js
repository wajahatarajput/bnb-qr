import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios'; // Assuming you're using Axios for HTTP requests
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function EditCourse() {
  const params = useParams();
  const [course, setCourse] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5000/api/courses/${e.target[0].value}`, {
      name: e.target[1].value,
      department: e.target[2].value,
      course_code: e.target[3].value,
    }).then((res) => {
      if (res.status === 200) {
        toast.success('Successfully updated student!');
      }
    })
  }, []);

  const getStudentData = useCallback(async () => {
    await axios.get(`http://localhost:5000/api/courses/${params.id}`).then((res) => {
      setCourse(res.data)
    })
  }, [params]);

  useEffect(() => {
    getStudentData();
    return (() => {
      setCourse([]);
    });
  }, [getStudentData]);

  return (
    <div className="container">
      <h1>Edit Course</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3" hidden>
          <label htmlFor="name" className="form-label">ID</label>
          <input type="text" className="form-control" id="name" name="name" defaultValue={course?._id} required />
        </div>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" id="name" name="name" defaultValue={course?.name} required />
        </div>
        <div className="mb-3">
          <label htmlFor="department" className="form-label">Department</label>
          <input type="text" className="form-control" id="department" name="department" defaultValue={course?.department} required />
        </div>
        <div className="mb-3">
          <label htmlFor="courseCode" className="form-label">Course Code</label>
          <input type="text" className="form-control" id="courseCode" name="courseCode" defaultValue={course?.course_code} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Update Course</button>
      </form>
    </div>
  );
}

export default EditCourse;
