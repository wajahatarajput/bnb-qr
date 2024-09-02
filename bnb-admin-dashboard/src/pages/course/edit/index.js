import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

function EditCourse() {
  const params = useParams();
  const [course, setCourse] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const form = e.target;
      const response = await server.put(`/api/courses/${e.target[0].value}`, {
        name: e.target[1].value,
        department: e.target[2].value,
        course_code: e.target[3].value,
      });
      if (response.status === 200) {
        toast.success('Successfully updated course!');
        form.reset();
      } else {
        toast.error('Failed to update course. Please try again.');
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  }, []);

  const getCourseData = useCallback(async () => {
    try {
      const response = await server.get(`/api/courses/${params.id}`);
      setCourse(response.data);
    } catch (error) {
      toast.error(`Error fetching course data: ${error.response?.data?.message || error.message}`);
    }
  }, [params.id]);

  useEffect(() => {
    getCourseData();
    return () => {
      setCourse(null);
    };
  }, [getCourseData]);

  return (
    <div className="container">
      <h1>Edit Course</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3" hidden>
          <label htmlFor="id" className="form-label">ID</label>
          <input type="text" className="form-control" id="id" name="id" defaultValue={course?._id} required />
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
