import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminTenant } from "@/hooks/use-tenant";
import {
  fetchActiveBrands,
  fetchTenantBrands,
  addTenantBrand,
  removeTenantBrand,
  setTenantBrandFeatured,
  BRAND_CATEGORY_OPTIONS,
} from "@/lib/brands";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/brands")({
  component: AdminBrandsPage,
});

function AdminBrandsPage() {
  const { tenant } = useAdminTenant();
  const queryClient = useQueryClient();

  const { data: allBrands = [], isLoading: loadingAll } = useQuery({
    queryKey: ["active-brands"],
    queryFn: fetchActiveBrands,
  });

  const { data: selection = [], isLoading: loadingSelection } = useQuery({
    queryKey: ["tenant-brands", tenant?.id],
    queryFn: () => fetchTenantBrands(tenant!.id),
    enabled: !!tenant?.id,
  });

  const selectedMap = new Map(selection.map((s) => [s.brand_id, s]));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tenant-brands", tenant?.id] });

  const toggleMutation = useMutation({
    mutationFn: async ({ brandId, checked }: { brandId: string; checked: boolean }) => {
      if (checked) await addTenantBrand(tenant!.id, brandId);
      else await removeTenantBrand(tenant!.id, brandId);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const featuredMutation = useMutation({
    mutationFn: ({ brandId, featured }: { brandId: string; featured: boolean }) =>
      setTenantBrandFeatured(tenant!.id, brandId, featured),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  const isLoading = loadingAll || loadingSelection;
  const grouped = BRAND_CATEGORY_OPTIONS.map((category) => ({
    category,
    brands: allBrands.filter((b) => b.category === category),
  })).filter((g) => g.brands.length > 0);
  const uncategorized = allBrands.filter((b) => !b.category);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mes marques"
        description="Sélectionnez les marques avec lesquelles vous travaillez, parmi le catalogue géré par la plateforme. Étoilez celles à mettre en avant."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : allBrands.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune marque disponible pour le moment dans le catalogue.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[...grouped, ...(uncategorized.length > 0 ? [{ category: "Autres", brands: uncategorized }] : [])].map(
            (group) => (
              <div key={group.category} className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{group.category}</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.brands.map((b) => {
                    const sel = selectedMap.get(b.id);
                    const checked = !!sel;
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "flex items-center gap-3 rounded-md border p-3 transition-colors",
                          checked ? "border-primary/40 bg-primary/5" : "border-border",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleMutation.mutate({ brandId: b.id, checked: !!v })}
                        />
                        <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted/40">
                          {b.logo_url ? (
                            <img src={b.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                          ) : null}
                        </div>
                        <span className="flex-1 truncate text-sm text-foreground">{b.name}</span>
                        {checked && (
                          <button
                            type="button"
                            aria-label={sel!.is_featured ? "Retirer la mise en avant" : "Mettre en avant"}
                            onClick={() => featuredMutation.mutate({ brandId: b.id, featured: !sel!.is_featured })}
                            className="shrink-0 text-muted-foreground hover:text-amber-500"
                          >
                            <Star className={cn("h-4 w-4", sel!.is_featured && "fill-amber-400 text-amber-500")} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
