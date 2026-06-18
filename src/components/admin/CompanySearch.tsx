import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Building2, Loader2 } from "lucide-react";

type CompanyResult = {
  siren: string;
  nom_complet: string;
  siege: {
    siret: string;
    adresse: string;
    code_postal: string;
    libelle_commune: string;
    libelle_voie: string;
    numero_voie: string;
    type_voie: string;
  };
};

type CompanyData = {
  company_name: string;
  siret: string;
  address: string;
  city: string;
};

interface CompanySearchProps {
  onSelect: (data: CompanyData) => void;
}

export function CompanySearch({ onSelect }: CompanySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function search(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(q)}&per_page=5`
        );
        const data = await res.json();
        setResults(data.results || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }

  function handleSelect(r: CompanyResult) {
    const s = r.siege;
    const streetParts = [s.numero_voie, s.type_voie, s.libelle_voie].filter(Boolean).join(" ");
    const address = streetParts || s.adresse || "";

    onSelect({
      company_name: r.nom_complet,
      siret: s.siret,
      address,
      city: s.libelle_commune || "",
    });

    setQuery(r.nom_complet);
    setShowDropdown(false);
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      <Label className="flex items-center gap-1.5">
        <Search className="h-3.5 w-3.5" />
        Rechercher une entreprise (SIRET ou nom)
      </Label>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Ex: 12345678901234 ou Plomberie Dupont"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.siren}
              type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-accent/50 transition-colors border-b border-border last:border-0"
              onClick={() => handleSelect(r)}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{r.nom_complet}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    SIRET: {r.siege.siret} — {r.siege.libelle_commune}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && !isLoading && query.length >= 3 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground text-center">
          Aucun résultat trouvé
        </div>
      )}
    </div>
  );
}
