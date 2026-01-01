"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import locales from "@/locales/hero.json";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const floatingVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary/40 via-background to-accent/20 py-20 lg:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary"
              variants={itemVariants as any}
            >
              <Sparkles className="h-4 w-4" />
              <span>Tu belleza, nuestra pasión</span>
            </motion.div>

            <motion.h1
              className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-balance"
              variants={itemVariants as any}
            >
              Transforma tu <span className="text-primary">belleza</span> con
              nosotros
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground leading-relaxed max-w-xl"
              variants={itemVariants as any}
            >
              En BeautyRoom te ofrecemos una experiencia única de cuidado
              personal. Nuestro equipo de estilistas expertos está listo para
              realzar tu belleza natural.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              variants={itemVariants as any}
            >
              <Link href="/citas">
                <Button
                  size="lg"
                  className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg text-white bg-[#9E6034]"
                >
                  <Calendar className="h-5 w-5" />
                  Agendar Cita
                </Button>
              </Link>
              <Link href="/servicios">
                <Button
                  size="lg"
                  variant="outline"
                  className="transition-all duration-300 hover:scale-105 bg-transparent"
                >
                  Ver Servicios
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative hidden lg:block"
            variants={imageVariants as any}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={locales.main.src.replace(/^\/public/, "")}
                alt={locales.main.alt}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <motion.div
              className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-xl"
              variants={floatingVariants as any}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img
                    src={locales.gallery[0].src.replace(/^\/public/, "")}
                    alt={locales.gallery[0].alt}
                    className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  />
                  <img
                    src={locales.gallery[1].src.replace(/^\/public/, "")}
                    alt={locales.gallery[1].alt}
                    className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  />
                  <img
                    src={locales.gallery[2].src.replace(/^\/public/, "")}
                    alt={locales.main.alt}
                    className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">+2,500 clientes</p>
                  <p className="text-xs text-muted-foreground">satisfechos</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}