import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="w-36 h-36 mx-auto mb-10 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl">🎥</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-6 drop-shadow">
            Connect Instantly
          </h1>
          <p className="text-xl text-blue-700 mb-10 max-w-xl mx-auto">
            Experience seamless video conversations with crystal-clear quality and real-time interactions.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              to="/login"
              className="px-10 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg text-lg"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-10 py-4 border-2 border-blue-600 text-blue-700 rounded-full font-semibold hover:bg-blue-50 transition-all shadow text-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-blue-50 shadow-lg">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{feature.title}</h3>
                <p className="text-blue-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: "🎥",
    title: "HD Video Quality",
    description: "Experience crystal-clear video calls with our advanced streaming technology.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your conversations are encrypted and protected with enterprise-grade security.",
  },
  {
    icon: "🌐",
    title: "Global Connectivity",
    description: "Connect with anyone, anywhere in the world with minimal latency.",
  },
];

export default LandingPage; 