import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateCard = () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      navigate('/budget');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 via-white to-orange-100">
      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-10">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left - Text */}
          <div className="md:w-1/2 text-center md:text-left space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
              Legal Documents,<br />
              <span className="text-orange-600">One Click Away</span>
            </h2>
            <p className="text-lg text-gray-600">
              Manage stamp duties, property transfers, and legal certificates — all under one dashboard.
            </p>
            <button
              onClick={handleCreateCard}
              className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white px-6 py-3 rounded-lg shadow hover:scale-105 transition transform"
            >
              Get Started
            </button>
          </div>

          {/* Right - Features */}
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {[
              {
                title: "🏠 Property Transfer",
                desc: "Ownership change, land registration, and mutation services.",
                color: "text-orange-600",
              },
              {
                title: "💍 Marriage & Divorce Cert.",
                desc: "Legal document handling for marriages and separations.",
                color: "text-blue-600",
              },
              {
                title: "📄 Stamp Duty Management",
                desc: "Track government stamp duties and legal fees accurately.",
                color: "text-purple-600",
              },
              {
                title: "🧾 Document Verification",
                desc: "Fast and reliable verification of official certificates.",
                color: "text-green-600",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
              >
                <h4 className={`font-semibold text-lg mb-1 ${feature.color}`}>
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white text-center text-gray-500 p-4 text-sm shadow-inner">
        &copy; {new Date().getFullYear()} Ellora commercial . Created by Riya
      </footer>
    </div>
  );
};

export default HomePage;
