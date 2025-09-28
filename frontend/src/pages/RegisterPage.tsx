import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Shield, Zap, Users } from "lucide-react";
import RegisterForm from "../components/auth/RegisterForm";

const RegisterPage = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your notes are encrypted and stored securely",
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Lightning-fast performance with real-time sync",
    },
    {
      icon: Users,
      title: "Collaborative",
      description: "Share and collaborate on notes with your team",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Brand and Features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-600 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Notes App</h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Start your journey with
                <br />
                <span className="text-purple-600">organized thinking</span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                Join thousands of users who trust Notes App to keep their ideas
                organized and accessible anywhere, anytime.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <feature.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side - Register Form */}
        <div className="w-full">
          <RegisterForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
