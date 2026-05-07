import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateSketch } from "@/utils/sketch.functions";
import { buildPrompt, DEFAULT_DESCRIPTION, type WitnessDescription } from "@/lib/witness";
import { rankMatches } from "@/lib/mugshots";
import { Loader2, RefreshCw, Search, FileText, AlertTriangle } from "lucide-react";

const FIELDS: { key: keyof WitnessDescription; label: string; options: string[] }[] = [
  { key: "gender", label: "Gender", options: ["male", "female"] },
  { key: "age_range", label: "Age Range", options: ["10-20","20-30","30-40","40-50","50-60","60+"] },
  { key: "skin_tone", label: "Skin Tone", options: ["fair","light","medium","tan","dark"] },
  { key: "face_shape", label: "Face Shape", options: ["oval","round","square","long","heart"] },
  { key: "eyes", label: "Eye Shape", options: ["almond","round","narrow","hooded"] },
  { key: "eye_color", label: "Eye Color", options: ["brown","blue","green","hazel"] },
  { key: "eyebrows", label: "Eyebrows", options: ["thin","thick","arched","straight"] },
  { key: "nose", label: "Nose", options: ["straight","wide","pointed","flat"] },
  { key: "lips", label: "Lips", options: ["thin","medium","full"] },
  { key: "hair_color", label: "Hair Color", options: ["black","brown","blonde","red","gray","bald"] },
  { key: "hair_style", label: "Hair Style", options: ["short","medium","long","curly","wavy","bald"] },
  { key: "facial_hair", label: "Facial Hair", options: ["none","stubble","goatee","full beard","mustache"] },
  { key: "observation_quality", label: "Witness Reliability", options: ["poor","fair","good","excellent"] },
];

export function ForensicWorkspace() {
  const [d, setD] = useState<WitnessDescription>(DEFAULT_DESCRIPTION);
  const [extra, setExtra] = useState("");
  const [sketch, setSketch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const generate = useServerFn(generateSketch);

  const matches = useMemo(() => rankMatches(d).slice(0, 4), [d, sketch]);
  const prompt = useMemo(() => buildPrompt(d, extra), [d, extra]);

  const update = <K extends keyof WitnessDescription>(k: K, v: WitnessDescription[K]) =>
    setD((s) => ({ ...s, [k]: v }));

  async function onGenerate() {
    setLoading(true); setErr(null);
    const res = await generate({ data: { prompt } });
    setLoading(false);
    if (res.error) setErr(res.error);
    if (res.image) { setSketch(res.image); setRevision((r) => r + 1); setShowResults(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_360px] gap-6">
      {/* Witness form */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-display tracking-widest text-muted-foreground">CASE FILE</p>
            <h2 className="text-lg font-semibold">Witness Statement</h2>
          </div>
          <span className="stamp text-primary text-[10px]">CLASSIFIED</span>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="grid grid-cols-[140px_1fr] items-center gap-2">
              <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">{f.label}</Label>
              <Select value={String(d[f.key])} onValueChange={(v) => update(f.key as any, v as any)}>
                <SelectTrigger className="h-9 bg-input border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}

          {[
            { key: "glasses", label: "Glasses" },
            { key: "scar", label: "Visible Scar" },
            { key: "tattoo", label: "Face Tattoo" },
          ].map((f) => (
            <div key={f.key} className="grid grid-cols-[140px_1fr] items-center gap-2">
              <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">{f.label}</Label>
              <Switch
                checked={(d as any)[f.key]}
                onCheckedChange={(v) => update(f.key as any, v as any)}
              />
            </div>
          ))}
        </div>

        <Button onClick={onGenerate} disabled={loading} className="w-full mt-4 font-display tracking-widest">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> RENDERING…</> :
            sketch ? <><RefreshCw className="mr-2 h-4 w-4" /> REGENERATE SKETCH</> :
            <><FileText className="mr-2 h-4 w-4" /> GENERATE SKETCH</>}
        </Button>
      </Card>

      {/* Sketch canvas */}
      <Card className="relative p-6 bg-card border-border overflow-hidden grid-paper">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-display tracking-widest text-muted-foreground">EXHIBIT A · COMPOSITE</p>
            <h2 className="text-lg font-semibold">Forensic Sketch</h2>
          </div>
          {sketch && <span className="stamp text-accent text-[10px]">REV · {String(revision).padStart(3,"0")}</span>}
        </div>

        <div className="relative aspect-[4/5] max-w-md mx-auto bg-background border-2 border-border rounded scanline">
          {!sketch && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="font-display tracking-widest text-xs text-muted-foreground">AWAITING WITNESS INPUT</p>
              <p className="text-sm text-muted-foreground">Configure features at left, then generate the composite.</p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-display tracking-widest text-xs text-muted-foreground">RENDERING COMPOSITE…</p>
            </div>
          )}
          {sketch && !loading && (
            <img src={sketch} alt="Forensic composite sketch" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        {err && (
          <div className="mt-4 flex items-start gap-2 text-sm text-destructive border border-destructive/40 bg-destructive/10 rounded p-3">
            <AlertTriangle className="h-4 w-4 mt-0.5" /> <span>{err}</span>
          </div>
        )}

        {sketch && (
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                Add More Details
              </Label>
              <Textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value.slice(0, 500))}
                placeholder="e.g. sharp jawline, mole on left cheek, tired eyes, slight smirk…"
                className="mt-1 bg-input border-border min-h-[80px] text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{extra.length}/500</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={onGenerate} disabled={loading} variant="secondary" className="font-display tracking-widest">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> REFINING…</> :
                  <><RefreshCw className="mr-2 h-4 w-4" /> REGENERATE WITH DETAILS</>}
              </Button>
              <Button variant="outline" onClick={() => setShowResults(true)} className="font-display tracking-widest">
                <Search className="mr-2 h-4 w-4" /> RUN DATABASE MATCH
              </Button>
            </div>
          </div>
        )}

        <p className="mt-4 text-[10px] font-display tracking-widest text-muted-foreground text-center">
          PROMPT · {prompt.slice(0, 110)}…
        </p>
      </Card>

      {/* Matches */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-display tracking-widest text-muted-foreground">DATABASE</p>
            <h2 className="text-lg font-semibold">Candidate Matches</h2>
          </div>
          <span className="stamp text-accent text-[10px]">MOCK · DEMO</span>
        </div>

        {!showResults ? (
          <div className="text-sm text-muted-foreground py-12 text-center border border-dashed border-border rounded">
            Generate a sketch and run the database match to see ranked candidates.
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m, i) => {
              const pct = Math.round(m.similarity * 100);
              const tone = pct >= 75 ? "text-primary" : pct >= 55 ? "text-accent" : "text-muted-foreground";
              return (
                <div key={m.id} className="flex gap-3 p-2 border border-border rounded bg-background/40 hover:border-primary/60 transition-colors">
                  <img src={m.image} alt={m.name} loading="lazy" className="h-20 w-16 object-cover rounded-sm grayscale" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{m.name}</p>
                      <span className={`font-display text-sm ${tone}`}>{pct}%</span>
                    </div>
                    <p className="text-[10px] font-display tracking-widest text-muted-foreground">#{m.id} · RANK {i+1}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.record}</p>
                    <div className="mt-2 h-1 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-muted-foreground pt-2">
              Reliability factor applied: <span className="font-display">{d.observation_quality.toUpperCase()}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
