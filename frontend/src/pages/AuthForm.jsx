import React, { useState } from "react";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate,Link } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
const API_URL = import.meta.env.VITE_API_URL;

const validatePassword = (password) => {
  // At least 6 letters, one number, one special char
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/.test(password);
};

const AuthForm = ({ isSignup, setIsSignup }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser, signInWithGoogle } = useUserAuth();
  const navigate = useNavigate();

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const userCred = await signInWithGoogle();
      const idToken = await userCred.user.getIdToken();
      const res = await axios.post(`${API_URL}/api/users/google-login`, { token: idToken });

      // Store JWT token and user info if provided by backend
      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
      }
      if (res.data.user) {
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }

      navigate("/budget");
    } catch (err) {
      setError("Google sign-in failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Input Change Handler
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignup && !validatePassword(form.password)) {
      setError("Password must be at least 6 characters, include a number and a special character.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (isSignup) {
        res = await axios.post(`${API_URL}/api/suers/signup`, form);
      } else {
        res = await axios.post(`${API_URL}/api/users/login`, { email: form.email, password: form.password });
      }

      // Store JWT token and user info
      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
      }
      if (res.data.user) {
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }

      navigate("/budget");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {isSignup ? "Sign Up" : "Login"}
        </h2>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center bg-white border border-gray-300 rounded py-2 mb-4 text-gray-700 hover:bg-gray-50 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Sign in with Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            {isSignup ? "Sign Up" : "Continue"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
        {isSignup ? "Already have an account?" : "No account?"}{" "}
          <Link
            to={isSignup ? "/login" : "/signup"} // Specify the target path
            className="text-blue-600 hover:underline cursor-pointer"
            // onClick is not needed here as Link handles navigation
          >
            {isSignup ? "login" : "signup"}
          </Link>
        </p>
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
    </main>
    <footer className="bg-white text-center text-gray-500 p-4 text-sm shadow-inner">
        &copy; {new Date().getFullYear()} Ellora commercial . Created by Riya
      </footer>
    </div>
  );
};

export default AuthForm;
