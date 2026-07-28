import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminTenant } from "@/hooks/use-tenant";
import { fetchContacts } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/admin/contacts")({
  component: AdminContacts,
});

function AdminContacts() {
  const { tenant } = useAdminTenant();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["admin-contacts", tenant?.id],
    queryFn: () => fetchContacts(tenant!.id),
    enabled: !!tenant?.id,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  const unread = contacts.filter((c) => !c.is_read).length;

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Demandes reçues"
        description={`${contacts.length} message${contacts.length > 1 ? "s" : ""} · ${unread} non lu${unread > 1 ? "s" : ""}`}
      />

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : contacts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun message reçu.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <Card key={c.id} className={!c.is_read ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{c.name}</span>
                      {!c.is_read && <Badge variant="default" className="text-xs">Nouveau</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />{c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />{c.phone}
                        </span>
                      )}
                    </div>
                    {c.message && <p className="text-sm text-foreground whitespace-pre-wrap">{c.message}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : ""}
                    </p>
                  </div>
                  {!c.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead.mutate(c.id)} title="Marquer comme lu">
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
