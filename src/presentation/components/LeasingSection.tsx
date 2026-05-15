"use client";

import { motion } from "framer-motion";
import { Battery, Shield, Settings, Zap } from "lucide-react";

const features = [
  {
    title: "All-Inclusive Lease",
    description: "Lease price includes registration, insurance, and maintenance.",
    icon: Shield,
    color: "text-blue-400"
  },
  {
    title: "Minimum Deposit",
    description: "Start driving with the lowest upfront cost in the market.",
    icon: Zap,
    color: "text-yellow-400"
  },
  {
    title: "24/7 Support",
    description: "Dedicated fleet support for service, repair, and warranty claims.",
    icon: Settings,
    color: "text-purple-400"
  },
  {
    title: "Battery Analytics",
    description: "Real-time health monitoring to ensure maximum vehicle uptime.",
    icon: Battery,
    color: "text-green-400"
  }
];

export default function LeasingSection() {
  return (
    <section id="leasing" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">Why Lease with <span className="text-primary">ZMR?</span></h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            We've simplified the transition to electric mobility. Focus on your business 
            while we handle the vehicle lifecycle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 hover:border-primary/50 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 glass-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-accent/20 eco-glow">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold italic">Ready to make the switch?</h3>
            <p className="text-white/60">Choose the perfect vehicle configuration for your fleet objectives.</p>
          </div>
          <button className="bg-accent text-background px-10 py-4 rounded-xl font-extrabold hover:bg-accent/90 transition-all uppercase tracking-wider text-sm">
            Explore Vehicle Categories
          </button>
        </div>
      </div>
    </section>
  );
}
