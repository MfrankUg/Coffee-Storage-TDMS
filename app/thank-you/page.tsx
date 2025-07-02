export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Thank You!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your feedback has been successfully submitted to the TDMS team.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            We appreciate your input and will review your message shortly.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  )
}
