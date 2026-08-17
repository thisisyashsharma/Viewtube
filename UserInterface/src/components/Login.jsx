import React, { useState, useEffect } from "react";
import logo from "../assets/googleLogo.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/slice/authSlice.js";
import GoogleAuthButton from "./GoogleAuthButton";

function Login() {
  const [loader, setLoader] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimateIn(true);
      });
    });
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoader(true);
      await dispatch(login(formData)).unwrap();
      setError("");
      setLoader(false);
      // alert("login successful");
      // navigate('/your_channel');
      navigate("/home");
    } catch (err) {
      alert("Please check your email and password !");
      setLoader(false);
      // setError(err.message || 'An error occurred.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return loader ? (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 bg-gray-50 dark:bg-black overflow-hidden">
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Sign in</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">to continue to Viewtube</p>
        </div>
        <form onSubmit={handleFormSubmit} className={`space-y-5 transition-all duration-700 delay-200 ease-out ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          
          <GoogleAuthButton label="Sign in with Google" setError={setError} />

          <div className="flex items-center justify-center space-x-2 my-4">
            <span className="h-px w-full bg-gray-200 dark:bg-gray-800"></span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">or</span>
            <span className="h-px w-full bg-gray-200 dark:bg-gray-800"></span>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              id="email"
              className="bg-gray-50 dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 rounded-xl block w-full p-3 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              id="password"
              placeholder="••••••••"
              className="bg-gray-50 dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 rounded-xl block w-full p-3 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 text-base font-semibold text-center text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors min-h-[44px]"
          >
            Next
          </button>
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Not registered?</span>
            <Link to="/signup" className="text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-xl transition-colors">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;


// try {

//     const res = await axios.post('/api/v1/account/login' , {
//         email : email ,
//         password : password
//     })

//     // console.log('Full response:', res);
//     // console.log('Response data:', res.data.data.user._id);

//     console.log('login successful:', res.data.data.user);

//     setUser(res.data.data.user);
//     alert("login successful");
//     history('/your_channel');

// } catch (error) {

//     console.log('Signup error : ', error);
//     alert(" Login failed !");

// }
