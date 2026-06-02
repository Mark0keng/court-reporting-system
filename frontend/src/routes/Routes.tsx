import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.js";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout.js";
import JobList from "../pages/JobList/JobList.js";
import JobCreate from "../pages/JobCreate/JobCreate.js";
import JobAssign from "../pages/JobAssign/JobAssign.js";
import UserList from "../pages/UserList/UserList.js";
import UserCreate from "../pages/UserCreate/UserCreate.js";
import ReporterJobList from "../pages/ReporterJobList/ReporterJobList.js";
import ReporterJobSubmit from "../pages/ReporterJobSubmit/ReporterJobSubmit.js";
import EditorJobList from "../pages/EditorJobList/EditorJobList.js";
import EditorJobSubmit from "../pages/EditorJobSubmit/EditorJobSubmit.js";
import Login from "../pages/Login/Login.js";
import JobAssignEditor from "../pages/JobAssignEditor/JobAssignEditor.js";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Area Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/" element={<JobList />} />
            <Route path="/jobs/create" element={<JobCreate />} />
            <Route path="/jobs/assign/:id" element={<JobAssign />} />
            <Route
              path="/jobs/assign-editor/:id"
              element={<JobAssignEditor />}
            />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<UserCreate />} />
          </Route>

          {/* Reporter Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["reporter"]} />}>
            <Route path="/reporter/jobs" element={<ReporterJobList />} />
            <Route
              path="/reporter/submit/:id"
              element={<ReporterJobSubmit />}
            />
          </Route>

          {/* Editor Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["editor"]} />}>
            <Route path="/editor/jobs" element={<EditorJobList />} />
            <Route path="/editor/submit/:id" element={<EditorJobSubmit />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
