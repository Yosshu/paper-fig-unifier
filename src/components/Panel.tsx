import type { ReactNode } from 'react'

export function Panel({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2 className="panel-title">
        <span className="step" aria-hidden="true">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}
