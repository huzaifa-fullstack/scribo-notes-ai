import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, Download } from "lucide-react";
import RegisterForm from "../components/auth/RegisterForm";
import ScriboLogo from "../components/icons/ScriboLogo";

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
      icon: Download,
      title: "Import & Export",
      description: "Easily backup and transfer your notes in multiple formats",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4"
    >
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
              <ScriboLogo size={48} />
              <h1 className="text-3xl font-bold text-gray-900">Scribo Notes</h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Start your journey with
                <br />
                <span className="text-cyan-600">organized thinking</span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                Capture your ideas, organize your thoughts, and never lose track
                of what matters most.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="p-2 bg-cyan-100 rounded-lg flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-cyan-600" />
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
                className="font-medium text-cyan-600 hover:text-cyan-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
