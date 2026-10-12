"use client";

import { useFormState } from "react-dom";
import { submitFeedback } from "@/app/actions";
import { Alert } from "@/components/Alert";
import SubmitButton from "@/components/SubmitButton";
import type { Field, FormDef } from "@/lib/forms";

export default function FeedbackForm({ form, prefill }: { form: FormDef; prefill: Record<string, string> }) {
  const [state, action] = useFormState(submitFeedback.bind(null, form.id), undefined);
  return (
    <form action={action} className="space-y-6">
      {form.sections.map((s) => (
        <section key={s.title} className="card space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-brand-800">{s.title}</h2>
            {s.description && <p className="text-sm text-slate-500">{s.description}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {s.fields.map((f) => (
              <FieldInput key={f.id} field={f} prefill={prefill} />
            ))}
          </div>
        </section>
      ))}
      <section className="card space-y-4">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="declaration" className="mt-1" required />
          <span>I confirm that the information given above is true to the best of my knowledge. (This replaces the signature on the paper form; the date is recorded automatically.)</span>
        </label>
        {state?.error && <Alert>{state.error}</Alert>}
        {state?.errors && (
          <Alert>
            <p className="font-semibold">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5">
              {state.errors.slice(0, 10).map((e) => <li key={e}>{e}</li>)}
              {state.errors.length > 10 && <li>…and {state.errors.length - 10} more</li>}
            </ul>
          </Alert>
        )}
        <SubmitButton>Submit feedback</SubmitButton>
      </section>
    </form>
  );
}

function Req({ on }: { on?: boolean }) {
  return on ? <span className="text-red-500"> *</span> : null;
}

function FieldInput({ field: f, prefill }: { field: Field; prefill: Record<string, string> }) {
  const dv = "prefill" in f && f.prefill ? prefill[f.prefill] ?? "" : "";
  switch (f.type) {
    case "matrix":
      return (
        <div className="sm:col-span-2">
          {f.label && <p className="mb-2 text-sm font-medium text-slate-700">{f.label}<Req on={f.required} /></p>}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th w-10">#</th>
                  <th className="th">Particulars</th>
                  {f.scale.map((o) => (
                    <th key={o.value} className="th text-center normal-case">
                      {f.numeric && <span className="block text-sm text-slate-700">{o.value}</span>}
                      <span className="block font-normal">{o.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {f.items.map((it, i) => (
                  <tr key={it.id} className="hover:bg-brand-50/40">
                    <td className="td text-slate-400">{i + 1}</td>
                    <td className="td">{it.label}</td>
                    {f.scale.map((o) => (
                      <td key={o.value} className="td text-center">
                        <input
                          type="radio"
                          name={`${f.id}.${it.id}`}
                          value={o.value}
                          required={f.required}
                          aria-label={`${it.label}: ${o.label}`}
                          className="h-4 w-4 accent-brand-600"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "radio":
      return (
        <fieldset className={f.options.length > 3 || f.label.length > 50 ? "sm:col-span-2" : ""}>
          <legend className="label">{f.label}<Req on={f.required} /></legend>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                <input type="radio" name={f.id} value={o.value} required={f.required} defaultChecked={dv === o.value} className="accent-brand-600" />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "checkboxes":
      return (
        <fieldset className="sm:col-span-2">
          <legend className="label">{f.label}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {f.options.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={f.id} value={o.value} className="h-4 w-4 accent-brand-600" />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "select":
      return (
        <div>
          <label className="label" htmlFor={f.id}>{f.label}<Req on={f.required} /></label>
          <select className="input" id={f.id} name={f.id} required={f.required} defaultValue={f.options.some((o) => o.value === dv) ? dv : ""}>
            <option value="">Select…</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    case "textarea":
      return (
        <div className="sm:col-span-2">
          <label className="label" htmlFor={f.id}>{f.label}<Req on={f.required} /></label>
          <textarea className="input min-h-[90px]" id={f.id} name={f.id} required={f.required} defaultValue={dv} placeholder={f.placeholder} />
        </div>
      );
    default:
      return (
        <div>
          <label className="label" htmlFor={f.id}>{f.label}<Req on={f.required} /></label>
          <input className="input" id={f.id} name={f.id} type={f.type} required={f.required} defaultValue={dv} placeholder={f.placeholder} />
        </div>
      );
  }
}
