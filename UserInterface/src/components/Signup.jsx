import React, { useState, useEffect, useMemo } from "react";
import logo from "../assets/download (1).png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../store/slice/authSlice";
import axios from "axios";

//EU10u1.p3.a1.8ln - Email verification level 2 - debounce Helper
function useDebounce(value, delay = 600) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Signup() {
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  //EU10u1.p3.a2.6ln - Email verification level 2 -  Syntax check (pure frontend)
  const syntaxValid = useMemo(() => {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return rx.test((formData.email || "").trim());
  }, [formData.email]);
  // debounce the email b/f hitting server
  const debouncedEmail = useDebounce(formData.email, 600);

  const [loader, setLoader] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoader(true);
      await dispatch(register(formData)).unwrap();
      setSuccessMessage("Signup successful!");
      setFormData({ name: "", email: "", password: "" });
      setError("");
      setLoader(false);
      alert(" SignUp Successfully .");
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred.");
      setSuccessMessage("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //EU10u1.p3.a2.27ln - Email verification level 2 - Domain MX + Disposable + Deliverability via backend
  useEffect(() => {
    const email = (debouncedEmail || "").trim();
    // only call server if format looks OK
    if (!email || !syntaxValid) {
      setEmailStatus(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setEmailChecking(true);
        const { data } = await axios.get("/api/v1/account/validate-email", {
          params: { email },
        });
        if (!cancelled) {
          setEmailStatus(data?.data ?? null);
        }
      } catch (e) {
        if (!cancelled) setEmailStatus(null);
      } finally {
        if (!cancelled) setEmailChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedEmail, syntaxValid]);

  return loader ? (
    <div className="text-center  my-72 ">
      <div className="p-4 text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin  fill-black"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 bg-slate-100 ">
      <a
        href="/"
        className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 "
      >
        <img src={logo} className="mr-4 h-11" alt="Logo" />
      </a>
      <div className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow ">
        <h2 className="text-2xl font-bold text-gray-900 ">
          Create a New Account
        </h2>
        <form onSubmit={handleFormSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              placeholder="Varshit Gupta"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              placeholder="name@company.com"
              required
            />

            {/* EU10u1.p3.a4.6ln - Email verification level 2 */}
            {formData.email.length > 0 && (
              <p
                className={`text-xs mt-1 ${
                  syntaxValid ? "text-green-500" : "text-red-500"
                }`}
              >
                {syntaxValid
                  ? "✓ Nice email"
                  : "✗ Invalid email"}
              </p>
            )}
            {emailChecking && syntaxValid && (
              <p className="text-xs mt-1 text-gray-500">
                Checking domain & deliverability…
              </p>
            )}
            {!emailChecking && emailStatus && (
              <div className="text-xs mt-2 space-y-1">
                <p
                  className={
                    emailStatus.domainHasMX ? "text-green-500" : "text-red-500"
                  }
                >
                  {emailStatus.domainHasMX
                    ? "✓ MX"
                    : "✗ Domain cannot receive email (no MX)"}
                </p>
                <p
                  className={
                    emailStatus.isDisposable ? "text-red-600" : "text-green-700"
                  }
                >
                  {emailStatus.isDisposable
                    ? "✗ Disposable/temporary email"
                    : "✓ Not a disposable domain"}
                </p>
                <p
                  className={
                    emailStatus.deliverability === "deliverable"
                      ? "text-green-500"
                      : emailStatus.deliverability === "undeliverable"
                      ? "text-red-500"
                      : emailStatus.deliverability === "risky"
                      ? "text-orange-500"
                      : "text-gray-500"
                  }
                >
                  Deliverability: {emailStatus.deliverability}
                </p>
                {Array.isArray(emailStatus.notes) &&
                  emailStatus.notes.length > 0 && (
                    <ul className="list-disc ml-5 text-gray-600">
                      {emailStatus.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  )}
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              required
            />
          </div>
          {/* EU10u1.p3.a4.6ln - Email verification level 2 - conditional rendering */}
          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white bg-gray-700 rounded-lg hover:bg-black focus:ring-4 focus:ring-primary-300 sm:w-auto disabled:opacity-50"
            disabled={
              !syntaxValid ||
              (emailStatus &&
                (!emailStatus.domainHasMX ||
                  emailStatus.isDisposable ||
                  emailStatus.deliverability === "undeliverable"))
            }
          >
            Create account
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {successMessage && (
            <div className="text-green-500 text-sm">{successMessage}</div>
          )}
          <div className="text-sm font-medium text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 hover:underline">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
