import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scale,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfServicePage = () => {
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
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Terms of Service
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
              Agreement to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              By accessing or using Scribo Notes ("the Service"), you agree
              to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use our Service. These terms apply to
              all users, including visitors, registered users, and contributors.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Description of Service
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Scribo Notes is a cloud-based note-taking application that
              provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4 mt-4">
              <li>Rich text note creation and editing</li>
              <li>AI-powered note enhancement and summarization</li>
              <li>Image upload and embedding</li>
              <li>Note organization with tags and folders</li>
              <li>Export functionality (PDF, Markdown)</li>
              <li>Recycle bin for deleted notes</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                User Accounts
              </h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>When you create an account, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
              <p className="mt-4">
                You may sign up using email/password or through Google OAuth.
                Both methods are subject to these terms.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Acceptable Use
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You may use our Service for lawful purposes only. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
              <li>Use the Service in compliance with all applicable laws</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Maintain appropriate backups of your important data</li>
              <li>Use AI features responsibly and ethically</li>
            </ul>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Prohibited Activities
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You may NOT use our Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
              <li>Store or distribute illegal content</li>
              <li>Harass, abuse, or harm others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Transmit viruses, malware, or malicious code</li>
              <li>Scrape or collect user data without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          {/* Content Ownership */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Content Ownership
              </h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Your Content
                </h3>
                <p>
                  You retain full ownership of all notes, images, and content
                  you create. We do not claim any intellectual property rights
                  over your content.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Our Service
                </h3>
                <p>
                  The Scribo Notes application, including its design,
                  features, and code, is owned by us and protected by
                  intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  License to Operate
                </h3>
                <p>
                  By using our Service, you grant us a limited license to store,
                  process, and display your content solely for the purpose of
                  providing the Service to you.
                </p>
              </div>
            </div>
          </section>

          {/* AI Features */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              AI-Powered Features
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our Service includes AI features powered by third-party providers.
              By using these features, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4 mt-4">
              <li>AI-generated content may not always be accurate</li>
              <li>
                You are responsible for reviewing and verifying AI outputs
              </li>
              <li>Your content may be processed by our AI service providers</li>
              <li>AI features are provided "as-is" without guarantees</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Disclaimer of Warranties
              </h2>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-slate-700 dark:text-slate-300">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE
                WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. USE THE SERVICE AT
                YOUR OWN RISK.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of data, profits, or
              business opportunities, arising from your use of the Service.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Termination
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We reserve the right to suspend or terminate your account at any
              time for violation of these terms or for any other reason at our
              discretion. You may also delete your account at any time through
              your account settings. Upon termination, your right to use the
              Service will immediately cease.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We may modify these Terms of Service at any time. We will notify
              users of significant changes by posting a notice on our website or
              sending an email. Your continued use of the Service after changes
              constitutes acceptance of the new terms.
            </p>
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
              If you have any questions about these Terms of Service, please
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

          {/* Governing Law */}
          <section className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Governing Law
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              These Terms shall be governed by and construed in accordance with
              applicable laws, without regard to conflict of law principles. Any
              disputes arising from these terms shall be resolved through
              appropriate legal channels.
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

export default TermsOfServicePage;
