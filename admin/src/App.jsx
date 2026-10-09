import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./layouts/Dashboard";
import AllBooks from "./layouts/AllBooks";
import AddStudent from "./layouts/AddStudent";
import RemoveStudent from "./layouts/RemoveStudent";
import AddBook from "./layouts/AddBook";
import RemoveBook from "./layouts/RemoveBook";
import IssueBook from "./layouts/IssueBook";
import SubmitBook from "./layouts/SubmitBook";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AdminLogin />,
    },
    {
      path: "/admindashboard",
      element: (
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Dashboard /> },
        { path: "allbooks", element: <AllBooks /> },
        { path: "addstudent", element: <AddStudent /> },
        { path: "removestudent", element: <RemoveStudent /> },
        { path: "addbook", element: <AddBook /> },
        { path: "removebook", element: <RemoveBook /> },
        { path: "issuebook", element: <IssueBook /> },
        { path: "submitbook", element: <SubmitBook /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ], { basename: import.meta.env.BASE_URL.replace(/\/$/, "") });

  return <RouterProvider router={router} />;
}

export default App;

