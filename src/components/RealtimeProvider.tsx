import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("supabase-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["featured-products"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["product"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["settings-pix"] });
          queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return <>{children}</>;
};
