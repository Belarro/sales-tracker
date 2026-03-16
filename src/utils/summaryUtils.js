// ============================================
// DAILY SUMMARY GENERATOR
// ============================================
// Generates a plain-text WhatsApp summary of today's tasks.

/**
 * Format a single task line for the summary
 */
function taskLine(loc) {
  const days = loc._daysUntilAction;
  const action = loc.nextActionType ? loc.nextActionType.replace(/_/g, ' ') : 'follow up';
  const contact = loc.contactPerson ? ` (${loc.contactPerson})` : '';
  let timing = '';
  if (days < 0) timing = ` — ${Math.abs(days)}d overdue`;
  else if (days > 0) timing = ` — in ${days}d`;
  return `- ${loc.locationName}${contact}${timing} [${action}]`;
}

/**
 * Generate a daily summary text for WhatsApp self-send.
 * Keeps total under ~3500 chars (safe for wa.me URL).
 */
export function generateDailySummary(overdueTasks, todayTasks, upcomingTasks) {
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;

  const lines = [`SALES TRACKER — ${dateStr}`, ''];

  const MAX_CHARS = 3500;
  let charCount = lines.join('\n').length;

  const addSection = (title, tasks) => {
    if (tasks.length === 0) return;
    const header = `${title} (${tasks.length}):`;
    lines.push(header);
    charCount += header.length + 1;

    for (const task of tasks) {
      const line = taskLine(task);
      if (charCount + line.length + 1 > MAX_CHARS) {
        const remaining = tasks.length - tasks.indexOf(task);
        lines.push(`  ... and ${remaining} more`);
        break;
      }
      lines.push(line);
      charCount += line.length + 1;
    }
    lines.push('');
  };

  addSection('OVERDUE', overdueTasks);
  addSection('TODAY', todayTasks);
  addSection('UPCOMING', upcomingTasks);

  const total = overdueTasks.length + todayTasks.length + upcomingTasks.length;
  lines.push(`Total: ${total} tasks`);

  return lines.join('\n');
}
