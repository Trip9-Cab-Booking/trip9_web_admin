import React from "react";

const HelpSupportPage: React.FC = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-7xl bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">

                {/* Icon */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <svg
                        className="h-8 w-8 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Help & Support
                </h1>

                {/* Subtitle */}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    We’re building a better support experience for you.
                </p>

                {/* Badge */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-4 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                    🚧 Under Construction
                </div>

                {/* Divider */}
                <div className="my-8 h-px bg-gray-200 dark:bg-gray-800" />

                {/* What’s Coming */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <Feature title="Detailed Guides">
                        Step-by-step documentation for platform features.
                    </Feature>

                    <Feature title="Support Tickets">
                        Raise and track issues directly from the dashboard.
                    </Feature>

                    <Feature title="FAQs">
                        Quick answers to common questions.
                    </Feature>

                    <Feature title="Issue Tracking">
                        Monitor the status of reported problems.
                    </Feature>
                </div>

                {/* Support Info */}
                <div className="mt-8 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                        Need help right now?
                    </p>
                    <p className="mt-1">
                        Email us at{" "}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                            support@trip9.com
                        </span>
                    </p>
                    <p className="text-xs mt-1 text-gray-500">
                        Support hours: Mon–Fri, 10:00 AM – 7:00 PM
                    </p>
                </div>

                {/* Disabled CTA */}
                <button
                    disabled
                    className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600/40 px-5 py-2 text-sm font-medium text-white cursor-not-allowed"
                >
                    Contact Support (Coming Soon)
                </button>
            </div>
        </div>
    );
};

export default HelpSupportPage;

/* ------------------------------------------------------------------ */

type FeatureProps = {
    title: string;
    children: React.ReactNode;
};

const Feature: React.FC<FeatureProps> = ({ title, children }) => {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {children}
            </p>
        </div>
    );
};
