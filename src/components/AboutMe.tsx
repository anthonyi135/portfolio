import { motion } from 'framer-motion';

const AboutMe = () => {
  return (
    <section id="about" className="py-24 px-4 bg-gray-950">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6"
        >
          About Me
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          {/* Add your writeup here! Example: */}
          I am a passionate video production and live broadcast specialist with over 6 yearsof experience in creating compelling visual stories. My expertise spans technical directing, camera operation, and seamless live production for a variety of clients and events.
        </motion.p>
      </div>
    </section>
  );
};

export default AboutMe;
