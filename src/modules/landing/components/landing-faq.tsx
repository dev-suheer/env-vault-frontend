"use client";

import { useState } from "react";
import { LandingReveal } from "@/modules/landing/components/landing-reveal";

const questions = [
  {
    q: "Who can see an env file?",
    a: "Personal envs are private to the owner. Project envs follow workspace membership: the project manager and invited developers with view or edit access.",
  },
  {
    q: "What happens when I delete something?",
    a: "Records are marked deleted and disappear from the app. They stay in the database so a restore path remains possible.",
  },
  {
    q: "Do you store secret values in the audit log?",
    a: "No. The audit log records who changed what and when: names and descriptions, not variable values.",
  },
  {
    q: "Can I invite people who do not have an account yet?",
    a: "Invite by email. They receive a notification, accept, and join the workspace with the access you chose.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14 sm:scroll-mt-24 sm:px-6 sm:py-28">
      <LandingReveal>
        <h2 className="text-center text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-5xl">
          Common <span className="text-brand-600 dark:text-brand-500">questions.</span>
        </h2>
      </LandingReveal>
      <div className="mt-10 divide-y divide-line dark:divide-ink-700">
        {questions.map((item, index) => (
          <LandingReveal key={item.q} delay={index * 50}>
            <FaqItem question={item.q} answer={item.a} />
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-4">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left text-[15px] font-semibold sm:gap-4 sm:text-base"
        onClick={() => setOpen((value) => !value)}
      >
        {question}
        <span
          className={`shrink-0 text-mute transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:text-ink-400 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className={`mt-3 text-sm leading-6 text-mute transition-opacity duration-300 dark:text-ink-400 ${open ? "opacity-100" : "opacity-0"}`}>
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
