import React from "react";
import { Link } from "react-router-dom";

export default function ErrorPage({ message = "Something went wrong." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-8 text-center bg-gray-50 text-gray-800">
      <h1 className="text-4xl font-bold mb-4 text-red-500">Oops!</h1>
      <p className="text-lg mb-8">{message}</p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
