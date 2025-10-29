import React from 'react';
import { FaWaveSquare, FaUsers, FaClock, FaChartBar, FaShieldAlt, FaBolt, FaCheckCircle,  FaHeadphones, FaGlobe } from 'react-icons/fa';
import { TypeAnimation } from 'react-type-animation';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Professional Audio Workstation',
    icon: <FaWaveSquare className="text-purple-600 text-2xl" />,
    description:
      'Advanced audio editing tools with waveform visualization, clipping, and real-time processing capabilities.',
  },
  {
    title: 'Team Collaboration',
    icon: <FaUsers className="text-purple-600 text-2xl" />,
    description:
      'Organize teams by city and FM stations with dedicated Quality and Labelling teams for efficient workflow management.',
  },
  {
    title: 'Real-time Processing',
    icon: <FaClock className="text-purple-600 text-2xl" />,
    description:
      'Streamlined clip assignment, progress tracking, and real-time collaboration for maximum productivity.',
  },
  {
    title: 'Comprehensive Analytics',
    icon: <FaChartBar className="text-purple-600 text-2xl" />,
    description:
      'Complete history tracking and performance analytics for data-driven decision making.',
  },
  {
    title: 'Secure & Reliable',
    icon: <FaShieldAlt className="text-purple-600 text-2xl" />,
    description:
      'Enterprise-grade security with role-based access control and data protection.',
  },
  {
    title: 'Lightning Fast',
    icon: <FaBolt className="text-purple-600 text-2xl" />,
    description:
      'Optimized performance for handling large audio files and complex processing tasks.',
  },
];
const modals = [
 "Centralized audio content management",
    "Multi-team collaboration across cities",
    "Quality assurance workflows",
    "Real-time progress tracking",
    "Automated clip processing",
    "Performance analytics and reporting",
];
const stats = [
    { icon: <FaHeadphones size={28} />, label: "Audio Clips Processed", value: "2,847" },
    { icon: <FaUsers size={28} />, label: "Active Teams", value: "24" },
    { icon: <FaGlobe size={28} />, label: "Cities Connected", value: "12" },
    { icon: <FaChartBar size={28} />, label: "Efficiency Rate", value: "95%" },
  ];


const Home = () => {
   
  const navigate=useNavigate();
  // const MotionLink = motion(Link);


  return (
    <>
    <div>
    <div className="relative min-h-screen bg-cover bg-center text-center px-6" style={{ backgroundImage: "url('/images/image.png')" }}>
      
     <nav className="w-full absolute top-0 left-0 px-6 py-4 flex justify-between items-center bg-white/30 backdrop-blur-md shadow-md z-20">
        {/* Logo */}
       <img src="/images/logo1.png" alt="Logo" className="h-16 md:h-16" />
        {/* Nav Links */}
        <ul className="flex gap-6 text-gray-800 font-medium">
          <li>
            <a href="#features" className="hover:text-purple-700 transition">
              Features
            </a>
          </li>
          <li>
            <a href="#about" className="hover:text-purple-700 transition">
              About Us
            </a>
          </li>
          <li>
            <Link
              to="/login"
              className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition"
            >
              Start Now
            </Link>
          </li>
        </ul>
      </nav>
      {/* Optional background overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0" />

      {/* ✅ Hero Content */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col justify-center items-center min-h-screen">
        <TypeAnimation
          sequence={['Audio Content Management System', 1000, '']}
          wrapper="span"
          speed={50}
          repeat={Infinity}
          className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 font-bold text-sm md:text-base mb-2"
        />

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
          Transform Your <span className="text-yellow-700">Audio Workflow</span>
        </h1>

        <p className="text-gray-800 text-lg mb-8">
          A comprehensive platform for managing radio content, team collaboration, and audio processing workflows.
          Streamline your operations with professional-grade tools designed for modern audio teams.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/login"><button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium">
            Get Started →
          </button></Link>
          <button className="bg-white/80 text-gray-900 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-200 font-medium">
            Learn More
          </button>
        </div>
      </div>
    </div>
</div>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
<section id="features" className="py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Everything You Need for Audio Management
        </h2>
        <p className="text-gray-500 mt-2 text-lg max-w-xl mx-auto">
          Powerful features designed to streamline your audio content workflow from upload to delivery.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-purple-600 transition duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full mb-4 transition group-hover:scale-110">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
      <section id="about"className="bg-white py-16 px-4 sm:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
        <p className="text-lg text-gray-600 mb-10 max-w-3xl">
          Built specifically for radio stations and audio content teams, our platform offers unmatched efficiency and collaboration capabilities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {modals.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 hover:text-green-600 transition-colors duration-300">
              <FaCheckCircle className="text-green-500 mt-1" />
              <p className="text-base text-gray-800">{item}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="border rounded-xl p-6 text-center shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-purple-600 group-hover:scale-110 transition-transform duration-300 mb-2">
                {stat.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-800 to-black text-white py-24">
      <div className="container mx-auto px-6 lg:px-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-extrabold mb-6"
        >
          🎧 Audio Content Management System
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-lg md:text-2xl font-light max-w-3xl mx-auto"
        >
          Centralized audio control. Real-time collaboration. Trusted by professionals across cities.
        </motion.p>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }} onClick={()=>navigate('/login')}
        className="cursor-pointer mt-10 bg-white text-purple-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-purple-100"
      >
        Get Started Now
      </motion.button>
      </div>

      {/* SVG Wave Animation */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" id="start" >
        <path
          fill="#fff"
          fillOpacity="0.1"
          d="M0,192L60,181.3C120,171,240,149,360,138.7C480,128,600,128,720,144C840,160,960,192,1080,192C1200,192,1320,160,1380,144L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        ></path>
      </svg>
    </div>
     </>
  );
};

export default Home;
