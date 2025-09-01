export default function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1)
    .toString().padStart(2,'0')}/${d.getFullYear()}`;
}
