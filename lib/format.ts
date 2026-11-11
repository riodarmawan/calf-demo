export const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export const priceRange = (prices: number[]) => {
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? rp(lo) : `${rp(lo)} – ${hi.toLocaleString("id-ID")}`;
};

export const minutesSince = (ts: number, now: number) => Math.max(0, Math.floor((now - ts) / 60000));

export const clock = (ts: number) =>
  new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
