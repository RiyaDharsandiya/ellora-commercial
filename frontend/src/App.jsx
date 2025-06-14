import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/NavBar';
import HomePage from './pages/HomePage';
import AuthForm from "./pages/AuthForm";
import Budget from './pages/Budget';
import ProtectedRoute from './components/ProtectedRoute';
import BudgetDetails from './pages/BudgetDetails';
import MiscExpDetails from './pages/MiscExpDetails';
import AllBudgetsPage from './pages/AllBugetsPage';

function App() {
  const [isSignup, setIsSignup] = useState(false);
  return (
    <>
      <Navbar />

      <Routes>
      <Route
          path="/login"
          element={<AuthForm isSignup={false} setIsSignup={setIsSignup} />}
        />
        <Route
          path="/signup"
          element={<AuthForm isSignup={true} setIsSignup={setIsSignup} />}
        />
        <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            }
          />
          <Route
          path="/"
          element={
              <HomePage />
          }
        />
          <Route
          path="/budgetDetails/:id"
          element={
            <ProtectedRoute>
              <BudgetDetails />
            </ProtectedRoute>
          }
        />
          <Route
          path="/miscExpDetails/:id"
          element={
            <ProtectedRoute>
              <MiscExpDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-budgets"
          element={
            <ProtectedRoute>
              <AllBudgetsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;
