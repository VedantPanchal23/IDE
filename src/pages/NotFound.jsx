export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-white dark:bg-gray-900 transition-colors">
      <h1 className="text-5xl md:text-5xl font-semibold text-gray-900 dark:text-gray-100">404</h1>
      <h1 className="text-2xl md:text-3xl font-semibold mt-6 text-gray-900 dark:text-white">
        This page could not be found
      </h1>
      <p className="mt-4 text-xl md:text-2xl text-gray-500 dark:text-gray-400">
        Please check the URL or return to the homepage.
      </p>
    </div>
  );
}