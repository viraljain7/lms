import { useState } from 'react';
import { assets } from '../assets/assets';
import Footer from './student/Footer';

export default function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState('overview');

  const sections = {
    overview: {
      title: 'Overview',
      icon: '📋',
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            At Edemy LMS, we respect your privacy and are committed to protecting your personal information. 
            This policy explains how we collect, use, and safeguard your data when you use our learning platform.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Transparent</h3>
              <p className="text-blue-800 text-sm">We clearly explain what data we collect and why</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-600">
              <h3 className="text-xl font-semibold text-green-900 mb-2">Secure</h3>
              <p className="text-green-800 text-sm">Your data is protected with industry-standard security</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600">
              <h3 className="text-xl font-semibold text-purple-900 mb-2">Your Control</h3>
              <p className="text-purple-800 text-sm">You have full control over your personal information</p>
            </div>
          </div>
        </div>
      )
    },
    collection: {
      title: 'Data Collection',
      icon: '📊',
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">What Information We Collect</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-3xl">👤</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Account Information</h4>
                <p className="text-gray-600 text-sm">Name, email address, password, profile picture, and basic profile details when you register for an account.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="text-3xl">📚</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Course Activity</h4>
                <p className="text-gray-600 text-sm">Your learning progress, quiz results, assignments, discussion posts, and course interactions.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-3xl">💳</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Payment Details</h4>
                <p className="text-gray-600 text-sm">Billing information processed securely through our trusted third-party payment processors.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
              <div className="text-3xl">📱</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Device & Usage Data</h4>
                <p className="text-gray-600 text-sm">IP address, browser type, device information, pages visited, and how you interact with our platform.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
              <div className="text-3xl">💬</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Communications</h4>
                <p className="text-gray-600 text-sm">Messages, emails, and feedback you send to us, instructors, or other users on the platform.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    usage: {
      title: 'How We Use Data',
      icon: '⚙️',
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">How We Use Your Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h4 className="font-semibold text-gray-800">Service Delivery</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Provide access to courses and content</li>
                <li>• Process enrollments and payments</li>
                <li>• Track your learning progress</li>
                <li>• Issue certificates upon completion</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h4 className="font-semibold text-gray-800">Personalization</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Recommend relevant courses</li>
                <li>• Customize your experience</li>
                <li>• Remember your preferences</li>
                <li>• Tailor content to your interests</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h4 className="font-semibold text-gray-800">Communications</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Send course updates and notifications</li>
                <li>• Respond to your inquiries</li>
                <li>• Deliver important announcements</li>
                <li>• Send marketing emails (with consent)</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="font-semibold text-gray-800">Security & Legal</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Protect against fraud and abuse</li>
                <li>• Enforce our terms and policies</li>
                <li>• Comply with legal obligations</li>
                <li>• Resolve disputes and issues</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">💡</span>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Marketing Communications</h4>
                <p className="text-yellow-800 text-sm">We only send marketing emails with your consent. You can unsubscribe at any time using the link in our emails.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
  
  };

  return (
    <>
      <main className="w-full  to-white min-h-screen">
        {/* Hero Section -- bg-gradient-to-b from-cyan-100/40*/}
        <div className="text-black py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
            
              <h1 className="text-5xl md:text-6xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-xl opacity-90 mb-2">Your privacy matters to us</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex overflow-x-auto scrollbar-hide">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === key
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-blue-600'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {sections[activeTab].content}
          </div>

        
        </div>
      </main>
      <Footer />
    </>
  );
}