const iconModules = import.meta.glob<string>("/lol_champion_icons/*.png", {
  eager: true,
  import: "default",
});

const entries = Object.entries(iconModules)
  .map(([path, url]) => {
    const name = path.split("/").pop()?.replace(".png", "") ?? "";
    return { id: name, url };
  })
  .filter((item) => item.id.length > 0)
  .sort((a, b) => Number(a.id) - Number(b.id));

export const championIconIds = entries.map((item) => item.id);
const iconUrlMap = new Map(entries.map((item) => [item.id, item.url]));

export function getChampionIconUrl(icon: string | number | null): string {
  if (icon === null) return "";
  return iconUrlMap.get(String(icon)) ?? "";
}
