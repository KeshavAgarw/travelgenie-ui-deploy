"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { getAttractionImageUrl } from "@/lib/attraction-images";

function AttractionPlaceholder() {
  return (
    <div className="flex h-28 items-center justify-center bg-slate-100">
      <MapPin className="size-8 text-slate-300" />
    </div>
  );
}

export function AttractionImage({
  name,
  destination,
}: {
  name: string;
  destination?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAttractionImageUrl(name, destination).then((url) => {
      if (cancelled) return;
      if (url) {
        setSrc(url);
      } else {
        setFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [name, destination]);

  if (!src || failed) {
    return <AttractionPlaceholder />;
  }

  return (
    <div className="relative h-28 w-full">
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 25vw"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
