"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────

interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "number"
    | "tel"
    | "url"
    | "date";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormConfig {
  id: string;
  name: string;
  fields: FormField[];
  successMessage: string;
}

export interface ContactFormBlockProps {
  paddingTop?: string;
  paddingBottom?: string;
  formId: string;
  title?: string;
}

type Status = "idle" | "loading" | "success" | "error";

// ── Component ────────────────────────────────────────────────

export default function ContactFormBlock({
  paddingTop,
  paddingBottom,
  formId,
  title,
}: ContactFormBlockProps) {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [configError, setConfigError] = useState(false);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch form configuration
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/forms/${formId}`);
      if (!res.ok) throw new Error("Form not found");
      const data: FormConfig = await res.json();
      setConfig(data);
      // Initialise values
      const init: Record<string, string | boolean> = {};
      data.fields.forEach((f) => {
        init[f.id] = f.type === "checkbox" ? false : "";
      });
      setValues(init);
    } catch {
      setConfigError(true);
    }
  }, [formId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConfig();
  }, [loadConfig]);

  const handleChange = (
    fieldId: string,
    value: string | boolean
  ) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, data: values }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Submission failed");
      }
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (!config && !configError) {
    return (
      <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-20 px-6`}>
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-8 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-700" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
          <div className="h-11 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </section>
    );
  }

  // ── Config error ──────────────────────────────────────────
  if (configError) {
    return (
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 px-8 py-10 text-center">
          <p className="font-semibold text-destructive">
            Unable to load form. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  // ── Success state ─────────────────────────────────────────
  if (status === "success") {
    return (
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-green-500/30 bg-green-500/5 px-8 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-green-700 dark:text-green-400">
            {config!.successMessage}
          </p>
        </div>
      </section>
    );
  }

  // ── Form ──────────────────────────────────────────────────
  return (
    <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-20 px-6`}>
      <div className="mx-auto max-w-2xl">
        {title && (
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[var(--theme-h2-color,currentColor)] dark:text-white sm:text-4xl">
            {title}
          </h2>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300"
          noValidate
        >
          {config!.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id] ?? ""}
              onChange={(val) => handleChange(field.id, val)}
            />
          ))}

          {status === "error" && (
            <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-medium text-destructive">
              {errorMessage}
            </p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={status === "loading"}
              style={{
                backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary)))",
                color: "var(--theme-button-text, #ffffff)",
                borderRadius: "var(--theme-button-radius, 1rem)",
              }}
              className="w-full font-bold py-6 text-base shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {status === "loading" && (
                <svg
                  className="mr-2 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {status === "loading" ? "Sending…" : "Submit"}
          </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ── Field renderer ────────────────────────────────────────────

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string | boolean;
  onChange: (val: string | boolean) => void;
}) {
  const inputClass =
    "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:border-violet-500 focus:ring-2 focus:ring-theme-primary/30 disabled:opacity-50";

  const labelEl = (
    <label
      htmlFor={field.id}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {field.label}
      {field.required && (
        <span className="ml-1 text-destructive" aria-hidden>
          *
        </span>
      )}
    </label>
  );

  if (field.type === "textarea") {
    return (
      <div>
        {labelEl}
        <textarea
          id={field.id}
          name={field.id}
          rows={5}
          required={field.required}
          placeholder={field.placeholder}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div>
        {labelEl}
        <select
          id={field.id}
          name={field.id}
          required={field.required}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Select an option…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "radio" && field.options) {
    return (
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          {field.label}
          {field.required && (
            <span className="ml-1 text-destructive" aria-hidden>
              *
            </span>
          )}
        </legend>
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                required={field.required}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="h-4 w-4 accent-theme-primary"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-start gap-3">
        <input
          id={field.id}
          type="checkbox"
          name={field.id}
          required={field.required}
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded accent-theme-primary"
        />
        <span className="text-sm text-foreground">{field.label}</span>
      </label>
    );
  }

  // Default: text / email / number / tel / url / date
  return (
    <div>
      {labelEl}
      <input
        id={field.id}
        type={field.type}
        name={field.id}
        required={field.required}
        placeholder={field.placeholder}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
