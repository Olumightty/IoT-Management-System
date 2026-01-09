import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <section className="space-y-10">
      {children}
    </section>
  );
}
