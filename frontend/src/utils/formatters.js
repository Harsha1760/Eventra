export function formatDateShort(dateString) {
  if (!dateString) return { day: '--', month: '---' };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Fallback if format is YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return {
          day: String(d.getDate()).padStart(2, '0'),
          month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        };
      }
      return { day: '--', month: '---' };
    }
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    };
  } catch {
    return { day: '--', month: '---' };
  }
}

export function formatDateFull(dateString) {
  if (!dateString) return '';
  try {
    const parts = String(dateString).split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString) {
  if (!timeString) return '';
  try {
    // If format is HH:MM or HH:MM:SS
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeString;
  } catch {
    return timeString;
  }
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹---';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '₹---';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatBookingRef(id) {
  if (!id) return 'EV-00000';
  return `EV-${String(id).padStart(5, '0')}`;
}

