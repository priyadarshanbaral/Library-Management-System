import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import LibraryHome from "./Layout/LibraryHome";
import StudentLogin from "./Layout/StudentLogin";
import DashboardHome from "./Layout/DashboardHome";
import Dashboard from "./Layout/Dashboard";
import AllBooks from "./Layout/AllBooks";
import IssuedBooks from "./Layout/IssuedBooks";
import RequestBook from "./Layout/RequestBook";
import History from "./Layout/History";
import Profile from "./Layout/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LibraryHome />,
    },
    {
      path: "/studentlogin",
      element: <StudentLogin />,
    },
    {
      path: "/dashboardhome",
      element: (
        <ProtectedRoute>
          <DashboardHome />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Dashboard /> },
        { path: "all-books", element: <AllBooks /> },
        { path: "issued-books", element: <IssuedBooks /> },
        { path: "request-book", element: <RequestBook /> },
        { path: "history", element: <History /> },
        { path: "profile", element: <Profile /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

