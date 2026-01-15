import { useState } from "react";
import Footer from "./student/Footer";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const About = () => {
	const { user } = useUser();
	const { openSignIn } = useClerk();
	const [openFaq, setOpenFaq] = useState(null);

	const toggleFaq = (index) => {
		setOpenFaq(openFaq === index ? null : index);
	};

	const faqs = [
		{
			question: "How do I get started?",
			answer: "Getting started is easy! Simply click the 'Get Started' button to create your account. Once registered, you can browse our course catalog, enroll in courses that interest you, and start learning immediately. If you're an educator, you can apply to become an instructor and start creating your own courses."
		},
		{
			question: "What types of courses are available?",
			answer: "Edemy LMS offers a wide variety of courses across multiple categories including technology, business, design, personal development, languages, and more. Our courses range from beginner to advanced levels, ensuring there's something for everyone regardless of your skill level."
		},
		{
			question: "How much do courses cost?",
			answer: "Course pricing varies depending on the content, duration, and instructor. We offer both free and paid courses. Many courses are available at affordable prices, and we frequently run promotions and discounts. You can also find bundle deals that offer multiple courses at a reduced rate."
		},
		{
			question: "Can I access courses on mobile devices?",
			answer: "Absolutely! Edemy LMS is fully responsive and works seamlessly across all devices including smartphones, tablets, and desktop computers. You can learn on the go, pick up where you left off, and access your courses anytime, anywhere with an internet connection."
		},
		{
			question: "Do I get a certificate after completing a course?",
			answer: "Yes! Upon successful completion of a course, you'll receive a certificate of completion that you can share on your LinkedIn profile, resume, or portfolio. This certificate validates your newly acquired skills and knowledge."
		},
		{
			question: "How long do I have access to a course?",
			answer: "Once you enroll in a course, you have lifetime access to it. This means you can learn at your own pace, revisit materials whenever you need a refresher, and benefit from any updates the instructor makes to the course content."
		},
		{
			question: "Can I become an instructor on Edemy LMS?",
			answer: "Yes! We welcome passionate educators and subject matter experts to join our platform as instructors. You can apply through our instructor application process. Once approved, you'll have access to our course creation tools and support to help you build and launch your courses."
		},
		{
			question: "What if I'm not satisfied with a course?",
			answer: "We offer a 30-day money-back guarantee on most paid courses. If you're not satisfied with your purchase, you can request a full refund within 30 days of enrollment, no questions asked. Your satisfaction is our priority."
		},
		{
			question: "How do I track my learning progress?",
			answer: "Our platform includes a comprehensive progress tracking system. You can view your completion percentage, track quiz scores, monitor assignment submissions, and see your overall learning journey through your personalized dashboard."
		},
		{
			question: "Is there support available if I need help?",
			answer: "Yes! We provide multiple support channels including email support, a comprehensive help center with articles and tutorials, and community forums where you can connect with other learners and instructors. Premium course enrollments may also include direct instructor support."
		}
	];

	return (
		<>
			<div className="max-w-8xl mx-auto px-6 py-12 ">
			{/* bg-gradient-to-b from-cyan-100/30 */}
			
			<div className="max-w-6xl mx-auto">	{/* Hero Section */}
				<div className="text-center mb-16 ">
					<h1 className="text-5xl font-bold text-gray-800 mb-6">
						About Edemy LMS
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Empowering learners and educators with a seamless online learning
						experience that transforms education into an engaging journey.
					</p>

				</div>

				{/* Stats Section */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
					<div className="text-center p-6 bg-white rounded-lg shadow-md  hover:shadow-xl transition-shadow duration-300 border-2 border-blue-100 ">
						<div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
						<div className="text-gray-600">Active Students</div>
					</div>
					<div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl border-2 border-blue-100 transition-shadow duration-300">
						<div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
						<div className="text-gray-600">Expert Instructors</div>
					</div>
					<div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl border-2 border-blue-100 transition-shadow duration-300">
						<div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
						<div className="text-gray-600">Quality Courses</div>
					</div>
					<div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl border-2 border-blue-100 transition-shadow duration-300">
						<div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
						<div className="text-gray-600">Satisfaction Rate</div>
					</div>
				</div>

				{/* Mission Section */}
				<div className="bg-white p-8 rounded-lg shadow-lg mb-12">
					<h2 className="text-3xl font-semibold text-gray-800 mb-4">
						Our Mission
					</h2>
					<p className="text-lg text-gray-600 leading-relaxed">
						At Edemy LMS, we strive to make education accessible and engaging
						for everyone. Our platform bridges the gap between students and
						educators by providing high-quality courses, interactive learning
						tools, and an intuitive user experience. We believe that learning
						should be flexible, affordable, and available to anyone with the
						desire to grow.
					</p>
				</div>

				{/* Why Choose Us Section */}
				<div className="mb-16">
					<h2 className="text-3xl font-semibold text-gray-800 text-center mb-10">
						Why Choose Edemy LMS?
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="p-8 bg-white border-2 border-blue-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
							<div className="text-5xl mb-4">📚</div>
							<h3 className="text-2xl font-semibold text-gray-700 mb-3">
								Quality Courses
							</h3>
							<p className="text-gray-600">
								Learn from expert educators through well-structured and engaging
								courses designed to deliver real-world skills and knowledge.
							</p>
						</div>
						<div className="p-8 bg-white border-2 border-blue-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
							<div className="text-5xl mb-4">🚀</div>
							<h3 className="text-2xl font-semibold text-gray-700 mb-3">
								Interactive Learning
							</h3>
							<p className="text-gray-600">
								Our platform includes real-time progress tracking, quizzes,
								hands-on projects, and interactive assignments to enhance your
								learning experience.
							</p>
						</div>
						<div className="p-8 bg-white border-2 border-blue-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
							<div className="text-5xl mb-4">🌍</div>
							<h3 className="text-2xl font-semibold text-gray-700 mb-3">
								Global Access
							</h3>
							<p className="text-gray-600">
								Learn anytime, anywhere, on any device with a seamless
								experience. Your education fits your schedule, not the other way
								around.
							</p>
						</div>
						<div className="p-8 bg-white border-2 border-blue-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
							<div className="text-5xl mb-4">💡</div>
							<h3 className="text-2xl font-semibold text-gray-700 mb-3">
								Personalized Learning
							</h3>
							<p className="text-gray-600">
								Get course recommendations based on your interests and learning
								goals. Track your progress and earn certificates to showcase
								your achievements.
							</p>
						</div>
						<div className="p-8 bg-white border-2 border-blue-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
							<div className="text-5xl mb-4">👥</div>
							<h3 className="text-2xl font-semibold text-gray-700 mb-3">
								Community Support
							</h3>
							<p className="text-gray-600">
								Join a vibrant community of learners and educators. Collaborate,
								share insights, and grow together in a supportive learning
								environment.
							</p>
						</div>
						<div className="p-8 bg-white border-2 border-blue-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
							<div className="text-5xl mb-4">🎓</div>
							<h3 className="text-2xl font-semibold text-gray-700 mb-3">
								Certified Learning
							</h3>
							<p className="text-gray-600">
								Earn recognized certificates upon course completion that you can
								add to your resume and share with potential employers.
							</p>
						</div>
					</div>
				</div>

				{/* FAQ Section */}
				<div className="mb-16">
					<h2 className="text-3xl font-semibold text-gray-800 text-center mb-10">
						Frequently Asked Questions
					</h2>
					<div className="max-w-4xl mx-auto space-y-4">
						{faqs.map((faq, index) => (
							<div
								key={index}
								className="bg-white rounded-lg shadow-md overflow-hidden"
							>
								<button
									onClick={() => toggleFaq(index)}
									className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
								>
									<span className="text-lg font-semibold text-gray-800">
										{faq.question}
									</span>
									<svg
										className={`w-6 h-6 text-blue-600 transform transition-transform duration-200 ${
											openFaq === index ? "rotate-180" : ""
										}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								<div
									className={`transition-all duration-300 ease-in-out ${
										openFaq === index
											? "max-h-96 opacity-100"
											: "max-h-0 opacity-0"
									} overflow-hidden`}
								>
									<div className="px-6 pb-5 text-gray-600 leading-relaxed">
										{faq.answer}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* CTA Section */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-12 text-center text-white">
					<h2 className="text-4xl font-bold mb-4">
						Ready to Start Your Learning Journey?
					</h2>
					<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
						Whether you're a student looking to enhance your skills or an
						educator wanting to share knowledge, Edemy LMS is the perfect
						platform for you.
					</p>

					{user ? (
						<Link
							to="/"
							className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
						>
							Explore Courses
						</Link>
					) : (
						<button
							onClick={() => openSignIn()}
							className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
						>
							Get Started Now
						</button>
					)}
				</div>
				</div>
			</div>
			<Footer />
		</>
	);
};

export default About;