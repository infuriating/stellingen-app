"use client";

import {
  Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import React, { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "@clerk/nextjs/server";

export default function ActieveStelling(props: {
  preloadedStellingen: Preloaded<typeof api.stelling.getAll>;
  actieveStelling: Preloaded<typeof api.actieveStelling.getActieveStelling>;
  user: User | null;
}) {
  const user = props.user;
  const userId = user?.id;

  const stellingen = usePreloadedQuery(props.preloadedStellingen);
  const stelling = usePreloadedQuery(props.actieveStelling);
  const stemMutation = useMutation(api.stemmen.addStem);

  const [vorigeKeuze, setVorigeKeuze] = useState<string | null>(null);

  const huidigeStelling = stellingen.filter(
    (stellingen) => stelling && stellingen.slug === stelling.stellingSlug
  );
  const huidigeStem = useQuery(api.stemmen.getStem, {
    // @ts-expect-error - userId is possibly undefined
    userId,
    stellingId: huidigeStelling.length > 0 ? huidigeStelling[0]._id : "",
  });

  if (!stellingen) return;
  if (!stelling) return <></>;
  if (!userId) return <></>;

  const stem = async (id: string, keuze: string, keuzeOptie: string) => {
    setVorigeKeuze(keuze);
    await stemMutation({ userId, id, keuze, keuzeOptie });

    if (huidigeStem?.keuze === keuze) {
      toast.success(`Uw keuze ${keuze} voor de stelling is verwijderd!`);
      return;
    }

    if (vorigeKeuze && vorigeKeuze !== keuze) {
      toast.success(`Uw keuze is gewijzigd van ${vorigeKeuze} naar ${keuze}!`);
    } else {
      toast.success(`Uw keuze ${keuze} voor de stelling is geregistreerd!`);
    }
  };

  return (
    <>
      {huidigeStelling.length > 0 ? (
        <Card className="py-4 mb-4">
          <CardHeader>
            <CardTitle>{huidigeStelling[0].stelling}</CardTitle>
            <CardDescription>
              {huidigeStem?.keuze ? (
                <>
                  Uw huidige keuze is:
                  <span className="font-bold"> {huidigeStem.keuze}</span>
                </>
              ) : (
                huidigeStelling.length > 0 && <>U heeft nog niet gestemd!</>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Geen actieve stelling</CardTitle>
            <CardDescription>
              Er is momenteel nog geen actieve stelling.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {huidigeStelling.length > 0 && (
        <div className="grid gap-x-6 gap-y-4 pb-4">
          <Button
            className="h-24 text-lg"
            onClick={() =>
              stem(
                huidigeStelling[0]._id,
                huidigeStelling[0].keuzes.keuze1.naam,
                "keuze1"
              )
            }
          >
            {huidigeStelling[0].keuzes.keuze1.naam}
          </Button>
          <Button
            className="h-24 text-lg"
            onClick={() =>
              stem(
                huidigeStelling[0]._id,
                huidigeStelling[0].keuzes.keuze2.naam,
                "keuze2"
              )
            }
          >
            {huidigeStelling[0].keuzes.keuze2.naam}
          </Button>
          {huidigeStelling[0].keuzes.keuze3.naam && (
            <Button
              className="h-24 text-lg"
              onClick={() =>
                stem(
                  huidigeStelling[0]._id,
                  huidigeStelling[0].keuzes.keuze3.naam,
                  "keuze3"
                )
              }
            >
              {huidigeStelling[0].keuzes.keuze3.naam}
            </Button>
          )}
          {huidigeStelling[0].keuzes.keuze4.naam && (
            <Button
              className="h-24 text-lg"
              onClick={() =>
                stem(
                  huidigeStelling[0]._id,
                  huidigeStelling[0].keuzes.keuze4.naam,
                  "keuze4"
                )
              }
            >
              {huidigeStelling[0].keuzes.keuze4.naam}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
