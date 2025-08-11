import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "CodeAI has fundamentally changed the way I work. The AI code completion is so intuitive, it feels like it's reading my mind. I'm shipping features twice as fast.",
    name: 'Sarah T.',
    title: 'Senior Frontend Developer @ Innovate Inc.',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  },
  {
    quote: "The intelligent debugging feature is a lifesaver. It catches subtle bugs that would have taken me hours to find. I can't imagine going back to my old workflow.",
    name: 'Mike R.',
    title: 'Backend Engineer @ Tech Solutions',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
  },
  {
    quote: "As a team lead, the collaborative coding features are invaluable. My team is more in sync than ever, and code reviews are a breeze with AI-powered suggestions.",
    name: 'Jessica L.',
    title: 'Engineering Manager @ CodeCrafters',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-vscode-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Loved by Developers Worldwide</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what developers are saying about CodeAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-vscode-dark p-8 rounded-lg border border-vscode-border flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <p className="text-gray-300 italic mb-6 flex-grow">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
