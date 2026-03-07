import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function HeaderTitle({ title, description, className }: { title: string, description: string, className?: string }) {
    return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={cn("text-center", className)}
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 glow-text">
            {title}
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            {description}
          </p>
        </motion.div>
    )
}