import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Clock } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";
import ScriboLogo from "../components/icons/ScriboLogo";

const LoginPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4"
    >
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Brand and Description */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <ScriboLogo size={48} />
              <h1 className="text-3xl font-bold text-gray-900">Scribo Notes</h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Organize your thoughts,
                <br />
                <span className="text-cyan-600">simplify your life</span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                Capture ideas, create to-do lists, and keep your thoughts
                organized with our powerful and intuitive note-taking
                application.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1 text-center">
                  Rich Text Editor
                </div>
                <div className="text-xs text-gray-600 text-center">
                  Format your notes beautifully
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1 text-center">
                  Auto-Save
                </div>
                <div className="text-xs text-gray-600 text-center">
                  Never lose your work
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <div className="w-full">
          <LoginForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-cyan-600 hover:text-cyan-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
