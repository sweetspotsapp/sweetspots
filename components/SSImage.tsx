import { getReadSas } from "@/endpoints/upload/endpoints";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ImageProps, ActivityIndicator, View, ImageURISource } from "react-native";

const AZURE_BUCKET_BASE = "https://sweetspotsbucket.blob.core.windows.net/";
const MARKER = "/place-medias/";

function extractBlobAfterMarker(url: string): string | null {
  const clean = url.split("?")[0];
  const idx = clean.indexOf(MARKER);
  if (idx === -1) return null;
  return clean.substring(idx + MARKER.length);
}

type Source = ImageProps["source"];

export const SSImage: React.FC<ImageProps> = (props) => {
  const { source, onError, onLoadEnd, style, ...rest } = props;
  const [resolvedSource, setResolvedSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(false);

  const primaryUriSource: ImageURISource | null = useMemo(() => {
    if (!source) return null;
    if (typeof source === "number") return null;
    if (Array.isArray(source)) return source[0] ?? null;
    return source as ImageURISource;
  }, [source]);

  useEffect(() => {
    let alive = true;

    const resolve = async () => {
      if (!primaryUriSource || !primaryUriSource.uri) {
        setResolvedSource(source ?? null);
        return;
      }

      const uri = primaryUriSource.uri;
      const isAzure = uri.startsWith(AZURE_BUCKET_BASE) && uri.includes(MARKER);
      if (!isAzure) {
        setResolvedSource(source ?? null);
        return;
      }

      const blob = extractBlobAfterMarker(uri);
      if (!blob) {
        setResolvedSource(source ?? null);
        return;
      }

      setLoading(true);
      try {
        const read = await getReadSas(blob);
        const readUrl = read?.data?.url;
        if (alive) setResolvedSource(readUrl ? { uri: readUrl } : source ?? null);
      } catch (e) {
        console.error("SSImage getReadSas error:", e);
        if (alive) setResolvedSource(source ?? null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    resolve();
    return () => {
      alive = false;
    };
  }, [primaryUriSource?.uri]); // ✅ safer dependency — no infinite loop

  if (loading || !resolvedSource) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  // ✅ render a real Image, not SSImage again
  return (
    <Image
      {...rest}
      style={style}
      source={resolvedSource}
      onError={onError}
      onLoadEnd={onLoadEnd}
    />
  );
};