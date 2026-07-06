import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { motion } from "framer-motion";
import { LOGIN_API } from "../../../Api";
import { generateSessionId } from "../../../Utils/helper";
import Modal from "../../../UiComponents/Modal";
import BranchAndFinYearForm from "../../components/BranchAndFinyear";
import { PRODUCT_ADMIN_HOME_PATH } from "../../../Route/urlPaths";
import Swal from "sweetalert2";
import PinnacleLogo from "../../../assets/pinnacle.png";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [formData, setFormData] = useState({ email: email, password: password })
  const [errors, setErrors] = useState({});
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planExpirationDate, setPlanExpirationDate] = useState("");
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  // Validation function to check email and password
  const validate = () => {
    const errors = {};

    if (!username) {
      errors.email = "Email is required";
    }
    //  else if (
    //     !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    // ) {
    //     errors.email = "Invalid email address";
    // }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    }
    //  else if (password.length < 6) {
    //     errors.password = "Password must be at least 6 characters";
    // }

    return errors;
  };

  const data = { username, password };
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validateErrors = validate();
    setErrors(validateErrors);
    if (Object.keys(validateErrors).length === 0) {
      axios({
        method: "post",
        url: BASE_URL + LOGIN_API,
        data: data,
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              sessionStorage.setItem("sessionId", generateSessionId());
              if (!result.data.userInfo.roleId) {
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "userId",
                  result.data.userInfo.id,
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "username",
                  result.data.userInfo.username,
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "superAdmin",
                  true,
                );
                navigate(PRODUCT_ADMIN_HOME_PATH);
              } else {
                const currentPlanActive =
                  result.data.userInfo.role.company.Subscription.some(
                    (sub) => sub.planStatus,
                  );
                if (currentPlanActive) {
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "employeeId",
                    result.data.userInfo.employeeId,
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userId",
                    result.data.userInfo.id,
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "username",
                    result.data.userInfo.username,
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userEmail",
                    result.data.userInfo.email,
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userCompanyId",
                    result.data.userInfo.role.companyId,
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "defaultAdmin",
                    JSON.stringify(result.data.userInfo.role.defaultRole),
                  );

                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRoleId",
                    result.data.userInfo.roleId,
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") +
                      "latestActivePlanExpireDate",
                    new Date(
                      result.data.userInfo.role.company.Subscription[0]
                        .expireAt,
                    ).toDateString(),
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRole",
                    result.data.userInfo.role.name,
                  );
                  setIsGlobalOpen(true);
                } else {
                  const expireDate = new Date(
                    result.data.userInfo.role.company.Subscription[0].expireAt,
                  );
                  setPlanExpirationDate(expireDate.toDateString());
                }
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "Submission error",
                text: result.data.message || "Something went wrong!",
                didClose: () => {
                  usernameRef.current.focus();
                },
              });
              setLoading(false);
            }
          }
        },
        (error) => {
          Swal.fire({
            title: "Server Down",
            icon: "error",
          });
          setLoading(false);
        },
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isGlobalOpen}
        onClose={() => {
          setIsGlobalOpen(false);
        }}
        widthClass={""}
      >
        <BranchAndFinYearForm setIsGlobalOpen={setIsGlobalOpen} />
      </Modal>

      <div className="flex h-screen bg-white overflow-hidden font-sans select-none">
        {/* Left Section: Sophisticated Gradient Backdrop */}
        <div className="w-full lg:w-[45%] h-full flex items-center justify-center px-8 sm:px-16 bg-[radial-gradient(circle_at_top_left,#F1F3F6_0%,#FFFFFF_100%)] relative overflow-hidden">
          {/* Subtle noise/grain texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-md w-full mx-auto bg-white/95 backdrop-blur-2xl p-10 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white relative z-10 h-[50vh] min-h-[500px] flex flex-col justify-center ring-1 ring-black/[0.03]"
          >
            <div className="mb-6 space-y-1">
              <h1 className="text-3xl font-bold text-stone-900 mb-1">
                Sign in
              </h1>
              <p className="text-sm text-stone-500">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="username"
                  className="text-xs font-bold text-stone-700 uppercase tracking-wider"
                >
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-stone-900 transition-all placeholder-stone-400 text-sm outline-none"
                    placeholder="Enter your username"
                    ref={usernameRef}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-stone-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block outline-none w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-stone-900 transition-all placeholder-stone-400 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-stone-400 hover:text-stone-600 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-stone-400 hover:text-stone-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  {/* <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-3.5 w-3.5 text-black border-stone-300 rounded focus:ring-black cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-stone-700 cursor-pointer">
                      Remember me
                    </label> */}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }
                }}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-black text-white rounded-xl font-semibold transition-all duration-300 shadow-md shadow-stone-200 transform active:scale-[0.98] disabled:opacity-70 text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="mt-8"></div>
          </motion.div>
        </div>

        {/* Right Section: Visual Backdrop */}
        <div className="hidden lg:flex w-[55%] h-full items-center justify-center p-12 bg-[#F0F2F5] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-full max-h-[850px] bg-stone-950 rounded-[48px] shadow-2xl overflow-hidden flex flex-col p-16 text-white"
          >
            {/* Background Grain & Gradients */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-stone-800/40 via-transparent to-transparent pointer-events-none" />

            {/* Abstract Background Design (Slanted lines) */}
            <div className="absolute top-0 right-[-10%] w-full h-full flex flex-col items-end pointer-events-none select-none">
              <div className="w-[1px] h-[200%] bg-white/5 rotate-[35deg] origin-top transform translate-x-[-100px] blur-[1px]" />
              <div className="w-[10px] h-[200%] bg-white/10 rotate-[35deg] origin-top transform translate-x-[-300px] blur-[2px]" />
              <div className="w-[1px] h-[200%] bg-white/5 rotate-[35deg] origin-top transform translate-x-[-500px] blur-[1px]" />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              {/* Header/Logo in Card */}
              <div className="mb-auto px-4">
                <div className="mb-14">
                  <img
                    src={PinnacleLogo}
                    alt="Pinnacle"
                    className="h-16 w-auto object-contain"
                  />
                </div>

                <div className="max-w-lg">
                  <h2 className="text-6xl font-extrabold leading-[1.1] mb-8 tracking-tight">
                    Pinnacle Systems
                  </h2>
                  {/* <p className="text-xl text-stone-400 font-light leading-relaxed mb-6">
                    A leading software company providing customized ERP solutions across various platforms. Elevate your business efficiency with our specialized systems.
                  </p> */}
                </div>
              </div>

              {/* Services & Products Grid */}
              <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 pb-12 px-4 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold border-l-2 border-blue-400 pl-3">
                    ERP for Textile Industries
                  </h3>
                  <p className="text-blue-100/70 text-[12px] tracking-wider leading-relaxed">
                    An ERP system tailored for textile industries streamlines
                    and optimizes various operations, from supply chain
                    management to production planning and inventory control.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold border-l-2 border-blue-400 pl-3">
                    Payroll Management System
                  </h3>
                  <p className="text-blue-100/70 text-[12px] tracking-wider leading-relaxed">
                    Payroll management system with mobile app integration,
                    employee self-service portal, and real-time attendance
                    tracking.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold border-l-2 border-blue-400 pl-3">
                    ERP For Textile Lab
                  </h3>
                  <p className="text-blue-100/70 text-[12px] tracking-wider leading-relaxed">
                    Cloud and IoT solutions for enhanced efficiency, real-time
                    monitoring, data analytics, and scalability in textile
                    testing laboratories.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold border-l-2 border-blue-400 pl-3">
                    POS
                  </h3>
                  <p className="text-blue-100/70 text-[12px] tracking-wider leading-relaxed">
                    Retail Point of Sale system with inventory management,
                    customer loyalty programs, and multi-store support.
                  </p>
                </div>

                {/* <div className="space-y-2 sm:col-span-2">
                  <h3 className="text-white text-lg font-bold border-l-2 border-blue-400 pl-3">Hospital Management</h3>
                  <p className="text-blue-100/70 text-[12px] tracking-wider leading-relaxed lg:max-w-2xl">
                    Streamline hospital operations with an integrated ERP solution. Manage patient records, billing, and resource allocation efficiently. Enhance patient care through seamless coordination and data-driven insights.
                  </p>
                </div> */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
