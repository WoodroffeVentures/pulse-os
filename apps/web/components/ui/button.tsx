import * as React from "react"; import { cn } from "@/lib/utils";
export function Button({className, variant="primary", ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?:"primary"|"ghost"|"danger"}){
 const map={primary:"bg-gold text-[#08111f] hover:opacity-90", ghost:"bg-white/5 text-primaryText hover:bg-white/10", danger:"bg-critical text-white hover:opacity-90"};
 return <button className={cn("inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50", map[variant], className)} {...props}/>;
}
