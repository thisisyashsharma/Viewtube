import React, { useState, useMemo, useEffect } from "react";
import logo from "../assets/googleLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../store/slice/authSlice";
import GoogleAuthButton from "./GoogleAuthButton";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [animateIn, setAnimateIn] = useState(false);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimateIn(true);
      });
    });
  }, []);

  const syntaxValid = useMemo(() => {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return rx.test((formData.email || "").trim());
  }, [formData.email]);

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim().length >= 2 &&
      syntaxValid &&
      formData.password.trim().length >= 6
    );
  }, [formData.name, syntaxValid, formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Please fill all required fields correctly.");
      return;
    }

    try {
      setLoader(true);
      setError("");
      setSuccessMessage("");

      await dispatch(
        register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
        })
      ).unwrap();

      setSuccessMessage("Signup successful! Redirecting to login...");
      setLoader(false);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err?.message || (typeof err === "string" ? err : "Signup failed. Please try again.")
      );
      setLoader(false);
    }
  };

  return loader ? (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8 bg-gray-50 dark:bg-[#0f0f0f] overflow-hidden">
      <Link 
        to="/" 
        className={`flex items-center justify-center mb-6 transition-all duration-700 ease-out ${
          animateIn ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <img src={logo} className="h-10 sm:h-12" alt="Logo" />
      </Link>

      <div 
        className={`w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#0f0f0f] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transform transition-all duration-700 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animateIn ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className={`transition-all duration-700 delay-150 ease-out ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            to get started with Viewtube
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className={`space-y-5 transition-all duration-700 delay-200 ease-out ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          
          <GoogleAuthButton setError={setError} />

          <div className="flex items-center justify-center space-x-2 my-4">
            <span className="h-px w-full bg-gray-200 dark:bg-gray-800"></span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">or</span>
            <span className="h-px w-full bg-gray-200 dark:bg-gray-800"></span>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-gray-50 dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 rounded-xl block w-full p-3 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              required
              placeholder="Your Full Name"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-gray-50 dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 rounded-xl block w-full p-3 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              required
              placeholder="name@company.com"
            />
            {formData.email.length > 0 && (
              <p className={`text-xs mt-1 font-medium ${syntaxValid ? "text-green-600" : "text-red-500"}`}>
                {syntaxValid ? "✓ Valid email format" : "✗ Invalid email format"}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="•••••••• (Min 6 characters)"
              className="bg-gray-50 dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 rounded-xl block w-full p-3 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || loader}
            className="w-full px-6 py-3 text-base font-semibold text-center text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {loader ? "Creating Account..." : "Create Account"}
          </button>

          {error && (
            <div className="text-red-500 text-sm font-medium p-3 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="text-green-600 text-sm font-medium p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-100 dark:border-green-900/50">
              {successMessage}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Already have an account?</span>
            <Link to="/login" className="text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-xl transition-colors">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
