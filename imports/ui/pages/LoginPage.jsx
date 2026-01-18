import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const user = useTracker(() => Meteor.user());

  // 이미 로그인되어 있으면 상점 목록으로 리다이렉트
  if (user) {
    return <Navigate to="/shops" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        setError(err.reason || "로그인에 실패했습니다.");
      } else {
        navigate("/shops");
      }
    });
  };

  const handleGuest = () => {
    // 게스트는 그냥 이동 (Meteor.userId() === null 상태로 접근)
    navigate("/shops");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SIKYO</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            주문 취합을 간편하게
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              아이디
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            로그인
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to="/join" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            회원가입
          </Link>
          <button
            type="button"
            onClick={handleGuest}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            게스트로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
