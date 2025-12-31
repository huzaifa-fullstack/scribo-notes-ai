import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Mail,
  Database,
  Lock,
  Eye,
  Trash2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: December 31, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Introduction
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Welcome to Scribo Notes ("we," "our," or "us"). We are
              committed to protecting your privacy and ensuring the security of
              your personal information. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              use our note-taking application.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Information We Collect
              </h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Account Information
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address</li>
                  <li>Name (if provided)</li>
                  <li>Profile picture (if using Google Sign-In)</li>
                  <li>
                    Password (securely hashed, never stored in plain text)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Content You Create
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Notes and their contents</li>
                  <li>Images uploaded to notes</li>
                  <li>Tags and categories</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (browser type, operating system)</li>
                  <li>Usage data (features used, timestamps)</li>
                  <li>Error logs for debugging purposes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                How We Use Your Information
              </h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
              <li>Provide and maintain our note-taking service</li>
              <li>Authenticate your identity and secure your account</li>
              <li>Enable AI-powered features (summarization, enhancement)</li>
              <li>Send important service updates and password reset emails</li>
              <li>Improve our application based on usage patterns</li>
              <li>Detect and prevent security issues</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Third-Party Services
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We use the following third-party services to provide our
              application:
            </p>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Google OAuth:</strong> For secure sign-in
                authentication. See{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google's Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>MongoDB Atlas:</strong> For secure database storage.
              </li>
              <li>
                <strong>Cloudinary:</strong> For image storage and processing.
              </li>
              <li>
                <strong>HuggingFace:</strong> For AI-powered note features.
              </li>
              <li>
                <strong>Sentry:</strong> For error tracking and application
                monitoring.
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Data Security
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We implement industry-standard security measures to protect your
              data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4 mt-4">
              <li>All data transmitted over HTTPS encryption</li>
              <li>Passwords are hashed using bcrypt</li>
              <li>JWT tokens for secure authentication</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Your Rights & Data Control
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You have full control over your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
              <li>
                <strong>Access:</strong> View all your stored data through your
                account
              </li>
              <li>
                <strong>Export:</strong> Export your notes in Markdown or PDF
                format
              </li>
              <li>
                <strong>Delete:</strong> Delete individual notes or your entire
                account
              </li>
              <li>
                <strong>Recycle Bin:</strong> Recover deleted notes within 30
                days
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Contact Us
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p className="mt-2">
              <a
                href="mailto:karimhuzaifa590@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                karimhuzaifa590@gmail.com
              </a>
            </p>
          </section>

          {/* Updates */}
          <section className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
          <p>© 2025 Scribo Notes. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
