"use client";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormField } from "@/components/form/FormField";

type FormValues = { feedback: string };

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>();
  function onSubmit() {
    setSubmitted(true);
  }
  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <h1 className="font-display text-4xl leading-[1.05]">Feedback</h1>
      {!submitted ? (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="feedback"
              label="Your thoughts"
              hint="Tell us what would make this better"
            >
              {({ id, error, field }) => (
                <textarea
                  id={id}
                  aria-invalid={!!error}
                  aria-describedby={`${id}-hint`}
                  {...field}
                  required
                  className="w-full h-40 rounded-lg border px-3 py-2"
                />
              )}
            </FormField>
            <button type="submit" className="btn btn-primary">
              Send feedback
            </button>
          </form>
        </FormProvider>
      ) : (
        <p className="text-sm text-muted-foreground">
          Thanks! We appreciate it.
        </p>
      )}
    </main>
  );
}
