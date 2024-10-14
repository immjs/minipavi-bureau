import { stat } from "fs/promises";
import { extname } from "path";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

export function Embed() {
  const params = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const path = params.get('url');
      if (!path) return navigate('/');
      const stats = await stat(path);
      
      if (!stats.isDirectory() && !stats.isSymbolicLink()) {
        const fileext = extname(path);
        switch (fileext.toLowerCase()) {
          case '.msld':
            return navigate(`/slides?path=${encodeURIComponent(path)}`, { replace: true });
          case '.png':
          case '.jpg':
          case '.jpeg':
          case '.webp':
          case '.svg':
          case '.gif':
            return navigate(`/imgview?path=${encodeURIComponent(path)}`, { replace: true });
          default:
            return navigate(`/edit?path=${encodeURIComponent(path)}`, { replace: true });
        }
      }
      return navigate(`/finder?path=${encodeURIComponent(path)}`, { replace: true });
    })();
  }, []);

  return <para>Redirecting...</para>
}
