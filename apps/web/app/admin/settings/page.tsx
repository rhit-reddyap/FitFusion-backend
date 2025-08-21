"use client";

export default function SettingsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">⚙️ App Settings</h1>
        <p className="text-gray-700 mb-6">
          Configure global settings for your app here.
        </p>
        <div className="bg-gray-200 p-4 rounded">
          <p className="text-gray-500 italic">
            Settings panel coming soon...
          </p>
        </div>
      </div>
    </main>
  );
}
