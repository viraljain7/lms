import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!path) return;

    const timer = setTimeout(() => {
      navigate(`/${path}`);
      // console.log(path)
    }, 2000);

    return () => clearTimeout(timer);
  }, [path, navigate]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <div className="flex space-x-3 mb-4">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
        <div className="w-4 h-4 bg-green-500 rounded-full animate-ping animation-delay-200"></div>
        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-ping animation-delay-400"></div>
      </div>
      <p className="text-gray-600 font-medium">
        Processing payment, please wait...
      </p>
    </div>
  );
};

export default Loading;