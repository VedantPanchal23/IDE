import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is CodeAI?',
    answer: 'CodeAI is an AI-powered integrated development environment (IDE) designed to make coding faster, smarter, and more efficient. It integrates advanced artificial intelligence features directly into your workflow.',
  },
  {
    question: 'Which languages does CodeAI support?',
    answer: 'CodeAI supports a wide range of popular programming languages, including JavaScript, Python, Java, C++, Go, Rust, and more. Our AI models are trained to understand the nuances of each language.',
  },
  {
    question: 'Is my code secure with CodeAI?',
    answer: 'Absolutely. We take security and privacy very seriously. Your code is never stored on our servers or used for training our models without your explicit consent. All processing is done securely.',
  },
  {
    question: 'How do I get started with the early access program?',
    answer: 'You can sign up for the early access program by clicking the "Get Early Access" button on our homepage. We are gradually rolling out access to more users and will notify you as soon as a spot is available.',
  },
  {
    question: 'Can I use CodeAI with my existing tools and workflows?',
    answer: 'Yes, CodeAI is designed to integrate seamlessly with your existing development environment. It can be used as a standalone IDE or as a plugin for popular editors like VS Code, JetBrains IDEs, and more.',
  },
];

const AccordionItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-vscode-border">
      <button
        className="w-full flex justify-between items-center text-left py-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl font-medium text-white">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-300 leading-relaxed">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-vscode-dark">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-400">
            Have questions? We've got answers.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} item={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
