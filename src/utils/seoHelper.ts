export function getBrandSlug(brand: string): string {
  const lower = brand.toLowerCase().trim();
  if (lower === 'tata motors' || lower === 'tata') return 'tata';
  if (lower === 'mg motor' || lower === 'mg') return 'mg';
  if (lower === 'maruti suzuki' || lower === 'maruti') return 'maruti';
  return lower.replace(/\s+/g, '-');
}
