#!/usr/bin/env bash
# Converts local originals (media/sources.local.tsv) into small web assets in public/media.
# Images -> WebP (max 1600px, plus 640px thumb). GIF/MP4 -> muted H.264 MP4 + WebM (max 960px, 24fps) + poster.
# Metadata is stripped. Originals never enter the repo.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/media; mkdir -p "$OUT"
while IFS=$'\t' read -r name src; do
  [[ -z "$name" || "$name" == \#* ]] && continue
  [[ -f "$src" ]] || { echo "MISSING $name: $src" >&2; continue; }
  case "$(printf %s "$src" | tr A-Z a-z)" in
    *.gif|*.mp4|*.mov)
      vf="fps=24,scale='min(960,iw)':-2:flags=lanczos"
      ffmpeg -nostdin -loglevel error -y -i "$src" -an -vf "$vf" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart -map_metadata -1 "$OUT/$name.mp4"
      ffmpeg -nostdin -loglevel error -y -i "$src" -an -vf "$vf" -c:v libvpx-vp9 -crf 38 -b:v 0 -map_metadata -1 "$OUT/$name.webm"
      ffmpeg -nostdin -loglevel error -y -i "$OUT/$name.mp4" -frames:v 1 -q:v 3 "$OUT/$name.poster.jpg"
      cwebp -quiet -q 72 "$OUT/$name.poster.jpg" -o "$OUT/$name.poster.webp" && rm "$OUT/$name.poster.jpg" ;;
    *)
      w=$(sips -g pixelWidth "$src" | awk '/pixelWidth/{print $2}')
      big=$(( w > 1600 ? 1600 : w )); th=$(( w > 640 ? 640 : w ))
      cwebp -quiet -q 80 -metadata none -resize "$big" 0 "$src" -o "$OUT/$name.webp"
      cwebp -quiet -q 72 -metadata none -resize "$th" 0 "$src" -o "$OUT/$name.thumb.webp" ;;
  esac
  echo "ok $name"
done < media/sources.local.tsv
du -sh "$OUT"
