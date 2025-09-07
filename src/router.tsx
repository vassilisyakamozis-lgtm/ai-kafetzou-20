import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./system/ProtectedRoute";
const Home = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./pages/Auth"));
const NewReading = lazy(() => import("./pages/NewReading"));
const ReadingResult = lazy(() => import("./pages/CupReadingResult"));


const withFB = (el: JSX.Element) => <Suspense fallback={<div />}>{el}</Suspense>;

export const router = createBrowserRouter([
  { index: true, element: withFB(<Home />) },
  { path: "auth", element: withFB(<AuthPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "new", element: withFB(<NewReading />) },
      { path: "reading/:id", element: withFB(<ReadingResult />) },
    ],
  },
  // δημόσιο share link:
  { path: "share/:id", element: withFB(<ReadingResult />) },
  { path: "*", element: <Navigate to="/" replace /> },
]);
