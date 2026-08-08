import * as React from "react"; import { cn } from "@/lib/utils";
export function Input({className,...props}:React.InputHTMLAttributes<HTMLInputElement>){return <input className={cn("w-full rounded-xl border border-borderline bg-[#030b16] px-3 py-2 text-sm text-primaryText outline-none ring-gold/30 placeholder:text-secondaryText focus:ring-2",className)} {...props}/>}
