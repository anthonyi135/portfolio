import { motion } from 'framer-motion';
import { Youtube, Instagram, Music, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'YouTube',
      icon: Youtube,
      url: '#',
      color: 'hover:text-red-500',
      description: 'Long-form content & reels',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: '#',
      color: 'hover:text-pink-500',
      description: 'Behind-the-scenes & stories',
    },
    {
      name: 'TikTok',
      icon: Music,
      url: '#',
      color: 'hover:text-cyan-500',
      description: 'Short-form video content',
    },
  ];

  return (
    <footer className="relative bg-black py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Let's Create Something
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {' '}
                Extraordinary
              </span>
            </h3>
            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
              Available for video production projects, live broadcast consulting, and technical
              directing opportunities.
            </p>
            <a
              href="mailto:contact@example.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Get In Touch
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xl font-bold text-white mb-6">Connect With Me</h4>
            <div className="space-y-4">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                    className={`flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-300 ${link.color}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{link.name}</p>
                      <p className="text-gray-400 text-sm">{link.description}</p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Video Production & Live Broadcast Specialist. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
          >
            <span className="text-sm font-medium">Back to Top</span>
            <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 group-hover:border-blue-500 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30">
              <ArrowUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
