export function formatRelativeTime(dateInput: any): string {
  if (!dateInput) return 'Just now';

  let date: Date;

  if (typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date();
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 5) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Format as readable date e.g. "Aug 10, 2026"
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  if (year === now.getFullYear()) {
    return `${month} ${day}`;
  }

  return `${month} ${day}, ${year}`;
}

export function formatExactTime(dateInput: any): string {
  if (!dateInput) return '';

  let date: Date;
  if (typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number' || typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date();
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
