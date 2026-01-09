import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth.jsx";
import gymImage from "../assets/emplogin.jpg";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-fill email and check for success messages from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData({ email: emailParam });
    }

    const resetParam = searchParams.get("reset");
    if (resetParam === "success") {
      setSuccessMessage(
        "Password updated! Please log in with your new credentials."
      );
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure("Please fill all the fields"));
    }
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }

      if (res.ok) {
        dispatch(signInSuccess(data));
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data._id);
        navigate("/");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <>
      <div className="min-h-screen mt-20 bg-gray-100">
        <div className="flex flex-col max-w-3xl gap-10 p-3 mx-auto md:flex-row md:items-center">
          {/* left */}
          <div className="flex-col hidden w-full mr-10 md:w-8/12 lg:w-6/12 md:flex">
            <img
              src={gymImage}
              alt="Gym"
              className="object-cover w-full h-full"
            />
          </div>

          {/* right */}
          <div className="flex-1">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <h4 className="text-xl font-bold" style={{ color: "black" }}>
                Sign in
              </h4>
              <p
                className="mt-5 text-sm text-center"
                style={{ color: "#707070" }}
              >
                Welcome back! to Banglar Heshel
              </p>
              <div>
                <Label value="Email" style={{ color: "black" }} />
                <TextInput
                  type="email"
                  placeholder="Enter your email"
                  id="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  style={{ color: "black" }}
                />
              </div>
              <div>
                <Label value="Password" style={{ color: "black" }} />
                <div className="relative">
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    placeholder="**********"
                    id="password"
                    onChange={handleChange}
                    style={{ color: "black" }}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <HiEyeOff size={20} />
                    ) : (
                      <HiEye size={20} />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    style={{ color: "black" }}
                    className="text-xs font-semibold hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                className={`flex items-center justify-center text-white bg-red-900 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Loading...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
              <OAuth />
            </form>
            <div className="flex gap-2 mt-5 text-sm">
              <span>Don't have an account?</span>
              <Link to="/signup" style={{ color: "black" }}>
                Sign Up
              </Link>
            </div>
            {successMessage && (
              <Alert className="mt-5" color="success">
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert className="mt-5" color="failure">
                {errorMessage}
              </Alert>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
