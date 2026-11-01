/**
 * Formats date and time consistently across the entire Cloud Admin Panel
 * Required Format: DD/MM/YYYY & HH:MM AM/PM
 */

export function formatDateTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'N/A';

  const d = new Date(dateInput);

  // If Date constructor failed or string is pure YYYY-MM-DD
  if (isNaN(d.getTime())) {
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [yyyy, mm, dd] = dateInput.split('-');
      return `${dd}/${mm}/${yyyy}`;
    }
    return String(dateInput);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  // Check if string contains an explicit time component
  const hasTime =
    typeof dateInput === 'string'
      ? dateInput.includes('T') || dateInput.includes(':')
      : true;

  if (!hasTime) {
    return `${day}/${month}/${year}`;
  }

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour becomes 12
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}/${month}/${year} & ${formattedHours}:${minutes} ${ampm}`;
}

export function formatDateOnly(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [yyyy, mm, dd] = dateInput.split('-');
      return `${dd}/${mm}/${yyyy}`;
    }
    return String(dateInput);
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

