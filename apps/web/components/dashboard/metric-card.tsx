import { Card, CardContent } from "@/components/ui/card";
export function MetricCard({label,value,delta}:{label:string;value:string;delta:string}){return <Card><CardContent><p className="text-xs uppercase tracking-widest text-secondaryText">{label}</p><div className="mt-3 text-3xl font-semibold text-primaryText">{value}</div><p className="mt-2 text-sm text-gold">{delta}</p></CardContent></Card>}
