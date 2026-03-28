import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => (
  <Sonner
    theme="light"
    className="toaster"
    toastOptions={{
      classNames: {
        toast:
          "group rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-lg",
        title: "text-sm font-semibold",
        description: "text-sm text-slate-600",
      },
    }}
    {...props}
  />
);

export { Toaster };
